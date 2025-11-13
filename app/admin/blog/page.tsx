import { getServerComponentClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getDashboardPathForRole, type UserRole } from "@/lib/auth/roles";
import Link from "next/link";
import RichEditor from "@/components/editor/RichEditor";
import CoverPicker from "@/components/editor/CoverPicker";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  const supabase = getServerComponentClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");
  const { data: rows } = await supabase.from("users").select("role").eq("id", session.user.id).limit(1);
  const role = (rows?.[0]?.role as UserRole) ?? "volunteer";
  if (!["founder","intern"].includes(role)) redirect(getDashboardPathForRole(role));

  const { data: posts } = await supabase
    .from("blog_posts")
    .select("id,title,slug,published,updated_at,cover_image,content")
    .order("updated_at", { ascending: false })
    .limit(100);

  async function Create(formData: FormData) {
    "use server";
    const supa = getServerComponentClient();
    const { data: { session } } = await supa.auth.getSession();
    const title = String(formData.get("title") ?? "");
    const slug = String(formData.get("slug") ?? "").toLowerCase().replace(/[^a-z0-9-]+/g,"-").replace(/^-+|-+$/g,"");
    const content = String(formData.get("content") ?? "");
    const cover_image = String(formData.get("cover_image") ?? "");
    await supa.from("blog_posts").insert({
      title, slug, content, cover_image: cover_image || null, published: false, author_id: session?.user?.id ?? null
    });
  }

  async function TogglePublish(formData: FormData) {
    "use server";
    const supa = getServerComponentClient();
    const id = String(formData.get("id") ?? "");
    const published = formData.get("published") === "true";
    await supa.from("blog_posts").update({ published: !published, updated_at: new Date().toISOString() }).eq("id", id);
  }

  async function Update(formData: FormData) {
    "use server";
    const supa = getServerComponentClient();
    const id = String(formData.get("id") ?? "");
    const title = String(formData.get("title") ?? "");
    const content = String(formData.get("content") ?? "");
    const cover_image = String(formData.get("cover_image") ?? "");
    await supa.from("blog_posts").update({ title, content, cover_image: cover_image || null, updated_at: new Date().toISOString() }).eq("id", id);
  }

  return (
    <div className="container py-10">
      <h1 className="text-2xl font-semibold">Blog Manager</h1>
      <div className="card p-6 mt-4">
        <div className="font-semibold mb-2">Create Post</div>
        <form action={Create} className="grid gap-2">
          <input name="title" placeholder="Title" className="border rounded px-3 py-2" required />
          <input name="slug" placeholder="Slug (auto-normalized)" className="border rounded px-3 py-2" required />
          <div>
            <div className="text-sm text-gsv-gray mb-1">Cover image</div>
            <CoverPicker name="cover_image" />
          </div>
          <RichEditor name="content" />
          <button className="rounded bg-gsv-green text-white px-3 py-2 w-fit">Create</button>
        </form>
      </div>
      <div className="card p-6 mt-4">
        <div className="font-semibold mb-2">Posts</div>
        <ul className="space-y-4">
          {(posts ?? []).map((p:any) => (
            <li key={p.id} className="border rounded p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gsv-gray">{new Date(p.updated_at as any).toLocaleString()} • {p.published ? "Published" : "Draft"}</div>
                  <div className="font-semibold">{p.title}</div>
                  <div className="text-xs">{p.slug} • <Link className="underline" href={`/blog/${p.slug}`} target="_blank">View</Link></div>
                </div>
                <form action={TogglePublish}>
                  <input type="hidden" name="id" value={p.id} />
                  <input type="hidden" name="published" value={String(p.published)} />
                  <button className="rounded border px-3 py-1 text-xs">{p.published ? "Unpublish" : "Publish"}</button>
                </form>
              </div>
              <div className="mt-3">
                <form action={Update} className="grid gap-2">
                  <input type="hidden" name="id" value={p.id} />
                  <input name="title" defaultValue={p.title} className="border rounded px-3 py-2" />
                  <div>
                    <div className="text-sm text-gsv-gray mb-1">Cover image</div>
                    <CoverPicker name="cover_image" defaultUrl={p.cover_image ?? ""} />
                  </div>
                  <RichEditor name="content" defaultValue={p.content ?? ""} />
                  <button className="rounded border px-3 py-1 text-xs">Save</button>
                </form>
              </div>
            </li>
          ))}
          {(posts ?? []).length === 0 ? <li className="text-gsv-gray text-sm">No posts yet.</li> : null}
        </ul>
      </div>
    </div>
  );
}


