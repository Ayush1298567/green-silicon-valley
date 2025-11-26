import { NextRequest, NextResponse } from 'next/server';
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { reminders } from "@/lib/automation/reminders";

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { entityType, entityId, reminderType } = await request.json();

    if (!entityType || !entityId) {
      return NextResponse.json(
        { error: 'Entity type and ID are required' },
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

    let scheduledReminders;

    // Schedule reminders based on entity type
    switch (entityType) {
      case 'presentation':
        scheduledReminders = await reminders.schedulePresentationReminders(entityId);
        break;
      case 'meeting':
        scheduledReminders = await reminders.scheduleMeetingReminders(entityId);
        break;
      case 'task':
        scheduledReminders = await reminders.scheduleDeadlineReminders(entityId);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid entity type for reminders' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      message: `Reminders scheduled successfully for ${entityType}`,
      reminders: scheduledReminders
    });

  } catch (error) {
    console.error('Error scheduling reminders:', error);
    return NextResponse.json(
      { error: 'Failed to schedule reminders' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Process scheduled reminders (called by cron job)
    const sentCount = await reminders.processScheduledReminders();

    return NextResponse.json({
      message: `Processed scheduled reminders`,
      sentCount
    });

  } catch (error) {
    console.error('Error processing reminders:', error);
    return NextResponse.json(
      { error: 'Failed to process reminders' },
      { status: 500 }
    );
  }
}
