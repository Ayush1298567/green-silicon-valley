import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getUserRoleServer } from "@/lib/auth/guards";

export async function getClient() {
  return createRouteHandlerClient({ cookies });
}

export async function isChannelMember(
  supabase: SupabaseClient,
  channelId: string,
  userId: string
): Promise<boolean> {
  const { data } = await supabase
    .from("channel_members")
    .select("id")
    .eq("channel_id", channelId)
    .eq("user_id", userId)
    .limit(1);
  return !!data?.length;
}

export async function sendMessage(params: {
  content: string;
  channelId?: string | null;
  recipientId?: string | null;
  replyToId?: string | null;
}) {
  const supabase = await getClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();
  if (!session) return { error: "Unauthorized" };
  const senderId = session.user.id;

  const { content, channelId, recipientId, replyToId } = params;

  // Simple rate limit: <=30 messages in last minute
  const sinceIso = new Date(Date.now() - 60 * 1000).toISOString();
  const { count } = await supabase
    .from("messages")
    .select("id", { count: "exact", head: true })
    .eq("sender_id", senderId)
    .gte("created_at", sinceIso);
  if ((count ?? 0) > 30) {
    await supabase.from("message_logs").insert({
      event_type: "rate_limited",
      payload: { senderId }
    });
    return { error: "Rate limited" };
  }

  if (channelId) {
    const member = await isChannelMember(supabase as any, channelId, senderId);
    if (!member) return { error: "Forbidden" };
  }

  const { error } = await supabase.from("messages").insert({
    sender_id: senderId,
    channel_id: channelId ?? null,
    recipient_id: recipientId ?? null,
    reply_to_id: replyToId ?? null,
    content
  });
  if (error) return { error: error.message };
  await supabase.from("message_logs").insert({
    event_type: "message_sent",
    payload: { senderId, channelId, recipientId }
  });
  return { ok: true };
}

export async function searchMessages(params: {
  q?: string;
  channelId?: string;
  senderId?: string;
  after?: string;
  before?: string;
}) {
  const supabase = await getClient();
  let query = supabase.from("messages").select("*").eq("deleted", false);
  if (params.channelId) query = query.eq("channel_id", params.channelId);
  if (params.senderId) query = query.eq("sender_id", params.senderId);
  if (params.after) query = query.gte("created_at", params.after);
  if (params.before) query = query.lte("created_at", params.before);
  if (typeof params.q === "string" && params.q.trim().length > 0) {
    // Use ILIKE as a fallback; full-text index exists
    query = query.ilike("content", `%${params.q}%`);
  }
  const { data, error } = await query.order("created_at", { ascending: true }).limit(200);
  if (error) return { error: error.message };
  return { data };
}

export async function createChannel(params: {
  name: string;
  type: string;
  description?: string;
  allowVolunteers?: boolean; // Allow volunteers to create team channels
}) {
  const supabase = await getClient();
  const role = await getUserRoleServer(supabase as any);
  
  // Allow volunteers only for team channels
  if (!params.allowVolunteers && role !== "founder" && role !== "intern") {
    return { error: "Forbidden" };
  }
  
  // For team channels, allow volunteers
  if (params.allowVolunteers && params.type === "team" && role !== "founder" && role !== "intern" && role !== "volunteer") {
    return { error: "Forbidden" };
  }
  
  const {
    data: { session }
  } = await supabase.auth.getSession();
  if (!session) return { error: "Unauthorized" };
  const { error, data } = await supabase
    .from("channels")
    .insert({
      name: params.name,
      type: params.type,
      description: params.description ?? "",
      created_by: session.user.id
    })
    .select("id")
    .single();
  if (error) return { error: error.message };
  await supabase.from("channel_members").insert({
    channel_id: data.id,
    user_id: session.user.id,
    role: "owner"
  });
  return { ok: true, id: data.id };
}


