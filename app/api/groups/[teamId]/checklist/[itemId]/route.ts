import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { getUserRoleServer } from "@/lib/auth/guards";

export async function PUT(
  req: Request,
  { params }: { params: { teamId: string; itemId: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });
  const role = await getUserRoleServer(supabase as any);
  const teamId = parseInt(params.teamId);
  const itemId = params.itemId;

  if (!teamId || !itemId) {
    return NextResponse.json({ ok: false, error: "Invalid team ID or item ID" }, { status: 400 });
  }

  // Check if user has access to this team
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const isFounder = role === "founder" || role === "intern";
  const isTeamMember = await supabase
    .from("team_members")
    .select("user_id")
    .eq("user_id", session.user.id)
    .eq("volunteer_team_id", teamId)
    .single()
    .then(({ data }) => !!data);

  if (!isFounder && !isTeamMember) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { completed } = body;

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (completed !== undefined) {
      updateData.is_completed = completed;
      if (completed) {
        updateData.completed_at = new Date().toISOString();
        updateData.completed_by = session.user.id;
      } else {
        updateData.completed_at = null;
        updateData.completed_by = null;
      }
    }

    const { data: updatedItem, error } = await supabase
      .from("group_checklist_items")
      .update(updateData)
      .eq("id", itemId)
      .eq("volunteer_team_id", teamId)
      .select()
      .single();

    if (error) {
      console.error("Error updating checklist item:", error);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    // If item was completed, check if we should trigger any automated actions
    if (completed && updatedItem) {
      await triggerCompletionActions(supabase, updatedItem, session.user.id);
    }

    return NextResponse.json({ ok: true, item: updatedItem });

  } catch (error: any) {
    console.error("Checklist PUT error:", error);
    return NextResponse.json({ ok: false, error: error.message || "Failed to update checklist item" }, { status: 500 });
  }
}

async function triggerCompletionActions(supabase: any, item: any, userId: string) {
  try {
    // Create progress notification for founders
    if (item.is_required) {
      const { data: team } = await supabase
        .from("volunteers")
        .select("team_name")
        .eq("id", item.volunteer_team_id)
        .single();

      if (team) {
        await supabase
          .from("progress_notifications")
          .insert({
            volunteer_team_id: item.volunteer_team_id,
            notification_type: "milestone_completed",
            title: "Checklist Item Completed",
            message: `${team.team_name} completed: ${item.item_name}`,
            priority: item.priority === 'urgent' ? 'high' : 'medium'
          });
      }
    }

    // Check if all required items in category are completed
    const { data: categoryItems } = await supabase
      .from("group_checklist_items")
      .select("id, is_completed, is_required, item_category")
      .eq("volunteer_team_id", item.volunteer_team_id)
      .eq("item_category", item.item_category);

    const requiredItems = categoryItems?.filter(i => i.is_required) || [];
    const completedRequired = requiredItems.filter(i => i.is_completed);

    if (requiredItems.length > 0 && completedRequired.length === requiredItems.length) {
      // All required items in category completed - create milestone
      const milestoneType = getMilestoneTypeForCategory(item.item_category);

      if (milestoneType) {
        await supabase
          .from("group_milestones")
          .upsert({
            volunteer_team_id: item.volunteer_team_id,
            milestone_type: milestoneType,
            milestone_name: `${item.item_category.replace('_', ' ')} completed`,
            is_completed: true,
            completed_at: new Date().toISOString(),
            completed_by: userId
          }, {
            onConflict: 'volunteer_team_id,milestone_type'
          });
      }
    }

  } catch (error) {
    console.error("Error in completion actions:", error);
    // Don't fail the main request if automation fails
  }
}

function getMilestoneTypeForCategory(category: string): string | null {
  const milestoneMap: { [key: string]: string } = {
    'application': 'applied',
    'onboarding': 'group_chat_created', // This is a proxy - we might need better logic
    'preparation': 'presentation_draft_created',
    'presentation': 'presentation_submitted',
    'followup': 'presentation_completed'
  };

  return milestoneMap[category] || null;
}
