import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { computeAnalytics } from "@/lib/analytics";
import { runAIQuery } from "@/lib/aiClient";
import { getUserRoleServer } from "@/lib/auth/guards";

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });
  const role = await getUserRoleServer(supabase as any);
  if (role !== "founder") {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const metrics = await computeAnalytics();
  const { data: recentLogs } = await supabase
    .from("system_logs")
    .select("event_type, description, timestamp")
    .order("timestamp", { ascending: false })
    .limit(50);

  const prompt = `
You are an operations analyst. Using the metrics and logs below, produce 3-6 short, actionable insights for nonprofit leadership.
Be specific and quantify changes when possible. Keep each insight to one sentence.

Metrics:
${JSON.stringify(metrics, null, 2)}

Recent Logs:
${JSON.stringify(recentLogs ?? [], null, 2)}
`;
  let insightsText =
    "Insights unavailable. Configure local AI to enable this feature.";
  try {
    insightsText = await runAIQuery(prompt, { temperature: 0.2, maxTokens: 500 });
  } catch {}

  return NextResponse.json({ ok: true, insights: insightsText });
}


