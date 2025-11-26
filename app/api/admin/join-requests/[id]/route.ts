import { NextRequest, NextResponse } from "next/server";
import { getServerComponentClient } from "@/lib/supabase/server";
import { getUserRoleServer } from "@/lib/auth/guards";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getServerComponentClient();
    const role = await getUserRoleServer(supabase);

    if (role !== "founder") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { action, teamResponse } = body;

    // Get the current request
    const { data: currentRequest, error: fetchError } = await supabase
      .from("team_join_requests")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !currentRequest) {
      return NextResponse.json({ error: "Join request not found" }, { status: 404 });
    }

    let updateData: any = {};

    if (action === 'approve') {
      updateData = {
        status: 'admin_approved',
        admin_reviewed_at: new Date().toISOString(),
      };
      // TODO: Send notification email to the team about the approved request
    } else if (action === 'reject') {
      updateData = {
        status: 'admin_rejected',
        admin_reviewed_at: new Date().toISOString(),
      };
      // TODO: Send rejection email to the volunteer
    } else if (action === 'accept' || action === 'decline') {
      // This would typically be called by team members, not admin
      // For now, admin can also manage team responses
      updateData = {
        status: action === 'accept' ? 'accepted' : 'declined',
        team_responded_at: new Date().toISOString(),
        team_response: teamResponse || null,
      };
      // TODO: Send response email to the volunteer
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const { data: updatedRequest, error: updateError } = await supabase
      .from("team_join_requests")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({
      success: true,
      request: updatedRequest
    });
  } catch (error) {
    console.error("Error updating join request:", error);
    return NextResponse.json(
      { error: "Failed to update join request" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getServerComponentClient();
    const role = await getUserRoleServer(supabase);

    if (role !== "founder") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;

    const { error } = await supabase
      .from("team_join_requests")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting join request:", error);
    return NextResponse.json(
      { error: "Failed to delete join request" },
      { status: 500 }
    );
  }
}
