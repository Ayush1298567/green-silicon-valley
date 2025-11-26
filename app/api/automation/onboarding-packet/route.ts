import { NextRequest, NextResponse } from 'next/server';
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { onboardingAutomation } from "@/lib/automation/onboarding";

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { volunteerId } = await request.json();

    if (!volunteerId) {
      return NextResponse.json(
        { error: 'Volunteer ID is required' },
        { status: 400 }
      );
    }

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

    // Trigger onboarding packet generation
    const packet = await onboardingAutomation.triggerOnboardingPacket(volunteerId);

    return NextResponse.json({
      message: 'Onboarding packet triggered successfully',
      packet
    });

  } catch (error) {
    console.error('Error triggering onboarding packet:', error);
    return NextResponse.json(
      { error: 'Failed to trigger onboarding packet' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);
    const volunteerId = searchParams.get('volunteerId');

    if (!volunteerId) {
      return NextResponse.json(
        { error: 'Volunteer ID is required' },
        { status: 400 }
      );
    }

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Users can only check their own packet status, admins can check any
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (user.id !== volunteerId && (!profile || !['admin', 'founder'].includes(profile.role))) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Get packet status
    const packet = await onboardingAutomation.getPacketStatus(volunteerId);

    return NextResponse.json({ packet });

  } catch (error) {
    console.error('Error getting packet status:', error);
    return NextResponse.json(
      { error: 'Failed to get packet status' },
      { status: 500 }
    );
  }
}
