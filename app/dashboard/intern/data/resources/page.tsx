import { getServerComponentClient } from "@/lib/supabase/server";
import UploadBox from "@/components/Upload/UploadBox";
import { redirect } from "next/navigation";
import { getDashboardPathForRole, type UserRole } from "@/lib/auth/roles";

export const dynamic = "force-dynamic";

export default async function InternResourcesData() {
  const supabase = getServerComponentClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");
  const { data: rows } = await supabase.from("users").select("role").eq("id", session.user.id).limit(1);
  const role = (rows?.[0]?.role as UserRole) ?? "volunteer";
  if (!["intern","founder"].includes(role)) redirect(getDashboardPathForRole(role));
  const { data } = await supabase
    .from("resources")
    .select("id, filename, file_type, upload_date, archived, is_public")
    .order("upload_date", { ascending: false })
    .limit(200);

  async function ToggleArchive(formData: FormData) {
    "use server";
    const id = Number(formData.get("id") ?? 0);
    const archived = formData.get("archived") === "true";
    const supa = getServerComponentClient();
    await supa.from("resources").update({ archived: !archived }).eq("id", id);
  }

  async function TogglePublic(formData: FormData) {
    "use server";
    const id = Number(formData.get("id") ?? 0);
    const is_public = formData.get("is_public") === "true";
    const supa = getServerComponentClient();
    await supa.from("resources").update({ is_public: !is_public }).eq("id", id);
  }

  return (
    <div className="container py-10">
      <h1 className="text-2xl font-semibold">Resources</h1>
      <div className="card p-6 mt-4">
        <div className="font-semibold mb-2">Upload</div>
        <UploadBox />
      </div>
      <div className="card p-6 mt-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gsv-gray">
              <th className="py-2">File</th>
              <th className="py-2">Type</th>
              <th className="py-2">Uploaded</th>
              <th className="py-2">Public</th>
              <th className="py-2">Archived</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((r) => (
              <tr key={r.id} className="border-t">
                <td className="py-2">{r.filename?.split("/").pop() ?? "file"}</td>
                <td className="py-2">{r.file_type ?? ""}</td>
                <td className="py-2">{r.upload_date ? new Date(r.upload_date as any).toLocaleString() : ""}</td>
                <td className="py-2">{r.is_public ? "Yes" : "No"}</td>
                <td className="py-2">{r.archived ? "Yes" : "No"}</td>
                <td className="py-2">
                  <form action={TogglePublic} className="inline">
                    <input type="hidden" name="id" value={r.id} />
                    <input type="hidden" name="is_public" value={String(r.is_public)} />
                    <button className="rounded border px-2 py-1 text-xs mr-2">{r.is_public ? "Make Private" : "Make Public"}</button>
                  </form>
                  <form action={ToggleArchive} className="inline">
                    <input type="hidden" name="id" value={r.id} />
                    <input type="hidden" name="archived" value={String(r.archived)} />
                    <button className="rounded border px-2 py-1 text-xs">{r.archived ? "Restore" : "Archive"}</button>
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


