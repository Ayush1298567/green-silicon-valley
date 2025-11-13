import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import type { ChapterRow } from "@/types/db";

export async function listChapters(limit = 200): Promise<ChapterRow[]> {
  const supabase = createRouteHandlerClient({ cookies });
  const { data } = await supabase.from("chapters").select("*").order("name", { ascending: true }).limit(limit);
  return (data as any) ?? [];
}

export async function createChapter(input: Partial<ChapterRow>) {
  const supabase = createRouteHandlerClient({ cookies });
  return supabase.from("chapters").insert(input);
}

export async function updateChapter(id: number, input: Partial<ChapterRow>) {
  const supabase = createRouteHandlerClient({ cookies });
  return supabase.from("chapters").update(input).eq("id", id);
}

export async function deleteChapter(id: number) {
  const supabase = createRouteHandlerClient({ cookies });
  return supabase.from("chapters").delete().eq("id", id);
}


