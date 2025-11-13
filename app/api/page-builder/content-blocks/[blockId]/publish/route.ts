import { NextRequest, NextResponse } from "next/server";
import { getServerComponentClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { blockId: string } }
) {
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

  const { is_published } = await request.json();

  const { data, error } = await supabase
    .from("content_blocks")
    .update({ is_published, updated_at: new Date().toISOString() })
    .eq("id", parseInt(params.blockId))
    .select()
    .single();

  if (error) {
    console.error("Error updating block status:", error);
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }

  return NextResponse.json({ block: data });
}

