import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function GET(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  await supabase.from("system_logs").insert({
    event_type: "cron_run",
    description: JSON.stringify({ source: "vercel-cron-or-manual", at: new Date().toISOString() })
  });
  return NextResponse.json({ ok: true });
}


