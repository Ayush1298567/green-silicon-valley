import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

// GET - Fetch notifications for current user
export async function GET(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const unreadOnly = searchParams.get("unread_only") === "true";
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    let query = supabase
      .from("notifications")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (unreadOnly) {
      query = query.eq("is_read", false);
    }

    const { data: notifications, error } = await query;

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    // Get unread count
    const { count: unreadCount } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", session.user.id)
      .eq("is_read", false);

    return NextResponse.json({
      ok: true,
      notifications: notifications || [],
      unread_count: unreadCount || 0
    });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

// POST - Create a notification (typically done by system/triggers)
export async function POST(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is staff
    const { data: userRow } = await supabase.from("users").select("role").eq("id", session.user.id).single();
    if (userRow?.role !== "founder" && userRow?.role !== "intern") {
      return NextResponse.json({ ok: false, error: "Only staff can create notifications" }, { status: 403 });
    }

    const body = await req.json();
    const {
      user_id,
      notification_type,
      title,
      message,
      action_url,
      related_id,
      related_type,
      metadata = {}
    } = body;

    if (!user_id || !notification_type || !title || !message) {
      return NextResponse.json({ ok: false, error: "Missing required fields" }, { status: 400 });
    }

    const { data: notification, error } = await supabase
      .from("notifications")
      .insert({
        user_id,
        notification_type,
        title,
        message,
        action_url: action_url || null,
        related_id: related_id || null,
        related_type: related_type || null,
        metadata
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, notification });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

