import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { getUserRoleServer } from "@/lib/auth/guards";

export async function POST(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const role = await getUserRoleServer(supabase as any);

    if (role !== "volunteer") {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    const { conversationId, content } = await req.json();

    if (!conversationId || !content || content.trim().length === 0) {
      return NextResponse.json({ ok: false, error: "Missing required fields" }, { status: 400 });
    }

    // Get current user
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    // Verify user is participant in conversation
    const { data: participant } = await supabase
      .from("conversation_participants")
      .select("*")
      .eq("conversation_id", conversationId)
      .eq("user_id", session.user.id)
      .single();

    if (!participant) {
      return NextResponse.json({ ok: false, error: "Not authorized for this conversation" }, { status: 403 });
    }

    // Send message
    const { data: message, error: msgError } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        sender_id: session.user.id,
        content: content.trim()
      })
      .select()
      .single();

    if (msgError) {
      return NextResponse.json({ ok: false, error: msgError.message }, { status: 500 });
    }

    // Create notifications for other participants
    const { data: otherParticipants } = await supabase
      .from("conversation_participants")
      .select("user_id")
      .eq("conversation_id", conversationId)
      .neq("user_id", session.user.id);

    if (otherParticipants) {
      const notifications = otherParticipants.map((participant: any) => ({
        user_id: participant.user_id,
        notification_type: "message_received",
        title: "New Message",
        message: `You have a new message from a volunteer`,
        action_url: "/dashboard/messages"
      }));

      await supabase.from("notifications").insert(notifications);
    }

    return NextResponse.json({ ok: true, message });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
