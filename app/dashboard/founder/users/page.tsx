import { getServerComponentClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getDashboardPathForRole, type UserRole } from "@/lib/auth/roles";
import UsersManagementInterface from "@/components/users/UsersManagementInterface";

export const dynamic = "force-dynamic";

export default async function UsersManagementPage() {
  const supabase = getServerComponentClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const { data: userRow } = await supabase.from("users").select("role").eq("id", session.user.id).single();
  const role = (userRow?.role as UserRole) ?? "volunteer";

  if (role !== "founder") redirect(getDashboardPathForRole(role));

  // Fetch all users
  const { data: users } = await supabase.from("users").select("*").order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gsv-charcoal">Users & Permissions Management</h1>
        <p className="text-gsv-gray mt-2">
          Manage all platform users, roles, and permissions
        </p>
      </div>

      <UsersManagementInterface initialUsers={users || []} />
    </div>
  );
}

