import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import type { DonationRow } from "@/types/db";

export async function listDonations(limit = 200): Promise<DonationRow[]> {
  const supabase = createRouteHandlerClient({ cookies });
  const { data } = await supabase.from("donations").select("*").order("date", { ascending: false }).limit(limit);
  return (data as any) ?? [];
}

export async function createDonation(input: Partial<DonationRow>) {
  const supabase = createRouteHandlerClient({ cookies });
  return supabase.from("donations").insert(input);
}

export async function updateDonation(id: number, input: Partial<DonationRow>) {
  const supabase = createRouteHandlerClient({ cookies });
  return supabase.from("donations").update(input).eq("id", id);
}

export async function deleteDonation(id: number) {
  const supabase = createRouteHandlerClient({ cookies });
  return supabase.from("donations").delete().eq("id", id);
}


