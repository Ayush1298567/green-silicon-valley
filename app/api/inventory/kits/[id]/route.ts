import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function PUT(
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
    const {
      name,
      description,
      activity_type,
      location,
      current_stock,
      min_stock,
      max_stock
    } = body;

    const { data: kit, error } = await supabase
      .from("activity_kits")
      .update({
        name,
        description,
        activity_type,
        location,
        current_stock,
        min_stock,
        max_stock,
        updated_at: new Date().toISOString()
      })
      .eq("id", params.id)
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

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Check if kit is being used in any presentations
    const { data: presentations } = await supabase
      .from("presentations")
      .select("id")
      .eq("kit_id", params.id)
      .limit(1);

    if (presentations && presentations.length > 0) {
      return NextResponse.json({
        ok: false,
        error: "Cannot delete kit that is assigned to presentations. Remove kit assignment first."
      }, { status: 400 });
    }

    const { error } = await supabase
      .from("activity_kits")
      .delete()
      .eq("id", params.id);

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, message: "Kit deleted successfully" });

  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
