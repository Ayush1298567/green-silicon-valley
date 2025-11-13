import { getServerComponentClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getDashboardPathForRole, type UserRole } from "@/lib/auth/roles";
import { listUsers } from "@/lib/crud/users";
import { listVolunteers } from "@/lib/crud/volunteers";
import { listInternProjects } from "@/lib/crud/internProjects";
import { listResources } from "@/lib/crud/resources";
import { listRules } from "@/lib/crud/rules";
import { listGrants } from "@/lib/crud/grants";
import { listDonations } from "@/lib/crud/donations";
import { listSystemLogs } from "@/lib/crud/systemLogs";

export const dynamic = "force-dynamic";

export default async function DataManagerPage() {
  const supabase = getServerComponentClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");
  const { data: rows } = await supabase.from("users").select("role").eq("id", session.user.id).limit(1);
  const role = (rows?.[0]?.role as UserRole) ?? "volunteer";
  if (role !== "founder") redirect(getDashboardPathForRole(role));

  const [
    users, volunteers, projects, resources, rules, grants, donations, logs
  ] = await Promise.all([
    listUsers(50),
    listVolunteers(50),
    listInternProjects(50),
    listResources(24),
    listRules(24),
    listGrants(24),
    listDonations(24),
    listSystemLogs(24)
  ]);

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold">Data Manager</h1>
      <p className="mt-3 text-gsv-gray">Quick administrative view into core entities.</p>
      <div className="grid lg:grid-cols-2 gap-6 mt-6">
        <div className="card p-5">
          <div className="font-semibold mb-2">Users</div>
          <ul className="text-sm space-y-2 max-h-64 overflow-auto">
            {users?.map((u) => (
              <li key={u.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="truncate" title={`${u.name ?? "—"} • ${u.email ?? ""} • ${u.role}`}>
                  {u.name ?? "—"} • {u.email ?? ""} • {u.role}
                </div>
                <form action={UpdateUserRole} className="flex gap-1 ml-2">
                  <input type="hidden" name="id" value={u.id} />
                  <select name="role" defaultValue={u.role} className="border rounded px-1 py-0.5 text-xs">
                    <option value="founder">founder</option>
                    <option value="intern">intern</option>
                    <option value="volunteer">volunteer</option>
                    <option value="teacher">teacher</option>
                    <option value="partner">partner</option>
                  </select>
                  <button className="rounded bg-gsv-green text-white px-2 py-0.5 text-xs">Update</button>
                </form>
              </li>
            ))}
            {(!users || users.length === 0) ? <li className="text-gsv-gray">No users</li> : null}
          </ul>
        </div>
        <div className="card p-5">
          <div className="font-semibold mb-2">Create User</div>
          <form action={CreateUser} className="grid gap-2 text-sm">
            <input name="name" placeholder="Name" className="border rounded px-2 py-1" required />
            <input name="email" placeholder="Email" className="border rounded px-2 py-1" required />
            <select name="role" className="border rounded px-2 py-1">
              <option value="founder">founder</option>
              <option value="intern">intern</option>
              <option value="volunteer">volunteer</option>
              <option value="teacher">teacher</option>
              <option value="partner">partner</option>
            </select>
            <button className="rounded bg-gsv-green text-white px-3 py-1 w-fit">Create</button>
          </form>
          <div className="mt-3 font-semibold mb-1">Delete User</div>
          <form action={DeleteUser} className="flex gap-2 text-sm">
            <input name="id" placeholder="User UUID" className="border rounded px-2 py-1 flex-1" required />
            <button className="rounded border px-3 py-1">Delete</button>
          </form>
        </div>
        <Section title="Volunteers" items={volunteers?.map((v) => `${v.team_name ?? "—"} • hours: ${v.hours_total ?? 0}`) ?? []} />
        <Section title="Intern Projects" items={projects?.map((p) => `${p.department ?? "—"} • ${p.task ?? ""} • ${p.status ?? ""}`) ?? []} />
        <div className="card p-5">
          <div className="font-semibold mb-2">New Intern Project</div>
          <form action={CreateProject} className="grid gap-2 text-sm">
            <input name="department" placeholder="Department" className="border rounded px-2 py-1" required />
            <input name="task" placeholder="Task" className="border rounded px-2 py-1" required />
            <input name="due_date" placeholder="Due Date (YYYY-MM-DD)" className="border rounded px-2 py-1" />
            <select name="status" className="border rounded px-2 py-1">
              <option>Planning</option>
              <option>Scheduled</option>
              <option>Completed</option>
            </select>
            <button className="rounded bg-gsv-green text-white px-3 py-1 w-fit">Create</button>
          </form>
          <div className="mt-3 font-semibold mb-1">Delete Project</div>
          <form action={DeleteProject} className="flex gap-2 text-sm">
            <input name="id" placeholder="Project ID" className="border rounded px-2 py-1 flex-1" required />
            <button className="rounded border px-3 py-1">Delete</button>
          </form>
        </div>
        <Section title="Resources" items={resources?.map((r) => `${r.filename ?? "—"} • ${r.file_type ?? ""}`) ?? []} />
        <Section title="Rules & Bylaws" items={rules?.map((r) => `${r.title ?? "—"}`) ?? []} />
        <div className="card p-5">
          <div className="font-semibold mb-2">New Rule/Bylaw</div>
          <form action={CreateRule} className="grid gap-2 text-sm">
            <input name="title" placeholder="Title" className="border rounded px-2 py-1" required />
            <textarea name="content" placeholder="Content" className="border rounded px-2 py-1 min-h-[100px]" required />
            <button className="rounded bg-gsv-green text-white px-3 py-1 w-fit">Create</button>
          </form>
          <div className="mt-3 font-semibold mb-1">Delete Rule</div>
          <form action={DeleteRule} className="flex gap-2 text-sm">
            <input name="id" placeholder="Rule ID" className="border rounded px-2 py-1 flex-1" required />
            <button className="rounded border px-3 py-1">Delete</button>
          </form>
        </div>
        <Section title="Grants" items={grants?.map((g) => `${g.name ?? "—"} • ${g.status ?? ""}`) ?? []} />
        <div className="card p-5">
          <div className="font-semibold mb-2">New Grant</div>
          <form action={CreateGrant} className="grid gap-2 text-sm">
            <input name="name" placeholder="Grant name" className="border rounded px-2 py-1" required />
            <input name="deadline" placeholder="Deadline (YYYY-MM-DD)" className="border rounded px-2 py-1" />
            <input name="report_due" placeholder="Report due (YYYY-MM-DD)" className="border rounded px-2 py-1" />
            <input name="status" placeholder="Status" className="border rounded px-2 py-1" />
            <button className="rounded bg-gsv-green text-white px-3 py-1 w-fit">Create</button>
          </form>
          <div className="mt-3 font-semibold mb-1">Delete Grant</div>
          <form action={DeleteGrant} className="flex gap-2 text-sm">
            <input name="id" placeholder="Grant ID" className="border rounded px-2 py-1 flex-1" required />
            <button className="rounded border px-3 py-1">Delete</button>
          </form>
        </div>
        <Section title="Donations" items={donations?.map((d) => `${d.donor_name ?? "—"} • $${d.amount ?? 0}`) ?? []} />
        <div className="card p-5">
          <div className="font-semibold mb-2">New Donation</div>
          <form action={CreateDonation} className="grid gap-2 text-sm">
            <input name="donor_name" placeholder="Donor name" className="border rounded px-2 py-1" required />
            <input name="amount" placeholder="Amount (USD)" className="border rounded px-2 py-1" type="number" step="1" min="1" required />
            <input name="date" placeholder="Date (YYYY-MM-DD)" className="border rounded px-2 py-1" />
            <button className="rounded bg-gsv-green text-white px-3 py-1 w-fit">Create</button>
          </form>
          <div className="mt-3 font-semibold mb-1">Delete Donation</div>
          <form action={DeleteDonation} className="flex gap-2 text-sm">
            <input name="id" placeholder="Donation ID" className="border rounded px-2 py-1 flex-1" required />
            <button className="rounded border px-3 py-1">Delete</button>
          </form>
        </div>
        <Section title="System Logs" items={logs?.map((l) => `${l.event_type ?? "—"} • ${l.timestamp ?? ""}`) ?? []} />
      </div>
    </div>
  );
}

