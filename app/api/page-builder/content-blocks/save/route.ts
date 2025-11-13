import { NextRequest, NextResponse } from "next/server";
import { getServerComponentClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const supabase = getServerComponentClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: user } = await supabase
    .from("users")
    .select("role")
    .eq("id", session.user.id)
    .single();

  if (!user || user.role !== "founder") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  
  const {
    id,
    key,
    title,
    content,
    html_content,
    page_section,
    display_order,
    is_published,
    css_classes,
  } = body;

  const blockData: any = {
    key,
    title,
    content,
    html_content,
    page_section,
    display_order: display_order || 0,
    is_published: is_published || false,
    css_classes,
    updated_by: session.user.id,
    updated_at: new Date().toISOString(),
  };

  let result;

  if (id) {
    // Update existing block
    const { data, error } = await supabase
      .from("content_blocks")
      .update(blockData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating content block:", error);
      return NextResponse.json({ error: "Failed to update content block" }, { status: 500 });
    }
    result = data;
  } else {
    // Create new block
    blockData.version = 1;
    
    const { data, error } = await supabase
      .from("content_blocks")
      .insert(blockData)
      .select()
      .single();

    if (error) {
      console.error("Error creating content block:", error);
      return NextResponse.json({ error: "Failed to create content block" }, { status: 500 });
    }
    result = data;
  }

  return NextResponse.json({ block: result });
}

