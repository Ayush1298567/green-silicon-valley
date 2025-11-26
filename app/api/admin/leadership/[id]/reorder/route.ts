import { NextRequest, NextResponse } from "next/server";
import { getServerComponentClient } from "@/lib/supabase/server";
import { getUserRoleServer } from "@/lib/auth/guards";

export async function PATCH(
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
    const { direction } = body; // 'up' or 'down'

    // Get current leader
    const { data: currentLeader, error: fetchError } = await supabase
      .from("leadership_profiles")
      .select("id, order_index")
      .eq("id", id)
      .single();

    if (fetchError || !currentLeader) throw fetchError;

    // Find the adjacent leader
    const adjacentOrder = direction === 'up'
      ? currentLeader.order_index - 1
      : currentLeader.order_index + 1;

    const { data: adjacentLeader, error: adjacentError } = await supabase
      .from("leadership_profiles")
      .select("id, order_index")
      .eq("order_index", adjacentOrder)
      .single();

    if (adjacentError || !adjacentLeader) {
      // No adjacent item to swap with
      return NextResponse.json({ success: true });
    }

    // Swap the order indices
    const { error: updateError1 } = await supabase
      .from("leadership_profiles")
      .update({ order_index: adjacentLeader.order_index })
      .eq("id", currentLeader.id);

    const { error: updateError2 } = await supabase
      .from("leadership_profiles")
      .update({ order_index: currentLeader.order_index })
      .eq("id", adjacentLeader.id);

    if (updateError1 || updateError2) throw updateError1 || updateError2;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reordering leader:", error);
    return NextResponse.json(
      { error: "Failed to reorder leader" },
      { status: 500 }
    );
  }
}
