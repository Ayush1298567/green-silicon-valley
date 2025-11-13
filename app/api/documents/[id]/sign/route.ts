import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { getDashboardPathForRole, type UserRole } from "@/lib/auth/roles";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is founder or intern
    const { data: userRow } = await supabase.from("users").select("role").eq("id", session.user.id).single();
    const role = (userRow?.role as UserRole) ?? "volunteer";
    
    if (role !== "founder" && role !== "intern") {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    const documentId = parseInt(params.id);
    if (isNaN(documentId)) {
      return NextResponse.json({ ok: false, error: "Invalid document ID" }, { status: 400 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ ok: false, error: "File is required" }, { status: 400 });
    }

    // Get document info
    const { data: document } = await supabase
      .from("volunteer_documents")
      .select("volunteer_id, uploaded_by")
      .eq("id", documentId)
      .single();

    if (!document) {
      return NextResponse.json({ ok: false, error: "Document not found" }, { status: 404 });
    }

    // Upload signed document to Supabase Storage
    const fileExt = file.name.split(".").pop();
    const fileName = `signed_${documentId}_${Date.now()}.${fileExt}`;
    const filePath = `signed-documents/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false
      });

    if (uploadError) {
      return NextResponse.json({ ok: false, error: uploadError.message }, { status: 500 });
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from("documents")
      .getPublicUrl(filePath);

    // Update document status
    const { error: updateError } = await supabase
      .from("volunteer_documents")
      .update({
        status: "signed_by_founder",
        signed_by: session.user.id,
        signed_at: new Date().toISOString(),
        signed_document_url: publicUrl,
        reviewed_by: session.user.id,
        reviewed_at: new Date().toISOString()
      })
      .eq("id", documentId);

    if (updateError) {
      return NextResponse.json({ ok: false, error: updateError.message }, { status: 500 });
    }

    // Create notification for volunteer
    if (document.uploaded_by) {
      await supabase.from("notifications").insert({
        user_id: document.uploaded_by,
        notification_type: "application_approved", // Reuse type
        title: "Document Signed",
        message: "Your document has been signed and is ready for download.",
        action_url: "/dashboard/volunteer/documents",
        related_id: documentId,
        related_type: "volunteer_document"
      });
    }

    return NextResponse.json({ ok: true, signed_url: publicUrl });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

