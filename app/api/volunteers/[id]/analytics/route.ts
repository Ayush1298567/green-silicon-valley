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
  
  if (role !== "founder" && role !== "intern") {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const volunteerId = params.id;
  const { searchParams } = new URL(req.url);
  const period = searchParams.get("period") || "all_time"; // all_time, this_year, this_month

  // Get volunteer
  const { data: volunteer } = await supabase
    .from("volunteers")
    .select("*")
    .eq("id", volunteerId)
    .single();

  if (!volunteer) {
    return NextResponse.json({ ok: false, error: "Volunteer not found" }, { status: 404 });
  }

  // Calculate date range
  const now = new Date();
  let startDate: Date | null = null;
  if (period === "this_year") {
    startDate = new Date(now.getFullYear(), 0, 1);
  } else if (period === "this_month") {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  // Get hours - use team ID (volunteer.id), not user_id
  let hoursQuery = supabase
    .from("volunteer_hours")
    .select("hours_logged, date, status")
    .eq("volunteer_id", volunteer.id); // Use team ID
  
  if (startDate) {
    hoursQuery = hoursQuery.gte("date", startDate.toISOString());
  }

  const { data: hoursData } = await hoursQuery;

  // Get presentations - use volunteer_team_id
  let presentationsQuery = supabase
    .from("presentations")
    .select("id, date, status, hours, student_count")
    .eq("volunteer_team_id", volunteer.id); // Use team ID
  
  if (startDate) {
    presentationsQuery = presentationsQuery.gte("date", startDate.toISOString());
  }

  const { data: presentationsData } = await presentationsQuery;

  // Get activities - use team ID
  let activitiesQuery = supabase
    .from("volunteer_activities")
    .select("activity_type, created_at")
    .eq("volunteer_id", volunteer.id); // Use team ID
  
  if (startDate) {
    activitiesQuery = activitiesQuery.gte("created_at", startDate.toISOString());
  }

  const { data: activitiesData } = await activitiesQuery;

  // Calculate metrics
  const totalHours = hoursData?.reduce((sum, h) => sum + (h.hours_logged || 0), 0) || 0;
  const approvedHours = hoursData?.filter(h => h.status === "approved").reduce((sum, h) => sum + (h.hours_logged || 0), 0) || 0;
  const pendingHours = hoursData?.filter(h => h.status === "pending").reduce((sum, h) => sum + (h.hours_logged || 0), 0) || 0;
  
  const presentationsCompleted = presentationsData?.filter(p => p.status === "completed").length || 0;
  const presentationsScheduled = presentationsData?.filter(p => p.status === "scheduled").length || 0;
  const studentsReached = presentationsData?.reduce((sum, p) => sum + (p.student_count || 0), 0) || 0;

  // Activity breakdown
  const activityBreakdown: Record<string, number> = {};
  activitiesData?.forEach((a) => {
    activityBreakdown[a.activity_type] = (activityBreakdown[a.activity_type] || 0) + 1;
  });

  // Hours by month
  const hoursByMonth: Record<string, number> = {};
  hoursData?.forEach((h) => {
    if (h.date) {
      const date = new Date(h.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      hoursByMonth[key] = (hoursByMonth[key] || 0) + (h.hours_logged || 0);
    }
  });

  return NextResponse.json({
    ok: true,
    analytics: {
      period,
      totalHours,
      approvedHours,
      pendingHours,
      presentationsCompleted,
      presentationsScheduled,
      studentsReached,
      activityBreakdown,
      hoursByMonth: Object.entries(hoursByMonth).map(([month, hours]) => ({ month, hours })),
      lastActivityDate: volunteer.last_activity_date,
      joinDate: volunteer.join_date,
      performanceScore: volunteer.performance_score
    }
  });
}

