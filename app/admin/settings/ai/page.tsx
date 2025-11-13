import { getServerComponentClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getDashboardPathForRole, type UserRole } from "@/lib/auth/roles";
import { getBaseUrl } from "@/lib/utils/base-url";

export const dynamic = "force-dynamic";

async function getModels() {
  const res = await fetch(`${getBaseUrl()}/api/ai/models`, {
    cache: "no-store"
  }).catch(() => null);
  if (!res || !res.ok) return ["llama3", "mistral", "phi3", "tinyllama"];
  const data = await res.json();
  return (data?.models as string[]) ?? ["llama3", "mistral", "phi3", "tinyllama"];
}

export default async function AISettingsPage() {
  const supabase = getServerComponentClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();
  if (!session) redirect("/login");
  const { data: rows } = await supabase.from("users").select("role").eq("id", session.user.id).limit(1);
  const role = (rows?.[0]?.role as UserRole) ?? "volunteer";
  if (role !== "founder") redirect(getDashboardPathForRole(role));

  const models = await getModels();
  const { data: settingsRows } = await supabase
    .from("settings")
    .select("key,value")
    .in("key", ["ai_provider", "ai_model"]);
  const settings = Object.fromEntries((settingsRows ?? []).map((r) => [r.key, r.value])) as any;

  return (
    <div className="container py-10">
      <div className="card p-6">
        <h1 className="text-2xl font-semibold mb-4">AI Settings</h1>
        <form className="grid gap-3" action="/api/settings" method="post">
          <input type="hidden" name="type" value="ai_selection" />
          <label className="text-sm">Backend</label>
          <select className="border rounded-lg px-3 py-2" name="backend" defaultValue={settings.ai_provider?.provider ?? "ollama"}>
            <option value="ollama">Ollama (local)</option>
            <option value="lmstudio">LMStudio (local)</option>
            <option value="localai">LocalAI (Docker)</option>
            <option value="openrouter" disabled>OpenRouter (disabled by default)</option>
          </select>
          <label className="text-sm">Model</label>
          <select className="border rounded-lg px-3 py-2" name="model" defaultValue={settings.ai_model?.name ?? "llama3"}>
            {models.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <button className="rounded-lg bg-gsv-green px-4 py-2 text-white w-fit">Save</button>
        </form>
      </div>
    </div>
  );
}


