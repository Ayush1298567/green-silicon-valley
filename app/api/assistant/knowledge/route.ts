import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { runAIQuery } from "@/lib/aiClient";
import { getUserRoleServer } from "@/lib/auth/guards";

const SYSTEM_PROMPT = `
You are GSV's Knowledge Assistant. You can answer questions about the organization, rules, and data.
Tables: users, schools, presentations, volunteers, intern_projects, chapters, resources, rules_bylaws, grants, donations, system_logs.
If the user asks to add a rule, capture a short title and the content, then store it.
Keep replies concise and professional.
`;

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const question: string = body?.message ?? "";
  const supabase = createRouteHandlerClient({ cookies });

  // Require founder role for this endpoint (UI is founder-only by design)
  const {
    data: { session }
  } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const role = await getUserRoleServer(supabase as any);
  if (role !== "founder") {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  // Lightweight "add rule" parsing; founders only
  const addRuleMatch = question.toLowerCase().match(/add .*rule/i);
  if (addRuleMatch) {
    const title = question.split(".")[0]?.slice(0, 80) || "New Rule";
    const content = question;
    const editor_id = session.user.id;
    await supabase.from("rules_bylaws").insert({ title, content, editor_id });
    await supabase.from("system_logs").insert({
      event_type: "rule_updated",
      description: JSON.stringify({ title, by: editor_id })
    });
  }

  let answer = "Saved. Updating index.";
  try {
    const prompt = `${SYSTEM_PROMPT}\n\nQuestion:\n${question}\n\nReply briefly with bullets when appropriate.`;
    answer = await runAIQuery(prompt, { temperature: 0.2, maxTokens: 600 });
  } catch {
    // Fallback in absence of configured provider
    answer = "Knowledge Assistant ready. Configure local AI to enable full responses.";
  }

  return NextResponse.json({ reply: answer });
}


