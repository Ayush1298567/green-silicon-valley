import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { sendEmail } from "@/lib/email";
import { teacherRequestConfirmation } from "@/lib/emailTemplates";
import { resolveEmailTemplate } from "@/lib/emailTemplatesDb";
import { trackUserActivity } from "@/lib/auth/routing";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      full_name,
      school_name,
      grade_levels,
      email,
      request_type,
      preferred_months = [],
      topic_interests = [],
      classroom_needs,
      additional_notes,
    } = body;

    if (!full_name || !school_name || !email) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = createRouteHandlerClient({ cookies });
    const userAgent = req.headers.get("user-agent") || "";
    const referrer = req.headers.get("referer") || "";

    // Check if school already exists
    const { data: existingSchool } = await supabase
      .from("schools")
      .select("id")
      .eq("name", school_name)
      .eq("email", email)
      .single();

    let schoolId;
    if (existingSchool) {
      // Update existing school
      const { error: updateError } = await supabase
        .from("schools")
        .update({
          teacher_name: full_name,
          grade_levels,
          request_type: request_type || "presentation",
          preferred_months: preferred_months.length > 0 ? preferred_months : null,
          topic_interests: topic_interests.length > 0 ? topic_interests : null,
          classroom_needs: classroom_needs || null,
          additional_notes: additional_notes || null,
          on_mailing_list: request_type === "mailing_list" || request_type === "both",
          status: "pending",
          submitted_at: new Date().toISOString(),
        })
        .eq("id", existingSchool.id);

      if (updateError) {
        return NextResponse.json(
          { ok: false, error: updateError.message },
          { status: 500 }
        );
      }
      schoolId = existingSchool.id;
    } else {
      // Create new school
      const { data: newSchool, error: insertError } = await supabase
        .from("schools")
        .insert({
          name: school_name,
          teacher_name: full_name,
          email,
          grade_levels,
          request_type: request_type || "presentation",
          preferred_months: preferred_months.length > 0 ? preferred_months : null,
          topic_interests: topic_interests.length > 0 ? topic_interests : null,
          classroom_needs: classroom_needs || null,
          additional_notes: additional_notes || null,
          on_mailing_list: request_type === "mailing_list" || request_type === "both",
          status: "pending",
          submitted_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (insertError) {
        return NextResponse.json(
          { ok: false, error: insertError.message },
          { status: 500 }
        );
      }
      schoolId = newSchool.id;
    }

    // Track form submission activity
    await trackUserActivity(supabase, {
      email: email,
      activity_type: "form_submit",
      activity_source: "teacher_form",
      user_category: "teacher",
      user_agent: userAgent,
      referrer: referrer,
      metadata: {
        school_id: schoolId,
        request_type,
        teacher_name: full_name,
      },
    });

    // Log the submission
    await supabase.from("system_logs").insert({
      event_type: "teacher_request",
      description: JSON.stringify({ school_id: schoolId, email, request_type }),
    });

    // Optional confirmation email
    if (process.env.SMTP_URL && email) {
      try {
        const fb = teacherRequestConfirmation({
          teacherName: full_name,
          school: school_name,
        });
        const tpl = await resolveEmailTemplate(
          "teacher_request_confirmation",
          { teacher_name: full_name, school: school_name },
          { subject: fb.subject, text: fb.text }
        );
        await sendEmail({ to: email, subject: tpl.subject, text: tpl.text });
      } catch {}
    }

    return NextResponse.json({ ok: true, school_id: schoolId });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error.message || "Failed to submit form" },
      { status: 500 }
    );
  }
}


