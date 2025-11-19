import { NextRequest, NextResponse } from "next/server";
import { getServerComponentClient } from "@/lib/supabase/server";
import { z } from "zod";

const themeSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
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
    const { theme } = themeSchema.parse(body);

    // Update or insert user preferences
    const { error } = await supabase
      .from("user_preferences")
      .upsert({
        user_id: session.user.id,
        theme,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: "user_id"
      });

    if (error) {
      return NextResponse.json(
        { error: "Failed to update theme preference" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      theme
    });

  } catch (error) {
    console.error("Theme update error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid theme value" },
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
        { theme: "system" },
        { status: 200 }
      );
    }

    const { data: preferences } = await supabase
      .from("user_preferences")
      .select("theme")
      .eq("user_id", session.user.id)
      .single();

    return NextResponse.json({
      theme: preferences?.theme || "system"
    });

  } catch (error) {
    console.error("Theme fetch error:", error);
    return NextResponse.json(
      { theme: "system" },
      { status: 200 }
    );
  }
}
