import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { getUserRoleServer } from "@/lib/auth/guards";

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = await getUserRoleServer(supabase);
    if (!['founder', 'intern'].includes(role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const resolved = searchParams.get('resolved');
    const severity = searchParams.get('severity');
    const incidentType = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '50');

    let query = supabase
      .from("safety_incidents")
      .select(`
        *,
        reporter:users(id, name, email)
      `)
      .order("incident_date", { ascending: false })
      .limit(limit);

    if (resolved !== null) {
      query = query.eq('resolved', resolved === 'true');
    }

    if (severity) {
      query = query.eq('severity', severity);
    }

    if (incidentType) {
      query = query.eq('incident_type', incidentType);
    }

    const { data: incidents, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: incidents
    });

  } catch (error: any) {
    console.error("Error fetching incidents:", error);
    return NextResponse.json({
      error: "Failed to fetch safety incidents",
      details: error.message
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = await getUserRoleServer(supabase);
    if (!['founder', 'intern'].includes(role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    const body = await request.json();
    const {
      incident_type,
      severity,
      description,
      location,
      incident_date,
      actions_taken,
      follow_up_required,
      follow_up_notes
    } = body;

    if (!incident_type || !severity || !description) {
      return NextResponse.json({
        error: "Incident type, severity, and description are required"
      }, { status: 400 });
    }

    const incidentData = {
      incident_type,
      severity,
      description,
      location,
      incident_date: incident_date || new Date().toISOString(),
      reported_by: session.user.id,
      actions_taken,
      follow_up_required: follow_up_required || false,
      follow_up_notes
    };

    const { data: incident, error } = await supabase
      .from("safety_incidents")
      .insert(incidentData)
      .select(`
        *,
        reporter:users(id, name, email)
      `)
      .single();

    if (error) throw error;

    // Log the incident report
    await supabase.from("system_logs").insert({
      actor_id: session.user.id,
      action_type: "safety_incident_reported",
      resource_type: "safety_incident",
      resource_id: incident.id,
      details: {
        incident_type,
        severity,
        description,
        location
      },
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    });

    return NextResponse.json({
      success: true,
      data: incident,
      message: "Safety incident reported successfully"
    });

  } catch (error: any) {
    console.error("Error reporting incident:", error);
    return NextResponse.json({
      error: "Failed to report safety incident",
      details: error.message
    }, { status: 500 });
  }
}
