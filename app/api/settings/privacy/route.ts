import { NextRequest, NextResponse } from "next/server";
import { getServerComponentClient } from "@/lib/supabase/server";
import { z } from "zod";

const privacySchema = z.object({
  analytics_opt_in: z.boolean().optional(),
  profile_visibility: z.enum(["public", "team", "private"]).optional(),
  activity_status: z.enum(["online", "offline", "hidden"]).optional(),
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
    const privacyData = privacySchema.parse(body);

    // Update privacy preferences
    const { error } = await supabase
      .from("user_preferences")
      .upsert({
        user_id: session.user.id,
        ...privacyData,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: "user_id"
      });

    if (error) {
      return NextResponse.json(
        { error: "Failed to update privacy settings" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Privacy settings updated successfully"
    });

  } catch (error) {
    console.error("Privacy update error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid privacy data", details: error.errors },
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
          analytics_opt_in: true,
          profile_visibility: "team",
          activity_status: "online"
        },
        { status: 200 }
      );
    }

    const { data: preferences } = await supabase
      .from("user_preferences")
      .select("analytics_opt_in, profile_visibility, activity_status")
      .eq("user_id", session.user.id)
      .single();

    const defaults = {
      analytics_opt_in: true,
      profile_visibility: "team",
      activity_status: "online"
    };

    return NextResponse.json({
      ...defaults,
      ...preferences
    });

  } catch (error) {
    console.error("Privacy fetch error:", error);

    return NextResponse.json({
      analytics_opt_in: true,
      profile_visibility: "team",
      activity_status: "online"
    });
  }
}
