import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const form = await req.formData();
  const donor_name = String(form.get("donor_name") ?? "");
  const amount = Number(form.get("amount") ?? 0);
  const email = String(form.get("email") ?? "");
  if (!donor_name || amount <= 0) return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 });
  const { error } = await supabase.from("donations").insert({
    donor_name,
    amount,
    date: new Date().toISOString(),
    acknowledgment_sent: false,
    notes: email ? `email:${email}` : null
  } as any);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.redirect(new URL("/donate?thanks=1", req.url));
}


