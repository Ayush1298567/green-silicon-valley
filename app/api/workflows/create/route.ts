import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check permissions
  const { data: userRoleData } = await supabase
    .from("users")
    .select("role, permissions")
    .eq("id", session.user.id)
    .single();

  if (userRoleData?.role !== "founder" && !userRoleData?.permissions?.manage_workflows) {
    return NextResponse.json({ error: "Forbidden: You don't have permission to create workflows" }, { status: 403 });
  }

  const { taskName, taskType, description, cronExpression, status } = await req.json();

  if (!taskName || !taskType || !cronExpression) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Calculate next run time based on cron expression
  const nextRunAt = new Date();
  nextRunAt.setHours(nextRunAt.getHours() + 1); // Placeholder - would use a cron parser in production

  const { error } = await supabase.from("scheduled_tasks").insert({
    task_name: taskName,
    task_type: taskType,
    schedule_type: "cron",
    cron_expression: cronExpression,
    task_data: { description },
    status: status || "active",
    next_run_at: nextRunAt.toISOString(),
    created_at: new Date().toISOString(),
    execution_count: 0,
  });

  if (error) {
    console.error("Error creating workflow:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Log the action
  await supabase.from("system_logs").insert({
    action: "created_workflow",
    actor_id: session.user.id,
    target_table: "scheduled_tasks",
    details: `Created workflow: ${taskName}`,
    timestamp: new Date().toISOString(),
  });

  return NextResponse.json({ message: "Workflow created successfully" });
}

