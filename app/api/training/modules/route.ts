import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { getUserRoleServer } from "@/lib/auth/guards";

export async function GET(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const role = await getUserRoleServer(supabase as any);
  
  if (role !== "founder" && role !== "intern") {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("training_modules")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, modules: data || [] });
}

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const role = await getUserRoleServer(supabase as any);
  
  if (role !== "founder" && role !== "intern") {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const {
    title,
    description,
    content_html,
    video_url,
    documents,
    quiz_data,
    completion_criteria,
    prerequisites,
    estimated_duration,
    is_required
  } = body;

  if (!title) {
    return NextResponse.json({ ok: false, error: "Title required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("training_modules")
    .insert({
      title,
      description,
      content_html,
      video_url,
      documents: documents || [],
      quiz_data,
      completion_criteria: completion_criteria || "view",
      prerequisites: prerequisites || [],
      estimated_duration,
      is_required: is_required || false
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, module: data });
}

