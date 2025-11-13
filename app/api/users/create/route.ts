import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if user is a founder
  const { data: userRoleData } = await supabase
    .from("users")
    .select("role")
    .eq("id", session.user.id)
    .single();

  if (userRoleData?.role !== "founder") {
    return NextResponse.json({ error: "Forbidden: Only founders can create users" }, { status: 403 });
  }

  const { email, name, role, phone, school_affiliation } = await req.json();

  if (!email || !name || !role) {
    return NextResponse.json({ error: "Email, name, and role are required" }, { status: 400 });
  }

  // Create auth user (this would require admin privileges in production)
  // For now, just create the users table entry
  // In production, you'd use Supabase Admin API or invite the user via email

  const { data, error } = await supabase.from("users").insert({
    email,
    name,
    role,
    phone,
    school_affiliation,
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }).select().single();

  if (error) {
    console.error("Error creating user:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "User created successfully", user: data });
}

