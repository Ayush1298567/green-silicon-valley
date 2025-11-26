import { NextRequest, NextResponse } from 'next/server';
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { reminders } from "@/lib/automation/reminders";
import { weeklySummaries } from "@/lib/automation/weekly-summaries";

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { action } = await request.json();

    // In production, you should verify this is being called by a legitimate cron service
    // For now, we'll just check for a secret key or admin authentication

    const authHeader = request.headers.get('authorization');
    const expectedSecret = process.env.CRON_SECRET_KEY;

    if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
      // Fallback: check if user is admin
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }

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
    }

    let result;

    switch (action) {
      case 'process-reminders':
        const sentCount = await reminders.processScheduledReminders();
        result = { message: `Processed scheduled reminders`, sentCount };
        break;

      case 'generate-weekly-summary':
        const summary = await weeklySummaries.generateWeeklySummary();
        result = { message: 'Weekly summary generated successfully', summaryId: summary.id };
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use "process-reminders" or "generate-weekly-summary"' },
          { status: 400 }
        );
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error in automation cron:', error);
    return NextResponse.json(
      { error: 'Automation task failed' },
      { status: 500 }
    );
  }
}

// Also support GET for simple cron services that only do GET requests
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    // Same authorization check as POST
    const authHeader = request.headers.get('authorization');
    const expectedSecret = process.env.CRON_SECRET_KEY;

    if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }

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
    }

    let result;

    switch (action) {
      case 'process-reminders':
        const sentCount = await reminders.processScheduledReminders();
        result = { message: `Processed scheduled reminders`, sentCount };
        break;

      case 'generate-weekly-summary':
        const summary = await weeklySummaries.generateWeeklySummary();
        result = { message: 'Weekly summary generated successfully', summaryId: summary.id };
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use ?action=process-reminders or ?action=generate-weekly-summary' },
          { status: 400 }
        );
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error in automation cron GET:', error);
    return NextResponse.json(
      { error: 'Automation task failed' },
      { status: 500 }
    );
  }
}
