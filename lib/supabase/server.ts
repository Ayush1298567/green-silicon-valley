import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";

export function getServerComponentClient() {
  return createServerComponentClient({ cookies });
}


