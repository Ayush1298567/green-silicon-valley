import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import type { UserRow } from "@/types/db";

export async function listUsers(limit = 200): Promise<UserRow[]> {
  const supabase = createRouteHandlerClient({ cookies });
  const { data } = await supabase.from("users").select("*").order("name", { ascending: true }).limit(limit);
  return (data as any) ?? [];
}

export async function getUser(id: string): Promise<UserRow | null> {
  const supabase = createRouteHandlerClient({ cookies });
  const { data } = await supabase.from("users").select("*").eq("id", id).single();
  return (data as any) ?? null;
}

export async function createUser(input: Partial<UserRow>) {
  const supabase = createRouteHandlerClient({ cookies });
  return supabase.from("users").insert(input);
}

export async function updateUser(id: string, input: Partial<UserRow>) {
  const supabase = createRouteHandlerClient({ cookies });
  return supabase.from("users").update(input).eq("id", id);
}

export async function deleteUser(id: string) {
  const supabase = createRouteHandlerClient({ cookies });
  return supabase.from("users").delete().eq("id", id);
}


