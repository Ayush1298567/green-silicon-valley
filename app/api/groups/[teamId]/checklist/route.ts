import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { getUserRoleServer } from "@/lib/auth/guards";

export async function GET(
  req: Request,
  { params }: { params: { teamId: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });
  const role = await getUserRoleServer(supabase as any);
  const teamId = parseInt(params.teamId);

  if (!teamId) {
    return NextResponse.json({ ok: false, error: "Invalid team ID" }, { status: 400 });
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
    // Get existing checklist items
    const { data: existingItems, error: fetchError } = await supabase
      .from("group_checklist_items")
      .select("*")
      .eq("volunteer_team_id", teamId)
      .order("order_index", { ascending: true });

    if (fetchError) {
      console.error("Error fetching checklist:", fetchError);
      return NextResponse.json({ ok: false, error: fetchError.message }, { status: 500 });
    }

    // If no items exist, create default checklist
    if (!existingItems || existingItems.length === 0) {
      const defaultItems = [
        {
          volunteer_team_id: teamId,
          item_name: "Submit Group Application",
          item_description: "Complete and submit the volunteer group application form",
          item_category: "application",
          is_required: true,
          order_index: 1
        },
        {
          volunteer_team_id: teamId,
          item_name: "Join Group Chat",
          item_description: "Join your team group chat for coordination",
          item_category: "onboarding",
          is_required: true,
          order_index: 2
        },
        {
          volunteer_team_id: teamId,
          item_name: "Choose Presentation Topic",
          item_description: "Select and confirm your environmental presentation topic",
          item_category: "onboarding",
          is_required: true,
          order_index: 3
        },
        {
          volunteer_team_id: teamId,
          item_name: "Review Resources",
          item_description: "Review presentation templates and guidelines",
          item_category: "onboarding",
          is_required: true,
          order_index: 4
        },
        {
          volunteer_team_id: teamId,
          item_name: "Create Presentation Draft",
          item_description: "Build your Google Slides presentation draft",
          item_category: "preparation",
          is_required: true,
          order_index: 5
        },
        {
          volunteer_team_id: teamId,
          item_name: "Share with GSV",
          item_description: "Share your presentation with greensiliconvalley27@gmail.com",
          item_category: "preparation",
          is_required: true,
          order_index: 6
        },
        {
          volunteer_team_id: teamId,
          item_name: "Submit for Review",
          item_description: "Submit your final presentation for founder review",
          item_category: "presentation",
          is_required: true,
          order_index: 7
        },
        {
          volunteer_team_id: teamId,
          item_name: "Complete Presentation",
          item_description: "Successfully deliver your environmental presentation",
          item_category: "followup",
          is_required: true,
          order_index: 8
        },
        {
          volunteer_team_id: teamId,
          item_name: "Log Volunteer Hours",
          item_description: "Record and submit your volunteer hours",
          item_category: "followup",
          is_required: true,
          order_index: 9
        },
        {
          volunteer_team_id: teamId,
          item_name: "Upload Documents",
          item_description: "Upload required forms signed by teachers and volunteers",
          item_category: "followup",
          is_required: true,
          order_index: 10
        }
      ];

      const { data: insertedItems, error: insertError } = await supabase
        .from("group_checklist_items")
        .insert(defaultItems)
        .select();

      if (insertError) {
        console.error("Error creating default checklist:", insertError);
        return NextResponse.json({ ok: false, error: insertError.message }, { status: 500 });
      }

      return NextResponse.json({ ok: true, items: insertedItems });
    }

    return NextResponse.json({ ok: true, items: existingItems });

  } catch (error: any) {
    console.error("Checklist GET error:", error);
    return NextResponse.json({ ok: false, error: error.message || "Failed to fetch checklist" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { teamId: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });
  const role = await getUserRoleServer(supabase as any);
  const teamId = parseInt(params.teamId);

  if (!teamId) {
    return NextResponse.json({ ok: false, error: "Invalid team ID" }, { status: 400 });
  }

  // Only founders can create checklist items
  if (role !== "founder" && role !== "intern") {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { item_name, item_description, item_category, is_required, due_date, priority } = body;

    const { data: newItem, error } = await supabase
      .from("group_checklist_items")
      .insert({
        volunteer_team_id: teamId,
        item_name,
        item_description,
        item_category: item_category || "general",
        is_required: is_required ?? true,
        priority: priority || "medium",
        due_date: due_date ? new Date(due_date).toISOString() : null
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating checklist item:", error);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, item: newItem });

  } catch (error: any) {
    console.error("Checklist POST error:", error);
    return NextResponse.json({ ok: false, error: error.message || "Failed to create checklist item" }, { status: 500 });
  }
}
