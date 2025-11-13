import { getServerComponentClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getDashboardPathForRole, type UserRole } from "@/lib/auth/roles";
import ChannelHeader from "@/components/messaging/ChannelHeader";
import ChannelThread from "@/components/messaging/ChannelThread";

export const dynamic = "force-dynamic";

export default async function ChannelPage({ params }: any) {
  const supabase = getServerComponentClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();
  if (!session) redirect("/login");
  const { data: rows } = await supabase.from("users").select("role").eq("id", session.user.id).limit(1);
  const role = (rows?.[0]?.role as UserRole) ?? "volunteer";
  if (!["founder", "intern", "volunteer"].includes(role)) redirect(getDashboardPathForRole(role));

  const { data: ch } = await supabase.from("channels").select("id,name,description").eq("id", params.channelId).single();
  if (!ch) redirect("/");
  const { data: msgs } = await supabase
    .from("messages")
    .select("id, content, created_at, edited_at, attachments, sender_id")
    .eq("channel_id", params.channelId)
    .order("created_at", { ascending: true })
    .limit(200);

  const senderIds = Array.from(new Set((msgs ?? []).map((m: any) => m.sender_id).filter(Boolean))) as string[];
  let msgsWithNames = msgs ?? [];
  let senderDirectory: Array<[string, string | null]> = [];

  if (senderIds.length > 0) {
    const { data: usersRows } = await supabase.from("users").select("id,name").in("id", senderIds);
    const nameById = new Map((usersRows ?? []).map((u: any) => [u.id as string, u.name as string | null]));
    senderDirectory = Array.from(nameById.entries());
    msgsWithNames = (msgs ?? []).map((m: any) => ({
      ...m,
      sender_name: nameById.get(m.sender_id) ?? null
    }));
  }

  return (
    <div className="container py-10">
      <div className="card p-6 shadow-soft-lg border border-gsv-slate-200/60 bg-white/80 backdrop-blur">
        <ChannelHeader name={ch.name} description={ch.description ?? ""} />
        <ChannelThread
          channelId={params.channelId}
          initialMessages={msgsWithNames ?? []}
          senderDirectory={senderDirectory}
        />
      </div>
    </div>
  );
}


