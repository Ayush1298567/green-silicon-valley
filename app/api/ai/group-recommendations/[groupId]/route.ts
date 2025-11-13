import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { getUserRoleServer } from "@/lib/auth/guards";
import { aiService } from "@/lib/aiService";

export async function GET(req: Request, { params }: { params: { groupId: string } }) {
  const supabase = createRouteHandlerClient({ cookies });
  const role = await getUserRoleServer(supabase as any);
  if (role !== "founder" && role !== "intern") {
    // Allow volunteers to see recommendations for their own group
    const { data: teamMember } = await supabase
      .from("team_members")
      .select("volunteer_team_id")
      .eq("user_id", (await supabase.auth.getSession()).data.session?.user.id)
      .single();

    if (!teamMember || teamMember.volunteer_team_id !== params.groupId) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }
  }

  try {
    const recommendations = await aiService.createGroupRecommendations(params.groupId);

    // Store recommendations in database for tracking
    for (const rec of recommendations) {
      await supabase.from("ai_recommendations").upsert({
        group_id: params.groupId,
        recommendation_type: rec.type,
        title: rec.title,
        description: rec.description,
        action_url: rec.url,
        priority: rec.priority
      });
    }

    return NextResponse.json({
      ok: true,
      recommendations,
      count: recommendations.length,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("Error generating group recommendations:", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

// Mark recommendation as clicked/helpful
export async function POST(req: Request, { params }: { params: { groupId: string } }) {
  const supabase = createRouteHandlerClient({ cookies });
  const role = await getUserRoleServer(supabase as any);
  if (role !== "founder" && role !== "intern") {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { recommendationId, wasHelpful, clicked } = body;

    const updates: any = {};
    if (wasHelpful !== undefined) updates.was_helpful = wasHelpful;
    if (clicked) updates.clicked_at = new Date().toISOString();

    await supabase
      .from("ai_recommendations")
      .update(updates)
      .eq("id", recommendationId)
      .eq("group_id", params.groupId);

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Error updating recommendation:", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
