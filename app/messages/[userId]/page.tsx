import { getServerComponentClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DirectThread from "@/components/messaging/DirectThread";

export const dynamic = "force-dynamic";

export default async function DirectMessagePage({ params }: any) {
  const supabase = getServerComponentClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();
  if (!session) redirect("/login");
  const me = session.user.id as string;
  const other = params.userId as string;

  const { data: msgs } = await supabase
    .from("messages")
    .select("id, content, created_at, edited_at, attachments, sender_id")
    .or(`and(sender_id.eq.${me},recipient_id.eq.${other}),and(sender_id.eq.${other},recipient_id.eq.${me})`)
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
      sender_name: nameById.get(m.sender_id) ?? (m.sender_id === me ? "You" : null)
    }));
  }

  return (
    <div className="container py-10">
      <div className="card p-6 shadow-soft-lg border border-gsv-slate-200/60 bg-white/80 backdrop-blur">
        <div className="text-lg font-semibold text-gsv-charcoal">Direct Messages</div>
        <DirectThread
          currentUserId={me}
          peerId={other}
          initialMessages={msgsWithNames ?? []}
          senderDirectory={senderDirectory}
        />
      </div>
    </div>
  );
}


