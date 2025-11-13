import type { SupabaseClient } from "@supabase/supabase-js";
import { getDashboardPathForRole, type UserRole } from "./roles";

/**
 * Determines the appropriate route for a user after login/signup
 * Based on their role, category, signup source, and onboarding status
 */
export async function determineUserRoute(
  userId: string,
  email: string,
  supabase: SupabaseClient
): Promise<string> {
  try {
    // 1. Check user routing preferences first
    const { data: preferences } = await supabase
      .from("user_routing_preferences")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (preferences?.default_redirect_path) {
      return preferences.default_redirect_path;
    }

    // 2. Check user role and category
    const { data: user } = await supabase
      .from("users")
      .select("role, user_category")
      .eq("id", userId)
      .single();

    const role = user?.role as UserRole | undefined;
    const category = user?.user_category;

    // 3. Check signup sources to determine context
    const { data: signupSources } = await supabase
      .from("user_signup_sources")
      .select("source_type, source_reference_id")
      .eq("user_id", userId)
      .order("first_signup_at", { ascending: true });

    // 4. Route based on role and context
    if (role === "founder") {
      return "/dashboard/founder";
    }

    if (role === "intern") {
      // Check if onboarding needed
      if (!preferences?.onboarding_completed) {
        return "/dashboard/intern/onboarding";
      }
      return "/dashboard/intern";
    }

    if (role === "volunteer") {
      // Check if part of approved team
      const { data: teamMember } = await supabase
        .from("team_members")
        .select("volunteer_team_id")
        .eq("user_id", userId)
        .single();

      if (teamMember) {
        // Check onboarding status
        const { data: volunteer } = await supabase
          .from("volunteers")
          .select("onboarding_step, application_status")
          .eq("id", teamMember.volunteer_team_id)
          .single();

        if (volunteer?.application_status === "pending") {
          return "/dashboard/volunteer/pending-approval";
        }

        if (volunteer?.onboarding_step && volunteer.onboarding_step !== "completed" && volunteer.onboarding_step !== "scheduled") {
          return "/dashboard/volunteer/onboarding";
        }
      } else {
        // Not part of a team yet - check if they have a pending application
        const { data: volunteerApp } = await supabase
          .from("volunteers")
          .select("application_status")
          .eq("email", email)
          .order("submitted_at", { ascending: false })
          .limit(1)
          .single();

        if (volunteerApp?.application_status === "pending") {
          return "/dashboard/volunteer/pending-approval";
        }
      }

      return "/dashboard/volunteer";
    }

    if (role === "teacher") {
      // Check if they have pending presentation requests
      const { data: school } = await supabase
        .from("schools")
        .select("status")
        .eq("email", email)
        .order("submitted_at", { ascending: false })
        .limit(1)
        .single();

      if (school?.status === "pending") {
        return "/dashboard/teacher/pending-request";
      }

      return "/dashboard/teacher";
    }

    // 5. Check if newsletter subscriber (no account yet)
    const { data: subscriber } = await supabase
      .from("newsletter_subscribers")
      .select("id")
      .eq("email", email)
      .eq("status", "active")
      .single();

    if (subscriber && !user) {
      return "/newsletter/welcome";
    }

    // 6. Default fallback - use role-based routing
    if (role) {
      return getDashboardPathForRole(role);
    }

    // 7. Final fallback
    return "/";
  } catch (error) {
    console.error("Error determining user route:", error);
    return "/";
  }
}

/**
 * Tracks user activity (login, signup, page views, etc.)
 */
export async function trackUserActivity(
  supabase: SupabaseClient,
  activity: {
    user_id?: string | null;
    email: string;
    activity_type: "signup" | "login" | "logout" | "page_view" | "form_submit";
    activity_source?: string;
    user_category?: string;
    ip_address?: string;
    user_agent?: string;
    referrer?: string;
    metadata?: any;
  }
): Promise<void> {
  try {
    await supabase.from("user_activity_log").insert({
      user_id: activity.user_id || null,
      email: activity.email,
      activity_type: activity.activity_type,
      activity_source: activity.activity_source || null,
      user_category: activity.user_category || null,
      ip_address: activity.ip_address || null,
      user_agent: activity.user_agent || null,
      referrer: activity.referrer || null,
      metadata: activity.metadata || null,
    });
  } catch (error) {
    console.error("Error tracking user activity:", error);
    // Don't throw - activity tracking shouldn't break the flow
  }
}

/**
 * Records a signup source for a user
 */
export async function recordSignupSource(
  supabase: SupabaseClient,
  source: {
    user_id: string;
    email: string;
    source_type: "volunteer_form" | "intern_form" | "teacher_form" | "newsletter" | "direct_signup" | "invited";
    source_reference_id?: number | null;
    source_metadata?: any;
  }
): Promise<void> {
  try {
    await supabase.from("user_signup_sources").upsert({
      user_id: source.user_id,
      email: source.email,
      source_type: source.source_type,
      source_reference_id: source.source_reference_id || null,
      source_metadata: source.source_metadata || null,
    }, {
      onConflict: "user_id,source_type",
    });
  } catch (error) {
    console.error("Error recording signup source:", error);
  }
}

/**
 * Updates user routing preferences
 */
export async function updateRoutingPreferences(
  supabase: SupabaseClient,
  userId: string,
  preferences: {
    default_redirect_path?: string;
    onboarding_completed?: boolean;
    onboarding_step?: string;
    preferred_dashboard?: string;
  }
): Promise<void> {
  try {
    await supabase.from("user_routing_preferences").upsert({
      user_id: userId,
      ...preferences,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: "user_id",
    });
  } catch (error) {
    console.error("Error updating routing preferences:", error);
  }
}

/**
 * Updates last login time and increments login count
 */
export async function updateLoginStats(
  supabase: SupabaseClient,
  userId: string
): Promise<void> {
  try {
    const { data: existing } = await supabase
      .from("user_routing_preferences")
      .select("login_count")
      .eq("user_id", userId)
      .single();

    await supabase.from("user_routing_preferences").upsert({
      user_id: userId,
      last_login_at: new Date().toISOString(),
      login_count: (existing?.login_count || 0) + 1,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: "user_id",
    });
  } catch (error) {
    console.error("Error updating login stats:", error);
  }
}

