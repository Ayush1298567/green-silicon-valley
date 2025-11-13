import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function PUT(req: Request, { params }: { params: { workflowId: string } }) {
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
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const workflowId = parseInt(params.workflowId);
  const { taskName, taskType, description, cronExpression, status } = await req.json();

  const { error } = await supabase
    .from("scheduled_tasks")
    .update({
      task_name: taskName,
      task_type: taskType,
      cron_expression: cronExpression,
      task_data: { description },
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", workflowId);

  if (error) {
    console.error("Error updating workflow:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Log the action
  await supabase.from("system_logs").insert({
    action: "updated_workflow",
    actor_id: session.user.id,
    target_table: "scheduled_tasks",
    target_id: workflowId.toString(),
    details: `Updated workflow: ${taskName}`,
    timestamp: new Date().toISOString(),
  });

  return NextResponse.json({ message: "Workflow updated successfully" });
}

export async function DELETE(req: Request, { params }: { params: { workflowId: string } }) {
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
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const workflowId = parseInt(params.workflowId);

  const { error } = await supabase
    .from("scheduled_tasks")
    .delete()
    .eq("id", workflowId);

  if (error) {
    console.error("Error deleting workflow:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Log the action
  await supabase.from("system_logs").insert({
    action: "deleted_workflow",
    actor_id: session.user.id,
    target_table: "scheduled_tasks",
    target_id: workflowId.toString(),
    details: `Deleted workflow ID: ${workflowId}`,
    timestamp: new Date().toISOString(),
  });

  return NextResponse.json({ message: "Workflow deleted successfully" });
}

