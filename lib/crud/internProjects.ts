import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import type { InternProjectRow } from "@/types/db";

export async function listInternProjects(limit = 200): Promise<InternProjectRow[]> {
  const supabase = createRouteHandlerClient({ cookies });
  const { data } = await supabase.from("intern_projects").select("*").order("due_date", { ascending: true }).limit(limit);
  return (data as any) ?? [];
}

export async function createInternProject(input: Partial<InternProjectRow>) {
  const supabase = createRouteHandlerClient({ cookies });
  return supabase.from("intern_projects").insert(input);
}

export async function updateInternProject(id: number, input: Partial<InternProjectRow>) {
  const supabase = createRouteHandlerClient({ cookies });
  return supabase.from("intern_projects").update(input).eq("id", id);
}

export async function deleteInternProject(id: number) {
  const supabase = createRouteHandlerClient({ cookies });
  return supabase.from("intern_projects").delete().eq("id", id);
}


