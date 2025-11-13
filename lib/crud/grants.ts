import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import type { GrantRow } from "@/types/db";

export async function listGrants(limit = 200): Promise<GrantRow[]> {
  const supabase = createRouteHandlerClient({ cookies });
  const { data } = await supabase.from("grants").select("*").order("deadline", { ascending: true }).limit(limit);
  return (data as any) ?? [];
}

export async function createGrant(input: Partial<GrantRow>) {
  const supabase = createRouteHandlerClient({ cookies });
  return supabase.from("grants").insert(input);
}

export async function updateGrant(id: number, input: Partial<GrantRow>) {
  const supabase = createRouteHandlerClient({ cookies });
  return supabase.from("grants").update(input).eq("id", id);
}

export async function deleteGrant(id: number) {
  const supabase = createRouteHandlerClient({ cookies });
  return supabase.from("grants").delete().eq("id", id);
}


