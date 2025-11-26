"use client";

import { NextRequest, NextResponse } from "next/server";
import { getServerComponentClient } from "@/lib/supabase/server";
import { getUserFromRequest } from "@/lib/auth/getUserFromRequest";
import { actionItemsPermissions } from "@/lib/permissions/actionItemsPermissions";

export async function GET(request: NextRequest) {
  try {
    const supabase = getServerComponentClient();
    const user = await getUserFromRequest();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const type = searchParams.get("type");
    const assignedTo = searchParams.get("assigned_to");
    const limit = parseInt(searchParams.get("limit") || "50");

    let query = supabase
      .from("action_items")
      .select(`
        *,
        assigned_by_user:users!action_items_assigned_by_fkey(id, name, email),
        completed_by_user:users!action_items_completed_by_fkey(id, name, email)
      `)
      .order("created_at", { ascending: false })
      .limit(limit);

    // Filter by status if provided
    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    // Filter by priority if provided
    if (priority && priority !== "all") {
      query = query.eq("priority", priority);
    }

    // Filter by type if provided
    if (type && type !== "all") {
      query = query.eq("type", type);
    }

    // Filter by assigned user if provided
    if (assignedTo === "me") {
      query = query.contains("assigned_to", [user.id]);
    } else if (assignedTo && assignedTo !== "all") {
      query = query.contains("assigned_to", [assignedTo]);
    }

    // Apply permission-based filtering
    if (!permissions.canViewAll) {
      // Non-admin users only see items assigned to them or created by them
      query = query.or(`assigned_to.cs.{${user.id}},assigned_by.eq.${user.id}`);

      // Also filter by viewable types
      if (permissions.viewableTypes.length > 0 && !permissions.viewableTypes.includes('all')) {
        query = query.in('type', permissions.viewableTypes);
      }
    }

    const { data: items, error } = await query;

    if (error) {
      console.error("Error fetching action items:", error);
      return NextResponse.json({ error: "Failed to fetch action items" }, { status: 500 });
    }

    // Get counts for dashboard stats
    const { data: stats } = await supabase
      .from("action_items")
      .select("status, priority")
      .or(`assigned_to.cs.{${user.id}},assigned_by.eq.${user.id}`);

    const dashboardStats = {
      total: stats?.length || 0,
      pending: stats?.filter(item => item.status === "pending").length || 0,
      in_progress: stats?.filter(item => item.status === "in_progress").length || 0,
      completed: stats?.filter(item => item.status === "completed").length || 0,
      overdue: stats?.filter(item => {
        if (item.status !== "completed" && item.due_date) {
          return new Date(item.due_date) < new Date();
        }
        return false;
      }).length || 0,
      urgent: stats?.filter(item => item.priority === "urgent").length || 0
    };

    return NextResponse.json({
      items: items || [],
      stats: dashboardStats,
      success: true
    });

  } catch (error) {
    console.error("Error in action items API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getServerComponentClient();
    const user = await getUserFromRequest();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user permissions
    const permissions = await actionItemsPermissions.getUserPermissions(user.id, user.role);

    const body = await request.json();
    const {
      title,
      description,
      type,
      priority = "medium",
      assigned_to = [],
      due_date,
      metadata = {},
      related_entity_type,
      related_entity_id,
      action_required = {},
      tags = []
    } = body;

    // Validate required fields
    if (!title || !type) {
      return NextResponse.json({ error: "Title and type are required" }, { status: 400 });
    }

    // Check permissions for creation and assignment
    if (!permissions.canCreate) {
      return NextResponse.json({ error: "You don't have permission to create action items" }, { status: 403 });
    }

    // Check assignment permissions
    if (assigned_to.length > 0 && !permissions.canAssign) {
      // Users without assign permission can only assign to themselves
      const filteredAssignedTo = assigned_to.filter((id: string) => id === user.id);
      if (filteredAssignedTo.length !== assigned_to.length) {
        return NextResponse.json({ error: "You can only assign items to yourself" }, { status: 403 });
      }
    }

    // Check if assigned users are in the assignable roles
    if (assigned_to.length > 0 && permissions.assignableRoles?.length > 0) {
      // Get user roles for assigned users
      const { data: assignedUsers } = await supabase
        .from('users')
        .select('id, role')
        .in('id', assigned_to);

      const invalidAssignments = assignedUsers?.filter(u =>
        !permissions.assignableRoles!.includes(u.role)
      );

      if (invalidAssignments && invalidAssignments.length > 0) {
        return NextResponse.json({
          error: `You cannot assign items to users with roles: ${invalidAssignments.map(u => u.role).join(', ')}`
        }, { status: 403 });
      }
    }

    const { data: newItem, error } = await supabase
      .from("action_items")
      .insert({
        title,
        description,
        type,
        priority,
        assigned_to: assigned_to.length > 0 ? assigned_to : [user.id],
        assigned_by: user.id,
        due_date,
        metadata,
        related_entity_type,
        related_entity_id,
        action_required,
        tags,
        is_system_generated: false
      })
      .select(`
        *,
        assigned_by_user:users!action_items_assigned_by_fkey(id, name, email)
      `)
      .single();

    if (error) {
      console.error("Error creating action item:", error);
      return NextResponse.json({ error: "Failed to create action item" }, { status: 500 });
    }

    // Log creation in history
    await supabase
      .from("action_item_history")
      .insert({
        action_item_id: newItem.id,
        user_id: user.id,
        action: "created",
        new_value: "manual_creation",
        metadata: { created_by: user.id }
      });

    return NextResponse.json({
      item: newItem,
      success: true
    });

  } catch (error) {
    console.error("Error creating action item:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
