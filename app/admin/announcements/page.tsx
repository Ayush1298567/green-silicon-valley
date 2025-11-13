import { getServerComponentClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getDashboardPathForRole, type UserRole } from "@/lib/auth/roles";

export const dynamic = "force-dynamic";

export default async function AnnouncementsPanel() {
  const supabase = getServerComponentClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");
  const { data: rows } = await supabase.from("users").select("role").eq("id", session.user.id).limit(1);
  const role = (rows?.[0]?.role as UserRole) ?? "volunteer";
  if (role !== "founder" && role !== "intern") redirect(getDashboardPathForRole(role));

  const { data: list } = await supabase
    .from("announcements")
    .select("id,title,body,created_at,pinned,scope")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="container py-10">
      <div className="card p-6">
        <h1 className="text-2xl font-semibold mb-4">Announcements</h1>
        <form action="/api/messaging/announcement" method="post" className="grid gap-3">
          <input className="border rounded-lg px-3 py-2" name="title" placeholder="Title" required />
          <textarea className="border rounded-lg px-3 py-2 min-h-[120px]" name="body" placeholder="Body" required />
          <input className="border rounded-lg px-3 py-2" name="scope" placeholder="Scope (e.g., global, interns)" />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="pinned" /> Pin
          </label>
          <button className="rounded-lg bg-gsv-green px-4 py-2 text-white w-fit">Post</button>
        </form>
        <div className="mt-6 divide-y">
          {(list ?? []).map((a) => (
            <div key={a.id} className="py-3">
              <div className="flex items-center justify-between">
                <div className="font-semibold">{a.title}</div>
                {a.pinned ? <span className="text-xs bg-gsv-green text-white rounded px-2 py-0.5">Pinned</span> : null}
              </div>
              <div className="text-sm text-gsv-gray">{a.body}</div>
              <div className="text-xs text-gsv-gray mt-1">{new Date(a.created_at).toLocaleString()} • {a.scope ?? "global"}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


