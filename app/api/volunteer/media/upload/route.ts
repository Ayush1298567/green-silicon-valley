import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { getUserRoleServer } from "@/lib/auth/guards";

export async function POST(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const role = await getUserRoleServer(supabase as any);

    if (role !== "volunteer") {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const presentationId = formData.get('presentation_id') as string;
    const caption = formData.get('caption') as string;

    if (!file || !presentationId) {
      return NextResponse.json({ ok: false, error: "Missing file or presentation ID" }, { status: 400 });
    }

    // Validate file type and size
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ ok: false, error: "Invalid file type" }, { status: 400 });
    }

    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json({ ok: false, error: "File too large" }, { status: 400 });
    }

    // Get current user
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    // Verify user participated in this presentation
    const { data: presentation } = await supabase
      .from("presentations")
      .select("id, volunteer_team_id")
      .eq("id", presentationId)
      .single();

    if (!presentation) {
      return NextResponse.json({ ok: false, error: "Presentation not found" }, { status: 404 });
    }

    // Upload file to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `presentation-media/${presentationId}/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('media')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      return NextResponse.json({ ok: false, error: uploadError.message }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('media')
      .getPublicUrl(filePath);

    // Save media record
    const { data: mediaRecord, error: mediaError } = await supabase
      .from("presentation_media")
      .insert({
        presentation_id: presentationId,
        uploaded_by: session.user.id,
        file_url: urlData.publicUrl,
        file_type: file.type.startsWith('image/') ? 'image' : 'video',
        caption: caption || '',
        status: 'pending'
      })
      .select()
      .single();

    if (mediaError) {
      return NextResponse.json({ ok: false, error: mediaError.message }, { status: 500 });
    }

    // Create notification for founders
    await supabase.from("notifications").insert({
      user_id: null, // System notification for all founders
      notification_type: "media_uploaded",
      title: "New Presentation Media",
      message: `A volunteer uploaded ${file.type.startsWith('image/') ? 'a photo' : 'a video'} from their presentation`,
      action_url: "/admin/media-review"
    });

    return NextResponse.json({ ok: true, media: mediaRecord });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
