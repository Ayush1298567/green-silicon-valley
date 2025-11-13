import { getServerComponentClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getDashboardPathForRole, type UserRole } from "@/lib/auth/roles";
import VolunteerDashboardOverview from "@/components/dashboard/volunteer/VolunteerDashboardOverview";
import { getTeamByUserId, getUserTeamId } from "@/lib/volunteers/team-helpers";

export const dynamic = "force-dynamic";

export default async function VolunteerDashboard() {
  const supabase = getServerComponentClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const { data: userRow } = await supabase.from("users").select("*").eq("id", session.user.id).single();
  const role = (userRow?.role as UserRole) ?? "volunteer";

  if (role !== "volunteer") redirect(getDashboardPathForRole(role));

  // Find user's team via team_members table
  const teamId = await getUserTeamId(session.user.id, supabase);
  
  if (!teamId) {
    // User is not part of a team yet - redirect to pending approval or onboarding
    redirect("/dashboard/volunteer/pending-approval");
  }

  // Fetch volunteer-specific data using team ID
  const [
    { data: volunteerProfile },
    { data: myHours },
    { data: myPresentations },
    { data: upcomingPresentations },
    { data: availableTrainings },
  ] = await Promise.all([
    supabase.from("volunteers").select("*").eq("id", teamId).single(),
    supabase.from("volunteer_hours").select("*").eq("volunteer_id", teamId).order("date", { ascending: false }),
    supabase.from("presentations").select("*").eq("volunteer_team_id", teamId).order("scheduled_date", { ascending: false }),
    supabase.from("presentations").select("*").eq("volunteer_team_id", teamId).eq("status", "scheduled").gte("scheduled_date", new Date().toISOString()).order("scheduled_date", { ascending: true }).limit(5),
    supabase.from("resources").select("*").eq("category", "training").limit(5),
  ]);

  // Check if volunteer needs onboarding
  const needsOnboarding = volunteerProfile && 
    volunteerProfile.application_status === "approved" && 
    volunteerProfile.onboarding_step !== "completed" &&
    volunteerProfile.onboarding_step !== "scheduled";

  // Redirect to onboarding if needed
  if (needsOnboarding) {
    redirect("/dashboard/volunteer/onboarding");
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gsv-charcoal">Volunteer Dashboard</h1>
        <p className="text-gsv-gray mt-2">
          Welcome back, {userRow?.name}! Track your impact and upcoming opportunities.
        </p>
      </div>

      <VolunteerDashboardOverview
        user={userRow}
        volunteerProfile={volunteerProfile}
        myHours={myHours || []}
        myPresentations={myPresentations || []}
        upcomingPresentations={upcomingPresentations || []}
        availableTrainings={availableTrainings || []}
      />
    </div>
  );
}
