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
  const status = searchParams.get("status");

  let query = supabase
    .from("volunteer_onboarding_progress")
    .select(`
      *,
      volunteer:volunteers!volunteer_onboarding_progress_volunteer_id_fkey(
        id,
        user:users!volunteers_user_id_fkey(id, name, email)
      ),
      workflow:volunteer_workflows!volunteer_onboarding_progress_workflow_id_fkey(id, name, steps)
    `)
    .order("started_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, progress: data || [] });
}

