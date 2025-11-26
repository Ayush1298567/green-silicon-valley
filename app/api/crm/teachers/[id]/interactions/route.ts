import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

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
    const { data: interactions, error } = await supabase
      .from("teacher_interactions")
      .select(`
        *,
        users (
          name
        )
      `)
      .eq("relationship_id", params.id)
      .order("interaction_date", { ascending: false });

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    // Update last_interaction timestamp for the teacher relationship
    if (interactions && interactions.length > 0) {
      const latestInteraction = interactions[0];
      await supabase
        .from("teacher_relationships")
        .update({
          last_interaction: latestInteraction.interaction_date,
          updated_at: new Date().toISOString()
        })
        .eq("id", params.id);
    }

    return NextResponse.json({ ok: true, interactions: interactions || [] });

  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

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
    const {
      interaction_type,
      interaction_date,
      notes,
      outcome,
      next_followup
    } = body;

    if (!interaction_type || !notes) {
      return NextResponse.json({ ok: false, error: "Interaction type and notes are required" }, { status: 400 });
    }

    const { data: interaction, error } = await supabase
      .from("teacher_interactions")
      .insert({
        relationship_id: params.id,
        interaction_type,
        interaction_date: interaction_date ? new Date(interaction_date).toISOString() : new Date().toISOString(),
        notes,
        outcome,
        next_followup: next_followup ? new Date(next_followup).toISOString() : null,
        created_by: session.user.id
      })
      .select(`
        *,
        users (
          name
        )
      `)
      .single();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    // Update last_interaction timestamp
    await supabase
      .from("teacher_relationships")
      .update({
        last_interaction: interaction.interaction_date,
        updated_at: new Date().toISOString()
      })
      .eq("id", params.id);

    // Create follow-up action item if next_followup is set
    if (next_followup) {
      const { data: teacher } = await supabase
        .from("teacher_relationships")
        .select("teacher_name, schools(name)")
        .eq("id", params.id)
        .single();

      if (teacher) {
        await supabase.from("action_items").insert({
          title: `Follow up with ${teacher.teacher_name}`,
          description: `Scheduled follow-up from interaction: ${notes.substring(0, 100)}...`,
          type: "follow_up",
          priority: "medium",
          assigned_to: [session.user.id],
          due_date: new Date(next_followup).toISOString(),
          metadata: {
            teacher_relationship_id: params.id,
            interaction_id: interaction.id,
            teacher_name: teacher.teacher_name,
            school_name: teacher.schools?.name
          }
        });
      }
    }

    return NextResponse.json({ ok: true, interaction });

  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
