import { NextRequest, NextResponse } from "next/server";
import { getServerComponentClient } from "@/lib/supabase/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
           "Password must contain uppercase, lowercase, number, and special character"),
});

export async function POST(request: NextRequest) {
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
    const { currentPassword, newPassword } = passwordChangeSchema.parse(body);

    // Get current user data
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, email")
      .eq("id", session.user.id)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Verify current password by attempting sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });

    if (signInError) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 }
      );
    }

    // Update password using Supabase Auth
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update password" },
        { status: 500 }
      );
    }

    // Log password change
    await supabase
      .from("password_reset_history")
      .insert({
        user_id: session.user.id,
        reset_completed_at: new Date().toISOString(),
        success: true,
        ip_address: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"),
        user_agent: request.headers.get("user-agent"),
      });

    // Update last password change timestamp
    await supabase
      .from("users")
      .update({ last_password_change: new Date().toISOString() })
      .eq("id", session.user.id);

    return NextResponse.json({
      success: true,
      message: "Password updated successfully"
    });

  } catch (error) {
    console.error("Password change error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
