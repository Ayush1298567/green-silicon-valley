import { getServerComponentClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getDashboardPathForRole, type UserRole } from "@/lib/auth/roles";

export const dynamic = "force-dynamic";

export default async function InternProjectsData() {
  const supabase = getServerComponentClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");
  const { data: rows } = await supabase.from("users").select("role").eq("id", session.user.id).limit(1);
  const role = (rows?.[0]?.role as UserRole) ?? "volunteer";
  if (!["intern","founder"].includes(role)) redirect(getDashboardPathForRole(role));
  const { data } = await supabase.from("intern_projects").select("*").order("due_date", { ascending: true }).limit(200);
  async function Create(formData: FormData) {
    "use server";
    const supa = getServerComponentClient();
    await supa.from("intern_projects").insert({
      department: String(formData.get("department") ?? ""),
      task: String(formData.get("task") ?? ""),
      status: String(formData.get("status") ?? "Planning")
    });
  }
  return (
    <div className="container py-10">
      <h1 className="text-2xl font-semibold">Intern Projects</h1>
      <div className="card p-6 mt-6">
        <form action={Create} className="grid gap-2 text-sm">
          <input className="border rounded px-2 py-1" name="department" placeholder="Department" required />
          <input className="border rounded px-2 py-1" name="task" placeholder="Task" required />
          <select className="border rounded px-2 py-1" name="status">
            <option>Planning</option>
            <option>Scheduled</option>
            <option>Completed</option>
          </select>
          <button className="rounded bg-gsv-green text-white px-3 py-1 w-fit">Add</button>
        </form>
      </div>
      <div className="card p-6 mt-6">
        <ul className="text-sm space-y-1">
          {(data ?? []).map((p) => (
            <li key={p.id} className="text-gsv-charcoal">
              {p.department} • {p.task} • {p.status}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}


