import { NextRequest, NextResponse } from "next/server";
import { getServerComponentClient } from "@/lib/supabase/server";
import { getUserFromRequest } from "@/lib/auth/getUserFromRequest";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getServerComponentClient();
    const user = await getUserFromRequest();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 });
    }

    // Validate status
    const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled', 'overdue'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Check if user can access this action item
    const { data: existingItem } = await supabase
      .from("action_items")
      .select("assigned_to, assigned_by, status")
      .eq("id", params.id)
      .single();

    if (!existingItem) {
      return NextResponse.json({ error: "Action item not found" }, { status: 404 });
    }

    const canUpdate = existingItem.assigned_to?.includes(user.id) ||
                      existingItem.assigned_by === user.id ||
                      ["founder", "admin"].includes(user.role);

    if (!canUpdate) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Update status using the database function
    const { error } = await supabase.rpc('update_action_item_status', {
      p_item_id: params.id,
      p_new_status: status,
      p_user_id: user.id
    });

    if (error) {
      console.error("Error updating status:", error);
      return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
    }

    // Fetch updated item
    const { data: updatedItem, error: fetchError } = await supabase
      .from("action_items")
      .select(`
        *,
        assigned_by_user:users!action_items_assigned_by_fkey(id, name, email),
        completed_by_user:users!action_items_completed_by_fkey(id, name, email)
      `)
      .eq("id", params.id)
      .single();

    if (fetchError) {
      console.error("Error fetching updated item:", fetchError);
      return NextResponse.json({ error: "Status updated but failed to fetch item" }, { status: 500 });
    }

    return NextResponse.json({
      item: updatedItem,
      success: true,
      message: `Status updated to ${status}`
    });

  } catch (error) {
    console.error("Error updating action item status:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
