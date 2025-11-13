import { getServerComponentClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import OperationsDepartmentInterface from "@/components/dashboard/intern/departments/OperationsDepartmentInterface";

export const dynamic = "force-dynamic";

export default async function OperationsDepartmentPage() {
  const supabase = getServerComponentClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const { data: userRow } = await supabase.from("users").select("*").eq("id", session.user.id).single();
  
  // Fetch operations-specific data
  const [
    { data: resources },
    { data: presentations },
  ] = await Promise.all([
    supabase.from("resources").select("*").order("created_at", { ascending: false }),
    supabase.from("presentations").select("*").eq("status", "scheduled").order("scheduled_date", { ascending: true }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gsv-charcoal">📋 Operations Department</h1>
        <p className="text-gsv-gray mt-2">
          Manage logistics, scheduling, materials, and presentation coordination
        </p>
      </div>

      <OperationsDepartmentInterface
        user={userRow}
        resources={resources || []}
        presentations={presentations || []}
      />
    </div>
  );
}

