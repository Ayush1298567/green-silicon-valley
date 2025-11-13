import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { getUserRoleServer } from "@/lib/auth/guards";

export async function GET(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const role = await getUserRoleServer(supabase as any);
  if (role !== "founder") {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  const url = new URL(req.url);
  const channelId = url.searchParams.get("channelId");
  const userId = url.searchParams.get("userId");
  const format = (url.searchParams.get("format") ?? "csv").toLowerCase();

  let q = supabase.from("messages").select("id, sender_id, recipient_id, channel_id, content, created_at");
  if (channelId) q = q.eq("channel_id", channelId);
  if (userId) q = q.or(`sender_id.eq.${userId},recipient_id.eq.${userId}`);
  const { data, error } = await q.limit(5000).order("created_at", { ascending: true });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  if (format === "json") {
    return NextResponse.json({ ok: true, data });
  }
  // CSV
  const header = ["id", "sender_id", "recipient_id", "channel_id", "content", "created_at"];
  const rows = (data ?? []).map((r) =>
    [r.id, r.sender_id, r.recipient_id, r.channel_id, (r.content ?? "").replace(/"/g, '""'), r.created_at]
  );
  const csv = [header.join(","), ...rows.map((r) => r.map((c) => `"${c ?? ""}"`).join(","))].join("\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=messages.csv"
    }
  });
}


