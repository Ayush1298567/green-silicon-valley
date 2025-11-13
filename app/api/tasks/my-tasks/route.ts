import { NextRequest, NextResponse } from "next/server";
import { getServerComponentClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const supabase = getServerComponentClient();
  
  // Get current user
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const filter = searchParams.get("filter") || "active";

  let query = supabase
    .from("task_assignments")
    .select(`
      id,
      title,
      description,
      priority,
      status,
      due_date,
      task_type,
      created_at,
      assigned_by:users!task_assignments_assigned_by_fkey(name)
    `)
    .eq("assigned_to", session.user.id);

  // Apply filter
  if (filter === "active") {
    query = query.in("status", ["not_started", "in_progress", "blocked"]);
  } else if (filter === "completed") {
    query = query.eq("status", "completed");
  }

  query = query.order("priority", { ascending: false })
    .order("due_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  const { data: tasks, error } = await query;

  if (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }

  // Transform the data to flatten the assigned_by relationship
  const transformedTasks = tasks?.map((task: any) => ({
    ...task,
    assigned_by_name: task.assigned_by?.name || null,
    assigned_by: undefined,
  }));

  return NextResponse.json({ tasks: transformedTasks });
}

