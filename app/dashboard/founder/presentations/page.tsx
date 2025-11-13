import { getServerComponentClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getDashboardPathForRole, type UserRole } from "@/lib/auth/roles";
import PresentationManagementInterface from "@/components/presentations/PresentationManagementInterface";

export const dynamic = "force-dynamic";

export default async function PresentationsManagementPage() {
  const supabase = getServerComponentClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const { data: userRow } = await supabase.from("users").select("role").eq("id", session.user.id).single();
  const role = (userRow?.role as UserRole) ?? "volunteer";

  if (role !== "founder") redirect(getDashboardPathForRole(role));

  // Fetch all necessary data
  const [
    { data: presentations },
    { data: schools },
    { data: volunteers },
    { data: users },
  ] = await Promise.all([
    supabase.from("presentations").select("*").order("scheduled_date", { ascending: true }),
    supabase.from("schools").select("*"),
    supabase.from("volunteers").select("*"),
    supabase.from("users").select("*"),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gsv-charcoal">Presentation Management</h1>
        <p className="text-gsv-gray mt-2">
          Schedule, assign, and manage all school presentations
        </p>
      </div>

      <PresentationManagementInterface
        initialPresentations={presentations || []}
        schools={schools || []}
        volunteers={volunteers || []}
        users={users || []}
      />
    </div>
  );
}

