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

    // Verify user can access this action item
    const { data: item } = await supabase
      .from("action_items")
      .select("id")
      .eq("id", params.id)
      .or(`assigned_to.cs.{${user.id}},assigned_by.eq.${user.id}`)
      .single();

    if (!item && !["founder", "admin"].includes(user.role)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { data: comments, error } = await supabase
      .from("action_item_comments")
      .select(`
        id,
        comment,
        is_internal,
        created_at,
        user:users(id, name, email)
      `)
      .eq("action_item_id", params.id)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching comments:", error);
      return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
    }

    return NextResponse.json({
      comments: comments || [],
      success: true
    });

  } catch (error) {
    console.error("Error in comments API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
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
    const { comment, is_internal = false } = body;

    if (!comment || comment.trim().length === 0) {
      return NextResponse.json({ error: "Comment is required" }, { status: 400 });
    }

    // Verify user can access this action item
    const { data: item } = await supabase
      .from("action_items")
      .select("id")
      .eq("id", params.id)
      .or(`assigned_to.cs.{${user.id}},assigned_by.eq.${user.id}`)
      .single();

    if (!item && !["founder", "admin"].includes(user.role)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { data: newComment, error } = await supabase
      .from("action_item_comments")
      .insert({
        action_item_id: params.id,
        user_id: user.id,
        comment: comment.trim(),
        is_internal
      })
      .select(`
        id,
        comment,
        is_internal,
        created_at,
        user:users(id, name, email)
      `)
      .single();

    if (error) {
      console.error("Error creating comment:", error);
      return NextResponse.json({ error: "Failed to add comment" }, { status: 500 });
    }

    // Log comment in history
    await supabase
      .from("action_item_history")
      .insert({
        action_item_id: params.id,
        user_id: user.id,
        action: "commented",
        new_value: comment.substring(0, 100) + (comment.length > 100 ? "..." : ""),
        metadata: { comment_id: newComment.id, is_internal }
      });

    return NextResponse.json({
      comment: newComment,
      success: true
    });

  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
