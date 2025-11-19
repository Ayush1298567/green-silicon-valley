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
    const userId = searchParams.get('user_id');
    const volunteerTeamId = searchParams.get('volunteer_team_id');
    const search = searchParams.get('search');

    let query = supabase
      .from("emergency_contacts")
      .select(`
        *,
        user:users(id, name, email),
        volunteer_team:volunteers(id, team_name)
      `)
      .order("created_at", { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    if (volunteerTeamId) {
      query = query.eq('volunteer_team_id', volunteerTeamId);
    }

    if (search) {
      query = query.ilike('contact_name', `%${search}%`);
    }

    const { data: contacts, error } = await query.limit(100);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: contacts
    });

  } catch (error: any) {
    console.error("Error fetching emergency contacts:", error);
    return NextResponse.json({
      error: "Failed to fetch emergency contacts",
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
      user_type,
      reference_id,
      contact_name,
      relationship,
      phone_primary,
      phone_secondary,
      email,
      medical_conditions,
      allergies,
      medications,
      insurance_provider,
      insurance_policy_number,
      doctor_name,
      doctor_phone,
      blood_type
    } = body;

    if (!contact_name || !relationship || !phone_primary) {
      return NextResponse.json({
        error: "Contact name, relationship, and primary phone are required"
      }, { status: 400 });
    }

    const contactData: any = {
      contact_name,
      relationship,
      phone_primary,
      phone_secondary,
      email,
      medical_conditions,
      allergies,
      medications,
      insurance_provider,
      insurance_policy_number,
      doctor_name,
      doctor_phone,
      blood_type
    };

    // Add reference to user or volunteer team
    if (user_type === 'user' && reference_id) {
      contactData.user_id = reference_id;
    } else if (user_type === 'volunteer_team' && reference_id) {
      contactData.volunteer_team_id = reference_id;
    }

    const { data: contact, error } = await supabase
      .from("emergency_contacts")
      .insert(contactData)
      .select(`
        *,
        user:users(id, name, email),
        volunteer_team:volunteers(id, team_name)
      `)
      .single();

    if (error) throw error;

    // Log the contact addition
    await supabase.from("system_logs").insert({
      actor_id: session.user.id,
      action_type: "emergency_contact_added",
      resource_type: "emergency_contact",
      resource_id: contact.id,
      details: {
        contact_name,
        relationship,
        user_type,
        reference_id
      },
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    });

    return NextResponse.json({
      success: true,
      data: contact,
      message: "Emergency contact added successfully"
    });

  } catch (error: any) {
    console.error("Error adding emergency contact:", error);
    return NextResponse.json({
      error: "Failed to add emergency contact",
      details: error.message
    }, { status: 500 });
  }
}
