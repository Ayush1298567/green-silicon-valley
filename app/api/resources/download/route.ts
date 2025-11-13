import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function GET(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const url = new URL(req.url);
  const id = Number(url.searchParams.get("id") ?? 0);
  if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });
  const { data: rows, error } = await supabase.from("resources").select("id,filename").eq("id", id).limit(1);
  if (error || !rows || rows.length === 0) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  const filename = rows[0].filename ?? "";
  const { data: signed, error: sErr } = await supabase.storage.from("resources").createSignedUrl(filename, 60);
  if (sErr || !signed?.signedUrl) {
    return NextResponse.json({ ok: false, error: sErr?.message ?? "Cannot sign" }, { status: 500 });
  }
  return NextResponse.redirect(signed.signedUrl);
}


