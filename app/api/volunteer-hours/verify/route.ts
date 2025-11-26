import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const {
    hours_id,
    verification_method,
    teacher_signature,
    teacher_name,
    notes
  } = body;

  if (!hours_id || !verification_method) {
    return NextResponse.json({ ok: false, error: "Missing required fields" }, { status: 400 });
  }

  try {
    // Update the volunteer hours record with verification details
    const updateData: any = {
      verification_method,
      status: "verified",
      verified_at: new Date().toISOString(),
      verified_by: session.user.id
    };

    if (verification_method === "signature" || verification_method === "digital") {
      updateData.teacher_signature_url = teacher_signature;
    }

    const { error: updateError } = await supabase
      .from("volunteer_hours")
      .update(updateData)
      .eq("id", hours_id);

    if (updateError) {
      return NextResponse.json({ ok: false, error: updateError.message }, { status: 500 });
    }

    // Log the verification
    const { error: logError } = await supabase
      .from("hours_verification_log")
      .insert({
        hours_id,
        verified_by: session.user.id,
        verification_method,
        verification_data: {
          teacher_name,
          notes
        },
        notes
      });

    if (logError) {
      console.error("Error logging verification:", logError);
      // Don't fail the verification if logging fails
    }

    // Create action item for follow-up if needed
    if (verification_method === "email") {
      // Send email verification (placeholder - would integrate with email service)
      console.log(`Sending email verification for hours ${hours_id}`);
    }

    return NextResponse.json({ ok: true, message: "Hours verified successfully" });

  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

// GET endpoint to retrieve pending hours for verification
export async function GET(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "pending";

  try {
    const { data: hours, error } = await supabase
      .from("volunteer_hours")
      .select(`
        id,
        hours_logged,
        activity,
        feedback,
        status,
        submitted_at,
        timestamp_start,
        timestamp_end,
        verification_method,
        presentations (
          topic,
          scheduled_date,
          schools (
            name,
            teacher_name,
            email
          )
        ),
        volunteers (
          team_name
        ),
        users!submitted_by (
          name,
          email
        )
      `)
      .eq("status", status)
      .order("submitted_at", { ascending: false });

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, hours: hours || [] });

  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
