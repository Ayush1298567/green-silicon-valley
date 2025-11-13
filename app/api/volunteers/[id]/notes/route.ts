import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { getUserRoleServer } from "@/lib/auth/guards";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });
  const role = await getUserRoleServer(supabase as any);
  
  if (role !== "founder" && role !== "intern") {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const volunteerId = params.id;
  const { data, error } = await supabase
    .from("volunteer_notes")
    .select("*, author:users!volunteer_notes_author_id_fkey(id, name, email)")
    .eq("volunteer_id", volunteerId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, notes: data || [] });
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
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

  const volunteerId = params.id;
  const body = await req.json().catch(() => ({}));
  const { content, note_type, is_private } = body;

  if (!content) {
    return NextResponse.json({ ok: false, error: "Content required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("volunteer_notes")
    .insert({
      volunteer_id: parseInt(volunteerId),
      author_id: session.user.id,
      content,
      note_type: note_type || "general",
      is_private: is_private !== false
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, note: data });
}

