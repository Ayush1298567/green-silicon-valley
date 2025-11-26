import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { stage } = body;

    if (!stage) {
      return NextResponse.json({ ok: false, error: "Stage is required" }, { status: 400 });
    }

    // Update the applicant's current stage
    const { data: applicant, error } = await supabase
      .from("recruitment_pipeline")
      .update({
        current_stage: stage,
        updated_at: new Date().toISOString()
      })
      .eq("id", params.id)
      .select(`
        *,
        users (
          name,
          email
        )
      `)
      .single();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    // Get the stage details for auto-actions
    const { data: stageDetails } = await supabase
      .from("pipeline_stages")
      .select("*")
      .eq("stage_name", stage)
      .single();

    if (stageDetails && stageDetails.auto_actions) {
      // Execute auto-actions based on stage transition
      const autoActions = stageDetails.auto_actions;

      // Example auto-actions: send notifications, create tasks, etc.
      if (autoActions.send_notification && stageDetails.notification_template_id) {
        // Create notification task
        await supabase.from("action_items").insert({
          title: `Send notification to ${applicant.users?.name}`,
          description: `Send automated notification for stage: ${stage}`,
          type: "notification",
          priority: "medium",
          assigned_to: [session.user.id],
          metadata: {
            applicant_id: applicant.applicant_id,
            pipeline_id: applicant.id,
            stage: stage,
            template_id: stageDetails.notification_template_id
          }
        });
      }

      if (autoActions.create_followup && autoActions.followup_days) {
        // Create follow-up task
        const followupDate = new Date();
        followupDate.setDate(followupDate.getDate() + autoActions.followup_days);

        await supabase.from("action_items").insert({
          title: `Follow up with ${applicant.users?.name}`,
          description: `Scheduled follow-up after moving to ${stage} stage`,
          type: "follow_up",
          priority: "low",
          assigned_to: applicant.assigned_to ? [applicant.assigned_to] : [session.user.id],
          due_date: followupDate.toISOString(),
          metadata: {
            applicant_id: applicant.applicant_id,
            pipeline_id: applicant.id,
            stage: stage
          }
        });
      }
    }

    return NextResponse.json({ ok: true, applicant });

  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
