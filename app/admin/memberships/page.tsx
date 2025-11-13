import { getServerComponentClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getDashboardPathForRole, type UserRole } from "@/lib/auth/roles";

export const dynamic = "force-dynamic";

export default async function MembershipsPage() {
  const supabase = getServerComponentClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");
  const { data: rows } = await supabase.from("users").select("role").eq("id", session.user.id).limit(1);
  const role = (rows?.[0]?.role as UserRole) ?? "volunteer";
  if (role !== "founder") redirect(getDashboardPathForRole(role));

  const { data: teams } = await supabase.from("team_members").select("id,user_id,team_name").limit(200);
  const { data: pms } = await supabase.from("presentation_members").select("id,user_id,presentation_id").limit(200);

  async function AddTeam(formData: FormData) {
    "use server";
    const supa = getServerComponentClient();
    const email = String(formData.get("email") ?? "");
    const team_name = String(formData.get("team_name") ?? "");
    const { data: user } = await supa.from("users").select("id").eq("email", email).limit(1);
    if (user && user.length > 0) {
      await supa.from("team_members").insert({ user_id: user[0].id, team_name });
    }
  }

  async function AddPm(formData: FormData) {
    "use server";
    const supa = getServerComponentClient();
    const email = String(formData.get("email") ?? "");
    const presentation_id = Number(formData.get("presentation_id") ?? 0);
    const { data: user } = await supa.from("users").select("id").eq("email", email).limit(1);
    if (user && user.length > 0) {
      await supa.from("presentation_members").insert({ user_id: user[0].id, presentation_id });
    }
  }

  return (
    <div className="container py-10">
      <h1 className="text-2xl font-semibold">Membership Manager</h1>
      <div className="grid lg:grid-cols-2 gap-6 mt-6">
        <div className="card p-6">
          <div className="font-semibold mb-2">Team Members</div>
          <form action={AddTeam} className="flex gap-2 items-center text-sm">
            <input name="email" placeholder="user@example.com" className="border rounded px-2 py-1" />
            <input name="team_name" placeholder="Team Name" className="border rounded px-2 py-1" />
            <button className="rounded border px-3 py-1">Add</button>
          </form>
          <ul className="text-sm mt-4 space-y-1 max-h-64 overflow-auto">
            {(teams ?? []).map((t) => (
              <li key={t.id}>{t.team_name} • {t.user_id}</li>
            ))}
          </ul>
        </div>
        <div className="card p-6">
          <div className="font-semibold mb-2">Presentation Members</div>
          <form action={AddPm} className="flex gap-2 items-center text-sm">
            <input name="email" placeholder="user@example.com" className="border rounded px-2 py-1" />
            <input name="presentation_id" placeholder="Presentation ID" className="border rounded px-2 py-1" />
            <button className="rounded border px-3 py-1">Add</button>
          </form>
          <ul className="text-sm mt-4 space-y-1 max-h-64 overflow-auto">
            {(pms ?? []).map((m) => (
              <li key={m.id}>#{m.presentation_id} • {m.user_id}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}


