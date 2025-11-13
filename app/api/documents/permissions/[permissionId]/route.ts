import { NextRequest, NextResponse } from "next/server";
import { getServerComponentClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { permissionId: string } }
) {
  const supabase = getServerComponentClient();
  
  // Get current user
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if user is founder
  const { data: user } = await supabase
    .from("users")
    .select("role")
    .eq("id", session.user.id)
    .single();

  if (!user || user.role !== "founder") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Delete the permission
  const { error } = await supabase
    .from("document_permissions")
    .delete()
    .eq("id", params.permissionId);

  if (error) {
    console.error("Error revoking permission:", error);
    return NextResponse.json({ error: "Failed to revoke permission" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

