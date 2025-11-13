import { getServerComponentClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getDashboardPathForRole, type UserRole } from "@/lib/auth/roles";

export const dynamic = "force-dynamic";

const KEYS = [
  { key: "teacher_request_confirmation", title: "Teacher Request Confirmation" },
  { key: "hours_approved", title: "Volunteer Hours Approved" },
  { key: "hours_rejected", title: "Volunteer Hours Rejected" },
  { key: "report_generated", title: "Report Generated" }
];

export default async function EmailTemplatesPage() {
  const supabase = getServerComponentClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");
  const { data: rows } = await supabase.from("users").select("role").eq("id", session.user.id).limit(1);
  const role = (rows?.[0]?.role as UserRole) ?? "volunteer";
  if (role !== "founder") redirect(getDashboardPathForRole(role));

  const { data } = await supabase.from("email_templates").select("key,subject,body,updated_at");
  const map = new Map((data ?? []).map((t:any)=>[t.key, t]));

  async function Save(formData: FormData) {
    "use server";
    const supa = getServerComponentClient();
    const key = String(formData.get("key") ?? "");
    const subject = String(formData.get("subject") ?? "");
    const body = String(formData.get("body") ?? "");
    await supa.from("email_templates").upsert({
      key, subject, body, updated_at: new Date().toISOString()
    }, { onConflict: "key" });
  }

  return (
    <div className="container py-10">
      <h1 className="text-2xl font-semibold">Email Templates</h1>
      <p className="text-gsv-gray mt-2">
        Use placeholders like {"{{name}}"}, {"{{school}}"}, {"{{presentation_id}}"}, {"{{hours}}"}, {"{{url}}"}.
      </p>
      <div className="grid lg:grid-cols-2 gap-6 mt-6">
        {KEYS.map((k) => {
          const existing:any = map.get(k.key) ?? {};
          return (
            <div key={k.key} className="card p-6">
              <div className="font-semibold mb-2">{k.title}</div>
              <form action={Save} className="grid gap-2">
                <input type="hidden" name="key" value={k.key} />
                <input name="subject" placeholder="Subject" className="border rounded px-3 py-2" defaultValue={existing.subject ?? ""} />
                <textarea name="body" placeholder="Body text" className="border rounded px-3 py-2 min-h-[160px]" defaultValue={existing.body ?? ""} />
                <button className="rounded bg-gsv-green text-white px-3 py-2 w-fit">Save</button>
                <div className="text-xs text-gsv-gray">{existing.updated_at ? `Updated ${new Date(existing.updated_at).toLocaleString()}` : ""}</div>
              </form>
            </div>
          );
        })}
      </div>
    </div>
  );
}


