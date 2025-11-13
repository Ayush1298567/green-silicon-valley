import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { getUserRoleServer } from "@/lib/auth/guards";

export async function POST(req: Request) {
  const form = await req.formData();
  const title = String(form.get("title") ?? "");
  const body = String(form.get("body") ?? "");
  const scope = String(form.get("scope") ?? "global");
  const pinned = form.get("pinned") ? true : false;
  const supabase = createRouteHandlerClient({ cookies });
  const role = await getUserRoleServer(supabase as any);
  if (role !== "founder" && role !== "intern") {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  const {
    data: { session }
  } = await supabase.auth.getSession();
  await supabase.from("announcements").insert({
    title,
    body,
    scope,
    pinned,
    posted_by: session?.user?.id ?? null
  });
  return NextResponse.redirect(new URL("/admin/announcements", req.url));
}


