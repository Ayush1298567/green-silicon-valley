import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { getUserRoleServer } from "@/lib/auth/guards";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const role = await getUserRoleServer(supabase as any);

    if (role !== "founder" && role !== "intern") {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    const { status, approved_for_social } = await req.json();

    // Get current user for audit trail
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    // Update media status
    const { data: media, error } = await supabase
      .from("presentation_media")
      .update({
        status,
        approved_for_social: approved_for_social || false,
        reviewed_by: session.user.id,
        reviewed_at: new Date().toISOString()
      })
      .eq("id", params.id)
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
      .single();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    // Create notification for the volunteer
    const notificationType = status === 'approved' ? 'media_approved' : 'media_rejected';
    const title = status === 'approved' ? 'Media Approved!' : 'Media Needs Revision';
    const message = status === 'approved'
      ? `Your ${media.file_type} from ${media.presentations?.topic || 'presentation'} has been approved!`
      : `Your ${media.file_type} from ${media.presentations?.topic || 'presentation'} needs revision.`;

    await supabase.from("notifications").insert({
      user_id: media.uploaded_by,
      notification_type: notificationType,
      title,
      message,
      action_url: "/dashboard/volunteer/media-submission"
    });

    return NextResponse.json({ ok: true, media });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
