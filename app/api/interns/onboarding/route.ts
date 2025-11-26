import { NextRequest, NextResponse } from 'next/server';
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch onboarding checklist for the current user
    const { data: checklist, error } = await supabase
      .from('intern_onboarding_checklist')
      .select('*')
      .eq('intern_id', user.id)
      .order('order_index');

    if (error) {
      console.error('Error fetching onboarding checklist:', error);
      // Return sample checklist data if database table doesn't exist yet
      return NextResponse.json({
        checklist: [
          // Week 1: Administrative & Orientation
          {
            id: '1',
            title: 'Complete HR paperwork and background check',
            description: 'Fill out necessary forms, tax documents, and undergo background verification',
            category: 'administrative',
            estimatedTime: '2-3 hours',
            required: true,
            completed: false,
            order: 1
          },
          {
            id: '2',
            title: 'Set up email and access accounts',
            description: 'Get organizational email, Slack, and access to internal tools',
            category: 'administrative',
            estimatedTime: '30 minutes',
            required: true,
            completed: false,
            order: 2
          },
          {
            id: '3',
            title: 'Attend welcome orientation',
            description: 'Join the full team for introductions and overview of our mission and values',
            category: 'orientation',
            estimatedTime: '2 hours',
            required: true,
            completed: false,
            order: 3
          },
          {
            id: '4',
            title: 'Review organizational policies and handbook',
            description: 'Read through code of conduct, remote work policies, and organizational guidelines',
            category: 'orientation',
            estimatedTime: '1 hour',
            required: true,
            completed: false,
            order: 4
          },

          // Week 2: Department Training
          {
            id: '5',
            title: 'Meet with department supervisor',
            description: 'One-on-one meeting to discuss role expectations and initial projects',
            category: 'department',
            estimatedTime: '1 hour',
            required: true,
            completed: false,
            order: 5
          },
          {
            id: '6',
            title: 'Complete department-specific training',
            description: 'Learn tools, processes, and workflows specific to your department',
            category: 'training',
            estimatedTime: '4-6 hours',
            required: true,
            completed: false,
            order: 6
          },
          {
            id: '7',
            title: 'Set up development environment',
            description: 'Install necessary software, get access to code repositories, and configure workstations',
            category: 'training',
            estimatedTime: '2-4 hours',
            required: true,
            completed: false,
            order: 7
          },
          {
            id: '8',
            title: 'Shadow team meetings and presentations',
            description: 'Observe team meetings, client calls, and presentation preparations',
            category: 'training',
            estimatedTime: 'Ongoing',
            required: false,
            completed: false,
            order: 8
          },

          // Week 3-4: Hands-on Experience
          {
            id: '9',
            title: 'Complete first small project or task',
            description: 'Work on an initial assignment to apply your training and demonstrate skills',
            category: 'department',
            estimatedTime: '8-12 hours',
            required: true,
            completed: false,
            order: 9
          },
          {
            id: '10',
            title: 'Participate in team brainstorming sessions',
            description: 'Join collaborative sessions to contribute ideas and learn from peers',
            category: 'department',
            estimatedTime: 'Ongoing',
            required: false,
            completed: false,
            order: 10
          },
          {
            id: '11',
            title: 'Receive and give feedback',
            description: 'Complete performance check-in and provide feedback on onboarding process',
            category: 'orientation',
            estimatedTime: '1 hour',
            required: true,
            completed: false,
            order: 11
          },
          {
            id: '12',
            title: 'Create personal development plan',
            description: 'Set goals and identify areas for growth during your internship',
            category: 'orientation',
            estimatedTime: '2 hours',
            required: false,
            completed: false,
            order: 12
          }
        ]
      });
    }

    return NextResponse.json({ checklist });

  } catch (error) {
    console.error('Error in interns/onboarding API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient();

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { checklistItems } = body;

    if (!Array.isArray(checklistItems)) {
      return NextResponse.json(
        { error: 'checklistItems must be an array' },
        { status: 400 }
      );
    }

    // Upsert checklist items for this intern
    const itemsToUpsert = checklistItems.map((item, index) => ({
      intern_id: user.id,
      item_id: item.id,
      title: item.title,
      description: item.description,
      category: item.category,
      estimated_time: item.estimatedTime,
      required: item.required,
      completed: item.completed,
      order_index: index + 1
    }));

    const { data: updatedChecklist, error } = await supabase
      .from('intern_onboarding_checklist')
      .upsert(itemsToUpsert, {
        onConflict: 'intern_id,item_id',
        ignoreDuplicates: false
      })
      .select('*')
      .order('order_index');

    if (error) {
      console.error('Error updating onboarding checklist:', error);
      return NextResponse.json(
        { error: 'Failed to update checklist' },
        { status: 500 }
      );
    }

    return NextResponse.json({ checklist: updatedChecklist });

  } catch (error) {
    console.error('Error in interns/onboarding POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
