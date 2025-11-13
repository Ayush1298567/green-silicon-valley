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
  const { status } = await req.json();

  if (!status || !["active", "paused", "completed"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const { error } = await supabase
    .from("scheduled_tasks")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", workflowId);

  if (error) {
    console.error("Error updating workflow status:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Log the action
  await supabase.from("system_logs").insert({
    action: "updated_workflow_status",
    actor_id: session.user.id,
    target_table: "scheduled_tasks",
    target_id: workflowId.toString(),
    details: `Changed workflow status to: ${status}`,
    timestamp: new Date().toISOString(),
  });

  return NextResponse.json({ message: "Workflow status updated successfully" });
}

