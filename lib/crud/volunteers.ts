import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import type { VolunteerRow } from "@/types/db";

export async function listVolunteers(limit = 200): Promise<VolunteerRow[]> {
  const supabase = createRouteHandlerClient({ cookies });
  const { data } = await supabase.from("volunteers").select("*").order("team_name", { ascending: true }).limit(limit);
  return (data as any) ?? [];
}

export async function getVolunteer(id: number): Promise<VolunteerRow | null> {
  const supabase = createRouteHandlerClient({ cookies });
  const { data } = await supabase.from("volunteers").select("*").eq("id", id).single();
  return (data as any) ?? null;
}

export async function createVolunteer(input: Partial<VolunteerRow>) {
  const supabase = createRouteHandlerClient({ cookies });
  return supabase.from("volunteers").insert(input);
}

export async function updateVolunteer(id: number, input: Partial<VolunteerRow>) {
  const supabase = createRouteHandlerClient({ cookies });
  return supabase.from("volunteers").update(input).eq("id", id);
}

export async function deleteVolunteer(id: number) {
  const supabase = createRouteHandlerClient({ cookies });
  return supabase.from("volunteers").delete().eq("id", id);
}


