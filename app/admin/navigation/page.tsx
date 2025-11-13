import { getServerComponentClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getDashboardPathForRole, type UserRole } from "@/lib/auth/roles";

export const dynamic = "force-dynamic";

export default async function NavEditorPage() {
  const supabase = getServerComponentClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");
  const { data: rows } = await supabase.from("users").select("role").eq("id", session.user.id).limit(1);
  const role = (rows?.[0]?.role as UserRole) ?? "volunteer";
  if (role !== "founder") redirect(getDashboardPathForRole(role));
  const { data } = await supabase.from("nav_links").select("*").order("link_order", { ascending: true });

  async function Create(formData: FormData) {
    "use server";
    const supa = getServerComponentClient();
    await supa.from("nav_links").insert({
      label: String(formData.get("label") ?? ""),
      href: String(formData.get("href") ?? ""),
      link_order: Number(formData.get("order") ?? 0),
      role_visibility: String(formData.get("role_visibility") ?? "public"),
      enabled: true
    });
  }
  async function Toggle(formData: FormData) {
    "use server";
    const supa = getServerComponentClient();
    const id = Number(formData.get("id") ?? 0);
    const enabled = formData.get("enabled") === "true";
    await supa.from("nav_links").update({ enabled: !enabled }).eq("id", id);
  }

  return (
    <div className="container py-10">
      <h1 className="text-2xl font-semibold">Navigation Editor</h1>
      <div className="card p-6 mt-4 max-w-2xl">
        <form action={Create} className="grid gap-2">
          <input name="label" placeholder="Label" className="border rounded px-3 py-2" required />
          <input name="href" placeholder="/path" className="border rounded px-3 py-2" required />
          <input name="order" type="number" placeholder="Order" className="border rounded px-3 py-2" defaultValue={0} />
          <select name="role_visibility" className="border rounded px-3 py-2">
            <option value="public">public</option>
            <option value="auth">auth</option>
            <option value="founder">founder</option>
            <option value="intern">intern</option>
            <option value="volunteer">volunteer</option>
            <option value="teacher">teacher</option>
            <option value="partner">partner</option>
          </select>
          <button className="rounded bg-gsv-green text-white px-3 py-2 w-fit">Add Link</button>
        </form>
      </div>
      <div className="card p-6 mt-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gsv-gray">
              <th className="py-2">Label</th>
              <th className="py-2">Href</th>
              <th className="py-2">Order</th>
              <th className="py-2">Visibility</th>
              <th className="py-2">Enabled</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((n: any) => (
              <tr key={n.id} className="border-t">
                <td className="py-2">{n.label}</td>
                <td className="py-2">{n.href}</td>
                <td className="py-2">{n.link_order}</td>
                <td className="py-2">{n.role_visibility}</td>
                <td className="py-2">{n.enabled ? "Yes" : "No"}</td>
                <td className="py-2">
                  <form action={Toggle} className="inline">
                    <input type="hidden" name="id" value={n.id} />
                    <input type="hidden" name="enabled" value={String(n.enabled)} />
                    <button className="rounded border px-3 py-1 text-xs">{n.enabled ? "Disable" : "Enable"}</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


