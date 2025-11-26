import { NextResponse } from "next/server";
import { getServerComponentClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = getServerComponentClient();

    // Get top 10 volunteers by presentations count
    // This aggregates data from volunteer_impact table
    const { data: impactData, error } = await supabase
      .from("volunteer_impact")
      .select(`
        volunteer_id,
        metric_type,
        value,
        users!volunteer_impact_volunteer_id_fkey (
          id,
          name,
          created_at
        )
      `);

    if (error) throw error;

    // Aggregate data by volunteer
    const volunteerStats = new Map();

    impactData?.forEach(record => {
      const volunteerId = record.volunteer_id;
      const user = record.users;

      if (!user) return;

      if (!volunteerStats.has(volunteerId)) {
        volunteerStats.set(volunteerId, {
          id: volunteerId,
          name: user.name || 'Unknown Volunteer',
          presentationsCount: 0,
          hoursLogged: 0,
          studentsReached: 0,
          joinDate: user.created_at,
          teams: [] // This would need to be populated from team membership data
        });
      }

      const stats = volunteerStats.get(volunteerId);

      switch (record.metric_type) {
        case 'presentations':
          stats.presentationsCount += record.value || 0;
          break;
        case 'hours_logged':
          stats.hoursLogged += record.value || 0;
          break;
        case 'students_reached':
          stats.studentsReached += record.value || 0;
          break;
      }
    });

    // Convert to array and sort by presentations count
    const topVolunteers = Array.from(volunteerStats.values())
      .sort((a, b) => b.presentationsCount - a.presentationsCount)
      .slice(0, 10);

    // If no impact data, return empty array
    // In production, you might want to show some default volunteers
    return NextResponse.json({ volunteers: topVolunteers });
  } catch (error) {
    console.error("Error fetching top volunteers:", error);
    return NextResponse.json(
      { error: "Failed to fetch top volunteers" },
      { status: 500 }
    );
  }
}
