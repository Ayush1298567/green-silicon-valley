import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import type { SchoolRow } from "@/types/db";

export async function listSchools(limit = 200): Promise<SchoolRow[]> {
  const supabase = createRouteHandlerClient({ cookies });
  const { data } = await supabase.from("schools").select("*").order("name", { ascending: true }).limit(limit);
  return (data as any) ?? [];
}

export async function getSchool(id: number): Promise<SchoolRow | null> {
  const supabase = createRouteHandlerClient({ cookies });
  const { data } = await supabase.from("schools").select("*").eq("id", id).single();
  return (data as any) ?? null;
}

export async function createSchool(input: Partial<SchoolRow>) {
  const supabase = createRouteHandlerClient({ cookies });
  return supabase.from("schools").insert(input);
}

export async function updateSchool(id: number, input: Partial<SchoolRow>) {
  const supabase = createRouteHandlerClient({ cookies });
  return supabase.from("schools").update(input).eq("id", id);
}

export async function deleteSchool(id: number) {
  const supabase = createRouteHandlerClient({ cookies });
  return supabase.from("schools").delete().eq("id", id);
}


