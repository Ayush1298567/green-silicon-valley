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
    return NextResponse.json({ error: "Forbidden: Only founders can manage permissions" }, { status: 403 });
  }

  const userId = params.userId;
  const { permissions } = await req.json();

  if (!permissions || typeof permissions !== 'object') {
    return NextResponse.json({ error: "Invalid permissions data" }, { status: 400 });
  }

  const { error } = await supabase
    .from("users")
    .update({
      permissions,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) {
    console.error("Error updating permissions:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Log the permission change
  await supabase.from("system_logs").insert({
    action: "updated_user_permissions",
    actor_id: session.user.id,
    target_table: "users",
    target_id: userId,
    details: `Updated permissions for user ${userId}`,
    timestamp: new Date().toISOString(),
  });

  return NextResponse.json({ message: "Permissions updated successfully" });
}

