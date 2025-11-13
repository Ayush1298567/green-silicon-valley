import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { getUserRoleServer } from "@/lib/auth/guards";

// Internal API to index content for search
export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const role = await getUserRoleServer(supabase as any);
  
  // Allow internal indexing (could be called by cron or after content updates)
  // For now, allow founders to manually trigger indexing
  if (role && role !== "founder") {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const { content_type, content_id, title, content, tags, metadata } = body;

  if (!content_type || !content_id) {
    return NextResponse.json({ ok: false, error: "content_type and content_id required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("search_index")
    .upsert({
      content_type,
      content_id: String(content_id),
      title: title || "",
      content: content || "",
      tags: tags || [],
      metadata: metadata || {},
      updated_at: new Date().toISOString()
    }, {
      onConflict: "content_type,content_id"
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, indexed: data });
}

