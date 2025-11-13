import { getServerComponentClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getDashboardPathForRole, type UserRole } from "@/lib/auth/roles";
import InternDashboardOverview from "@/components/dashboard/intern/InternDashboardOverview";

export const dynamic = "force-dynamic";

export default async function InternDashboard() {
  const supabase = getServerComponentClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const { data: userRow } = await supabase.from("users").select("*").eq("id", session.user.id).single();
  const role = (userRow?.role as UserRole) ?? "volunteer";

  if (role !== "intern") redirect(getDashboardPathForRole(role));

  // Fetch intern-specific data
  const [
    { data: myTasks },
    { data: myProjects },
    { data: recentActivity },
    { data: teamMembers },
  ] = await Promise.all([
    supabase.from("intern_projects").select("*").eq("assigned_to", session.user.id).order("due_date", { ascending: true }),
    supabase.from("intern_projects").select("*").eq("created_by", session.user.id).order("created_at", { ascending: false }),
    supabase.from("system_logs").select("*").eq("actor_id", session.user.id).order("timestamp", { ascending: false }).limit(10),
    supabase.from("users").select("*").eq("role", "intern"),
  ]);

  // Determine department from user metadata or a separate field
  // For now, we'll assume it's stored in user metadata or we'll add it to the users table
  const department = userRow?.department || "general"; // This field should be added to users table

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gsv-charcoal">Intern Dashboard</h1>
        <p className="text-gsv-gray mt-2">
          Welcome back, {userRow?.name}! Here’s your {department} department overview.
        </p>
      </div>

      <InternDashboardOverview
        user={userRow}
        department={department}
        myTasks={myTasks || []}
        myProjects={myProjects || []}
        recentActivity={recentActivity || []}
        teamMembers={teamMembers || []}
      />
    </div>
  );
}
