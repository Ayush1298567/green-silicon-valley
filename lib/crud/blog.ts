import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function listPublishedPosts(limit = 20) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data } = await supabase
    .from("blog_posts")
    .select("id,title,slug,cover_image,category,created_at,updated_at")
    .eq("published", true)
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function getPostBySlug(slug: string) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .limit(1);
  return data?.[0] ?? null;
}


