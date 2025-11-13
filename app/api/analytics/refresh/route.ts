import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { computeAnalytics, writeAnalyticsCache } from "@/lib/analytics";
import { getUserRoleServer } from "@/lib/auth/guards";

export async function POST() {
  const supabase = createRouteHandlerClient({ cookies });
  const role = await getUserRoleServer(supabase as any);
  if (role !== "founder") {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  const metrics = await computeAnalytics();
  await writeAnalyticsCache(metrics);
  await supabase.from("system_logs").insert({
    event_type: "analytics_refreshed",
    description: JSON.stringify({ at: new Date().toISOString() })
  });
  return NextResponse.json({ ok: true, metrics });
}

export async function GET() {
  // convenience GET
  return POST();
}


