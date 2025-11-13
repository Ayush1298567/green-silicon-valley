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

    const body = await req.json();
    const { reason } = body;

    if (!reason || reason.trim().length === 0) {
      return NextResponse.json({ ok: false, error: "Rejection reason is required" }, { status: 400 });
    }

    const documentId = parseInt(params.id);
    if (isNaN(documentId)) {
      return NextResponse.json({ ok: false, error: "Invalid document ID" }, { status: 400 });
    }

    // Update document status
    const { error } = await supabase
      .from("volunteer_documents")
      .update({
        status: "rejected",
        reviewed_by: session.user.id,
        reviewed_at: new Date().toISOString(),
        rejection_reason: reason
      })
      .eq("id", documentId);

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    // Create notification for volunteer
    const { data: document } = await supabase
      .from("volunteer_documents")
      .select("volunteer_id, uploaded_by")
      .eq("id", documentId)
      .single();

    if (document && document.uploaded_by) {
      await supabase.from("notifications").insert({
        user_id: document.uploaded_by,
        notification_type: "application_rejected", // Reuse type
        title: "Document Rejected",
        message: `Your document was rejected. Reason: ${reason}`,
        action_url: "/dashboard/volunteer/documents",
        related_id: documentId,
        related_type: "volunteer_document"
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

