import { NextRequest, NextResponse } from "next/server";
import { getServerComponentClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  const supabase = getServerComponentClient();
  
  // Get current user
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { status } = await request.json();

  // Validate status
  const validStatuses = ["not_started", "in_progress", "blocked", "completed", "cancelled"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  // Verify the task belongs to the current user
  const { data: task } = await supabase
    .from("task_assignments")
    .select("assigned_to")
    .eq("id", params.taskId)
    .single();

  if (!task || task.assigned_to !== session.user.id) {
    return NextResponse.json({ error: "Task not found or access denied" }, { status: 404 });
  }

  // Update the task status
  const { data, error } = await supabase
    .from("task_assignments")
    .update({ status })
    .eq("id", params.taskId)
    .select()
    .single();

  if (error) {
    console.error("Error updating task status:", error);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }

  return NextResponse.json({ task: data });
}

