import { type SupabaseClient } from "@supabase/supabase-js";
import type { UserRole } from "./roles";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

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

/**
 * Get the authenticated user from a request (for API routes)
 * Returns the full user profile from the users table, or null if not authenticated
 */
export async function getUserFromRequest() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return null;
    }
    
    // Get full user profile from users table
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();
    
    if (profileError || !profile) {
      return null;
    }
    
    return profile;
  } catch (error) {
    console.error("Error getting user from request:", error);
    return null;
  }
}


