import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import type { RuleBylawRow } from "@/types/db";

export async function listRules(limit = 200): Promise<RuleBylawRow[]> {
  const supabase = createRouteHandlerClient({ cookies });
  const { data } = await supabase.from("rules_bylaws").select("*").order("revision_date", { ascending: false }).limit(limit);
  return (data as any) ?? [];
}

export async function createRule(input: Partial<RuleBylawRow>) {
  const supabase = createRouteHandlerClient({ cookies });
  return supabase.from("rules_bylaws").insert(input);
}

export async function updateRule(id: number, input: Partial<RuleBylawRow>) {
  const supabase = createRouteHandlerClient({ cookies });
  return supabase.from("rules_bylaws").update(input).eq("id", id);
}

export async function deleteRule(id: number) {
  const supabase = createRouteHandlerClient({ cookies });
  return supabase.from("rules_bylaws").delete().eq("id", id);
}


