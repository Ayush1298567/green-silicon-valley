import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { getUserTeamId } from "@/lib/volunteers/team-helpers";

export async function GET(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get user's team ID
    const teamId = await getUserTeamId(session.user.id, supabase);

    if (!teamId) {
      return NextResponse.json({ ok: true, hours: [] });
    }

    // Get hours for the user's team
    const { data: hours, error } = await supabase
      .from("volunteer_hours")
      .select(`
        id,
        presentation_id,
        hours_logged,
        activity,
        status,
        submitted_at,
        verified_at,
        teacher_signature_url,
        verification_method,
        excused_absence_pdf_url,
        timestamp_start,
        timestamp_end,
        auto_calculated,
        presentations (
          topic,
          scheduled_date,
          schools (
            name
          )
        )
      `)
      .eq("volunteer_id", teamId)
      .order("submitted_at", { ascending: false });

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    // Transform the data to match the expected format
    const transformedHours = hours?.map(hour => ({
      id: hour.id,
      presentation_id: hour.presentation_id,
      hours_logged: hour.hours_logged,
      activity: hour.activity,
      status: hour.status,
      submitted_at: hour.submitted_at,
      verified_at: hour.verified_at,
      teacher_signature_url: hour.teacher_signature_url,
      verification_method: hour.verification_method,
      excused_absence_pdf_url: hour.excused_absence_pdf_url,
      presentations: hour.presentations ? {
        topic: hour.presentations.topic,
        scheduled_date: hour.presentations.scheduled_date,
        school_name: hour.presentations.schools?.name
      } : null
    })) || [];

    return NextResponse.json({ ok: true, hours: transformedHours });

  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
