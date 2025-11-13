import { listPublishedPosts } from "@/lib/crud/blog";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function BlogIndexPage() {
  const posts = await listPublishedPosts(50);
  return (
    <div className="container py-14">
      <h1 className="text-3xl font-bold">Blog</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {posts.map((p: any) => (
          <Link key={p.id} href={`/blog/${p.slug}`} className="card p-5 block hover:border-gsv-green transition">
            <div className="text-xs text-gsv-gray">{p.category ?? "Article"} • {new Date(p.created_at).toLocaleDateString()}</div>
            <div className="font-semibold mt-1">{p.title}</div>
          </Link>
        ))}
        {posts.length === 0 ? <div className="text-gsv-gray">No published articles yet.</div> : null}
      </div>
    </div>
  );
}


