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
  const upcoming = searchParams.get("upcoming") === "true";

  let query = supabase
    .from("orientation_sessions")
    .select(`
      *,
      registrations:orientation_registrations(
        *,
        volunteer:volunteers!orientation_registrations_volunteer_id_fkey(id, user_id)
      )
    `)
    .order("scheduled_date", { ascending: true });

  if (upcoming) {
    query = query.gte("scheduled_date", new Date().toISOString());
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, sessions: data || [] });
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
  const { title, description, scheduled_date, location, capacity, is_required, materials_url } = body;

  if (!title || !scheduled_date) {
    return NextResponse.json({ ok: false, error: "Title and scheduled_date required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("orientation_sessions")
    .insert({
      title,
      description,
      scheduled_date,
      location,
      capacity,
      is_required: is_required !== false,
      materials_url,
      created_by: session.user.id
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, session: data });
}

