import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function GET(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  // Only founders and interns can view applications
  const { data: userRole } = await supabase
    .from("users")
    .select("role")
    .eq("id", session.user.id)
    .single();

  if (!["founder", "intern"].includes(userRole?.role)) {
    return NextResponse.json({ ok: false, error: "Insufficient permissions" }, { status: 403 });
  }

  try {
    const { data: applications, error } = await supabase
      .from("chapter_applications")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, applications: applications || [] });

  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const body = await req.json();
    const {
      applicant_name,
      applicant_email,
      proposed_location,
      proposed_country,
      motivation,
      experience,
      leadership_team,
      timeline,
      school_partners,
      community_partners,
      funding_sources,
      challenges,
      goals
    } = body;

    if (!applicant_name || !applicant_email || !proposed_location || !proposed_country) {
      return NextResponse.json({ ok: false, error: "Required fields missing" }, { status: 400 });
    }

    const { data: application, error } = await supabase
      .from("chapter_applications")
      .insert({
        applicant_name,
        applicant_email,
        proposed_location,
        proposed_country,
        motivation,
        experience,
        leadership_team: leadership_team || [],
        timeline,
        school_partners,
        community_partners,
        funding_sources,
        challenges,
        goals
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    // Create action item for founders/interns to review this application
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
      await supabase.from("action_items").insert({
        title: `Review chapter application: ${proposed_location}, ${proposed_country}`,
        description: `New chapter application from ${applicant_name} for ${proposed_location}, ${proposed_country}. ${motivation.substring(0, 100)}...`,
        type: "chapter_application",
        priority: "medium",
        assigned_to: [], // Assign to all founders/interns
        metadata: {
          application_id: application.id,
          applicant_name,
          proposed_location,
          proposed_country,
          applicant_email
        }
      });
    }

    return NextResponse.json({ ok: true, application });

  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
