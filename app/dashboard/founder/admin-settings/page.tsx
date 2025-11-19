import { getServerComponentClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getDashboardPathForRole, type UserRole } from "@/lib/auth/roles";
import ProcurementSettingsManager from "@/components/admin/ProcurementSettingsManager";
import InternPermissionManager from "@/components/admin/InternPermissionManager";
import KitInventoryManager from "@/components/admin/KitInventoryManager";
import InternationalSettingsManager from "@/components/admin/InternationalSettingsManager";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const supabase = getServerComponentClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const { data: userRow } = await supabase.from("users").select("*").eq("id", session.user.id).single();
  const role = (userRow?.role as UserRole) ?? "volunteer";

  if (role !== "founder") redirect(getDashboardPathForRole(role));

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-3xl font-bold text-gsv-gray-900">Administrative Settings</h1>
        <p className="text-gsv-gray-600 mt-2">
          Manage procurement settings, intern permissions, and kit inventory
        </p>
      </div>

      {/* Procurement Settings */}
      <section>
        <ProcurementSettingsManager />
      </section>

      {/* Intern Permissions */}
      <section>
        <InternPermissionManager />
      </section>

      {/* Kit Inventory Management */}
      <section>
        <KitInventoryManager />
      </section>

      {/* International Settings */}
      <section>
        <InternationalSettingsManager />
      </section>
    </div>
  );
}
