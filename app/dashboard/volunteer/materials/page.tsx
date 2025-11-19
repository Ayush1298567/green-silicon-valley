import { getServerComponentClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getDashboardPathForRole, type UserRole } from "@/lib/auth/roles";
import MaterialRequestWizard from "@/components/materials/MaterialRequestWizard";

export const dynamic = "force-dynamic";

export default async function VolunteerMaterialsPage() {
  const supabase = getServerComponentClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const { data: userRow } = await supabase.from("users").select("*").eq("id", session.user.id).single();
  const role = (userRow?.role as UserRole) ?? "volunteer";

  if (role !== "volunteer") redirect(getDashboardPathForRole(role));

  // Get user's team and upcoming presentations
  const { data: teamMembers } = await supabase
    .from("team_members")
    .select("volunteer_team_id")
    .eq("user_id", session.user.id)
    .single();

  if (!teamMembers) {
    redirect("/dashboard/volunteer/pending-approval");
  }

  // Get upcoming presentations for this team
  const { data: upcomingPresentations } = await supabase
    .from("presentations")
    .select("id, title, scheduled_date")
    .eq("volunteer_team_id", teamMembers.volunteer_team_id)
    .eq("status", "scheduled")
    .gte("scheduled_date", new Date().toISOString())
    .order("scheduled_date", { ascending: true })
    .limit(5);

  if (!upcomingPresentations || upcomingPresentations.length === 0) {
    // No upcoming presentations - redirect back to dashboard
    redirect("/dashboard/volunteer");
  }

  // Use the first upcoming presentation as default
  const presentationId = upcomingPresentations[0].id;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gsv-gray-900">Request Materials</h1>
        <p className="text-gsv-gray-600 mt-2">
          Request supplies and equipment for your upcoming presentation
        </p>
      </div>

      {/* Presentation Selection */}
      {upcomingPresentations.length > 1 && (
        <div className="bg-gsv-gray-50 border border-gsv-gray-200 rounded-xl p-4">
          <h2 className="text-sm font-medium text-gsv-gray-900 mb-2">Select Presentation</h2>
          <p className="text-xs text-gsv-gray-600 mb-3">
            Choose which presentation you need materials for:
          </p>
          <div className="flex flex-wrap gap-2">
            {upcomingPresentations.map((presentation) => (
              <button
                key={presentation.id}
                onClick={() => window.location.href = `/dashboard/volunteer/materials?presentation=${presentation.id}`}
                className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                  presentation.id === presentationId
                    ? 'bg-gsv-green text-white border-gsv-green'
                    : 'bg-white text-gsv-gray-700 border-gsv-gray-300 hover:border-gsv-green'
                }`}
              >
                {presentation.title} - {new Date(presentation.scheduled_date).toLocaleDateString()}
              </button>
            ))}
          </div>
        </div>
      )}

      <MaterialRequestWizard presentationId={presentationId} />
    </div>
  );
}
