import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { topicId } = body;

    if (!topicId) {
      return NextResponse.json({ ok: false, error: "Topic ID required" }, { status: 400 });
    }

    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    // Verify topic exists
    const { data: topic } = await supabase
      .from("presentation_topics")
      .select("id, name")
      .eq("id", topicId)
      .eq("is_active", true)
      .single();

    if (!topic) {
      return NextResponse.json({ ok: false, error: "Topic not found" }, { status: 404 });
    }

    // Get volunteer record
    const { data: volunteer } = await supabase
      .from("volunteers")
      .select("id")
      .eq("user_id", session.user.id)
      .single();

    if (!volunteer) {
      return NextResponse.json({ ok: false, error: "Volunteer record not found" }, { status: 404 });
    }

    // Update volunteer with selected topic
    const { error: updateError } = await supabase
      .from("volunteers")
      .update({
        selected_topic_id: topicId,
        selected_topic_at: new Date().toISOString(),
        onboarding_step: "resources_viewed",
      })
      .eq("id", volunteer.id);

    if (updateError) {
      return NextResponse.json({ ok: false, error: updateError.message }, { status: 500 });
    }

    // Log activity
    await supabase.from("volunteer_activities").insert({
      volunteer_id: volunteer.id,
      activity_type: "activity_selected",
      activity_data: { topic_id: topicId, topic_name: topic.name },
    });

    return NextResponse.json({ ok: true, topic });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message || "Failed to select activity" }, { status: 500 });
  }
}

