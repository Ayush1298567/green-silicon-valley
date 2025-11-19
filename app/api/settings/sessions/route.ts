import { NextRequest, NextResponse } from "next/server";
import { getServerComponentClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = getServerComponentClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Get user sessions (excluding current session for display)
    const { data: sessions, error } = await supabase
      .from("user_sessions")
      .select("*")
      .eq("user_id", session.user.id)
      .neq("is_current_session", true)
      .order("last_activity", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch sessions" },
        { status: 500 }
      );
    }

    // Format sessions for display
    const formattedSessions = sessions?.map(session => ({
      id: session.id,
      device: session.device_info?.browser || "Unknown Device",
      location: session.location?.city ? `${session.location.city}, ${session.location.country}` : "Unknown Location",
      ipAddress: session.ip_address,
      lastActivity: session.last_activity,
      createdAt: session.created_at,
    })) || [];

    return NextResponse.json({
      sessions: formattedSessions
    });

  } catch (error) {
    console.error("Sessions fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = getServerComponentClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID required" },
        { status: 400 }
      );
    }

    // Verify the session belongs to the user
    const { data: targetSession, error: fetchError } = await supabase
      .from("user_sessions")
      .select("user_id")
      .eq("id", sessionId)
      .single();

    if (fetchError || !targetSession) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    if (targetSession.user_id !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Delete the session
    const { error: deleteError } = await supabase
      .from("user_sessions")
      .delete()
      .eq("id", sessionId);

    if (deleteError) {
      return NextResponse.json(
        { error: "Failed to revoke session" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Session revoked successfully"
    });

  } catch (error) {
    console.error("Session revoke error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
