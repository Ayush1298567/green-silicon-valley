import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function GET(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { data: kits, error } = await supabase
      .from("activity_kits")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, kits: kits || [] });

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
    const {
      name,
      description,
      activity_type,
      location,
      current_stock,
      min_stock,
      max_stock
    } = body;

    if (!name || !activity_type) {
      return NextResponse.json({ ok: false, error: "Name and activity type are required" }, { status: 400 });
    }

    const { data: kit, error } = await supabase
      .from("activity_kits")
      .insert({
        name,
        description,
        activity_type,
        location,
        current_stock: current_stock || 0,
        min_stock: min_stock || 5,
        max_stock: max_stock || 50
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, kit });

  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
