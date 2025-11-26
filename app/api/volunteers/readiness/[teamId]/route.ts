import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { getUserFromRequest } from "@/lib/auth/guards";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const user = await getUserFromRequest();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate user is a volunteer
    if (user.role !== 'volunteer') {
      return NextResponse.json({ error: "Only volunteers can access readiness checklists" }, { status: 403 });
    }

    const { teamId } = await params;

    // Convert teamId: 'default' becomes null, otherwise use as-is (UUID string)
    const teamIdValue = teamId === 'default' ? null : teamId;

    // Get the readiness checklist for this user and team
    const { data: checklist, error } = await supabase
      .from("volunteer_readiness_checklist")
      .select("*")
      .eq("volunteer_id", user.id)
      .eq("team_id", teamIdValue)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error;
    }

    return NextResponse.json({
      checklist: checklist?.checklist_items || [],
      completedItems: checklist?.completed_items || [],
      isComplete: checklist?.is_complete || false,
    });
  } catch (error) {
    console.error("Error fetching readiness checklist:", error);
    return NextResponse.json(
      { error: "Failed to fetch readiness checklist" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const user = await getUserFromRequest();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate user is a volunteer
    if (user.role !== 'volunteer') {
      return NextResponse.json({ error: "Only volunteers can save readiness checklists" }, { status: 403 });
    }

    const { teamId } = await params;
    const body = await request.json();
    const { checklist } = body;

    // Validate checklist input
    if (!checklist || !Array.isArray(checklist)) {
      return NextResponse.json({ error: "Checklist must be an array" }, { status: 400 });
    }

    // Validate checklist items have required fields
    for (const item of checklist) {
      if (!item.id || typeof item.completed !== 'boolean') {
        return NextResponse.json({ 
          error: "Each checklist item must have an 'id' and 'completed' field" 
        }, { status: 400 });
      }
    }

    // Convert teamId: 'default' becomes null, otherwise use as-is (UUID string)
    const teamIdValue = teamId === 'default' ? null : teamId;

    // Calculate completion status
    const completedItems = checklist.filter((item: any) => item.completed).map((item: any) => item.id);
    const isComplete = checklist.every((item: any) => !item.required || item.completed);

    // Upsert the checklist
    const { data: savedChecklist, error } = await supabase
      .from("volunteer_readiness_checklist")
      .upsert({
        volunteer_id: user.id,
        team_id: teamIdValue,
        checklist_items: checklist,
        completed_items: completedItems,
        is_complete: isComplete,
        completed_at: isComplete ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'volunteer_id,team_id'
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      checklist: savedChecklist,
    });
  } catch (error) {
    console.error("Error saving readiness checklist:", error);
    return NextResponse.json(
      { error: "Failed to save readiness checklist" },
      { status: 500 }
    );
  }
}
