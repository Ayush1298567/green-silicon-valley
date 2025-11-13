import { getServerComponentClient } from "@/lib/supabase/server";

export async function GET() {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const supabase = getServerComponentClient();
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("title,slug,content,updated_at,created_at")
    .eq("published", true)
    .order("updated_at", { ascending: false })
    .limit(50);

  const items = (posts ?? []).map((p) => {
    const link = `${base}/blog/${p.slug}`;
    const pub = new Date(p.updated_at ?? p.created_at ?? new Date()).toUTCString();
    const desc = (p.content ?? "").slice(0, 280);
    return `
      <item>
        <title><![CDATA[${p.title}]]></title>
        <link>${link}</link>
        <guid>${link}</guid>
        <pubDate>${pub}</pubDate>
        <description><![CDATA[${desc}]]></description>
      </item>`;
  }).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
  <rss version="2.0">
    <channel>
      <title>Green Silicon Valley Blog</title>
      <link>${base}/blog</link>
      <description>Updates from Green Silicon Valley</description>
      ${items}
    </channel>
  </rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}


