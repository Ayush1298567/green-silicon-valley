import { getServerComponentClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getDashboardPathForRole, type UserRole } from "@/lib/auth/roles";

export const dynamic = "force-dynamic";

export default async function GeoAdminPage() {
  const supabase = getServerComponentClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");
  const { data: rows } = await supabase.from("users").select("role").eq("id", session.user.id).limit(1);
  const role = (rows?.[0]?.role as UserRole) ?? "volunteer";
  if (role !== "founder") redirect(getDashboardPathForRole(role));

  const { data: schools } = await supabase.from("schools").select("id,name,lat,lng").order("name", { ascending: true }).limit(200);
  const { data: chapters } = await supabase.from("chapters").select("id,name,region,lat,lng").order("name", { ascending: true }).limit(200);

  async function UpdateSchool(formData: FormData) {
    "use server";
    const supa = getServerComponentClient();
    const id = Number(formData.get("id") ?? 0);
    const lat = parseFloat(String(formData.get("lat") ?? ""));
    const lng = parseFloat(String(formData.get("lng") ?? ""));
    await supa.from("schools").update({ lat: isNaN(lat) ? null : lat, lng: isNaN(lng) ? null : lng }).eq("id", id);
  }

  async function UpdateChapter(formData: FormData) {
    "use server";
    const supa = getServerComponentClient();
    const id = Number(formData.get("id") ?? 0);
    const lat = parseFloat(String(formData.get("lat") ?? ""));
    const lng = parseFloat(String(formData.get("lng") ?? ""));
    await supa.from("chapters").update({ lat: isNaN(lat) ? null : lat, lng: isNaN(lng) ? null : lng }).eq("id", id);
  }

  return (
    <div className="container py-10">
      <h1 className="text-2xl font-semibold">Geo Coordinates</h1>
      <div className="grid lg:grid-cols-2 gap-6 mt-6">
        <div className="card p-5">
          <div className="font-semibold mb-2">Schools</div>
          <ul className="space-y-2 text-sm">
            {(schools ?? []).map((s) => (
              <li key={s.id} className="border-t pt-2">
                <div className="mb-1">{s.name}</div>
                <form action={UpdateSchool} className="flex gap-2 items-center">
                  <input type="hidden" name="id" value={s.id} />
                  <input name="lat" placeholder="lat" defaultValue={s.lat ?? ""} className="border rounded px-2 py-1 w-32" />
                  <input name="lng" placeholder="lng" defaultValue={s.lng ?? ""} className="border rounded px-2 py-1 w-32" />
                  <button className="rounded border px-3 py-1">Save</button>
                </form>
              </li>
            ))}
          </ul>
        </div>
        <div className="card p-5">
          <div className="font-semibold mb-2">Chapters</div>
          <ul className="space-y-2 text-sm">
            {(chapters ?? []).map((c) => (
              <li key={c.id} className="border-t pt-2">
                <div className="mb-1">{c.name} {c.region ? `• ${c.region}` : ""}</div>
                <form action={UpdateChapter} className="flex gap-2 items-center">
                  <input type="hidden" name="id" value={c.id} />
                  <input name="lat" placeholder="lat" defaultValue={c.lat ?? ""} className="border rounded px-2 py-1 w-32" />
                  <input name="lng" placeholder="lng" defaultValue={c.lng ?? ""} className="border rounded px-2 py-1 w-32" />
                  <button className="rounded border px-3 py-1">Save</button>
                </form>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}


