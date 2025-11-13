import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { getUserRoleServer } from "@/lib/auth/guards";

function formatMonthKey(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export async function GET(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const role = await getUserRoleServer(supabase as any);
  
  if (role !== "founder" && role !== "intern") {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("start") || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = searchParams.get("end") || new Date().toISOString();

    const [presentationsRes, volunteerHoursRes, volunteersRes, chaptersRes, schoolsRes] = await Promise.all([
      supabase
        .from("presentations")
        .select("id, status, scheduled_date, student_count, school_id")
        .gte("scheduled_date", startDate)
        .lte("scheduled_date", endDate)
        .order("scheduled_date", { ascending: true }),
      supabase
        .from("volunteer_hours")
        .select("id, volunteer_id, hours_logged, status, date, created_at")
        .gte("date", startDate)
        .lte("date", endDate),
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

    // Presentations per month
    const monthBuckets = new Map<string, { month: string; count: number }>();
    const start = new Date(startDate);
    const end = new Date(endDate);
    for (let d = new Date(start); d <= end; d.setMonth(d.getMonth() + 1)) {
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

    // Student engagement
    const studentEngagementMap = new Map<string, number>();
    presentations.forEach((p) => {
      const date = p.scheduled_date ? new Date(p.scheduled_date) : null;
      if (!date) return;
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      studentEngagementMap.set(key, (studentEngagementMap.get(key) || 0) + (p.student_count || 0));
    });
    const studentEngagement = Array.from(studentEngagementMap.entries())
      .map(([key, students]) => {
        const [year, month] = key.split("-").map(Number);
        return { month: formatMonthKey(new Date(year, month)), students };
      })
      .sort((a, b) => a.month.localeCompare(b.month));

    // Hours trend
    const hoursTrendMap = new Map<string, number>();
    volunteerHours
      .filter((h: any) => h.status === "approved")
      .forEach((h: any) => {
        const date = h.date ? new Date(h.date) : new Date(h.created_at || 0);
        const key = `${date.getFullYear()}-${date.getMonth()}`;
        hoursTrendMap.set(key, (hoursTrendMap.get(key) || 0) + (h.hours_logged || 0));
      });
    const hoursTrend = Array.from(hoursTrendMap.entries())
      .map(([key, hours]) => {
        const [year, month] = key.split("-").map(Number);
        return { month: formatMonthKey(new Date(year, month)), hours };
      })
      .sort((a, b) => a.month.localeCompare(b.month));

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

    const activeChapters = chapters.filter((c: any) => (c.status ?? "active") === "active").length;
    const inactiveChapters = chapters.length - activeChapters;

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

    return NextResponse.json({
      ok: true,
      data: {
        metrics: {
          totalPresentations,
          totalVolunteerHours,
          activeVolunteers,
          avgHoursPerVolunteer,
          upcomingPresentations,
          volunteerGrowth,
          presentationGrowth
        },
        charts: {
          presentationsPerMonth,
          volunteerHoursByTeam,
          studentEngagement,
          hoursTrend,
          activeVsInactive: { active: activeChapters, inactive: inactiveChapters }
        },
        volunteers: topVolunteers,
        schools: topSchools
      }
    });
  } catch (error: any) {
    console.error("Analytics error:", error);
    return NextResponse.json({ ok: false, error: error.message || "Failed to fetch analytics" }, { status: 500 });
  }
}
