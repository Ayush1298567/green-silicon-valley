import { getServerComponentClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = getServerComponentClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();
  if (!session) redirect("/login");
  // Founders only
  const { data: roleRows } = await supabase
    .from("users")
    .select("role")
    .eq("id", session.user.id)
    .limit(1);
  if (roleRows?.[0]?.role !== "founder") redirect("/");

  const { data: settingsRows } = await supabase
    .from("settings")
    .select("key,value")
    .in("key", ["automation_times", "ai_provider"]);
  const settings = Object.fromEntries(
    (settingsRows ?? []).map((r) => [r.key, r.value])
  ) as {
    automation_times?: { morning?: string; evening?: string };
    ai_provider?: { provider?: string };
  };

  return (
    <div className="container py-14">
      <h1 className="text-3xl font-bold">Settings</h1>
      <p className="mt-3 text-gsv-gray">Configure automations and AI providers.</p>
      <div className="grid md:grid-cols-2 gap-6 mt-8">
        <div className="card p-6">
          <h2 className="font-semibold mb-3">Automation Schedule</h2>
          <form className="grid gap-3" action="/api/settings" method="post">
            <input type="hidden" name="type" value="automation_times" />
            <label className="text-sm">Morning run (HH:MM)</label>
            <input
              className="border rounded-lg px-3 py-2"
              name="time_morning"
              placeholder="03:30"
              defaultValue={settings.automation_times?.morning ?? ""}
            />
            <label className="text-sm">Evening run (HH:MM)</label>
            <input
              className="border rounded-lg px-3 py-2"
              name="time_evening"
              placeholder="20:00"
              defaultValue={settings.automation_times?.evening ?? ""}
            />
            <button className="rounded-lg bg-gsv-green px-4 py-2 text-white w-fit">
              Save
            </button>
          </form>
        </div>
        <div className="card p-6">
          <h2 className="font-semibold mb-3">AI Provider</h2>
          <form className="grid gap-3" action="/api/settings" method="post">
            <input type="hidden" name="type" value="ai_provider" />
            <select
              className="border rounded-lg px-3 py-2"
              name="provider"
              defaultValue={settings.ai_provider?.provider ?? "openrouter"}
            >
              <option value="openrouter">OpenRouter</option>
              <option value="ollama">Local Ollama</option>
            </select>
            <button className="rounded-lg bg-gsv-green px-4 py-2 text-white w-fit">
              Save
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}


