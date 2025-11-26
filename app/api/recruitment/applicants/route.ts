import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function GET(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const { data: applicants, error } = await supabase
      .from("recruitment_pipeline")
      .select(`
        *,
        users (
          name,
          email
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, applicants: applicants || [] });

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
      applicant_id,
      applicant_type,
      initial_stage,
      priority,
      notes
    } = body;

    if (!applicant_id || !applicant_type) {
      return NextResponse.json({ ok: false, error: "Applicant ID and type are required" }, { status: 400 });
    }

    // Get the first stage for this applicant type
    const { data: firstStage } = await supabase
      .from("pipeline_stages")
      .select("stage_name")
      .eq("applicant_type", applicant_type === "volunteer" ? "volunteer" : "intern")
      .eq("is_active", true)
      .order("stage_order", { ascending: true })
      .limit(1)
      .single();

    const currentStage = initial_stage || firstStage?.stage_name || "New";

    const { data: applicant, error } = await supabase
      .from("recruitment_pipeline")
      .insert({
        applicant_id,
        applicant_type,
        current_stage: currentStage,
        status: "new",
        priority: priority || "medium",
        notes
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

    // Create action item for follow-up
    await supabase.from("action_items").insert({
      title: `Review ${applicant_type} application: ${applicant.users?.name}`,
      description: `New ${applicant_type} application from ${applicant.users?.name} requires review.`,
      type: "recruitment_review",
      priority: priority || "medium",
      assigned_to: [], // Assign to all recruiters
      metadata: {
        applicant_id: applicant.applicant_id,
        pipeline_id: applicant.id,
        applicant_type,
        current_stage: applicant.current_stage
      }
    });

    return NextResponse.json({ ok: true, applicant });

  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
