import { NextRequest, NextResponse } from 'next/server';
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { weeklySummaries } from "@/lib/automation/weekly-summaries";

export async function POST(request: NextRequest) {
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

    // Generate weekly summary
    const summary = await weeklySummaries.generateWeeklySummary();

    return NextResponse.json({
      message: 'Weekly summary generated successfully',
      summary
    });

  } catch (error) {
    console.error('Error generating weekly summary:', error);
    return NextResponse.json(
      { error: 'Failed to generate weekly summary' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);
    const weekOf = searchParams.get('weekOf');

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check user role - only admins/founders can access summaries
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

    let query = supabase
      .from('weekly_summaries')
      .select('*')
      .order('week_of', { ascending: false });

    if (weekOf) {
      query = query.eq('week_of', weekOf);
    }

    const { data: summaries, error } = await query.limit(10);

    if (error) {
      throw error;
    }

    return NextResponse.json({ summaries });

  } catch (error) {
    console.error('Error getting weekly summaries:', error);
    return NextResponse.json(
      { error: 'Failed to get weekly summaries' },
      { status: 500 }
    );
  }
}
