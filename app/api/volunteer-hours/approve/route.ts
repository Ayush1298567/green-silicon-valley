import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { getUserRoleServer } from "@/lib/auth/guards";
import { sendEmail } from "@/lib/email";
import { hoursApproved, hoursRejected } from "@/lib/emailTemplates";
import { resolveEmailTemplate } from "@/lib/emailTemplatesDb";

export async function POST(req: Request) {
  // Support both JSON and form POST (from SSR forms)
  const supabase = createRouteHandlerClient({ cookies });
  const role = await getUserRoleServer(supabase as any);
  if (role !== "founder" && role !== "intern") {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  const { data: { session } } = await supabase.auth.getSession();
  const contentType = req.headers.get("content-type") ?? "";
  let hours_id: number | null = null;
  let approved: boolean = true;
  let adjusted_hours: number | undefined = undefined;
  let rejection_reason: string | undefined = undefined;
  let approval_notes: string | undefined = undefined;

  if (contentType.includes("application/json")) {
    const body = await req.json().catch(() => ({}));
    hours_id = Number(body?.hours_id ?? body?.id ?? 0);
    approved = body?.approved !== false; // Default to true if not specified
    adjusted_hours = body?.adjusted_hours ? Number(body.adjusted_hours) : undefined;
    rejection_reason = body?.rejection_reason || undefined;
    approval_notes = body?.approval_notes || body?.comment || undefined;
  } else {
    const form = await req.formData().catch(() => null);
    if (form) {
      try {
        const payload = JSON.parse(String(form.get("payload") ?? "{}"));
        hours_id = Number(payload?.hours_id ?? payload?.id ?? 0);
        approved = payload?.approved !== false;
        adjusted_hours = payload?.adjusted_hours ? Number(payload.adjusted_hours) : undefined;
        rejection_reason = payload?.rejection_reason || undefined;
        approval_notes = String(form.get("comment") ?? "");
      } catch {}
    }
  }
  
  const id = hours_id;
  if (!id) return NextResponse.json({ ok: false, error: "Missing hours_id" }, { status: 400 });

  const { data: row, error: fetchErr } = await supabase.from("volunteer_hours").select("*").eq("id", id).single();
  if (fetchErr || !row) return NextResponse.json({ ok: false, error: fetchErr?.message ?? "Not found" }, { status: 404 });

  if (!approved) {
    // Reject
    await supabase.from("volunteer_hours").update({
      status: "rejected",
      approved_by: session?.user?.id ?? null,
      approved_at: new Date().toISOString(),
      rejection_reason: rejection_reason || null
    }).eq("id", id);
    
    await supabase.from("system_logs").insert({
      event_type: "hours_rejected",
      description: JSON.stringify({ by: session?.user?.id, id, reason: rejection_reason })
    });

    // Create notification for volunteer
    if (row.submitted_by) {
      await supabase.from("notifications").insert({
        user_id: row.submitted_by,
        notification_type: "hours_rejected",
        title: "Hours Rejected",
        message: rejection_reason 
          ? `Your hours submission was rejected. Reason: ${rejection_reason}`
          : "Your hours submission was rejected.",
        action_url: "/dashboard/volunteer/hours",
        related_id: id,
        related_type: "volunteer_hours"
      });
    }

    // Optional email
    if (process.env.SMTP_URL && row.submitted_by) {
      const { data: u } = await supabase.from("users").select("email,name").eq("id", row.submitted_by).single();
      if (u?.email) {
        const fb = hoursRejected({ name: u.name, submissionId: id, comment: rejection_reason || "" });
        const tpl = await resolveEmailTemplate("hours_rejected", {
          name: u.name ?? "",
          submission_id: String(id),
          comment: rejection_reason ?? ""
        }, { subject: fb.subject, text: fb.text });
        await sendEmail({ to: u.email, subject: tpl.subject, text: tpl.text });
      }
    }
    return NextResponse.json({ ok: true });
  }

  // Approve:
  const finalHours = adjusted_hours !== undefined ? adjusted_hours : row.hours_logged;
  
  await supabase.from("volunteer_hours").update({
    status: "approved",
    approved_by: session?.user?.id ?? null,
    approved_at: new Date().toISOString(),
    adjusted_hours: adjusted_hours !== undefined ? adjusted_hours : null,
    approval_notes: approval_notes || null
  }).eq("id", id);

  // Update presentation aggregate fields (optional)
  if (row.presentation_id) {
    await supabase.from("presentations").update({
      hours: finalHours,
      feedback: row.feedback,
    }).eq("id", row.presentation_id);
  }

  // Credit hours to volunteer team (team-based model)
  // Update hours_total for the volunteer team
  const { data: volunteer } = await supabase
    .from("volunteers")
    .select("hours_total")
    .eq("id", row.volunteer_id)
    .single();

  if (volunteer) {
    const newHours = (volunteer.hours_total ?? 0) + finalHours;
    await supabase
      .from("volunteers")
      .update({ hours_total: newHours })
      .eq("id", row.volunteer_id);
  }

  await supabase.from("system_logs").insert({
    event_type: "hours_approved",
    description: JSON.stringify({ by: session?.user?.id, id, presentation_id: row.presentation_id, hours: finalHours, adjusted: adjusted_hours !== undefined, comment: approval_notes })
  });

  // Create notification for volunteer
  if (row.submitted_by) {
    await supabase.from("notifications").insert({
      user_id: row.submitted_by,
      notification_type: "hours_approved",
      title: "Hours Approved",
      message: adjusted_hours !== undefined
        ? `Your ${row.hours_logged} hours were approved and adjusted to ${finalHours} hours.`
        : `Your ${finalHours} hour${finalHours !== 1 ? "s" : ""} ${finalHours !== 1 ? "have" : "has"} been approved!`,
      action_url: "/dashboard/volunteer/hours",
      related_id: id,
      related_type: "volunteer_hours"
    });
  }

  // Optional email
  if (process.env.SMTP_URL && row.submitted_by) {
    const { data: u } = await supabase.from("users").select("email,name").eq("id", row.submitted_by).single();
    if (u?.email) {
      const fb = hoursApproved({ name: u.name, presentationId: row.presentation_id, hours: finalHours, comment: approval_notes || "" });
      const tpl = await resolveEmailTemplate("hours_approved", {
        name: u.name ?? "",
        presentation_id: String(row.presentation_id),
        hours: String(finalHours),
        comment: approval_notes ?? ""
      }, { subject: fb.subject, text: fb.text });
      await sendEmail({ to: u.email, subject: tpl.subject, text: tpl.text });
    }
  }
  return NextResponse.json({ ok: true });
}


