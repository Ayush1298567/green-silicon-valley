import { getServerComponentClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ResourcesPage() {
  const supabase = getServerComponentClient();
  const { data } = await supabase
    .from("resources")
    .select("id, filename, file_type, upload_date, archived")
    .eq("archived", false)
    .order("upload_date", { ascending: false })
    .limit(100);

  const urls: Array<{ id: number; name: string; url: string; type: string | null; when: string | null }> = [];
  for (const r of data ?? []) {
    urls.push({
      id: r.id as any,
      name: r.filename?.split("/").pop() ?? r.filename ?? "file",
      url: `/api/resources/download?id=${r.id}`,
      type: r.file_type ?? null,
      when: r.upload_date ? new Date(r.upload_date as any).toLocaleDateString() : null
    });
  }

  return (
    <div className="container py-14">
      <h1 className="text-3xl font-bold">Resource Library</h1>
      <p className="mt-3 text-gsv-gray max-w-2xl">
        Presentation templates, activity guides, and branding assets.
      </p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {urls.map((f) => (
          <div key={f.id} className="card p-5">
            <div className="font-semibold text-gsv-charcoal line-clamp-2">{f.name}</div>
            <div className="text-xs text-gsv-gray mt-1">{f.type ?? "file"} • {f.when ?? ""}</div>
            <a className="mt-3 inline-flex text-sm text-white bg-gsv-green px-3 py-1.5 rounded-lg" href={f.url}>
              Download
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}


