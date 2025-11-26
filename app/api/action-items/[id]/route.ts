import { NextRequest, NextResponse } from "next/server";
import { getServerComponentClient } from "@/lib/supabase/server";
import { getUserFromRequest } from "@/lib/auth/getUserFromRequest";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getServerComponentClient();
    const user = await getUserFromRequest();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: item, error } = await supabase
      .from("action_items")
      .select(`
        *,
        assigned_by_user:users!action_items_assigned_by_fkey(id, name, email),
        completed_by_user:users!action_items_completed_by_fkey(id, name, email),
        action_item_comments(
          id,
          comment,
          is_internal,
          created_at,
          user:users(id, name, email)
        ),
        action_item_history(
          id,
          action,
          old_value,
          new_value,
          metadata,
          created_at,
          user:users(id, name)
        )
      `)
      .eq("id", params.id)
      .single();

    if (error) {
      console.error("Error fetching action item:", error);
      return NextResponse.json({ error: "Action item not found" }, { status: 404 });
    }

    // Check permissions
    const canAccess = item.assigned_to?.includes(user.id) ||
                     item.assigned_by === user.id ||
                     ["founder", "admin"].includes(user.role);

    if (!canAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json({
      item,
      success: true
    });

  } catch (error) {
    console.error("Error in action item GET:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
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
    const updates: any = {};

    // Fields that can be updated
    const allowedFields = [
      'title', 'description', 'priority', 'assigned_to', 'due_date',
      'status', 'metadata', 'action_required', 'tags'
    ];

    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    });

    // Handle status changes specially
    if (updates.status) {
      updates.updated_at = new Date().toISOString();

      if (updates.status === 'completed') {
        updates.completed_at = new Date().toISOString();
        updates.completed_by = user.id;
      }
    }

    // Check permissions for assignment changes
    if (updates.assigned_to && !["founder", "admin"].includes(user.role)) {
      // Non-admin users can only assign to themselves
      const filteredAssignedTo = updates.assigned_to.filter((id: string) => id === user.id);
      if (filteredAssignedTo.length !== updates.assigned_to.length) {
        return NextResponse.json({ error: "You can only assign items to yourself" }, { status: 403 });
      }
    }

    // First check if user can access this item
    const { data: existingItem } = await supabase
      .from("action_items")
      .select("assigned_to, assigned_by")
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

    // Update the item
    const { data: updatedItem, error } = await supabase
      .from("action_items")
      .update(updates)
      .eq("id", params.id)
      .select(`
        *,
        assigned_by_user:users!action_items_assigned_by_fkey(id, name, email),
        completed_by_user:users!action_items_completed_by_fkey(id, name, email)
      `)
      .single();

    if (error) {
      console.error("Error updating action item:", error);
      return NextResponse.json({ error: "Failed to update action item" }, { status: 500 });
    }

    // Log changes in history
    if (Object.keys(updates).length > 0) {
      const historyEntries = Object.entries(updates).map(([field, newValue]) => ({
        action_item_id: params.id,
        user_id: user.id,
        action: 'updated',
        old_value: existingItem[field],
        new_value: newValue,
        metadata: { field, updated_by: user.id }
      }));

      await supabase
        .from("action_item_history")
        .insert(historyEntries);
    }

    return NextResponse.json({
      item: updatedItem,
      success: true
    });

  } catch (error) {
    console.error("Error updating action item:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getServerComponentClient();
    const user = await getUserFromRequest();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only founders/admins can delete action items
    if (!["founder", "admin"].includes(user.role)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { error } = await supabase
      .from("action_items")
      .delete()
      .eq("id", params.id);

    if (error) {
      console.error("Error deleting action item:", error);
      return NextResponse.json({ error: "Failed to delete action item" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Action item deleted"
    });

  } catch (error) {
    console.error("Error deleting action item:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
