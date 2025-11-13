import { getServerComponentClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import TechnologyDepartmentInterface from "@/components/dashboard/intern/departments/TechnologyDepartmentInterface";

export const dynamic = "force-dynamic";

export default async function TechnologyDepartmentPage() {
  const supabase = getServerComponentClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const { data: userRow } = await supabase.from("users").select("*").eq("id", session.user.id).single();
  
  // Fetch technology-specific data
  const [
    { data: users },
    { data: systemLogs },
  ] = await Promise.all([
    supabase.from("users").select("*").order("created_at", { ascending: false }),
    supabase.from("system_logs").select("*").order("timestamp", { ascending: false }).limit(50),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gsv-charcoal">💻 Technology Department</h1>
        <p className="text-gsv-gray mt-2">
          Oversee website, technical infrastructure, data systems, and digital tools
        </p>
      </div>

      <TechnologyDepartmentInterface
        user={userRow}
        users={users || []}
        systemLogs={systemLogs || []}
      />
    </div>
  );
}

