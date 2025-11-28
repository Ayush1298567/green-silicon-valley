import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { getUserRoleServer } from "@/lib/auth/guards";

export async function GET(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const role = await getUserRoleServer(supabase as any);

    if (role !== "volunteer") {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    // Get current user
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    // Get user's team
    const { data: volunteer } = await supabase
      .from("volunteers")
      .select("id")
      .eq("user_id", session.user.id)
      .single();

    if (!volunteer) {
      return NextResponse.json({ ok: true, presentations: [] });
    }

    // Get completed presentations for this volunteer
    const { data: presentations, error } = await supabase
      .from("presentations")
      .select(`
        id,
        topic,
        scheduled_date,
        status,
        school:schools(name)
      `)
      .eq("volunteer_team_id", volunteer.id)
      .eq("status", "completed")
      .order("scheduled_date", { ascending: false });

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    // Format the response
    const formattedPresentations = (presentations || []).map(pres => ({
      id: pres.id,
      topic: pres.topic || "Presentation",
      scheduled_date: pres.scheduled_date,
      school_name: pres.school?.name || "School",
      status: pres.status
    }));

    return NextResponse.json({ ok: true, presentations: formattedPresentations });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
