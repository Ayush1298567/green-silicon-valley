import { getServerComponentClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getDashboardPathForRole, type UserRole } from "@/lib/auth/roles";
import AnalyticsDashboard from "@/components/analytics/AnalyticsDashboard";

export const dynamic = "force-dynamic";

function formatMonthKey(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export default async function AnalyticsPage() {
  const supabase = getServerComponentClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const { data: userRow } = await supabase.from("users").select("role").eq("id", session.user.id).single();
  const role = (userRow?.role as UserRole) ?? "volunteer";
  if (!["founder", "intern"].includes(role)) redirect(getDashboardPathForRole(role));

  const [presentationsRes, volunteerHoursRes, volunteersRes, chaptersRes, schoolsRes] = await Promise.all([
    supabase.from("presentations").select("id, status, scheduled_date, student_count, school_id").order("scheduled_date", { ascending: true }),
    supabase.from("volunteer_hours").select("id, volunteer_id, hours_logged, status, date, created_at"),
    supabase.from("volunteers").select("user_id, team_name, status, users(name)").limit(500),
    supabase.from("chapters").select("id, status"),
    supabase.from("schools").select("id, name").limit(500)
  ]);

  const presentations = presentationsRes.data ?? [];
  const volunteerHours = volunteerHoursRes.data ?? [];
  const volunteers = volunteersRes.data ?? [];
  const chapters = chaptersRes.data ?? [];
  const schools = schoolsRes.data ?? [];

  const now = new Date();
  const recentWindow = new Date(now);
  recentWindow.setDate(recentWindow.getDate() - 30);
  const previousWindow = new Date(now);
  previousWindow.setDate(previousWindow.getDate() - 60);

  // Presentations per month (last 12 months)
  const monthBuckets = new Map<string, { month: string; count: number }>();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now);
    d.setMonth(d.getMonth() - i);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    monthBuckets.set(key, { month: formatMonthKey(d), count: 0 });
  }
  presentations.forEach((p) => {
    const date = p.scheduled_date ? new Date(p.scheduled_date) : null;
    if (!date) return;
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    if (monthBuckets.has(key)) {
      monthBuckets.get(key)!.count += 1;
    }
  });
  const presentationsPerMonth = Array.from(monthBuckets.values());

  const totalPresentations = presentations.length;
  const upcomingPresentations = presentations.filter((p) => {
    if (!p.scheduled_date) return false;
    const date = new Date(p.scheduled_date);
    return date >= now && (p.status === "scheduled" || p.status === "pending");
  }).length;

  const presentationGrowth = (() => {
    const recent = presentations.filter((p) => {
      if (!p.scheduled_date) return false;
      const d = new Date(p.scheduled_date);
      return d >= recentWindow;
    }).length;
    const previous = presentations.filter((p) => {
      if (!p.scheduled_date) return false;
      const d = new Date(p.scheduled_date);
      return d < recentWindow && d >= previousWindow;
    }).length;
    if (previous === 0) return recent > 0 ? 100 : 0;
    return ((recent - previous) / previous) * 100;
  })();

  // Volunteer hours metrics
  const volunteerLookup = new Map<string, { name: string; team: string | null; status: string | null }>();
  volunteers.forEach((v: any) => {
    volunteerLookup.set(v.user_id, {
      name: v.users?.name ?? "Volunteer",
      team: v.team_name ?? null,
      status: v.status ?? null
    });
  });

  const approvedHours = volunteerHours.filter((v: any) => v.status === "approved");
  const totalVolunteerHours = approvedHours.reduce((sum, row: any) => sum + Number(row.hours_logged ?? 0), 0);
  const activeVolunteers = volunteers.filter((v: any) => (v.status ?? "active") === "active").length;
  const avgHoursPerVolunteer = activeVolunteers > 0 ? totalVolunteerHours / activeVolunteers : 0;

  const volunteerGrowth = (() => {
    const recent = approvedHours
      .filter((row: any) => {
        const d = row.date ? new Date(row.date) : new Date(row.created_at ?? 0);
        return d >= recentWindow;
      })
      .reduce((sum, row: any) => sum + Number(row.hours_logged ?? 0), 0);
    const previous = approvedHours
      .filter((row: any) => {
        const d = row.date ? new Date(row.date) : new Date(row.created_at ?? 0);
        return d < recentWindow && d >= previousWindow;
      })
      .reduce((sum, row: any) => sum + Number(row.hours_logged ?? 0), 0);
    if (previous === 0) return recent > 0 ? 100 : 0;
    return ((recent - previous) / previous) * 100;
  })();

  const volunteerHoursByTeamMap = new Map<string, number>();
  const topVolunteersMap = new Map<string, { name: string; hours: number; team: string | null }>();

  approvedHours.forEach((row: any) => {
    const volunteer = volunteerLookup.get(row.volunteer_id) ?? { name: "Volunteer", team: null, status: null };
    const team = volunteer.team ?? "General";
    const hours = Number(row.hours_logged ?? 0);
    volunteerHoursByTeamMap.set(team, (volunteerHoursByTeamMap.get(team) ?? 0) + hours);

    const existing = topVolunteersMap.get(row.volunteer_id) ?? { name: volunteer.name, hours: 0, team: volunteer.team };
    existing.hours += hours;
    topVolunteersMap.set(row.volunteer_id, existing);
  });

  const volunteerHoursByTeam = Array.from(volunteerHoursByTeamMap.entries())
    .map(([team, hours]) => ({ team, hours }))
    .sort((a, b) => b.hours - a.hours);

  const topVolunteers = Array.from(topVolunteersMap.values()).sort((a, b) => b.hours - a.hours);

  // Chapter health
  const activeChapters = chapters.filter((c: any) => (c.status ?? "active") === "active").length;
  const inactiveChapters = chapters.length - activeChapters;

  // Top schools by presentations
  const schoolLookup = new Map<number, string>();
  schools.forEach((s: any) => {
    if (typeof s.id === "number") {
      schoolLookup.set(s.id, s.name ?? "School");
    }
  });

  const schoolMap = new Map<string, { name: string; presentations: number; students: number }>();
  presentations.forEach((p: any) => {
    const name = schoolLookup.get(p.school_id) ?? "Unassigned";
    const entry = schoolMap.get(name) ?? { name, presentations: 0, students: 0 };
    entry.presentations += 1;
    entry.students += Number(p.student_count ?? 0);
    schoolMap.set(name, entry);
  });
  const topSchools = Array.from(schoolMap.values()).sort((a, b) => b.presentations - a.presentations);

  const metricsForCards = {
    totalPresentations,
    totalVolunteerHours,
    activeVolunteers,
    avgHoursPerVolunteer,
    upcomingPresentations,
    volunteerGrowth,
    presentationGrowth
  };

  const metricsForCharts = {
    presentationsPerMonth,
    activeVsInactive: { active: activeChapters, inactive: inactiveChapters },
    volunteerHoursByTeam
  };

  return (
    <div className="container py-10">
      <AnalyticsDashboard
        initialData={{
          metrics: metricsForCards,
          charts: metricsForCharts,
          volunteers: topVolunteers,
          schools: topSchools
        }}
      />
    </div>
  );
}
