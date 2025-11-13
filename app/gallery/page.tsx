import { getServerComponentClient } from "@/lib/supabase/server";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const supabase = getServerComponentClient();
  const { data } = await supabase
    .from("resources")
    .select("id, filename, file_type, upload_date, archived, is_public")
    .eq("is_public", true)
    .eq("archived", false)
    .order("upload_date", { ascending: false })
    .limit(60);
  const items: Array<{ id: number; url: string; name: string; when: string | null }> = [];
  for (const r of data ?? []) {
    if (!r.file_type || !r.file_type.startsWith("image")) continue;
    items.push({
      id: r.id as any,
      url: `/api/resources/download?id=${r.id}`,
      name: r.filename?.split("/").pop() ?? "image",
      when: r.upload_date ? new Date(r.upload_date as any).toLocaleDateString() : null
    });
  }
  return (
    <div className="container py-14">
      <h1 className="text-3xl font-bold">Gallery</h1>
      <p className="mt-3 text-gsv-gray">Highlights from GSV presentations and chapters.</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {items.map((it) => (
          <div key={it.id} className="card p-3">
            <Image src={it.url} alt={it.name} width={800} height={480} className="w-full h-48 object-cover rounded-lg" />
            <div className="mt-2 text-sm text-gsv-gray">{it.when ?? ""}</div>
          </div>
        ))}
        {items.length === 0 ? <div className="text-gsv-gray">No images yet.</div> : null}
      </div>
    </div>
  );
}


