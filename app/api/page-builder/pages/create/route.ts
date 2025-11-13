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

  const { page_name, page_path, template_type = "static" } = await request.json();

  if (!page_name || !page_path) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("page_templates")
    .insert({
      page_name,
      page_path,
      template_type,
      layout_config: {},
      is_editable: true,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating page:", error);
    return NextResponse.json({ error: "Failed to create page" }, { status: 500 });
  }

  return NextResponse.json({ page: data });
}

