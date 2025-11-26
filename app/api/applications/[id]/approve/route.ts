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
    const { type } = body;

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
        .update({ application_status: "approved" })
        .eq("id", volunteerId);

      // Record status change
      if (currentVolunteer) {
        await supabase.from("application_status_history").insert({
          application_type: "volunteer",
          application_id: volunteerId,
          old_status: currentVolunteer.application_status,
          new_status: "approved",
          changed_by: session.user.id
        });

        // Update related action item
        try {
          await actionItemsService.onApplicationStatusChanged('volunteer', volunteerId.toString(), 'approved', session.user.id);
        } catch (actionError) {
          console.error("Error updating action item for volunteer approval:", actionError);
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
            notification_type: "application_approved",
            title: "Application Approved",
            message: "Your volunteer application has been approved!",
            action_url: "/dashboard/volunteer/onboarding",
            related_id: volunteerId,
            related_type: "volunteer"
          }));

          await supabase.from("notifications").insert(notifications);

          // Send email to primary contact
          if (volunteerData?.user) {
            await emailService.sendVolunteerApplicationApproval({
              name: volunteerData.user.name || "Volunteer",
              email: volunteerData.user.email,
              teamName: volunteerData.team_name || undefined
            });
          }
        }
      }
    } else if (type === "intern") {
      // Handle intern approval
      // This would typically involve assigning them to a department/project
      // For now, we'll just acknowledge it
    } else if (type === "teacher") {
      const schoolId = parseInt(params.id);
      if (isNaN(schoolId)) {
        return NextResponse.json({ ok: false, error: "Invalid school ID" }, { status: 400 });
      }

      // Update school/teacher request status to "contacted" (first step) or "scheduled"
      const { data: currentSchool } = await supabase
        .from("schools")
        .select("status, teacher_name, email")
        .eq("id", schoolId)
        .single();

      if (currentSchool) {
        // Update status to contacted (or scheduled if they want to schedule immediately)
        await supabase
          .from("schools")
          .update({ 
            status: "contacted",
            contacted_at: new Date().toISOString()
          })
          .eq("id", schoolId);

        // Send email notification to teacher
        if (currentSchool.email && currentSchool.teacher_name) {
          await emailService.sendTeacherRequestContact({
            name: currentSchool.teacher_name,
            email: currentSchool.email,
            schoolName: currentSchool.name || "your school",
            requestType: currentSchool.request_type || undefined
          });
        }

        // TODO: Create task in Outreach dashboard for scheduling
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

