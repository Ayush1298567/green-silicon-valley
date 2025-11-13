import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

// PUT - Update a comment
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { content } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ ok: false, error: "Content is required" }, { status: 400 });
    }

    // Get comment to check ownership
    const { data: comment } = await supabase
      .from("presentation_comments")
      .select("author_id")
      .eq("id", params.id)
      .single();

    if (!comment) {
      return NextResponse.json({ ok: false, error: "Comment not found" }, { status: 404 });
    }

    // Check if user is author or staff
    const { data: userRow } = await supabase.from("users").select("role").eq("id", session.user.id).single();
    const role = userRow?.role;

    if (comment.author_id !== session.user.id && role !== "founder" && role !== "intern") {
      return NextResponse.json({ ok: false, error: "Not authorized to update this comment" }, { status: 403 });
    }

    const { data: updatedComment, error } = await supabase
      .from("presentation_comments")
      .update({ content: content.trim() })
      .eq("id", params.id)
      .select(`
        *,
        author:users!presentation_comments_author_id_fkey(id, name, email, role)
      `)
      .single();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, comment: updatedComment });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

// DELETE - Delete a comment
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    // Get comment to check ownership
    const { data: comment } = await supabase
      .from("presentation_comments")
      .select("author_id")
      .eq("id", params.id)
      .single();

    if (!comment) {
      return NextResponse.json({ ok: false, error: "Comment not found" }, { status: 404 });
    }

    // Check if user is author or staff
    const { data: userRow } = await supabase.from("users").select("role").eq("id", session.user.id).single();
    const role = userRow?.role;

    if (comment.author_id !== session.user.id && role !== "founder" && role !== "intern") {
      return NextResponse.json({ ok: false, error: "Not authorized to delete this comment" }, { status: 403 });
    }

    const { error } = await supabase
      .from("presentation_comments")
      .delete()
      .eq("id", params.id);

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

