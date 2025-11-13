import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function GET(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "hours_all_time";
  const limit = parseInt(searchParams.get("limit") || "10");

  // Calculate leaderboard based on type
  if (type.startsWith("hours_")) {
    // Hours leaderboard
    const period = type.replace("hours_", "");
    let startDate: Date | null = null;

    if (period === "this_year") {
      const now = new Date();
      startDate = new Date(now.getFullYear(), 0, 1);
    } else if (period === "this_month") {
      const now = new Date();
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    let hoursQuery = supabase
      .from("volunteer_hours")
      .select("volunteer_id, hours_logged")
      .eq("status", "approved");

    if (startDate) {
      hoursQuery = hoursQuery.gte("date", startDate.toISOString());
    }

    const { data: hoursData } = await hoursQuery;

    // Aggregate hours by volunteer
    const volunteerHours: Record<string, number> = {};
    hoursData?.forEach((h: any) => {
      volunteerHours[h.volunteer_id] = (volunteerHours[h.volunteer_id] || 0) + (h.hours_logged || 0);
    });

    // Get volunteer details
    const volunteerIds = Object.keys(volunteerHours);
    const { data: volunteers } = await supabase
      .from("volunteers")
      .select(`
        id,
        user_id,
        user:users!volunteers_user_id_fkey(id, name, email)
      `)
      .in("user_id", volunteerIds);

    // Build leaderboard entries
    const entries = volunteers
      ?.map((v: any) => ({
        volunteer_id: v.id,
        score: volunteerHours[v.user_id] || 0,
        volunteer: v
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((entry: any, idx: number) => ({
        ...entry,
        rank: idx + 1
      })) || [];

    return NextResponse.json({ ok: true, entries });
  }

  return NextResponse.json({ ok: false, error: "Invalid leaderboard type" }, { status: 400 });
}

