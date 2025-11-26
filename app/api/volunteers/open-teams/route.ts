import { NextResponse } from "next/server";
import { getServerComponentClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = getServerComponentClient();

    // Get open teams with their details
    const { data: openings, error } = await supabase
      .from("team_openings")
      .select(`
        id,
        status,
        max_members,
        current_members,
        location,
        description,
        requirements,
        volunteers!team_openings_team_id_fkey (
          id,
          name,
          meeting_schedule,
          presentation_experience
        )
      `)
      .eq("status", "open");

    if (error) throw error;

    // Transform the data for the frontend
    const teams = openings?.map(opening => ({
      id: opening.id,
      teamName: opening.volunteers?.name || 'Unnamed Team',
      location: opening.location || 'Location TBD',
      maxMembers: opening.max_members,
      currentMembers: opening.current_members,
      description: opening.description || 'No description available',
      requirements: opening.requirements || '',
      meetingSchedule: opening.volunteers?.meeting_schedule,
      presentationExperience: opening.volunteers?.presentation_experience,
    })) || [];

    return NextResponse.json({ teams });
  } catch (error) {
    console.error("Error fetching open teams:", error);
    return NextResponse.json(
      { error: "Failed to fetch open teams" },
      { status: 500 }
    );
  }
}
