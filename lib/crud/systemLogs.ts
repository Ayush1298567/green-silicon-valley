import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import type { SystemLogRow } from "@/types/db";

export async function listSystemLogs(limit = 200): Promise<SystemLogRow[]> {
  const supabase = createRouteHandlerClient({ cookies });
  const { data } = await supabase
    .from("system_logs")
    .select("*")
    .order("timestamp", { ascending: false })
    .limit(limit);
  return (data as any) ?? [];
}

export async function createSystemLog(input: Partial<SystemLogRow>) {
  const supabase = createRouteHandlerClient({ cookies });
  return supabase.from("system_logs").insert(input);
}


