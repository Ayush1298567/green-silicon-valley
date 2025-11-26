import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function GET(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const { data: settings, error } = await supabase
      .from("regional_settings")
      .select("*")
      .order("region", { ascending: true });

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, settings: settings || [] });

  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { region, calendar_format, date_format, time_format, currency, timezone } = body;

    if (!region) {
      return NextResponse.json({ ok: false, error: "Region is required" }, { status: 400 });
    }

    const { data: setting, error } = await supabase
      .from("regional_settings")
      .insert({
        region,
        calendar_format: calendar_format || "gregorian",
        date_format: date_format || "MM/DD/YYYY",
        time_format: time_format || "12h",
        currency: currency || "USD",
        timezone: timezone || "UTC"
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, setting });

  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
