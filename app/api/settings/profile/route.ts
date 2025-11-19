import { NextRequest, NextResponse } from "next/server";
import { getServerComponentClient } from "@/lib/supabase/server";
import { z } from "zod";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  bio: z.string().max(500, "Bio too long").optional(),
  phone_secondary: z.string().optional(),
  social_links: z.record(z.string()).optional(),
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
    const profileData = profileSchema.parse(body);

    // Update user profile
    const { error } = await supabase
      .from("users")
      .update({
        name: profileData.name,
        bio: profileData.bio || null,
        phone_secondary: profileData.phone_secondary || null,
        social_links: profileData.social_links || {},
        updated_at: new Date().toISOString()
      })
      .eq("id", session.user.id);

    if (error) {
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully"
    });

  } catch (error) {
    console.error("Profile update error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid profile data", details: error.errors },
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
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { data: profile } = await supabase
      .from("users")
      .select("name, email, bio, phone, phone_secondary, avatar_url, social_links, last_login_at")
      .eq("id", session.user.id)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      profile: {
        name: profile.name || "",
        email: profile.email || "",
        bio: profile.bio || "",
        phone: profile.phone || "",
        phone_secondary: profile.phone_secondary || "",
        avatar_url: profile.avatar_url || "",
        social_links: profile.social_links || {},
        last_login_at: profile.last_login_at
      }
    });

  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}
