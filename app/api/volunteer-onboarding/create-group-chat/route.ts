import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { volunteerId, groupMembers } = body;

    if (!volunteerId) {
      return NextResponse.json({ ok: false, error: "Volunteer ID required" }, { status: 400 });
    }

    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    // Get volunteer data
    const { data: volunteer } = await supabase
      .from("volunteers")
      .select("team_name, group_members, selected_topic_id")
      .eq("id", volunteerId)
      .single();

    if (!volunteer) {
      return NextResponse.json({ ok: false, error: "Volunteer not found" }, { status: 404 });
    }

    // Get topic name for channel description
    let topicName = "Presentation";
    if (volunteer.selected_topic_id) {
      const { data: topic } = await supabase
        .from("presentation_topics")
        .select("name")
        .eq("id", volunteer.selected_topic_id)
        .single();
      if (topic) topicName = topic.name;
    }

    // Create channel directly (volunteers can create team channels)
    const channelName = volunteer.team_name || `Team ${volunteerId}`;
    const { data: channel, error: channelError } = await supabase
      .from("channels")
      .insert({
        name: channelName,
        type: "team",
        description: `${topicName} presentation group - Please text your name and phone number`,
        created_by: session.user.id,
      })
      .select("id")
      .single();

    if (channelError) {
      return NextResponse.json({ ok: false, error: channelError.message }, { status: 500 });
    }

    // Add creator as member
    await supabase.from("channel_members").insert({
      channel_id: channel.id,
      user_id: session.user.id,
      role: "owner",
    });

    // Add group members to channel (if they have user accounts)
    if (groupMembers && Array.isArray(groupMembers)) {
      for (const member of groupMembers) {
        if (member.email) {
          // Try to find user by email
          const { data: user } = await supabase
            .from("users")
            .select("id")
            .eq("email", member.email)
            .single();

          if (user) {
            // Add to channel
            await supabase.from("channel_members").insert({
              channel_id: channel.id,
              user_id: user.id,
              role: "member",
            });
          }
        }
      }
    }

    // Update volunteer record with channel ID
    await supabase
      .from("volunteers")
      .update({ group_channel_id: channel.id })
      .eq("id", volunteerId);

    // Log activity
    await supabase.from("volunteer_activities").insert({
      volunteer_id: volunteerId,
      activity_type: "group_chat_created",
      activity_data: { channel_id: channel.id, channel_name: channelName },
    });

    return NextResponse.json({ ok: true, channelId: channel.id, channelName });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message || "Failed to create group chat" }, { status: 500 });
  }
}

