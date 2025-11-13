import { getServerComponentClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getDashboardPathForRole, type UserRole } from "@/lib/auth/roles";

export const dynamic = "force-dynamic";

export default async function ApprovalsPage() {
  const supabase = getServerComponentClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");
  const { data: rows } = await supabase.from("users").select("role").eq("id", session.user.id).limit(1);
  const role = (rows?.[0]?.role as UserRole) ?? "volunteer";
  if (!["founder","intern"].includes(role)) redirect(getDashboardPathForRole(role));

  const { data: pending } = await supabase
    .from("volunteer_hours")
    .select("id, presentation_id, hours, feedback, submitted_by, created_at")
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="container py-14">
      <h1 className="text-3xl font-bold">Approve Volunteer Hours</h1>
      <div className="card p-6 mt-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gsv-gray">
              <th className="py-2">Presentation</th>
              <th className="py-2">Hours</th>
              <th className="py-2">Feedback</th>
              <th className="py-2">Submitted</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {(pending ?? []).map((h) => (
              <tr key={h.id} className="border-t">
                <td className="py-2">{h.presentation_id}</td>
                <td className="py-2">{h.hours}</td>
                <td className="py-2 max-w-sm truncate" title={h.feedback ?? ""}>{h.feedback ?? ""}</td>
                <td className="py-2">{h.created_at ? new Date(h.created_at as any).toLocaleString() : ""}</td>
                <td className="py-2">
                  <form action={`/api/volunteer-hours/approve`} method="post" className="inline">
                    <input type="text" name="comment" placeholder="Comment" className="border rounded px-2 py-1 text-xs mr-2" />
                    <input type="hidden" name="payload" value={JSON.stringify({ id: h.id, action: "approve" })} />
                    <button className="rounded bg-gsv-green text-white px-3 py-1 text-xs mr-2">Approve</button>
                  </form>
                  <form action={`/api/volunteer-hours/approve`} method="post" className="inline">
                    <input type="text" name="comment" placeholder="Comment" className="border rounded px-2 py-1 text-xs mr-2" />
                    <input type="hidden" name="payload" value={JSON.stringify({ id: h.id, action: "reject" })} />
                    <button className="rounded border px-3 py-1 text-xs">Reject</button>
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


