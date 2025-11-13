import { NextResponse } from "next/server";
import { saveContactMessage } from "@/lib/db";

export async function POST(req: Request) {
  const form = await req.formData();
  const name = String(form.get("name") ?? "");
  const email = String(form.get("email") ?? "");
  const message = String(form.get("message") ?? "");
  const { error } = await saveContactMessage({ name, email, message });
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.redirect(new URL("/contact?sent=1", req.url));
}


