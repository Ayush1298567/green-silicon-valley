import { getServerComponentClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getDashboardPathForRole, type UserRole } from "@/lib/auth/roles";
import WorkflowManagementInterface from "@/components/workflows/WorkflowManagementInterface";

export const dynamic = "force-dynamic";

export default async function WorkflowsManagementPage() {
  const supabase = getServerComponentClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const { data: userRow } = await supabase.from("users").select("*").eq("id", session.user.id).single();
  const role = (userRow?.role as UserRole) ?? "volunteer";

  // Check permissions
  const canManageWorkflows = role === "founder" || userRow?.permissions?.manage_workflows;
  if (!canManageWorkflows && !userRow?.permissions?.view_workflows) {
    redirect(getDashboardPathForRole(role));
  }

  // Fetch all workflows
  const { data: workflows } = await supabase
    .from("scheduled_tasks")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gsv-charcoal">Workflow Automation</h1>
        <p className="text-gsv-gray mt-2">
          Create and manage automated workflows for presentations, onboarding, reminders, and more
        </p>
      </div>

      <WorkflowManagementInterface
        workflows={workflows || []}
        canEdit={canManageWorkflows}
      />
    </div>
  );
}

