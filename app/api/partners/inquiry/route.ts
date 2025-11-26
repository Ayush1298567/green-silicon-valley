import { NextRequest, NextResponse } from 'next/server';
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check if user is authenticated and is admin/founder
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check user role
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'founder'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Fetch partnership inquiries
    const { data: inquiries, error } = await supabase
      .from('partner_inquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching partnership inquiries:', error);
      return NextResponse.json(
        { error: 'Failed to fetch inquiries' },
        { status: 500 }
      );
    }

    return NextResponse.json({ inquiries });

  } catch (error) {
    console.error('Error in partners/inquiry GET:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const body = await request.json();

    const {
      organizationName,
      contactName,
      email,
      phone,
      partnershipType,
      website,
      message,
      hearAboutUs
    } = body;

    if (!organizationName || !contactName || !email || !partnershipType || !message) {
      return NextResponse.json(
        { error: 'Required fields missing' },
        { status: 400 }
      );
    }

    const { data: inquiry, error } = await supabase
      .from('partner_inquiries')
      .insert({
        organization_name: organizationName,
        contact_name: contactName,
        email,
        phone,
        partnership_type: partnershipType,
        website,
        message,
        hear_about_us: hearAboutUs,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating partnership inquiry:', error);
      return NextResponse.json(
        { error: 'Failed to submit inquiry' },
        { status: 500 }
      );
    }

    // In production, you would send notification emails here
    // For now, we'll just return success

    return NextResponse.json({
      message: 'Partnership inquiry submitted successfully',
      inquiry
    });

  } catch (error) {
    console.error('Error in partners/inquiry POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
