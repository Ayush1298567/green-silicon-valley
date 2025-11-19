import { NextRequest, NextResponse } from "next/server";
import { getServerComponentClient } from "@/lib/supabase/server";
import { z } from "zod";

const preferencesSchema = z.object({
  compact_mode: z.boolean().optional(),
  sidebar_collapsed: z.boolean().optional(),
  high_contrast: z.boolean().optional(),
  font_size: z.enum(["small", "medium", "large"]).optional(),
  email_notifications: z.boolean().optional(),
  push_notifications: z.boolean().optional(),
  analytics_opt_in: z.boolean().optional(),
  profile_visibility: z.enum(["public", "team", "private"]).optional(),
  activity_status: z.enum(["online", "offline", "hidden"]).optional(),
  preferred_contact: z.enum(["email", "phone", "app"]).optional(),
  language: z.string().optional(),
  timezone: z.string().optional(),
  date_format: z.string().optional(),
  time_format: z.enum(["12h", "24h"]).optional(),
});

export async function PUT(request: NextRequest) {
  try {
    const supabase = getServerComponentClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const preferences = preferencesSchema.parse(body);

    // Update user preferences
    const { error } = await supabase
      .from("user_preferences")
      .upsert({
        user_id: session.user.id,
        ...preferences,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: "user_id"
      });

    if (error) {
      return NextResponse.json(
        { error: "Failed to update preferences" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Preferences updated successfully"
    });

  } catch (error) {
    console.error("Preferences update error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid preferences data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getServerComponentClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        {
          theme: "system",
          compact_mode: false,
          sidebar_collapsed: false,
          high_contrast: false,
          font_size: "medium",
          email_notifications: true,
          push_notifications: true,
          analytics_opt_in: true,
          profile_visibility: "team",
          activity_status: "online",
          preferred_contact: "email",
          language: "en",
          timezone: "America/Los_Angeles",
          date_format: "MM/DD/YYYY",
          time_format: "12h"
        },
        { status: 200 }
      );
    }

    const { data: preferences } = await supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", session.user.id)
      .single();

    // Return defaults if no preferences exist
    const defaults = {
      theme: "system",
      compact_mode: false,
      sidebar_collapsed: false,
      high_contrast: false,
      font_size: "medium",
      email_notifications: true,
      push_notifications: true,
      analytics_opt_in: true,
      profile_visibility: "team",
      activity_status: "online",
      preferred_contact: "email",
      language: "en",
      timezone: "America/Los_Angeles",
      date_format: "MM/DD/YYYY",
      time_format: "12h"
    };

    return NextResponse.json({
      ...defaults,
      ...preferences
    });

  } catch (error) {
    console.error("Preferences fetch error:", error);

    // Return defaults on error
    return NextResponse.json({
      theme: "system",
      compact_mode: false,
      sidebar_collapsed: false,
      high_contrast: false,
      font_size: "medium",
      email_notifications: true,
      push_notifications: true,
      analytics_opt_in: true,
      profile_visibility: "team",
      activity_status: "online",
      preferred_contact: "email",
      language: "en",
      timezone: "America/Los_Angeles",
      date_format: "MM/DD/YYYY",
      time_format: "12h"
    });
  }
}
