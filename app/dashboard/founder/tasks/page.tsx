import { redirect } from "next/navigation";
import { getServerComponentClient } from "@/lib/supabase/server";
import { getDashboardPathForRole, type UserRole } from "@/lib/auth/roles";
import TaskManagementInterface from "@/components/tasks/TaskManagementInterface";

export const dynamic = "force-dynamic";

export default async function FounderTasksPage() {
  const supabase = getServerComponentClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");
  
  const { data: rows } = await supabase.from("users").select("role").eq("id", session.user.id).limit(1);
  const role = (rows?.[0]?.role as UserRole) ?? "volunteer";
  
  if (role !== "founder") redirect(getDashboardPathForRole(role));

  // Fetch all tasks for management
  const { data: tasks } = await supabase
    .from("task_assignments")
    .select(`
      *,
      assigned_to_user:users!task_assignments_assigned_to_fkey(id, name, email, role),
      assigned_by_user:users!task_assignments_assigned_by_fkey(id, name)
    `)
    .order("created_at", { ascending: false })
    .limit(200);

  // Fetch all users for assignment dropdown
  const { data: users } = await supabase
    .from("users")
    .select("id, name, email, role")
    .in("role", ["volunteer", "intern", "founder"])
    .order("name");

  return (
    <div className="container py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Task Management</h1>
        <p className="mt-2 text-gsv-gray">
          Assign and manage tasks for volunteers, interns, and team members
        </p>
      </div>

      <TaskManagementInterface 
        initialTasks={tasks || []} 
        users={users || []}
        currentUserId={session.user.id}
      />
    </div>
  );
}

