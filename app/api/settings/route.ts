import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { getUserRoleServer } from "@/lib/auth/guards";

export async function POST(req: Request) {
  const form = await req.formData();
  const type = String(form.get("type") ?? "");
  const supabase = createRouteHandlerClient({ cookies });

  // Authorization: founders only
  const {
    data: { session }
  } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const role = await getUserRoleServer(supabase as any);
  if (role !== "founder") {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  if (type === "automation_times") {
    const morning = String(form.get("time_morning") ?? "");
    const evening = String(form.get("time_evening") ?? "");
    await supabase
      .from("settings")
      .upsert({ key: "automation_times", value: { morning, evening } }, { onConflict: "key" });
    return NextResponse.redirect(new URL("/settings?saved=1", req.url));
  }

  if (type === "ai_provider") {
    const provider = String(form.get("provider") ?? "openrouter");
    await supabase
      .from("settings")
      .upsert({ key: "ai_provider", value: { provider } }, { onConflict: "key" });
    return NextResponse.redirect(new URL("/settings?saved=1", req.url));
  }

  if (type === "ai_selection") {
    const backend = String(form.get("backend") ?? "ollama");
    const model = String(form.get("model") ?? "llama3");
    await supabase
      .from("settings")
      .upsert({ key: "ai_provider", value: { provider: backend } }, { onConflict: "key" });
    await supabase
      .from("settings")
      .upsert({ key: "ai_model", value: { name: model } }, { onConflict: "key" });
    return NextResponse.redirect(new URL("/admin/settings/ai?saved=1", req.url));
  }

  return NextResponse.json({ ok: false, error: "Unknown settings type" }, { status: 400 });
}


