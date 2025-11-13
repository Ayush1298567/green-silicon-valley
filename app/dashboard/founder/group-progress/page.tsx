import { getServerComponentClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getDashboardPathForRole, type UserRole } from "@/lib/auth/roles";
import GroupProgressDashboard from "@/components/dashboard/founder/GroupProgressDashboard";

export const dynamic = "force-dynamic";

export default async function GroupProgressPage() {
  const supabase = getServerComponentClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const { data: userRow } = await supabase.from("users").select("role").eq("id", session.user.id).single();
  const role = (userRow?.role as UserRole) ?? "volunteer";

  if (role !== "founder" && role !== "intern") redirect(getDashboardPathForRole(role));

  // Pre-fetch initial data for better performance
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

  // Calculate basic metrics for initial load
  const totalPresentations = presentations.length;
  const upcomingPresentations = presentations.filter((p) => {
    if (!p.scheduled_date) return false;
    const date = new Date(p.scheduled_date);
    return date >= now && (p.status === "scheduled" || p.status === "pending");
  }).length;

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

  const presentationGrowth = (() => {
    const recent = presentations.filter((p) => {
      if (!p.scheduled_date) return false;
      const d = new Date(p.scheduled_date);
      return d >= recentWindow;
    }).length;
    const previous = presentations.filter((p) => {
      if (!p.scheduled_date) return false;
      const d = new Date(p.scheduled_date);
      return d < recentWindow && d >= new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    }).length;
    if (previous === 0) return recent > 0 ? 100 : 0;
    return ((recent - previous) / previous) * 100;
  })();

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
        return d < recentWindow && d >= new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
      })
      .reduce((sum, row: any) => sum + Number(row.hours_logged ?? 0), 0);
    if (previous === 0) return recent > 0 ? 100 : 0;
    return ((recent - previous) / previous) * 100;
  })();

  const metricsForCards = {
    totalPresentations,
    totalVolunteerHours,
    activeVolunteers,
    avgHoursPerVolunteer,
    upcomingPresentations,
    volunteerGrowth,
    presentationGrowth
  };

  return <GroupProgressDashboard initialData={{ metrics: metricsForCards, charts: {}, volunteers: [], schools: [] }} />;
}