async function CreateUser(formData: FormData) {
  "use server";
  const supabase = getServerComponentClient();
  await supabase.from("users").insert({
    id: crypto.randomUUID(),
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    role: String(formData.get("role") ?? "volunteer")
  });
}

async function CreateProject(formData: FormData) {
  "use server";
  const supabase = getServerComponentClient();
  await supabase.from("intern_projects").insert({
    department: String(formData.get("department") ?? ""),
    task: String(formData.get("task") ?? ""),
    due_date: String(formData.get("due_date") ?? ""),
    status: String(formData.get("status") ?? "Planning")
  });
}

async function UpdateUserRole(formData: FormData) {
  "use server";
  const supabase = getServerComponentClient();
  const id = String(formData.get("id") ?? "");
  const role = String(formData.get("role") ?? "volunteer");
  await supabase.from("users").update({ role }).eq("id", id);
}

async function DeleteUser(formData: FormData) {
  "use server";
  const supabase = getServerComponentClient();
  await supabase.from("users").delete().eq("id", String(formData.get("id") ?? ""));
}

async function DeleteProject(formData: FormData) {
  "use server";
  const supabase = getServerComponentClient();
  await supabase.from("intern_projects").delete().eq("id", Number(formData.get("id") ?? 0));
}

async function CreateRule(formData: FormData) {
  "use server";
  const supabase = getServerComponentClient();
  await supabase.from("rules_bylaws").insert({
    title: String(formData.get("title") ?? ""),
    content: String(formData.get("content") ?? ""),
    revision_date: new Date().toISOString()
  });
}

