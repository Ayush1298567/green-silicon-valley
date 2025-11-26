import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { getDashboardPathForRole, type UserRole } from "@/lib/auth/roles";

// GET - Fetch all applications (volunteer and intern)
export async function GET(req: Request) {
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

    const applications: any[] = [];

    // Get volunteer applications (from volunteers table where application_status is pending/contacted)
    const { data: volunteers } = await supabase
      .from("volunteers")
      .select(`
        id,
        team_name,
        application_status,
        group_members,
        created_at,
        user:users!volunteers_user_id_fkey(id, name, email)
      `)
      .in("application_status", ["pending", "contacted", "approved", "rejected"])
      .order("created_at", { ascending: false });

    if (volunteers) {
      for (const vol of volunteers) {
        // Get primary contact from group_members or user
        let name = vol.user?.name || "";
        let email = vol.user?.email || "";
        
        if (!name && vol.group_members && Array.isArray(vol.group_members) && vol.group_members.length > 0) {
          name = vol.group_members[0].name || "";
          email = vol.group_members[0].email || "";
        }

        applications.push({
          id: vol.id,
          type: "volunteer" as const,
          name: name || vol.team_name || `Team #${vol.id}`,
          email: email || "",
          submittedDate: vol.created_at,
          status: vol.application_status || "pending",
          team_name: vol.team_name,
          group_members: vol.group_members
        });
      }
    }

    // Get intern applications (from users table where role is intern and they have intern_projects or from a separate table)
    // For now, we'll check users with role intern who don't have active status
    const { data: internUsers } = await supabase
      .from("users")
      .select("id, name, email, created_at")
      .eq("role", "intern")
      .order("created_at", { ascending: false });

    if (internUsers) {
      for (const user of internUsers) {
        // Check if they have any intern_projects assigned
        const { data: projects } = await supabase
          .from("intern_projects")
          .select("department")
          .eq("assigned_to", user.id)
          .limit(1);

        // If no projects, consider them as pending application
        if (!projects || projects.length === 0) {
          applications.push({
            id: user.id,
            type: "intern" as const,
            name: user.name || "",
            email: user.email || "",
            submittedDate: user.created_at,
            status: "pending",
            department: null
          });
        }
      }
    }

    // Get teacher requests (from schools table where status is pending/contacted)
    const { data: teacherRequests } = await supabase
      .from("schools")
      .select("id, name, teacher_name, email, status, submitted_at, request_type, grade_levels, preferred_months, topic_interests, classroom_needs, additional_notes")
      .in("status", ["pending", "contacted", "scheduled", "waitlist"])
      .order("submitted_at", { ascending: false });

    if (teacherRequests) {
      for (const school of teacherRequests) {
        applications.push({
          id: school.id,
          type: "teacher" as const,
          name: school.teacher_name || school.name || "Unknown Teacher",
          email: school.email || "",
          submittedDate: school.submitted_at || new Date().toISOString(),
          status: school.status || "pending",
          school_name: school.name,
          request_type: school.request_type,
          grade_levels: school.grade_levels,
          preferred_months: school.preferred_months,
          topic_interests: school.topic_interests,
          classroom_needs: school.classroom_needs,
          additional_notes: school.additional_notes
        });
      }
    }

    return NextResponse.json({ ok: true, applications });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

