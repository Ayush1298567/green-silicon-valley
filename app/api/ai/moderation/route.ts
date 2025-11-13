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
  const content = String(body?.content ?? "");
  // Simple keyword pre-filter to avoid AI calls for obvious cases
  const badWords = ["fuck", "shit", "bitch", "kill yourself", "hate speech"];
  const lower = content.toLowerCase();
  let result = "";
  if (badWords.some((w) => lower.includes(w))) {
    result = "Pre-filter: warn or remove (contains prohibited language).";
  } else {
    const prompt =
      `Classify moderation severity and recommend one action: ignore | warn | remove | notify founder.\n` +
      `Return a short sentence.\nMessage:\n"${content}"`;
    try {
      result = await runAIQuery(prompt, { temperature: 0, maxTokens: 120 });
    } catch {
      result = "Moderation unavailable.";
    }
  }
  await supabase.from("message_logs").insert({
    event_type: "moderation_checked",
    payload: { result }
  });
  return NextResponse.json({ ok: true, result });
}


