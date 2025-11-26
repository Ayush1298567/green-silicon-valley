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
    // Get teacher relationships with enhanced data
    const { data: teachers, error } = await supabase
      .from("teacher_relationships")
      .select(`
        *,
        schools (
          name,
          district
        ),
        users!assigned_to (
          name
        )
      `)
      .order("last_interaction", { ascending: false, nullsFirst: false });

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    // Enhance with interaction counts and presentation counts
    const enhancedTeachers = await Promise.all(
      (teachers || []).map(async (teacher) => {
        // Count interactions
        const { count: interactionCount } = await supabase
          .from("teacher_interactions")
          .select("*", { count: "exact", head: true })
          .eq("relationship_id", teacher.id);

        // Count presentations at this school
        const { count: presentationCount } = await supabase
          .from("presentations")
          .select("*", { count: "exact", head: true })
          .eq("school_id", teacher.school_id);

        return {
          ...teacher,
          interaction_count: interactionCount || 0,
          presentation_count: presentationCount || 0
        };
      })
    );

    return NextResponse.json({ ok: true, teachers: enhancedTeachers });

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
      school_id,
      teacher_name,
      email,
      phone,
      notes,
      tags
    } = body;

    if (!school_id || !teacher_name || !email) {
      return NextResponse.json({ ok: false, error: "School, teacher name, and email are required" }, { status: 400 });
    }

    // Check if relationship already exists
    const { data: existing } = await supabase
      .from("teacher_relationships")
      .select("id")
      .eq("school_id", school_id)
      .eq("email", email)
      .single();

    if (existing) {
      return NextResponse.json({ ok: false, error: "A relationship with this teacher already exists" }, { status: 400 });
    }

    const { data: teacher, error } = await supabase
      .from("teacher_relationships")
      .insert({
        school_id,
        teacher_name,
        email,
        phone,
        notes,
        tags: tags || [],
        status: "pending"
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, teacher });

  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
