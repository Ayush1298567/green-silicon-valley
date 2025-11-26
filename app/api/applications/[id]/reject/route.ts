import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { getDashboardPathForRole, type UserRole } from "@/lib/auth/roles";
import { emailService } from "@/lib/email/email-service";
import { actionItemsService } from "@/lib/actionItemsService";

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
    const { type, reason } = body;

    if (!reason || reason.trim().length === 0) {
      return NextResponse.json({ ok: false, error: "Rejection reason is required" }, { status: 400 });
    }

    if (type === "volunteer") {
      const volunteerId = parseInt(params.id);
      if (isNaN(volunteerId)) {
        return NextResponse.json({ ok: false, error: "Invalid volunteer ID" }, { status: 400 });
      }

      // Update volunteer status
      const { data: currentVolunteer } = await supabase
        .from("volunteers")
        .select("application_status")
        .eq("id", volunteerId)
        .single();

      await supabase
        .from("volunteers")
        .update({ application_status: "rejected" })
        .eq("id", volunteerId);

      // Record status change
      if (currentVolunteer) {
        await supabase.from("application_status_history").insert({
          application_type: "volunteer",
          application_id: volunteerId,
          old_status: currentVolunteer.application_status,
          new_status: "rejected",
          changed_by: session.user.id,
          notes: reason
        });

        // Update related action item
        try {
          await actionItemsService.onApplicationStatusChanged('volunteer', volunteerId.toString(), 'rejected', session.user.id);
        } catch (actionError) {
          console.error("Error updating action item for volunteer rejection:", actionError);
        }

        // Get volunteer details for email
        const { data: volunteerData } = await supabase
          .from("volunteers")
          .select(`
            team_name,
            user:users!volunteers_user_id_fkey(name, email)
          `)
          .eq("id", volunteerId)
          .single();

        // Create notification for volunteer team members
        const { data: teamMembers } = await supabase
          .from("team_members")
          .select("user_id")
          .eq("volunteer_team_id", volunteerId);

        if (teamMembers && teamMembers.length > 0) {
          const notifications = teamMembers.map(member => ({
            user_id: member.user_id,
            notification_type: "application_rejected",
            title: "Application Rejected",
            message: `Your volunteer application was rejected. Reason: ${reason}`,
            action_url: "/dashboard/volunteer",
            related_id: volunteerId,
            related_type: "volunteer"
          }));

          await supabase.from("notifications").insert(notifications);

          // Send email to primary contact
          if (volunteerData?.user) {
            await emailService.sendVolunteerApplicationRejection({
              name: volunteerData.user.name || "Volunteer",
              email: volunteerData.user.email,
              reason: reason
            });
          }
        }
      }
    } else if (type === "intern") {
      // Handle intern rejection
    } else if (type === "teacher") {
      const schoolId = parseInt(params.id);
      if (isNaN(schoolId)) {
        return NextResponse.json({ ok: false, error: "Invalid school ID" }, { status: 400 });
      }

      // Update school/teacher request status to "waitlist" or mark as rejected
      const { data: currentSchool } = await supabase
        .from("schools")
        .select("status, teacher_name, email")
        .eq("id", schoolId)
        .single();

      if (currentSchool) {
        // Update status - could be "waitlist" or we could add a "rejected" status
        await supabase
          .from("schools")
          .update({ 
            status: "waitlist",
            additional_notes: currentSchool.additional_notes 
              ? `${currentSchool.additional_notes}\n\nRejection reason: ${reason}`
              : `Rejection reason: ${reason}`
          })
          .eq("id", schoolId);

        // Send email notification to teacher with rejection reason
        if (currentSchool.email && currentSchool.teacher_name) {
          await emailService.sendTeacherRequestWaitlist({
            name: currentSchool.teacher_name,
            email: currentSchool.email,
            schoolName: currentSchool.name || "your school",
            reason: reason
          });
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

