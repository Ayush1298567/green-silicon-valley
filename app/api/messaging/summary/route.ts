import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { runAIQuery } from "@/lib/aiClient";
import { getUserRoleServer } from "@/lib/auth/guards";

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const role = await getUserRoleServer(supabase as any);
  if (role !== "founder" && role !== "intern") {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json().catch(() => ({}));
  const channelId = String(body?.channel_id ?? "");
  const timeRange = String(body?.time_range ?? "7d");
  if (!channelId) return NextResponse.json({ ok: false, error: "channel_id required" }, { status: 400 });

  const since = new Date();
  if (timeRange.endsWith("d")) since.setDate(since.getDate() - Number(timeRange.replace("d","")));
  else since.setDate(since.getDate() - 7);

  const { data: msgs } = await supabase
    .from("messages")
    .select("sender_id, content, created_at")
    .eq("channel_id", channelId)
    .gte("created_at", since.toISOString())
    .order("created_at", { ascending: true })
    .limit(1000);

  let summary = "Summary unavailable (local AI not configured).";
  try {
    const prompt = `Summarize channel messages below. Output bullets for: Key Points, Decisions, Action Items. Keep under 200 words.\n${JSON.stringify(msgs ?? [], null, 2)}`;
    summary = await runAIQuery(prompt, { temperature: 0.2, maxTokens: 400 });
  } catch {}

  await supabase.from("message_logs").insert({
    event_type: "summary",
    payload: { channelId, timeRange }
  });
  return NextResponse.json({ ok: true, summary });
}


