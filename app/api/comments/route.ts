import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

// GET - Fetch comments for a volunteer or presentation
export async function GET(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const volunteerId = searchParams.get("volunteer_id");
    const presentationId = searchParams.get("presentation_id");
    const includeInternal = searchParams.get("include_internal") === "true";

    if (!volunteerId && !presentationId) {
      return NextResponse.json({ ok: false, error: "volunteer_id or presentation_id required" }, { status: 400 });
    }

    // Check user role
    const { data: userRow } = await supabase.from("users").select("role").eq("id", session.user.id).single();
    const role = userRow?.role;
    const isStaff = role === "founder" || role === "intern";

    let query = supabase
      .from("presentation_comments")
      .select(`
        *,
        author:users!presentation_comments_author_id_fkey(id, name, email, role)
      `)
      .order("created_at", { ascending: true });

    if (volunteerId) {
      query = query.eq("volunteer_id", volunteerId);
    }
    if (presentationId) {
      query = query.eq("presentation_id", presentationId);
    }

    // Filter internal comments based on role
    if (!isStaff) {
      query = query.eq("is_internal", false);
    } else if (!includeInternal) {
      // Staff can choose to exclude internal
      query = query.eq("is_internal", false);
    }

    const { data: comments, error } = await query;

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    // Mark comments as read for current user
    if (comments && comments.length > 0) {
      const commentIds = comments.map(c => c.id);
      // Update read_by array for each comment
      for (const comment of comments) {
        const readBy = comment.read_by || [];
        if (!readBy.includes(session.user.id)) {
          await supabase
            .from("presentation_comments")
            .update({ read_by: [...readBy, session.user.id] })
            .eq("id", comment.id);
        }
      }
    }

    return NextResponse.json({ ok: true, comments: comments || [] });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

// POST - Create a new comment
export async function POST(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      volunteer_id,
      presentation_id,
      content,
      comment_type = "update",
      is_internal = false,
      parent_comment_id,
      attachments = []
    } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ ok: false, error: "Content is required" }, { status: 400 });
    }

    if (!volunteer_id && !presentation_id) {
      return NextResponse.json({ ok: false, error: "volunteer_id or presentation_id required" }, { status: 400 });
    }

    // Check permissions
    const { data: userRow } = await supabase.from("users").select("role").eq("id", session.user.id).single();
    const role = userRow?.role;

    // Only staff can create internal comments
    if (is_internal && role !== "founder" && role !== "intern") {
      return NextResponse.json({ ok: false, error: "Only staff can create internal comments" }, { status: 403 });
    }

    // If volunteer_id provided, verify user is part of that team (unless staff)
    if (volunteer_id && role !== "founder" && role !== "intern") {
      const { data: teamMember } = await supabase
        .from("team_members")
        .select("volunteer_team_id")
        .eq("user_id", session.user.id)
        .eq("volunteer_team_id", volunteer_id)
        .single();

      if (!teamMember) {
        return NextResponse.json({ ok: false, error: "Not authorized to comment on this volunteer" }, { status: 403 });
      }
    }

    const { data: comment, error } = await supabase
      .from("presentation_comments")
      .insert({
        volunteer_id: volunteer_id || null,
        presentation_id: presentation_id || null,
        author_id: session.user.id,
        content: content.trim(),
        comment_type,
        is_internal,
        parent_comment_id: parent_comment_id || null,
        attachments
      })
      .select(`
        *,
        author:users!presentation_comments_author_id_fkey(id, name, email, role)
      `)
      .single();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    // Create notifications (handled by trigger, but we can also do it here for more control)
    if (!is_internal) {
      // Notifications are created by database trigger
    }

    return NextResponse.json({ ok: true, comment });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

