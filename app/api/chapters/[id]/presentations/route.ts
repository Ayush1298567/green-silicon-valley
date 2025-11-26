import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") || "10");

  try {
    const { data: presentations, error } = await supabase
      .from("presentations")
      .select(`
        id,
        topic,
        scheduled_date,
        status,
        schools (
          name
        )
      `)
      .eq("chapter_id", params.id)
      .order("scheduled_date", { ascending: false })
      .limit(limit);

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, presentations: presentations || [] });

  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
