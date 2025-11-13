import { getPostBySlug } from "@/lib/crud/blog";
import { notFound } from "next/navigation";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post || (!post.published)) {
    // allow founders/interns to preview via direct slug would require auth; keeping simple
    notFound();
  }
  return (
    <div className="container py-14">
      <div className="text-xs text-gsv-gray">{post.category ?? "Article"} • {new Date(post.created_at).toLocaleDateString()}</div>
      <h1 className="text-3xl font-bold mt-1">{post.title}</h1>
      {post.cover_image ? (
        <div className="mt-6">
          <Image src={post.cover_image} alt={post.title} width={1280} height={720} className="w-full h-auto rounded" />
        </div>
      ) : null}
      <article className="prose max-w-none mt-6">
        <div className="whitespace-pre-wrap">{post.content}</div>
      </article>
    </div>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};
  const title = `${post.title} | Green Silicon Valley`;
  const description = (post.content ?? "").slice(0, 140);
  const url = `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/blog/${slug}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "article"
    },
    twitter: {
      card: "summary_large_image",
      title,
      description
    }
  };
}


