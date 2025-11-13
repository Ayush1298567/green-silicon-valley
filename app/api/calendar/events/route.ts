import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { getUserRoleServer } from "@/lib/auth/guards";

export async function GET(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const role = await getUserRoleServer(supabase as any);
  
  if (role !== "founder" && role !== "intern") {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");
  const eventType = searchParams.get("type");
  const status = searchParams.get("status");

  let query = supabase.from("events").select("*");

  if (start) {
    query = query.gte("start_date", start);
  }
  if (end) {
    query = query.lte("start_date", end);
  }
  if (eventType) {
    query = query.eq("event_type", eventType);
  }
  if (status) {
    query = query.eq("status", status);
  }

  query = query.order("start_date", { ascending: true });

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, events: data || [] });
}

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const role = await getUserRoleServer(supabase as any);
  
  if (role !== "founder" && role !== "intern") {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const {
    data: { session }
  } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const {
    event_type,
    title,
    description,
    start_date,
    end_date,
    all_day,
    location,
    location_type,
    virtual_link,
    color,
    related_id,
    recurrence_rule,
    reminder_minutes,
    metadata
  } = body;

  if (!event_type || !title || !start_date) {
    return NextResponse.json({ ok: false, error: "event_type, title, and start_date required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("events")
    .insert({
      event_type,
      title,
      description,
      start_date,
      end_date,
      all_day: all_day || false,
      location,
      location_type: location_type || "physical",
      virtual_link,
      color,
      created_by: session.user.id,
      related_id,
      recurrence_rule,
      reminder_minutes: reminder_minutes || [],
      metadata: metadata || {}
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, event: data });
}

