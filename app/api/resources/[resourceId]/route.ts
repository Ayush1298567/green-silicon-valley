import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function DELETE(req: Request, { params }: { params: { resourceId: string } }) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check permissions
  const { data: userRoleData } = await supabase
    .from("users")
    .select("role, permissions")
    .eq("id", session.user.id)
    .single();

  if (userRoleData?.role !== "founder" && !userRoleData?.permissions?.manage_documents) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const resourceId = parseInt(params.resourceId);

  // Get the resource to find the file URL
  const { data: resource } = await supabase
    .from("resources")
    .select("file_url")
    .eq("id", resourceId)
    .single();

  // Delete from storage if it's not a Google Docs link
  if (resource?.file_url && !resource.file_url.includes("docs.google")) {
    try {
      const filePath = resource.file_url.split("/").pop();
      if (filePath) {
        await supabase.storage.from("documents").remove([`resources/${filePath}`]);
      }
    } catch (error) {
      console.error("Error deleting file from storage:", error);
    }
  }

  // Delete from database
  const { error } = await supabase
    .from("resources")
    .delete()
    .eq("id", resourceId);

  if (error) {
    console.error("Error deleting resource:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Log the action
  await supabase.from("system_logs").insert({
    action: "deleted_resource",
    actor_id: session.user.id,
    target_table: "resources",
    target_id: resourceId.toString(),
    details: `Deleted resource ID: ${resourceId}`,
    timestamp: new Date().toISOString(),
  });

  return NextResponse.json({ message: "Resource deleted successfully" });
}

