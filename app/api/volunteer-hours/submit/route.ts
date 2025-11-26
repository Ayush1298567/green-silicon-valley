import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { getUserTeamId } from "@/lib/volunteers/team-helpers";
import { generateAndSaveExcusedAbsencePDF } from "@/lib/pdf/excusedAbsence";

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  // Find user's team
  const teamId = await getUserTeamId(session.user.id, supabase);
  if (!teamId) {
    return NextResponse.json({ ok: false, error: "Not part of a team" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const {
    presentation_id,
    timestamp_start,
    timestamp_end,
    hours_logged,
    activity,
    feedback,
    auto_calculated
  } = body;

  if (!presentation_id || !hours_logged || hours_logged <= 0) {
    return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 });
  }
  
  // Get presentation and user details for PDF generation
  const { data: presentation } = await supabase
    .from("presentations")
    .select(`
      topic,
      scheduled_date,
      schools(name)
    `)
    .eq("id", presentation_id)
    .single();

  const { data: user } = await supabase
    .from("users")
    .select("name")
    .eq("id", session.user.id)
    .single();

  const { data: team } = await supabase
    .from("volunteers")
    .select("team_name")
    .eq("id", teamId)
    .single();

  // Generate excused absence PDF
  let pdfUrl = null;
  try {
    const pdfData = {
      studentName: user?.name || "Unknown Student",
      schoolName: presentation?.schools?.name || "Unknown School",
      presentationDate: presentation?.scheduled_date || new Date().toISOString(),
      hoursLogged: hours_logged,
      activity: activity || "Presentation",
      teacherName: presentation?.schools?.teacher_name || "School Teacher",
      volunteerTeam: team?.team_name || "Volunteer Team",
      presentationTopic: presentation?.topic || "STEM Presentation"
    };

    const pdfPath = await generateAndSaveExcusedAbsencePDF(pdfData);
    // In a real implementation, you'd upload this to cloud storage and get a URL
    // For now, we'll store the local path (this should be changed in production)
    pdfUrl = pdfPath;
  } catch (error) {
    console.error("Error generating PDF:", error);
    // Don't fail the submission if PDF generation fails
  }

  const { error } = await supabase.from("volunteer_hours").insert({
    presentation_id,
    volunteer_id: teamId, // Use team ID, not user ID
    submitted_by: session.user.id,
    hours_logged: hours_logged,
    activity: activity || null,
    feedback: feedback || null,
    status: "pending",
    timestamp_start: timestamp_start ? new Date(timestamp_start).toISOString() : null,
    timestamp_end: timestamp_end ? new Date(timestamp_end).toISOString() : null,
    auto_calculated: auto_calculated || false,
    excused_absence_pdf_url: pdfUrl
  });
  
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  
      await supabase.from("system_logs").insert({
        event_type: "hours_submitted",
        description: JSON.stringify({ by: session.user.id, team_id: teamId, presentation_id, hours })
      });

      // Create notifications for founders
      const { data: founders } = await supabase
        .from("users")
        .select("id")
        .eq("role", "founder");

      if (founders && founders.length > 0) {
        const { data: presentation } = await supabase
          .from("presentations")
          .select("topic, scheduled_date")
          .eq("id", presentation_id)
          .single();

        const notifications = founders.map(founder => ({
          user_id: founder.id,
          notification_type: "hours_submitted",
          title: "New Hours Submitted",
          message: `Team submitted ${hours} hour${hours !== 1 ? "s" : ""} for presentation${presentation?.topic ? `: ${presentation.topic}` : ""}`,
          action_url: `/dashboard/founder/hours/pending`,
          related_id: teamId,
          related_type: "volunteer"
        }));

        await supabase.from("notifications").insert(notifications);
      }
      
      return NextResponse.json({ ok: true });
}


