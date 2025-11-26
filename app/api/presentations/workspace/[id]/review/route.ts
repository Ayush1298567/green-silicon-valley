import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { aiSlideReviewer } from "@/lib/ai/slideReviewer";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action } = body;

    if (action === "submit") {
      // Submit workspace for review
      const { data: workspace, error } = await supabase
        .from("presentation_workspaces")
        .update({
          status: "under_review",
          updated_at: new Date().toISOString()
        })
        .eq("id", params.id)
        .select(`
          *,
          presentations (
            topic,
            schools (
              name
            )
          ),
          workspace_slides (
            slide_content
          )
        `)
        .single();

      if (error) {
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
      }

      // Trigger AI review if slides are available
      if (workspace.workspace_slides && workspace.workspace_slides.length > 0) {
        try {
          const slideContent = workspace.workspace_slides
            .map(slide => slide.slide_content?.content || slide.slide_content?.title || "Untitled slide")
            .filter(content => content !== "Untitled slide");

          if (slideContent.length > 0) {
            const reviewInput = {
              slide_content: slideContent,
              presentation_topic: workspace.presentations?.topic || "General STEM Topic",
              target_grade_level: "6-8", // Default, could be made configurable
              presentation_duration: 45,
              activity_type: workspace.selected_activity_id ? "hands_on" : undefined
            };

            const review = await aiSlideReviewer.reviewSlides(reviewInput);

            // Store review results (could be stored in a separate table)
            console.log("AI Review completed:", review);
          }
        } catch (reviewError) {
          console.error("AI review failed:", reviewError);
          // Continue even if AI review fails
        }
      }

      return NextResponse.json({ ok: true, workspace });

    } else if (action === "approve" || action === "reject") {
      // Approve or reject workspace (founder/intern only)
      const { data: userRole } = await supabase
        .from("users")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (!["founder", "intern"].includes(userRole?.role)) {
        return NextResponse.json({ ok: false, error: "Insufficient permissions" }, { status: 403 });
      }

      const updateData: any = {
        status: action === "approve" ? "approved" : "needs_revision",
        updated_at: new Date().toISOString()
      };

      if (action === "approve") {
        updateData.approved_by = session.user.id;
        updateData.approved_at = new Date().toISOString();
      }

      const { data: workspace, error } = await supabase
        .from("presentation_workspaces")
        .update(updateData)
        .eq("id", params.id)
        .select(`
          *,
          presentations (
            topic,
            scheduled_date,
            schools (
              name
            )
          )
        `)
        .single();

      if (error) {
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
      }

      return NextResponse.json({ ok: true, workspace });

    } else {
      return NextResponse.json({ ok: false, error: "Invalid action" }, { status: 400 });
    }

  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get review status and any stored review data
    const { data: workspace, error } = await supabase
      .from("presentation_workspaces")
      .select(`
        id,
        status,
        review_notes,
        approved_by,
        approved_at,
        updated_at,
        presentations (
          topic,
          schools (
            name
          )
        )
      `)
      .eq("id", params.id)
      .single();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      review_status: workspace.status,
      review_notes: workspace.review_notes,
      approved_by: workspace.approved_by,
      approved_at: workspace.approved_at,
      can_review: ["founder", "intern"].includes(
        (await supabase.from("users").select("role").eq("id", session.user.id).single()).data?.role
      )
    });

  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
