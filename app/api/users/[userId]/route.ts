import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function PUT(req: Request, { params }: { params: { userId: string } }) {
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
    return NextResponse.json({ error: "Forbidden: Only founders can update users" }, { status: 403 });
  }

  const userId = params.userId;
  const updates = await req.json();

  const { error } = await supabase
    .from("users")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "User updated successfully" });
}

export async function DELETE(req: Request, { params }: { params: { userId: string } }) {
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
    return NextResponse.json({ error: "Forbidden: Only founders can delete users" }, { status: 403 });
  }

  const userId = params.userId;

  // In production, you might want to soft delete or deactivate instead of hard delete
  const { error } = await supabase
    .from("users")
    .update({ status: "inactive", updated_at: new Date().toISOString() })
    .eq("id", userId);

  if (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "User deleted successfully" });
}

