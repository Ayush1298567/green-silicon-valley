export const dynamic = "force-dynamic";

import { getServerComponentClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getBaseUrl } from "@/lib/utils/base-url";
import { getDashboardPathForRole, type UserRole } from "@/lib/auth/roles";

export default async function VolunteerHoursPage() {
  const supabase = getServerComponentClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");
  const { data: rows } = await supabase.from("users").select("role").eq("id", session.user.id).limit(1);
  const role = (rows?.[0]?.role as UserRole) ?? "volunteer";
  if (!["volunteer","intern","founder"].includes(role)) redirect(getDashboardPathForRole(role));
  // Find presentations the user belongs to by team or explicit assignment
  const { data: pres } = await supabase
    .from("presentations")
    .select("id, topic, volunteer_team")
    .in("volunteer_team",
      (await supabase.from("team_members").select("team_name").eq("user_id", session.user.id)).data?.map((t:any)=>t.team_name) ?? [])
    .limit(200);
  const { data: explicit } = await supabase
    .from("presentation_members")
    .select("presentation_id")
    .eq("user_id", session.user.id);
  const explicitIds = new Set((explicit ?? []).map((e:any)=>e.presentation_id));
  const presentationMap = new Map<string, any>();
  (pres ?? []).forEach((p: any) => {
    if (p?.id) {
      presentationMap.set(String(p.id), p);
    }
  });
  const combinedIds = new Set<string>([...presentationMap.keys(), ...Array.from(explicitIds, (id) => String(id))]);

  async function Submit(formData: FormData) {
    "use server";
    const supa = getServerComponentClient();
    const { data: { session } } = await supa.auth.getSession();
    if (!session) {
      return { error: "Unauthorized" };
    }

    const presentation_id = String(formData.get("presentation_id") ?? "");
    const hours = Number(formData.get("hours") ?? 0);
    const feedback = String(formData.get("feedback") ?? "");

    if (!presentation_id || hours <= 0) {
      return { error: "Please select a presentation and enter valid hours" };
    }

    const response = await fetch(`${getBaseUrl()}/api/volunteer-hours/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ presentation_id, hours, feedback })
    });

    const result = await response.json();
    if (!result.ok) {
      return { error: result.error || "Failed to submit hours" };
    }

    return { success: true };
  }

  return (
    <div className="container py-14">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gsv-charcoal mb-2">Submit Hours & Feedback</h1>
          <p className="text-gsv-gray">
            Log your volunteer hours and share your experience from presentations you&apos;ve completed.
          </p>
        </div>

        <div className="card p-6">
          <form action={async (formData: FormData) => {
            const result = await Submit(formData);
            if (result.error) {
              setError(result.error);
            } else {
              setSuccess(true);
              setTimeout(() => setSuccess(false), 3000);
            }
          }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gsv-charcoal mb-2">
                Presentation <span className="text-red-500">*</span>
              </label>
              <select 
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gsv-green" 
                name="presentation_id" 
                required
              >
                <option value="">Select a presentation...</option>
                {Array.from(combinedIds).map((id) => {
                  const details = presentationMap.get(id);
                  const label = details
                    ? `#${details.id} • ${details.topic ?? details.volunteer_team ?? ""}`
                    : `Presentation ${id}`;
                  return (
                    <option key={id} value={id}>
                      {label}
                    </option>
                  );
                })}
              </select>
              {combinedIds.size === 0 && (
                <p className="text-sm text-gsv-gray mt-2">
                  No presentations available. Complete a presentation first.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gsv-charcoal mb-2">
                Hours <span className="text-red-500">*</span>
              </label>
              <input 
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gsv-green" 
                name="hours" 
                placeholder="e.g., 2.5" 
                type="number" 
                min="0.5" 
                max="20" 
                step="0.5" 
                required
              />
              <p className="text-xs text-gsv-gray mt-1">
                Typical presentation: 2-4 hours. Minimum: 0.5 hours
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gsv-charcoal mb-2">
                Reflection / Feedback <span className="text-xs text-gsv-gray">(Optional but encouraged)</span>
              </label>
              <textarea 
                className="w-full border rounded-lg px-3 py-2 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-gsv-green" 
                name="feedback" 
                placeholder="Share your experience, what went well, what you learned, student engagement, etc..."
                maxLength={1000}
              />
              <p className="text-xs text-gsv-gray mt-1">
                Help us understand the impact of your presentation
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Your hours will be reviewed by founders before being approved.
                You&apos;ll receive a notification when they&apos;re approved or if any changes are needed.
              </p>
            </div>

            <button 
              type="submit"
              className="w-full md:w-auto px-6 py-3 bg-gsv-green text-white rounded-lg hover:bg-gsv-greenDark transition font-medium"
            >
              Submit Hours
            </button>
          </form>
        </div>

        {/* Hours History Preview */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gsv-charcoal mb-4">Recent Submissions</h2>
          <div className="card p-6">
            <p className="text-gsv-gray text-sm">
              View your complete hours history and status on your{" "}
              <a href="/dashboard/volunteer" className="text-gsv-green hover:underline">
                dashboard
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


