import { NextRequest, NextResponse } from "next/server";
import { getServerComponentClient } from "@/lib/supabase/server";
import { getUserRoleServer } from "@/lib/auth/guards";

export async function GET(request: NextRequest) {
  try {
    const supabase = getServerComponentClient();
    const role = await getUserRoleServer(supabase);

    if (role !== "founder") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let query = supabase
      .from("team_join_requests")
      .select(`
        id,
        status,
        created_at,
        admin_reviewed_at,
        team_responded_at,
        team_response,
        users!team_join_requests_volunteer_id_fkey (
          id,
          name,
          email,
          phone,
          school_affiliation
        ),
        team_openings (
          id,
          location,
          volunteers (
            id,
            name,
            meeting_schedule
          )
        )
      `)
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    const { data: requests, error } = await query;

    if (error) throw error;

    // Transform the data for the frontend
    const formattedRequests = requests?.map(request => ({
      id: request.id,
      status: request.status,
      submittedAt: request.created_at,
      adminReviewedAt: request.admin_reviewed_at,
      teamRespondedAt: request.team_responded_at,
      teamResponse: request.team_response,
      volunteer: {
        id: request.users?.id,
        name: request.users?.name,
        email: request.users?.email,
        phone: request.users?.phone,
        school: request.users?.school_affiliation,
      },
      team: {
        id: request.team_openings?.id,
        name: request.team_openings?.volunteers?.name || 'Unknown Team',
        location: request.team_openings?.location,
        meetingSchedule: request.team_openings?.volunteers?.meeting_schedule,
      }
    })) || [];

    return NextResponse.json({ requests: formattedRequests });
  } catch (error) {
    console.error("Error fetching join requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch join requests" },
      { status: 500 }
    );
  }
}
