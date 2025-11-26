import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function GET(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const { data: stages, error } = await supabase
      .from("pipeline_stages")
      .select("*")
      .order("stage_order", { ascending: true });

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, stages: stages || [] });

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
      stage_name,
      stage_order,
      applicant_type,
      requirements,
      auto_actions,
      notification_template_id
    } = body;

    if (!stage_name || !applicant_type) {
      return NextResponse.json({ ok: false, error: "Stage name and applicant type are required" }, { status: 400 });
    }

    const { data: stage, error } = await supabase
      .from("pipeline_stages")
      .insert({
        stage_name,
        stage_order: stage_order || 1,
        applicant_type: applicant_type === "both" ? "both" : applicant_type,
        requirements: requirements || [],
        auto_actions: auto_actions || {},
        notification_template_id,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, stage });

  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
