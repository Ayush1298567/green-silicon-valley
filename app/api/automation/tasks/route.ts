import { NextRequest, NextResponse } from 'next/server';
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { taskGeneration } from "@/lib/automation/task-generation";

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { entityType, entityId } = await request.json();

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

    let tasks;

    // Generate tasks based on entity type
    switch (entityType) {
      case 'teacher_request':
        tasks = await taskGeneration.generateTasksFromTeacherRequest(entityId);
        break;
      case 'presentation':
        tasks = await taskGeneration.generateTasksFromPresentation(entityId);
        break;
      case 'intern_task':
        tasks = await taskGeneration.generateTasksFromInternTask(entityId);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid entity type' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      message: `Tasks generated successfully for ${entityType}`,
      tasks
    });

  } catch (error) {
    console.error('Error generating tasks:', error);
    return NextResponse.json(
      { error: 'Failed to generate tasks' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get('entityType');
    const entityId = searchParams.get('entityId');

    if (!entityType || !entityId) {
      return NextResponse.json(
        { error: 'Entity type and ID are required' },
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

    // Get generated tasks for this entity
    const { data: tasks, error } = await supabase
      .from('generated_tasks')
      .select('*')
      .eq('related_entity_type', entityType)
      .eq('related_entity_id', entityId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ tasks });

  } catch (error) {
    console.error('Error getting tasks:', error);
    return NextResponse.json(
      { error: 'Failed to get tasks' },
      { status: 500 }
    );
  }
}
