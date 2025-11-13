import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { getDashboardPathForRole, type UserRole } from "@/lib/auth/roles";

// GET - Fetch volunteers with presentations for review
export async function GET(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is founder or intern
    const { data: userRow } = await supabase.from("users").select("role").eq("id", session.user.id).single();
    const role = (userRow?.role as UserRole) ?? "volunteer";
    
    if (role !== "founder" && role !== "intern") {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    // Get volunteers with presentations (those in onboarding or with presentation_draft_url)
    const { data: volunteers, error } = await supabase
      .from("volunteers")
      .select(`
        id,
        team_name,
        presentation_draft_url,
        slides_shared,
        presentation_status,
        last_comment_at,
        created_at,
        topic:presentation_topics!volunteers_selected_topic_id_fkey(id, name)
      `)
      .or("presentation_draft_url.not.is.null,onboarding_step.eq.submitted_for_review")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    // Get comment counts for each volunteer
    const volunteerIds = (volunteers || []).map(v => v.id);
    let commentCounts: Record<number, number> = {};
    
    if (volunteerIds.length > 0) {
      const { data: comments } = await supabase
        .from("presentation_comments")
        .select("volunteer_id")
        .in("volunteer_id", volunteerIds);
      
      if (comments) {
        commentCounts = comments.reduce((acc: Record<number, number>, comment: any) => {
          if (comment.volunteer_id) {
            acc[comment.volunteer_id] = (acc[comment.volunteer_id] || 0) + 1;
          }
          return acc;
        }, {});
      }
    }

    // Add comment counts to volunteers
    const reviews = (volunteers || []).map(volunteer => ({
      ...volunteer,
      comment_count: commentCounts[volunteer.id] || 0
    }));

    return NextResponse.json({ ok: true, reviews });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

