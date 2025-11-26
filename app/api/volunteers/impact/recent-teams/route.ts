import { NextResponse } from "next/server";
import { getServerComponentClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = getServerComponentClient();

    // Get active teams with their recent activity
    const { data: teams, error } = await supabase
      .from("volunteers")
      .select(`
        id,
        name,
        location,
        created_at,
        presentations (
          id,
          presentation_date,
          status
        )
      `)
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) throw error;

    // Process team data
    const recentTeams = teams?.map(team => {
      const completedPresentations = team.presentations?.filter(p => p.status === 'completed') || [];
      const lastPresentation = completedPresentations.length > 0
        ? completedPresentations.sort((a, b) =>
            new Date(b.presentation_date).getTime() - new Date(a.presentation_date).getTime()
          )[0].presentation_date
        : team.created_at;

      return {
        id: team.id,
        name: team.name || 'Unnamed Team',
        location: team.location || 'Location TBD',
        presentationsCompleted: completedPresentations.length,
        members: 1, // This would need to be calculated from team membership
        lastPresentation: lastPresentation,
      };
    }) || [];

    return NextResponse.json({ teams: recentTeams });
  } catch (error) {
    console.error("Error fetching recent teams:", error);
    return NextResponse.json(
      { error: "Failed to fetch recent teams" },
      { status: 500 }
    );
  }
}
