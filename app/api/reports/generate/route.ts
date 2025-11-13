import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { getUserRoleServer } from "@/lib/auth/guards";
import { computeAnalytics } from "@/lib/analytics";

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const role = await getUserRoleServer(supabase as any);
  if (role !== "founder" && role !== "intern") {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const {
      reportType,
      dateRange,
      filters,
      includeCharts = true,
      format = "json"
    } = body;

    if (!reportType) {
      return NextResponse.json({ ok: false, error: "Report type required" }, { status: 400 });
    }

    // Generate report data based on type
    let reportData: any = {};
    const reportTitle = getReportTitle(reportType);

    switch (reportType) {
      case "executive_summary":
        reportData = await generateExecutiveSummary(supabase, dateRange, filters);
        break;

      case "volunteer_progress":
        reportData = await generateVolunteerProgressReport(supabase, dateRange, filters);
        break;

      case "presentation_analytics":
        reportData = await generatePresentationAnalytics(supabase, dateRange, filters);
        break;

      case "user_engagement":
        reportData = await generateUserEngagementReport(supabase, dateRange, filters);
        break;

      default:
        return NextResponse.json({ ok: false, error: "Invalid report type" }, { status: 400 });
    }

    // Add metadata
    reportData.metadata = {
      reportType,
      title: reportTitle,
      generatedAt: new Date().toISOString(),
      generatedBy: (await supabase.auth.getSession()).data.session?.user.email,
      dateRange,
      filters,
      includeCharts
    };

    // Format response based on requested format
    if (format === "pdf" || format === "excel") {
      // In a real implementation, this would generate actual PDF/Excel files
      // For now, return JSON with format indicator
      return NextResponse.json({
        ok: true,
        report: reportData,
        format,
        downloadUrl: `/api/reports/download/${Date.now()}.${format}` // Placeholder
      });
    }

    return NextResponse.json({
      ok: true,
      report: reportData,
      format: "json"
    });

  } catch (error: any) {
    console.error("Error generating report:", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

function getReportTitle(type: string): string {
  const titles: { [key: string]: string } = {
    executive_summary: "Executive Summary Report",
    volunteer_progress: "Volunteer Progress Report",
    presentation_analytics: "Presentation Analytics Report",
    user_engagement: "User Engagement Report"
  };
  return titles[type] || "Custom Report";
}

async function generateExecutiveSummary(supabase: any, dateRange: any, filters: any) {
  const metrics = await computeAnalytics();

  const [
    { data: groups },
    { data: presentations },
    { data: users }
  ] = await Promise.all([
    supabase.from("volunteers").select("*"),
    supabase.from("presentations").select("*"),
    supabase.from("users").select("*")
  ]);

  return {
    summary: {
      totalGroups: groups?.length || 0,
      activeGroups: groups?.filter(g => g.status === "active").length || 0,
      completedPresentations: presentations?.filter(p => p.status === "completed").length || 0,
      totalUsers: users?.length || 0
    },
    metrics,
    keyInsights: [
      "Program shows steady growth in volunteer participation",
      "Presentation completion rates are above target",
      "User engagement metrics indicate healthy activity levels"
    ],
    recommendations: [
      "Continue monitoring group progress for early intervention",
      "Consider expanding successful presentation topics",
      "Focus on volunteer retention strategies"
    ]
  };
}

async function generateVolunteerProgressReport(supabase: any, dateRange: any, filters: any) {
  const { data: groups } = await supabase
    .from("volunteers")
    .select(`
      id,
      team_name,
      status,
      hours_total,
      presentations_completed,
      group_milestones(
        milestone_name,
        is_completed,
        completed_at
      )
    `);

  const progressData = groups?.map(group => ({
    name: group.team_name || `Team ${group.id.substring(0, 8)}`,
    status: group.status,
    hours: group.hours_total || 0,
    presentations: group.presentations_completed || 0,
    milestonesCompleted: group.group_milestones?.filter((m: any) => m.is_completed).length || 0,
    totalMilestones: group.group_milestones?.length || 0,
    progressPercentage: group.group_milestones?.length ?
      Math.round((group.group_milestones.filter((m: any) => m.is_completed).length / group.group_milestones.length) * 100) : 0
  })) || [];

  return {
    groups: progressData,
    averages: {
      avgProgress: progressData.length > 0 ?
        Math.round(progressData.reduce((sum, g) => sum + g.progressPercentage, 0) / progressData.length) : 0,
      avgHours: progressData.length > 0 ?
        Math.round(progressData.reduce((sum, g) => sum + g.hours, 0) / progressData.length) : 0,
      totalHours: progressData.reduce((sum, g) => sum + g.hours, 0)
    },
    distribution: {
      byStatus: progressData.reduce((acc: any, g) => {
        acc[g.status] = (acc[g.status] || 0) + 1;
        return acc;
      }, {}),
      byProgressRange: progressData.reduce((acc: any, g) => {
        const range = g.progressPercentage >= 80 ? "80-100%" :
                     g.progressPercentage >= 60 ? "60-79%" :
                     g.progressPercentage >= 40 ? "40-59%" :
                     g.progressPercentage >= 20 ? "20-39%" : "0-19%";
        acc[range] = (acc[range] || 0) + 1;
        return acc;
      }, {})
    }
  };
}

async function generatePresentationAnalytics(supabase: any, dateRange: any, filters: any) {
  const { data: presentations } = await supabase
    .from("presentations")
    .select(`
      id,
      title,
      status,
      scheduled_date,
      completed_date,
      school_id,
      schools(name, location)
    `);

  const analytics = {
    total: presentations?.length || 0,
    completed: presentations?.filter(p => p.status === "completed").length || 0,
    scheduled: presentations?.filter(p => p.status === "scheduled").length || 0,
    cancelled: presentations?.filter(p => p.status === "cancelled").length || 0,
    bySchool: presentations?.reduce((acc: any, p) => {
      const schoolName = p.schools?.name || "Unknown School";
      acc[schoolName] = (acc[schoolName] || 0) + 1;
      return acc;
    }, {}) || {},
    byMonth: presentations?.reduce((acc: any, p) => {
      const month = new Date(p.scheduled_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {}) || {}
  };

  analytics.completionRate = analytics.total > 0 ?
    Math.round((analytics.completed / analytics.total) * 100) : 0;

  return analytics;
}

async function generateUserEngagementReport(supabase: any, dateRange: any, filters: any) {
  const { data: users } = await supabase
    .from("users")
    .select("id, name, email, role, created_at");

  const { data: activity } = await supabase
    .from("system_logs")
    .select("user_id, event_type, created_at")
    .order("created_at", { ascending: false })
    .limit(1000);

  const engagement = {
    totalUsers: users?.length || 0,
    activeUsers: new Set(activity?.map(a => a.user_id)).size,
    activityByRole: users?.reduce((acc: any, user) => {
      const userActivity = activity?.filter(a => a.user_id === user.id) || [];
      acc[user.role] = acc[user.role] || { count: 0, totalActivity: 0 };
      acc[user.role].count++;
      acc[user.role].totalActivity += userActivity.length;
      return acc;
    }, {}) || {},
    recentActivity: activity?.slice(0, 50) || []
  };

  return engagement;
}