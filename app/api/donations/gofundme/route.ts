import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

const GOFUNDME_URL = process.env.GOFUNDME_URL || "https://www.gofundme.com/";

export async function GET(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const url = new URL(req.url);
  const source = url.searchParams.get("source") ?? "site";
  await supabase.from("system_logs").insert({
    event_type: "donation_referral",
    description: JSON.stringify({ source, at: new Date().toISOString() })
  });
  return NextResponse.redirect(GOFUNDME_URL);
}


