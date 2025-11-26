import { NextRequest, NextResponse } from "next/server";
import { getServerComponentClient } from "@/lib/supabase/server";
import { getUserFromRequest } from "@/lib/auth/getUserFromRequest";

export async function POST(request: NextRequest) {
  try {
    const supabase = getServerComponentClient();
    const user = await getUserFromRequest();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, itemIds, data = {} } = body;

    if (!action || !itemIds || !Array.isArray(itemIds)) {
      return NextResponse.json({ error: "Action and itemIds are required" }, { status: 400 });
    }

    // Verify user can access all items
    const { data: items } = await supabase
      .from("action_items")
      .select("id, assigned_to, assigned_by")
      .in("id", itemIds);

    if (!items || items.length !== itemIds.length) {
      return NextResponse.json({ error: "Some items not found" }, { status: 404 });
    }

    // Check permissions for each item
    for (const item of items) {
      const canAccess = item.assigned_to?.includes(user.id) ||
                       item.assigned_by === user.id ||
                       ["founder", "admin"].includes(user.role);

      if (!canAccess) {
        return NextResponse.json({ error: "Access denied to some items" }, { status: 403 });
      }
    }

    let result;

    switch (action) {
      case "status_update":
        if (!data.status) {
          return NextResponse.json({ error: "Status is required" }, { status: 400 });
        }

        // Bulk update status
        const { error: statusError } = await supabase
          .from("action_items")
          .update({
            status: data.status,
            updated_at: new Date().toISOString(),
            completed_at: data.status === 'completed' ? new Date().toISOString() : null,
            completed_by: data.status === 'completed' ? user.id : null
          })
          .in("id", itemIds);

        if (statusError) {
          return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
        }

        // Log history for each item
        const historyEntries = itemIds.map(itemId => ({
          action_item_id: itemId,
          user_id: user.id,
          action: "status_changed",
          new_value: data.status,
          metadata: { bulk_update: true }
        }));

        await supabase
          .from("action_item_history")
          .insert(historyEntries);

        result = { message: `Updated ${itemIds.length} items to ${data.status}` };
        break;

      case "assign":
        if (!["founder", "admin"].includes(user.role)) {
          return NextResponse.json({ error: "Only admins can bulk assign" }, { status: 403 });
        }

        if (!data.assigned_to || !Array.isArray(data.assigned_to)) {
          return NextResponse.json({ error: "assigned_to array is required" }, { status: 400 });
        }

        const { error: assignError } = await supabase
          .from("action_items")
          .update({
            assigned_to: data.assigned_to,
            updated_at: new Date().toISOString()
          })
          .in("id", itemIds);

        if (assignError) {
          return NextResponse.json({ error: "Failed to assign items" }, { status: 500 });
        }

        result = { message: `Assigned ${itemIds.length} items` };
        break;

      case "priority_update":
        if (!data.priority) {
          return NextResponse.json({ error: "Priority is required" }, { status: 400 });
        }

        const { error: priorityError } = await supabase
          .from("action_items")
          .update({
            priority: data.priority,
            updated_at: new Date().toISOString()
          })
          .in("id", itemIds);

        if (priorityError) {
          return NextResponse.json({ error: "Failed to update priority" }, { status: 500 });
        }

        result = { message: `Updated priority for ${itemIds.length} items` };
        break;

      case "delete":
        if (!["founder", "admin"].includes(user.role)) {
          return NextResponse.json({ error: "Only admins can bulk delete" }, { status: 403 });
        }

        const { error: deleteError } = await supabase
          .from("action_items")
          .delete()
          .in("id", itemIds);

        if (deleteError) {
          return NextResponse.json({ error: "Failed to delete items" }, { status: 500 });
        }

        result = { message: `Deleted ${itemIds.length} items` };
        break;

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error("Error in bulk action items:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
