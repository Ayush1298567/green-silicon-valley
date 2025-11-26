import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function DELETE(
  req: Request,
  { params }: { params: { dept: string; resourceId: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get the resource first to delete the file
    const { data: resource } = await supabase
      .from("department_resources")
      .select("file_url")
      .eq("id", params.resourceId)
      .eq("department", params.dept)
      .single();

    if (resource?.file_url) {
      // Delete file from storage
      await supabase.storage
        .from("department-resources")
        .remove([resource.file_url]);
    }

    // Delete resource record
    const { error } = await supabase
      .from("department_resources")
      .delete()
      .eq("id", params.resourceId)
      .eq("department", params.dept);

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, message: "Resource deleted successfully" });

  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
