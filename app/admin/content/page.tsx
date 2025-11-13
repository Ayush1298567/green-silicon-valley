import { getServerComponentClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getDashboardPathForRole, type UserRole } from "@/lib/auth/roles";

export const dynamic = "force-dynamic";

const DEFAULT_KEYS = [
  { key: "home_hero_title", title: "Home Hero Title" },
  { key: "home_hero_subtitle", title: "Home Hero Subtitle" },
  { key: "about_body", title: "About Page Body" },
  { key: "footer_note", title: "Footer Note" }
];

export default async function ContentManagerPage() {
  const supabase = getServerComponentClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");
  const { data: rows } = await supabase.from("users").select("role").eq("id", session.user.id).limit(1);
  const role = (rows?.[0]?.role as UserRole) ?? "volunteer";
  if (role !== "founder") redirect(getDashboardPathForRole(role));

  const { data } = await supabase.from("content_blocks").select("id,key,title,content,version,updated_at").limit(200);
  const map = new Map((data ?? []).map((c: any) => [c.key, c]));

  async function Save(formData: FormData) {
    "use server";
    const supa = getServerComponentClient();
    const key = String(formData.get("key") ?? "");
    const title = String(formData.get("title") ?? "");
    const content = String(formData.get("content") ?? "");
    await supa.from("content_blocks").upsert(
      { key, title, content, version: (map.get(key)?.version ?? 0) + 1, updated_at: new Date().toISOString() } as any,
      { onConflict: "key" }
    );
  }

  return (
    <div className="container py-10">
      <h1 className="text-2xl font-semibold">Content Manager</h1>
      <p className="text-gsv-gray mt-2">Edit public text blocks (safe HTML/markdown supported).</p>
      <div className="grid lg:grid-cols-2 gap-6 mt-6">
        {DEFAULT_KEYS.map((d) => {
          const existing: any = map.get(d.key) ?? {};
          return (
            <div key={d.key} className="card p-6">
              <form action={Save} className="grid gap-2">
                <input type="hidden" name="key" value={d.key} />
                <label className="text-sm">{d.title}</label>
                <input name="title" className="border rounded px-3 py-2" placeholder={d.title} defaultValue={existing.title ?? ""} />
                <textarea name="content" className="border rounded px-3 py-2 min-h-[160px]" placeholder="Content..." defaultValue={existing.content ?? ""} />
                <button className="rounded bg-gsv-green text-white px-3 py-2 w-fit">Save</button>
                <div className="text-xs text-gsv-gray">Version {existing.version ?? 0} • {existing.updated_at ? new Date(existing.updated_at).toLocaleString() : ""}</div>
              </form>
            </div>
          );
        })}
      </div>
    </div>
  );
}


