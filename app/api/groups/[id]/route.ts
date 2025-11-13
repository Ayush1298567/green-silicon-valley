import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { getUserRoleServer } from "@/lib/auth/guards";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });
  const role = await getUserRoleServer(supabase as any);
  const groupId = parseInt(params.id);

  if (!groupId) {
    return NextResponse.json({ ok: false, error: "Invalid group ID" }, { status: 400 });
  }

  // Check if user has access to this group
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const isFounder = role === "founder" || role === "intern";
  const isTeamMember = await supabase
    .from("team_members")
    .select("user_id")
    .eq("user_id", session.user.id)
    .eq("volunteer_team_id", groupId)
    .single()
    .then(({ data }) => !!data);

  if (!isFounder && !isTeamMember) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  try {
    // Get group details with members and presentations
    const { data: groupData, error: groupError } = await supabase
      .from("volunteers")
      .select(`
        id,
        team_name,
        status,
        application_status,
        onboarding_step,
        presentation_status,
        hours_total,
        created_at,
        updated_at
      `)
      .eq("id", groupId)
      .single();

    if (groupError || !groupData) {
      return NextResponse.json({ ok: false, error: "Group not found" }, { status: 404 });
    }

    // Get team members
    const { data: membersData } = await supabase
      .from("team_members")
      .select(`
        user_id,
        users!inner(name, email)
      `)
      .eq("volunteer_team_id", groupId);

    // Get milestones progress
    const { data: milestonesData } = await supabase
      .from("group_milestones")
      .select("milestone_type, is_completed")
      .eq("volunteer_team_id", groupId);

    // Get recent presentations
    const { data: presentationsData } = await supabase
      .from("presentations")
      .select(`
        id,
        topic,
        scheduled_date,
        status,
        school_id,
        schools(name)
      `)
      .eq("volunteer_team_id", groupId)
      .order("scheduled_date", { ascending: false })
      .limit(10);

    // Calculate progress metrics
    const totalMilestones = milestonesData?.length || 0;
    const completedMilestones = milestonesData?.filter(m => m.is_completed).length || 0;
    const progressPercentage = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

    // Format members
    const members = membersData?.map(member => ({
      user_id: member.user_id,
      name: member.users?.name || "Unknown",
      email: member.users?.email || ""
    })) || [];

    // Format presentations
    const recent_presentations = presentationsData?.map(presentation => ({
      id: presentation.id,
      topic: presentation.topic || "Untitled Presentation",
      scheduled_date: presentation.scheduled_date,
      status: presentation.status,
      school_name: presentation.schools?.name
    })) || [];

    const group = {
      ...groupData,
      member_count: members.length,
      milestones_completed: completedMilestones,
      total_milestones: totalMilestones,
      progress_percentage: progressPercentage,
      members,
      recent_presentations
    };

    return NextResponse.json({ ok: true, group });

  } catch (error: any) {
    console.error("Group details error:", error);
    return NextResponse.json({ ok: false, error: error.message || "Failed to fetch group details" }, { status: 500 });
  }
}
