import { getServerComponentClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import VolunteerDevDepartmentInterface from "@/components/dashboard/intern/departments/VolunteerDevDepartmentInterface";

export const dynamic = "force-dynamic";

export default async function VolunteerDevDepartmentPage() {
  const supabase = getServerComponentClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const { data: userRow } = await supabase.from("users").select("*").eq("id", session.user.id).single();
  
  // Fetch volunteer development-specific data
  const [
    { data: volunteers },
    { data: volunteerHours },
  ] = await Promise.all([
    supabase.from("volunteers").select("*").order("created_at", { ascending: false }),
    supabase.from("volunteer_hours").select("*").order("date", { ascending: false }).limit(50),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gsv-charcoal">🎓 Volunteer Development Department</h1>
        <p className="text-gsv-gray mt-2">
          Responsible for volunteer recruitment, training, and recognition
        </p>
      </div>

      <VolunteerDevDepartmentInterface
        user={userRow}
        volunteers={volunteers || []}
        volunteerHours={volunteerHours || []}
      />
    </div>
  );
}

