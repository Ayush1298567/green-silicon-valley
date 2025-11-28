import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function getUserFromRequest(req?: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
      return null;
    }

    return session.user;
  } catch (error) {
    console.error("Error getting user from request:", error);
    return null;
  }
}
