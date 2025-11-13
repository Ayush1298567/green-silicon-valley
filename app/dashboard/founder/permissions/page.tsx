import { getServerComponentClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getDashboardPathForRole, type UserRole } from "@/lib/auth/roles";
import GranularPermissionsInterface from "@/components/permissions/GranularPermissionsInterface";

export const dynamic = "force-dynamic";

export default async function PermissionsManagementPage() {
  const supabase = getServerComponentClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const { data: userRow } = await supabase.from("users").select("role").eq("id", session.user.id).single();
  const role = (userRow?.role as UserRole) ?? "volunteer";

  if (role !== "founder") redirect(getDashboardPathForRole(role));

  // Fetch users and their current permissions
  const { data: users } = await supabase
    .from("users")
    .select("*")
    .in("role", ["intern", "volunteer"])
    .order("name", { ascending: true });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gsv-charcoal">Permissions Management</h1>
        <p className="text-gsv-gray mt-2">
          Grant interns and volunteers access to specific features and sections of the platform
        </p>
      </div>

      <GranularPermissionsInterface users={users || []} />
    </div>
  );
}

