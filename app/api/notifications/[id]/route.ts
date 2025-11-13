import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

// PUT - Mark notification as read
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const { data: notification } = await supabase
      .from("notifications")
      .select("user_id")
      .eq("id", params.id)
      .single();

    if (!notification) {
      return NextResponse.json({ ok: false, error: "Notification not found" }, { status: 404 });
    }

    if (notification.user_id !== session.user.id) {
      return NextResponse.json({ ok: false, error: "Not authorized" }, { status: 403 });
    }

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq("id", params.id);

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

// DELETE - Delete notification
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const { data: notification } = await supabase
      .from("notifications")
      .select("user_id")
      .eq("id", params.id)
      .single();

    if (!notification) {
      return NextResponse.json({ ok: false, error: "Notification not found" }, { status: 404 });
    }

    if (notification.user_id !== session.user.id) {
      return NextResponse.json({ ok: false, error: "Not authorized" }, { status: 403 });
    }

    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", params.id);

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

