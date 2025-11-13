import { type SupabaseClient } from "@supabase/supabase-js";
import type { UserRole } from "./roles";

export async function getUserRoleServer(
  supabase: SupabaseClient
): Promise<UserRole | null> {
  const {
    data: { session }
  } = await supabase.auth.getSession();
  if (!session) return null;
  const { data } = await supabase
    .from("users")
    .select("role")
    .eq("id", session.user.id)
    .limit(1);
  const role = (data?.[0]?.role as UserRole | undefined) ?? null;
  return role;
}

export async function isFounderServer(
  supabase: SupabaseClient
): Promise<boolean> {
  const role = await getUserRoleServer(supabase);
  return role === "founder";
}


