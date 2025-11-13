import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { trackUserActivity } from "@/lib/auth/routing";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      email,
      group_city,
      group_size,
      group_year,
      group_members = [],
      primary_contact_phone,
      preferred_grade_level,
      in_santa_clara_usd,
      how_heard,
      why_volunteer,
    } = body;

    if (!email || !group_city || !group_size || !group_year || !primary_contact_phone) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!group_members || group_members.length < 3) {
      return NextResponse.json(
        { ok: false, error: "At least 3 group members are required" },
        { status: 400 }
      );
    }

    const supabase = createRouteHandlerClient({ cookies });
    const userAgent = req.headers.get("user-agent") || "";
    const referrer = req.headers.get("referer") || "";

    // Generate a team name based on the primary contact email
    const teamName = `Team_${email.split("@")[0]}_${Date.now()}`;

    // Create volunteer record
    const { data: volunteer, error: insertError } = await supabase
      .from("volunteers")
      .insert({
        team_name: teamName,
        group_city,
        group_size: parseInt(String(group_size)),
        group_year,
        group_members,
        primary_contact_phone,
        preferred_grade_level,
        in_santa_clara_usd: Boolean(in_santa_clara_usd),
        how_heard,
        why_volunteer,
        application_status: "pending",
        status: "pending",
        submitted_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (insertError) {
      return NextResponse.json(
        { ok: false, error: insertError.message },
        { status: 500 }
      );
    }

    // Track form submission activity
    await trackUserActivity(supabase, {
      email: email,
      activity_type: "form_submit",
      activity_source: "volunteer_form",
      user_category: "volunteer",
      user_agent: userAgent,
      referrer: referrer,
      metadata: {
        volunteer_id: volunteer.id,
        group_size,
        group_city,
      },
    });

    // Log the submission
    await supabase.from("system_logs").insert({
      event_type: "volunteer_application",
      description: JSON.stringify({
        volunteer_id: volunteer.id,
        email,
        group_size,
        group_city,
      }),
    });

    return NextResponse.json({ ok: true, volunteer_id: volunteer.id });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error.message || "Failed to submit form" },
      { status: 500 }
    );
  }
}


