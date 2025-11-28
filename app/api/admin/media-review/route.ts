import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { getUserRoleServer } from "@/lib/auth/guards";

export async function GET(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const role = await getUserRoleServer(supabase as any);

    if (role !== "founder" && role !== "intern") {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    // Get all media submissions with related data
    const { data: media, error } = await supabase
      .from("presentation_media")
      .select(`
        *,
        presentations (
          topic,
          schools (
            name
          )
        ),
        users!presentation_media_uploaded_by_fkey (
          name
        )
      `)
      .order("uploaded_at", { ascending: false });

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    // Format the response
    const formattedMedia = (media || []).map((item: any) => ({
      id: item.id,
      presentation_id: item.presentation_id,
      uploaded_by: item.uploaded_by,
      uploader_name: item.users?.name || "Unknown",
      file_url: item.file_url,
      file_type: item.file_type,
      caption: item.caption,
      approved_for_social: item.approved_for_social,
      status: item.status,
      uploaded_at: item.uploaded_at,
      presentation_topic: item.presentations?.topic,
      school_name: item.presentations?.schools?.name
    }));

    return NextResponse.json({ ok: true, media: formattedMedia });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
