import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { getDashboardPathForRole, type UserRole } from "@/lib/auth/roles";

export async function GET(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is founder or intern
    const { data: userRow } = await supabase.from("users").select("role").eq("id", session.user.id).single();
    const role = (userRow?.role as UserRole) ?? "volunteer";
    
    if (role !== "founder" && role !== "intern") {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    // Get pending hours with volunteer and presentation details
    const { data: hours, error } = await supabase
      .from("volunteer_hours")
      .select(`
        *,
        volunteer:volunteers!volunteer_hours_volunteer_id_fkey(id, team_name),
        presentation:presentations!volunteer_hours_presentation_id_fkey(id, topic, scheduled_date, school_id)
      `)
      .eq("status", "pending")
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, hours: hours || [] });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

