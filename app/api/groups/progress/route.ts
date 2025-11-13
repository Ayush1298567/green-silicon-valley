import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { getUserRoleServer } from "@/lib/auth/guards";

export async function GET(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const role = await getUserRoleServer(supabase as any);

  if (role !== "founder" && role !== "intern") {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get('status');

    // Fetch all volunteer groups with progress data
    let query = supabase
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
        updated_at,
        group_milestones!inner(
          milestone_type,
          is_completed,
          completed_at,
          due_date,
          priority
        ),
        team_members!inner(
          user_id,
          users!inner(name)
        )
      `);

    if (statusFilter && statusFilter !== 'all') {
      if (statusFilter === 'at_risk') {
        // Groups with urgent/high priority incomplete milestones or no recent activity
        query = query.or('presentation_status.is.null,status.eq.pending');
      } else {
        query = query.eq('status', statusFilter);
      }
    }

    const { data: groupsData, error } = await query;

    if (error) {
      console.error('Error fetching groups:', error);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    // Process the data to calculate progress metrics
    const groups = groupsData?.map((group: any) => {
      const milestones = group.group_milestones || [];
      const completedMilestones = milestones.filter((m: any) => m.is_completed);
      const totalMilestones = milestones.length;

      // Calculate progress percentage
      const progressPercentage = totalMilestones > 0
        ? Math.round((completedMilestones.length / totalMilestones) * 100)
        : 0;

      // Calculate risk level
      let riskLevel: 'low' | 'medium' | 'high' | 'urgent' = 'low';

      const hasOverdueMilestones = milestones.some((m: any) =>
        !m.is_completed && m.due_date && new Date(m.due_date) < new Date()
      );

      const hasUrgentMilestones = milestones.some((m: any) =>
        !m.is_completed && m.priority === 'urgent'
      );

      const daysSinceUpdate = Math.floor(
        (Date.now() - new Date(group.updated_at).getTime()) / (1000 * 60 * 60 * 24)
      );

      if (hasUrgentMilestones || hasOverdueMilestones) {
        riskLevel = 'urgent';
      } else if (daysSinceUpdate > 14 || progressPercentage < 25) {
        riskLevel = 'high';
      } else if (daysSinceUpdate > 7 || progressPercentage < 50) {
        riskLevel = 'medium';
      }

      // Find next deadline
      const upcomingDeadlines = milestones
        .filter((m: any) => !m.is_completed && m.due_date)
        .sort((a: any, b: any) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());

      const nextDeadline = upcomingDeadlines[0]?.due_date;

      return {
        id: group.id,
        team_name: group.team_name,
        status: group.status,
        application_status: group.application_status,
        onboarding_step: group.onboarding_step,
        presentation_status: group.presentation_status,
        hours_total: group.hours_total || 0,
        created_at: group.created_at,
        updated_at: group.updated_at,
        member_count: group.team_members?.length || 0,
        milestones_completed: completedMilestones.length,
        total_milestones: totalMilestones,
        progress_percentage: progressPercentage,
        days_since_last_activity: daysSinceUpdate,
        next_deadline: nextDeadline,
        risk_level: riskLevel
      };
    }) || [];

    // Sort by risk level (urgent first) then by progress
    groups.sort((a, b) => {
      const riskOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      const riskDiff = riskOrder[b.risk_level] - riskOrder[a.risk_level];
      if (riskDiff !== 0) return riskDiff;
      return b.progress_percentage - a.progress_percentage;
    });

    return NextResponse.json({
      ok: true,
      groups,
      summary: {
        total_groups: groups.length,
        completed_groups: groups.filter(g => g.status === 'completed').length,
        at_risk_groups: groups.filter(g => g.risk_level === 'high' || g.risk_level === 'urgent').length,
        average_progress: groups.length > 0
          ? Math.round(groups.reduce((sum, g) => sum + g.progress_percentage, 0) / groups.length)
          : 0
      }
    });

  } catch (error: any) {
    console.error("Groups progress error:", error);
    return NextResponse.json({ ok: false, error: error.message || "Failed to fetch groups progress" }, { status: 500 });
  }
}
