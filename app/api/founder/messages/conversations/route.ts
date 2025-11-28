import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { getUserRoleServer } from "@/lib/auth/guards";

export async function GET(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const role = await getUserRoleServer(supabase as any);

    if (role !== "founder" && role !== "intern") {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    // Get all conversations involving founders
    const { data: conversations, error } = await supabase
      .from("conversations")
      .select(`
        id,
        type,
        created_at,
        conversation_participants (
          user_id,
          users (
            id,
            name,
            role
          )
        )
      `)
      .eq("conversation_participants.users.role", "founder");

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    // Get last messages and unread counts for each conversation
    const enrichedConversations = await Promise.all(
      (conversations || []).map(async (conv) => {
        // Get last message
        const { data: lastMessage } = await supabase
          .from("messages")
          .select(`
            content,
            created_at,
            sender_id,
            users!messages_sender_id_fkey (
              name
            )
          `)
          .eq("conversation_id", conv.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        // Get unread count (messages after last read)
        const { count: unreadCount } = await supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("conversation_id", conv.id)
          .gt("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()); // Last 24 hours as proxy

        const participants = conv.conversation_participants?.map((cp: any) => ({
          id: cp.users?.id,
          name: cp.users?.name || "Unknown",
          role: cp.users?.role || "volunteer"
        })) || [];

        return {
          id: conv.id,
          type: conv.type,
          participants,
          teamName: conv.type === 'team' ? participants.find((p: any) => p.role !== 'founder')?.name + "'s Team" : undefined,
          lastMessage: lastMessage ? {
            content: lastMessage.content,
            sender_name: lastMessage.users?.name || "Unknown",
            timestamp: lastMessage.created_at
          } : undefined,
          unreadCount: unreadCount || 0
        };
      })
    );

    return NextResponse.json({ ok: true, conversations: enrichedConversations });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const role = await getUserRoleServer(supabase as any);

    if (role !== "founder" && role !== "intern") {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    const { type, participantIds } = await req.json();

    if (!type || !participantIds || participantIds.length === 0) {
      return NextResponse.json({ ok: false, error: "Missing required fields" }, { status: 400 });
    }

    // Get current user
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    // Check if conversation already exists
    let existingConversation = null;
    if (type === 'individual' && participantIds.length === 1) {
      const { data: existing } = await supabase
        .from("conversations")
        .select(`
          id,
          conversation_participants!inner(user_id)
        `)
        .eq("type", "individual")
        .eq("conversation_participants.user_id", session.user.id)
        .eq("conversation_participants.user_id", participantIds[0]);

      if (existing && existing.length > 0) {
        existingConversation = existing[0];
      }
    }

    if (existingConversation) {
      return NextResponse.json({ ok: true, conversation: existingConversation });
    }

    // Create new conversation
    const { data: conversation, error: convError } = await supabase
      .from("conversations")
      .insert({
        type,
        created_by: session.user.id
      })
      .select()
      .single();

    if (convError) {
      return NextResponse.json({ ok: false, error: convError.message }, { status: 500 });
    }

    // Add participants (including current user)
    const allParticipantIds = [...participantIds, session.user.id];
    const participantsData = allParticipantIds.map(userId => ({
      conversation_id: conversation.id,
      user_id: userId
    }));

    const { error: partError } = await supabase
      .from("conversation_participants")
      .insert(participantsData);

    if (partError) {
      return NextResponse.json({ ok: false, error: partError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, conversation });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
