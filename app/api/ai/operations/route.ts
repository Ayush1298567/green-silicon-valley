import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { getUserRoleServer } from "@/lib/auth/guards";
import { runAIQuery } from "@/lib/aiClient";

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const role = await getUserRoleServer(supabase as any);
  if (role !== "founder" && role !== "intern") {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json().catch(() => ({}));
  const task = String(body?.task ?? "summarize_inactive_chapters");
  const { data: chapters } = await supabase
    .from("chapters")
    .select("name, status, last_meeting_date, next_review_date, region");
  const { data: presentations } = await supabase
    .from("presentations")
    .select("school_id, date, status, hours");

  let output = "Operations assistant ready (local AI not configured).";
  try {
    const prompt =
      `Task: ${task}\n` +
      `Summarize operations and propose 3-5 next actions.\n` +
      `Keep under 150 words.\n` +
      `Chapters:\n${JSON.stringify(chapters ?? [], null, 0)}\n` +
      `Presentations:\n${JSON.stringify(presentations ?? [], null, 0)}\n`;
    output = await runAIQuery(prompt, { temperature: 0.2, maxTokens: 300 });
  } catch {}

  await supabase.from("system_logs").insert({
    event_type: "operations_ai_run",
    description: JSON.stringify({ task })
  });
  return NextResponse.json({ ok: true, result: output });
}


