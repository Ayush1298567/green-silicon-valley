import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { getUserRoleServer } from "@/lib/auth/guards";
import { computeAnalytics } from "@/lib/analytics";

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });
  const role = await getUserRoleServer(supabase as any);
  if (role !== "founder" && role !== "intern") {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  try {
    // Get comprehensive analytics data
    const metrics = await computeAnalytics();

    // Get additional dashboard data
    const [
      { data: presentations },
      { data: volunteers },
      { data: users },
      { data: recentActivity }
    ] = await Promise.all([
      supabase.from("presentations").select("id, status, scheduled_date, created_at"),
      supabase.from("volunteers").select("id, status, created_at"),
      supabase.from("users").select("id, role, created_at"),
      supabase.from("system_logs")
        .select("event_type, created_at")
        .order("created_at", { ascending: false })
        .limit(100)
    ]);

    // Calculate dashboard KPIs
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const dashboardData = {
      // Core metrics
      totalGroups: volunteers?.length || 0,
      activeGroups: volunteers?.filter(v => v.status === "active").length || 0,
      completedPresentations: presentations?.filter(p => p.status === "completed").length || 0,
      upcomingPresentations: presentations?.filter(p => {
        const scheduled = new Date(p.scheduled_date);
        return scheduled > now && scheduled <= new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      }).length || 0,

      // User metrics
      totalUsers: users?.length || 0,
      founderUsers: users?.filter(u => u.role === "founder").length || 0,
      volunteerUsers: users?.filter(u => u.role === "volunteer").length || 0,
      internUsers: users?.filter(u => u.role === "intern").length || 0,

      // Activity metrics (last 30 days)
      newGroups: volunteers?.filter(v => new Date(v.created_at) > thirtyDaysAgo).length || 0,
      newPresentations: presentations?.filter(p => new Date(p.created_at) > thirtyDaysAgo).length || 0,
      newUsers: users?.filter(u => new Date(u.created_at) > thirtyDaysAgo).length || 0,

      // Activity breakdown
      activityByType: recentActivity?.reduce((acc: any, log) => {
        acc[log.event_type] = (acc[log.event_type] || 0) + 1;
        return acc;
      }, {}) || {},

      // Trends (simplified - in real implementation, would calculate actual trends)
      trends: {
        groupGrowth: calculateTrend(volunteers?.map(v => v.created_at) || []),
        presentationGrowth: calculateTrend(presentations?.map(p => p.created_at) || []),
        userGrowth: calculateTrend(users?.map(u => u.created_at) || [])
      },

      // Real-time data
      lastUpdated: now.toISOString(),
      dataFreshness: "real-time"
    };

    return NextResponse.json({
      ok: true,
      dashboard: dashboardData,
      metrics, // Include the detailed analytics from computeAnalytics
      timestamp: now.toISOString()
    });

  } catch (error: any) {
    console.error("Error generating executive dashboard:", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

// Helper function to calculate simple trend
function calculateTrend(dates: string[]): number {
  if (dates.length < 2) return 0;

  const now = new Date();
  const periods = [
    { start: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), end: now }, // Last 30 days
    { start: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000), end: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } // Previous 30 days
  ];

  const recent = dates.filter(date => {
    const d = new Date(date);
    return d >= periods[0].start && d <= periods[0].end;
  }).length;

  const previous = dates.filter(date => {
    const d = new Date(date);
    return d >= periods[1].start && d <= periods[1].end;
  }).length;

  if (previous === 0) return recent > 0 ? 100 : 0;

  return Math.round(((recent - previous) / previous) * 100);
}
