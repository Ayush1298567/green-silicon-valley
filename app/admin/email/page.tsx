import { getServerComponentClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getDashboardPathForRole, type UserRole } from "@/lib/auth/roles";
import { sendEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export default async function AdminEmailPage() {
  const supabase = getServerComponentClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");
  const { data: rows } = await supabase.from("users").select("role").eq("id", session.user.id).limit(1);
  const role = (rows?.[0]?.role as UserRole) ?? "volunteer";
  if (role !== "founder") redirect(getDashboardPathForRole(role));

  async function Send(formData: FormData) {
    "use server";
    const supa = getServerComponentClient();
    const target = String(formData.get("target") ?? "volunteer"); // volunteer | intern | founder | all
    const subject = String(formData.get("subject") ?? "");
    const text = String(formData.get("text") ?? "");
    if (!process.env.SMTP_URL) return;
    let q = supa.from("users").select("email,name");
    if (target !== "all") q = q.eq("role", target);
    const { data: users } = await q;
    for (const u of users ?? []) {
      if (!u?.email) continue;
      try {
        await sendEmail({
          to: u.email,
          subject,
          text: `Hello ${u.name ?? ""},\n\n${text}\n\n— Green Silicon Valley`
        });
      } catch {}
    }
    await supa.from("system_logs").insert({
      event_type: "email_broadcast",
      description: JSON.stringify({ target, subject, count: (users ?? []).length })
    });
  }

  return (
    <div className="container py-10">
      <h1 className="text-2xl font-semibold">Founder Email Broadcast</h1>
      <p className="text-gsv-gray mt-2">Send a message to a role-based audience.</p>
      <div className="card p-6 mt-4 max-w-2xl">
        <form action={Send} className="grid gap-3">
          <label className="text-sm">Audience</label>
          <select name="target" className="border rounded px-3 py-2">
            <option value="volunteer">Volunteers</option>
            <option value="intern">Interns</option>
            <option value="founder">Founders</option>
            <option value="all">All</option>
          </select>
          <input name="subject" placeholder="Subject" className="border rounded px-3 py-2" required />
          <textarea name="text" placeholder="Message" className="border rounded px-3 py-2 min-h-[160px]" required />
          <button className="rounded bg-gsv-green text-white px-4 py-2 w-fit">Send</button>
        </form>
      </div>
      {!process.env.SMTP_URL ? (
        <div className="mt-4 text-xs text-red-600">SMTP_URL is not configured; emails will be skipped.</div>
      ) : null}
    </div>
  );
}


