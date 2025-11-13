import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { getUserRoleServer } from "@/lib/auth/guards";
import { aiService } from "@/lib/aiService";

export async function GET(req: Request, { params }: { params: { groupId: string } }) {
  const supabase = createRouteHandlerClient({ cookies });
  const role = await getUserRoleServer(supabase as any);
  if (role !== "founder" && role !== "intern") {
    // Allow volunteers to see predictions for their own group
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
    const prediction = await aiService.predictCompletion(params.groupId);

    // Store prediction in database
    await supabase.from("ai_insights").upsert({
      insight_type: "predictions",
      target_id: params.groupId,
      insight_data: prediction,
      confidence_score: prediction.confidence,
      expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour
    });

    return NextResponse.json({
      ok: true,
      prediction,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("Error generating prediction:", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
