import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { getUserFromRequest } from "@/lib/auth/guards";

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const user = await getUserFromRequest();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { teamId } = body;

    if (!teamId) {
      return NextResponse.json({ error: "Team ID is required" }, { status: 400 });
    }

    // Check if the team opening exists and is still open
    const { data: opening, error: openingError } = await supabase
      .from("team_openings")
      .select("id, status, volunteers(name)")
      .eq("id", teamId)
      .eq("status", "open")
      .single();

    if (openingError || !opening) {
      return NextResponse.json({ error: "Team opening not found or no longer available" }, { status: 404 });
    }

    // Check if user already has a pending request for this team
    const { data: existingRequest } = await supabase
      .from("team_join_requests")
      .select("id, status")
      .eq("volunteer_id", user.id)
      .eq("team_id", teamId)
      .in("status", ["pending", "admin_approved"])
      .single();

    if (existingRequest) {
      return NextResponse.json({
        error: "You already have a pending request for this team"
      }, { status: 400 });
    }

    // Create the join request
    const { data: joinRequest, error: requestError } = await supabase
      .from("team_join_requests")
      .insert({
        volunteer_id: user.id,
        team_id: teamId,
        status: "pending"
      })
      .select()
      .single();

    if (requestError) throw requestError;

    // TODO: Send notification email to admin about new join request

    return NextResponse.json({
      success: true,
      requestId: joinRequest.id,
      message: "Join request submitted successfully. You'll be notified once it's reviewed."
    });
  } catch (error) {
    console.error("Error submitting join request:", error);
    return NextResponse.json(
      { error: "Failed to submit join request" },
      { status: 500 }
    );
  }
}
