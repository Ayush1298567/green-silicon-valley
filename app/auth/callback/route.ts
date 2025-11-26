import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getDashboardPathForRole, type UserRole } from "@/lib/auth/roles";
import { determineUserRoute, trackUserActivity, updateLoginStats } from "@/lib/auth/routing";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const redirectedFrom = requestUrl.searchParams.get("redirectedFrom") || "/";

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    await supabase.auth.exchangeCodeForSession(code);
    
    // Get user role and redirect to appropriate dashboard
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      try {
        const userId = session.user.id;
        const email = session.user.email || "";
        const userAgent = request.headers.get("user-agent") || "";
        const referrer = request.headers.get("referer") || "";

        // Ensure user exists in users table
        const { data: existingUser } = await supabase
          .from("users")
          .select("role, user_category, needs_approval, status")
          .eq("id", userId)
          .single();

        if (!existingUser) {
          // Create user with default role and approval status
          // Teachers are auto-approved, interns and volunteers need approval
          const defaultRole = "teacher";
          const needsApproval = ["intern", "volunteer"].includes(defaultRole);

          await supabase.from("users").insert({
            id: userId,
            name: session.user.user_metadata?.full_name ?? email,
            email: email,
            role: defaultRole,
            user_category: "guest",
            status: needsApproval ? "pending_approval" : "active",
            needs_approval: needsApproval,
          });

          // Track signup activity
          await trackUserActivity(supabase, {
            user_id: userId,
            email: email,
            activity_type: "signup",
            activity_source: "magic_link",
            user_category: "guest",
            user_agent: userAgent,
            referrer: referrer,
          });
        } else {
          // Track login activity
          await trackUserActivity(supabase, {
            user_id: userId,
            email: email,
            activity_type: "login",
            activity_source: "magic_link",
            user_category: existingUser.user_category || null,
            user_agent: userAgent,
            referrer: referrer,
          });

          // Update login stats
          await updateLoginStats(supabase, userId);
        }

        // Use smart routing to determine where to send user
        const route = await determineUserRoute(userId, email, supabase);

        return NextResponse.redirect(`${requestUrl.origin}${route}`);
      } catch (error) {
        console.error("Error in auth callback:", error);
        // Fallback to dashboard
        return NextResponse.redirect(`${requestUrl.origin}/dashboard`);
      }
    }
  }

  // Default redirect to dashboard (which will then redirect based on role)
  return NextResponse.redirect(`${requestUrl.origin}/dashboard`);
}

