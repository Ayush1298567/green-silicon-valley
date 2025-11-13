import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import type { ResourceRow } from "@/types/db";

export async function listResources(limit = 200): Promise<ResourceRow[]> {
  const supabase = createRouteHandlerClient({ cookies });
  const { data } = await supabase.from("resources").select("*").order("upload_date", { ascending: false }).limit(limit);
  return (data as any) ?? [];
}

export async function createResource(input: Partial<ResourceRow>) {
  const supabase = createRouteHandlerClient({ cookies });
  return supabase.from("resources").insert(input);
}

export async function deleteResource(id: number) {
  const supabase = createRouteHandlerClient({ cookies });
  return supabase.from("resources").delete().eq("id", id);
}


