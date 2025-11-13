import { NextRequest, NextResponse } from "next/server";
import { getServerComponentClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const supabase = getServerComponentClient();
  
  // Get current user
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if user is founder or intern
  const { data: user } = await supabase
    .from("users")
    .select("role")
    .eq("id", session.user.id)
    .single();

  if (!user || !["founder", "intern"].includes(user.role)) {
    return NextResponse.json({ error: "Forbidden - only founders and interns can create tasks" }, { status: 403 });
  }

  const body = await request.json();
  
  const {
    title,
    description,
    assigned_to,
    priority = "medium",
    status = "not_started",
    due_date,
    task_type = "other",
    related_presentation_id,
    related_project_id,
  } = body;

  if (!title || !assigned_to) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Create the task
  const { data: task, error } = await supabase
    .from("task_assignments")
    .insert({
      title,
      description,
      assigned_to,
      assigned_by: session.user.id,
      priority,
      status,
      due_date: due_date || null,
      task_type,
      related_presentation_id,
      related_project_id,
    })
    .select(`
      *,
      assigned_to_user:users!task_assignments_assigned_to_fkey(id, name, email, role),
      assigned_by_user:users!task_assignments_assigned_by_fkey(id, name)
    `)
    .single();

  if (error) {
    console.error("Error creating task:", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }

  return NextResponse.json({ task });
}