async function DeleteRule(formData: FormData) {
  "use server";
  const supabase = getServerComponentClient();
  await supabase.from("rules_bylaws").delete().eq("id", Number(formData.get("id") ?? 0));
}

async function CreateGrant(formData: FormData) {
  "use server";
  const supabase = getServerComponentClient();
  await supabase.from("grants").insert({
    name: String(formData.get("name") ?? ""),
    deadline: String(formData.get("deadline") ?? ""),
    report_due: String(formData.get("report_due") ?? ""),
    status: String(formData.get("status") ?? "")
  });
}

async function DeleteGrant(formData: FormData) {
  "use server";
  const supabase = getServerComponentClient();
  await supabase.from("grants").delete().eq("id", Number(formData.get("id") ?? 0));
}

async function CreateDonation(formData: FormData) {
  "use server";
  const supabase = getServerComponentClient();
  await supabase.from("donations").insert({
    donor_name: String(formData.get("donor_name") ?? ""),
    amount: Number(formData.get("amount") ?? 0),
    date: String(formData.get("date") ?? new Date().toISOString())
  } as any);
}

async function DeleteDonation(formData: FormData) {
  "use server";
  const supabase = getServerComponentClient();
  await supabase.from("donations").delete().eq("id", Number(formData.get("id") ?? 0));
}

function Section({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="card p-5">
      <div className="font-semibold mb-2">{title}</div>
      <ul className="text-sm space-y-1 max-h-64 overflow-auto">
        {items.map((s, i) => (
          <li key={i} className="text-gsv-charcoal truncate" title={s}>
            {s}
          </li>
        ))}
        {items.length === 0 ? <li className="text-gsv-gray">No records</li> : null}
      </ul>
    </div>
  );
}


