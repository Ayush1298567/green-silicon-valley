import { getServerComponentClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function TeacherHistoryPage() {
  const supabase = getServerComponentClient();
  const { data: recent } = await supabase
    .from("presentations")
    .select("id, topic, date, status, school_id, hours")
    .order("date", { ascending: false })
    .limit(20);
  const { data: schools } = await supabase.from("schools").select("id,name");
  const nameById = new Map((schools ?? []).map((s) => [s.id, s.name]));

  return (
    <div className="container py-14">
      <h1 className="text-3xl font-bold">Past Presentations</h1>
      <p className="mt-3 text-gsv-gray max-w-2xl">
        Browse recent GSV visits. To request a repeat session, use the button below.
      </p>
      <div className="card p-6 mt-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gsv-gray">
              <th className="py-2">School</th>
              <th className="py-2">Topic</th>
              <th className="py-2">Date</th>
              <th className="py-2">Status</th>
              <th className="py-2">Hours</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {(recent ?? []).map((p) => (
              <tr key={p.id} className="border-t">
                <td className="py-2">{nameById.get(p.school_id as any) ?? "—"}</td>
                <td className="py-2">{p.topic ?? "—"}</td>
                <td className="py-2">{p.date ? new Date(p.date as any).toLocaleDateString() : "—"}</td>
                <td className="py-2">{p.status ?? "—"}</td>
                <td className="py-2">{p.hours ?? 0}</td>
                <td className="py-2">
                  <a className="text-gsv-green underline" href="/teachers/request">
                    Request Again
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


