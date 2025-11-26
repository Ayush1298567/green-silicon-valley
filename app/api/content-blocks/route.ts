import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { getUserRoleServer } from "@/lib/auth/roles";

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const { data, error } = await supabase
      .from("content_blocks")
      .select("*")
      .order("category")
      .order("block_key");

    if (error) throw error;

    return NextResponse.json({
      ok: true,
      contentBlocks: data
    });
  } catch (error: any) {
    console.error("Error fetching content blocks:", error);
    return NextResponse.json({
      ok: false,
      error: "Failed to fetch content blocks"
    }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const role = await getUserRoleServer(supabase as any);

  if (role !== "founder" && role !== "intern") {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { block_key, title, content, rich_content, category } = body;

    if (!block_key || !title) {
      return NextResponse.json({
        ok: false,
        error: "Block key and title are required"
      }, { status: 400 });
    }

    // Check if block already exists
    const { data: existing } = await supabase
      .from("content_blocks")
      .select("id")
      .eq("block_key", block_key)
      .single();

    if (existing) {
      return NextResponse.json({
        ok: false,
        error: "Content block with this key already exists"
      }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("content_blocks")
      .insert({
        block_key,
        title,
        content: content || "",
        rich_content: rich_content || null,
        category: category || "homepage",
        edit_permissions: { roles: ["founder", "intern"] },
        version_history: [{
          version: 1,
          content: content || "",
          rich_content: rich_content || null,
          edited_by: session.user.id,
          edited_at: new Date().toISOString(),
          changes: "Initial creation"
        }],
        created_by: session.user.id
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      ok: true,
      contentBlock: data
    });
  } catch (error: any) {
    console.error("Error creating content block:", error);
    return NextResponse.json({
      ok: false,
      error: "Failed to create content block"
    }, { status: 500 });
  }
}
