import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const { data: leadership, error } = await supabase
      .from("chapter_leadership")
      .select(`
        *,
        users (
          name,
          email
        )
      `)
      .eq("chapter_id", params.id)
      .order("start_date", { ascending: false });

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, leaders: leadership || [] });

  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { user_id, role, start_date, end_date } = body;

    if (!user_id || !role || !start_date) {
      return NextResponse.json({ ok: false, error: "User ID, role, and start date are required" }, { status: 400 });
    }

    const { data: leadership, error } = await supabase
      .from("chapter_leadership")
      .insert({
        chapter_id: params.id,
        user_id,
        role,
        start_date,
        end_date: end_date ? new Date(end_date).toISOString().split('T')[0] : null,
        is_active: true
      })
      .select(`
        *,
        users (
          name,
          email
        )
      `)
      .single();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, leadership });

  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
