import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import type { PresentationRow } from "@/types/db";

export async function listPresentations(limit = 100): Promise<PresentationRow[]> {
  const supabase = createRouteHandlerClient({ cookies });
  const { data } = await supabase
    .from("presentations")
    .select("*")
    .order("date", { ascending: false })
    .limit(limit);
  return (data as any) ?? [];
}

export async function getPresentation(id: number): Promise<PresentationRow | null> {
  const supabase = createRouteHandlerClient({ cookies });
  const { data } = await supabase.from("presentations").select("*").eq("id", id).single();
  return (data as any) ?? null;
}

export async function createPresentation(input: Partial<PresentationRow>) {
  const supabase = createRouteHandlerClient({ cookies });
  return supabase.from("presentations").insert(input);
}

export async function updatePresentation(id: number, input: Partial<PresentationRow>) {
  const supabase = createRouteHandlerClient({ cookies });
  return supabase.from("presentations").update(input).eq("id", id);
}

export async function deletePresentation(id: number) {
  const supabase = createRouteHandlerClient({ cookies });
  return supabase.from("presentations").delete().eq("id", id);
}


