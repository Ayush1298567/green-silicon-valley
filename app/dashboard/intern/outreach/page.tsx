import { getServerComponentClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import OutreachDepartmentInterface from "@/components/dashboard/intern/departments/OutreachDepartmentInterface";

export const dynamic = "force-dynamic";

export default async function OutreachDepartmentPage() {
  const supabase = getServerComponentClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const { data: userRow } = await supabase.from("users").select("*").eq("id", session.user.id).single();
  
  // Fetch outreach-specific data
  const [
    { data: schools },
    { data: presentations },
  ] = await Promise.all([
    supabase.from("schools").select("*").order("name", { ascending: true }),
    supabase.from("presentations").select("*").order("scheduled_date", { ascending: false }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gsv-charcoal">📞 Outreach Department</h1>
        <p className="text-gsv-gray mt-2">
          Handle communication with schools, teachers, and external partners
        </p>
      </div>

      <OutreachDepartmentInterface
        user={userRow}
        schools={schools || []}
        presentations={presentations || []}
      />
    </div>
  );
}

