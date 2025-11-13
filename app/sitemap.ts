import { getServerComponentClient } from "@/lib/supabase/server";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const staticPaths = ["/", "/about", "/impact", "/get-involved", "/contact", "/blog", "/gallery", "/donate", "/privacy", "/terms"];
  const urls: MetadataRoute.Sitemap = staticPaths.map((p) => ({
    url: `${base}${p}`,
    changeFrequency: "weekly",
    priority: p === "/" ? 1 : 0.5
  }));
  try {
    const supabase = getServerComponentClient();
    const { data: posts } = await supabase.from("blog_posts").select("slug,updated_at").eq("published", true).limit(200);
    for (const p of posts ?? []) {
      urls.push({
        url: `${base}/blog/${p.slug}`,
        lastModified: p.updated_at ? new Date(p.updated_at) : undefined,
        changeFrequency: "monthly",
        priority: 0.6
      });
    }
  } catch {}
  return urls;
}


