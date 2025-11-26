import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { getUserFromRequest } from "@/lib/auth/guards";

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const user = await getUserFromRequest();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's join requests with team information
    const { data: requests, error } = await supabase
      .from("team_join_requests")
      .select(`
        id,
        status,
        created_at,
        admin_reviewed_at,
        team_responded_at,
        team_response,
        team_openings!team_join_requests_team_id_fkey (
          volunteers(name)
        )
      `)
      .eq("volunteer_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Transform the data for the frontend
    const formattedRequests = requests?.map(request => ({
      id: request.id,
      teamId: request.team_id,
      teamName: request.team_openings?.volunteers?.name || 'Unknown Team',
      status: request.status,
      submittedAt: request.created_at,
      adminReviewedAt: request.admin_reviewed_at,
      teamRespondedAt: request.team_responded_at,
      teamResponse: request.team_response,
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
