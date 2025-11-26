import { NextRequest, NextResponse } from 'next/server';
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { crossDepartmentAlerts } from "@/lib/automation/cross-department-alerts";

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const alertData = await request.json();

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

    // Create alert
    const alert = await crossDepartmentAlerts.createAlert({
      ...alertData,
      triggeredBy: user.id
    });

    return NextResponse.json({
      message: 'Alert created successfully',
      alert
    });

  } catch (error) {
    console.error('Error creating alert:', error);
    return NextResponse.json(
      { error: 'Failed to create alert' },
      { status: 500 }
    );
  }
}

// Helper function to get department from role
function getDepartmentFromRole(role: string): string {
  switch (role) {
    case 'admin':
    case 'founder':
      return 'Operations';
    case 'intern':
      return 'Technology'; // Default department for interns
    case 'volunteer':
      return 'Volunteer Development';
    case 'teacher':
      return 'Outreach';
    default:
      return 'Operations';
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department');

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check user role - admins can see all alerts, others see their department's alerts
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    let alerts;
    if (profile && ['admin', 'founder'].includes(profile.role)) {
      // Admins can see all alerts or filter by department
      alerts = department
        ? await crossDepartmentAlerts.getDepartmentAlerts(department)
        : await crossDepartmentAlerts.getDepartmentAlerts('all');
    } else {
      // Regular users see alerts for their "department" (based on role)
      const userDepartment = getDepartmentFromRole(profile?.role || 'volunteer');
      alerts = await crossDepartmentAlerts.getDepartmentAlerts(userDepartment);
    }

    return NextResponse.json({ alerts });

  } catch (error) {
    console.error('Error getting alerts:', error);
    return NextResponse.json(
      { error: 'Failed to get alerts' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { alertId, action } = await request.json();

    if (!alertId || !action) {
      return NextResponse.json(
        { error: 'Alert ID and action are required' },
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

    if (action === 'acknowledge') {
      await crossDepartmentAlerts.acknowledgeAlert(alertId, user.id);
      return NextResponse.json({ message: 'Alert acknowledged successfully' });
    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error updating alert:', error);
    return NextResponse.json(
      { error: 'Failed to update alert' },
      { status: 500 }
    );
  }
}
