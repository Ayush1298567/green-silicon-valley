import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { getUserRoleServer } from "@/lib/auth/guards";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const role = await getUserRoleServer(supabase as any);

    if (role !== "volunteer") {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
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
      .eq("conversation_id", params.id)
      .eq("user_id", session.user.id)
      .single();

    if (!participant) {
      return NextResponse.json({ ok: false, error: "Not authorized for this conversation" }, { status: 403 });
    }

    // Get messages for conversation
    const { data: messages, error } = await supabase
      .from("messages")
      .select(`
        id,
        content,
        created_at,
        sender_id,
        users!messages_sender_id_fkey (
          name
        )
      `)
      .eq("conversation_id", params.id)
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    const formattedMessages = (messages || []).map((msg: any) => ({
      id: msg.id,
      content: msg.content,
      sender_id: msg.sender_id === session.user.id ? 'current-user' : msg.sender_id,
      sender_name: msg.sender_id === session.user.id ? 'You' : (msg.users?.name || "Unknown"),
      timestamp: msg.created_at,
      conversation_id: params.id
    }));

    return NextResponse.json({ ok: true, messages: formattedMessages });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
