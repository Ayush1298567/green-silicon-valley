import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { getUserRoleServer } from "@/lib/auth/guards";

export async function GET(req: Request) {
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

    // Get user's volunteer record
    const { data: volunteer } = await supabase
      .from("volunteers")
      .select("id")
      .eq("user_id", session.user.id)
      .single();

    if (!volunteer) {
      return NextResponse.json({ ok: true, conversations: [] });
    }

    // Get all conversations involving this volunteer
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
      .eq("conversation_participants.user_id", session.user.id);

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

        // For unread count, check messages since last read (simplified - last 24 hours)
        const { count: unreadCount } = await supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("conversation_id", conv.id)
          .neq("sender_id", session.user.id)
          .gt("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

        const participants = conv.conversation_participants?.map((cp: any) => ({
          id: cp.users?.id,
          name: cp.users?.name || "Unknown",
          role: cp.users?.role || "volunteer"
        })) || [];

        return {
          id: conv.id,
          type: conv.type,
          participants,
          teamName: conv.type === 'team' ? participants.find((p: any) => p.role !== 'volunteer')?.name + "'s Team" : undefined,
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
