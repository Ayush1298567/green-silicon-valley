import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export type AnalyticsMetrics = {
  totalPresentationsAllTime: number;
  totalVolunteerHoursAllTime: number;
  schoolsReachedAllTime: number;
  activeChapters: number;
  inactiveChapters: number;
  fundingReceived: number;
  fundingPending: number;
  presentationsPerMonth: Array<{ month: string; count: number }>;
  volunteerHoursByChapter: Array<{ chapter: string; hours: number }>;
  activeVsInactive: { active: number; inactive: number };
  topVolunteers: Array<{ name: string | null; hours: number }>;
};

export async function computeAnalytics(): Promise<AnalyticsMetrics> {
  const supabase = createRouteHandlerClient({ cookies });

  const { data: presAll } = await supabase
    .from("presentations")
    .select("id, hours, date");

  const { data: schools } = await supabase.from("schools").select("id");
  const { data: chapters } = await supabase
    .from("chapters")
    .select("id, name, status, region");
  const { data: donations } = await supabase
    .from("donations")
    .select("amount, date, acknowledgment_sent");
  const { data: grants } = await supabase
    .from("grants")
    .select("status, notes");
  const { data: volunteersRows } = await supabase
    .from("volunteers")
    .select("id, hours_total");
  const { data: usersRows } = await supabase
    .from("users")
    .select("id, name, role");

  const totalPresentationsAllTime = presAll?.length ?? 0;
  const totalVolunteerHoursAllTime =
    presAll?.reduce((sum, p) => sum + (p.hours ?? 0), 0) ?? 0;
  const schoolsReachedAllTime = schools?.length ?? 0;

  const activeChapters =
    chapters?.filter((c) => (c.status ?? "").toLowerCase() === "active")
      ?.length ?? 0;
  const inactiveChapters = (chapters?.length ?? 0) - activeChapters;

  const fundingReceived =
    donations?.reduce((sum, d) => sum + Number(d.amount ?? 0), 0) ?? 0;
  const fundingPending =
    grants?.filter((g) => (g.status ?? "").toLowerCase() !== "awarded")
      ?.length ?? 0;

  // Presentations per month (last 12 months)
  const byMonthMap = new Map<string, number>();
  for (const p of presAll ?? []) {
    const d = p.date ? new Date(p.date) : null;
    if (!d) continue;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    byMonthMap.set(key, (byMonthMap.get(key) ?? 0) + 1);
  }
  const presentationsPerMonth = Array.from(byMonthMap.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([month, count]) => ({ month, count }));

  // Hours by chapter (aggregate volunteers.hours_total by chapter if known)
  // As we don't have direct mapping, use chapters table and assume 0 for now
  const volunteerHoursByChapter =
    chapters?.map((c) => ({
      chapter: c.name ?? "Unknown",
      hours: 0
    })) ?? [];

  const activeVsInactive = { active: activeChapters, inactive: inactiveChapters };

  // Top volunteers (from volunteers table)
  const topVolunteers =
    (volunteersRows ?? [])
      .map((v) => ({
        name: (usersRows ?? []).find((u) => u.id === (v as any).user_id)?.name ?? null,
        hours: v.hours_total ?? 0
      }))
      .sort((a, b) => b.hours - a.hours)
      .slice(0, 10) ?? [];

  return {
    totalPresentationsAllTime,
    totalVolunteerHoursAllTime,
    schoolsReachedAllTime,
    activeChapters,
    inactiveChapters,
    fundingReceived,
    fundingPending,
    presentationsPerMonth,
    volunteerHoursByChapter,
    activeVsInactive,
    topVolunteers
  };
}

export async function writeAnalyticsCache(metrics: AnalyticsMetrics) {
  const supabase = createRouteHandlerClient({ cookies });
  const pairs: Array<[string, number]> = [
    ["totalPresentationsAllTime", metrics.totalPresentationsAllTime],
    ["totalVolunteerHoursAllTime", metrics.totalVolunteerHoursAllTime],
    ["schoolsReachedAllTime", metrics.schoolsReachedAllTime],
    ["activeChapters", metrics.activeChapters],
    ["inactiveChapters", metrics.inactiveChapters],
    ["fundingReceived", metrics.fundingReceived],
    ["fundingPending", metrics.fundingPending]
  ];
  for (const [metric_name, metric_value] of pairs) {
    await supabase.from("analytics_cache").insert({ metric_name, metric_value });
  }
}


