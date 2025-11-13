import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { getDashboardPathForRole, type UserRole } from "@/lib/auth/roles";

// GET - Fetch volunteer details
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const volunteerId = parseInt(params.id);
    if (isNaN(volunteerId)) {
      return NextResponse.json({ ok: false, error: "Invalid volunteer ID" }, { status: 400 });
    }

    // Get volunteer with topic info
    const { data: volunteer, error } = await supabase
      .from("volunteers")
      .select(`
        *,
        topic:presentation_topics!volunteers_selected_topic_id_fkey(id, name, description)
      `)
      .eq("id", volunteerId)
      .single();

    if (error || !volunteer) {
      return NextResponse.json({ ok: false, error: "Volunteer not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, volunteer });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

// PUT - Update volunteer
export async function PUT(
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

    const volunteerId = parseInt(params.id);
    if (isNaN(volunteerId)) {
      return NextResponse.json({ ok: false, error: "Invalid volunteer ID" }, { status: 400 });
    }

    const body = await req.json();
    const updates: any = {};

    // Allow updating presentation_status
    if (body.presentation_status !== undefined) {
      updates.presentation_status = body.presentation_status;
    }

    // Allow updating onboarding_step
    if (body.onboarding_step !== undefined) {
      updates.onboarding_step = body.onboarding_step;
    }

    // Record status change in history
    if (body.presentation_status !== undefined) {
      const { data: currentVolunteer } = await supabase
        .from("volunteers")
        .select("presentation_status")
        .eq("id", volunteerId)
        .single();

      if (currentVolunteer && currentVolunteer.presentation_status !== body.presentation_status) {
        await supabase.from("volunteer_status_history").insert({
          volunteer_id: volunteerId,
          old_status: currentVolunteer.presentation_status,
          new_status: body.presentation_status,
          changed_by: session.user.id,
          notes: body.notes || null
        });

        // Create notification for volunteer team members
        const { data: teamMembers } = await supabase
          .from("team_members")
          .select("user_id")
          .eq("volunteer_team_id", volunteerId);

        if (teamMembers && teamMembers.length > 0) {
          const notifications = teamMembers.map(member => ({
            user_id: member.user_id,
            notification_type: body.presentation_status === "approved" ? "presentation_approved" : 
                             body.presentation_status === "needs_changes" ? "presentation_rejected" :
                             "presentation_updated",
            title: body.presentation_status === "approved" ? "Presentation Approved" :
                   body.presentation_status === "needs_changes" ? "Changes Requested" :
                   "Presentation Status Updated",
            message: `Your presentation status has been updated to: ${body.presentation_status}`,
            action_url: `/dashboard/volunteer/onboarding`,
            related_id: volunteerId,
            related_type: "volunteer"
          }));

          await supabase.from("notifications").insert(notifications);
        }
      }
    }

    const { data: updated, error } = await supabase
      .from("volunteers")
      .update(updates)
      .eq("id", volunteerId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, volunteer: updated });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

