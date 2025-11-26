import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function GET(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("student_id");

  if (!studentId) {
    return NextResponse.json({ ok: false, error: "Student ID required" }, { status: 400 });
  }

  try {
    const { data: consents, error } = await supabase
      .from("consent_forms")
      .select("*")
      .eq("student_id", studentId)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, consents: consents || [] });

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
      form_type,
      student_id,
      parent_signature_url,
      parent_signature_date,
      expiry_date
    } = body;

    if (!form_type || !student_id) {
      return NextResponse.json({ ok: false, error: "Form type and student ID are required" }, { status: 400 });
    }

    const { data: consent, error } = await supabase
      .from("consent_forms")
      .insert({
        form_type,
        student_id,
        parent_signature_url,
        parent_signature_date: parent_signature_date ? new Date(parent_signature_date).toISOString() : new Date().toISOString(),
        expiry_date: expiry_date ? new Date(expiry_date).toISOString() : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        is_active: true
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, consent });

  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
