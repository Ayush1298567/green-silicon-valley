import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { getUserRoleServer } from "@/lib/auth/guards";
import { aiService } from "@/lib/aiService";

export async function GET(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const role = await getUserRoleServer(supabase as any);
  if (role !== "founder" && role !== "intern") {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const groupId = searchParams.get("groupId");

  try {
    const recommendations = await aiService.generateSchedulingRecommendations(groupId || undefined);

    // Store insights in database
    if (recommendations.length > 0) {
      await supabase.from("ai_insights").upsert({
        insight_type: "scheduling",
        target_id: groupId || null,
        insight_data: { recommendations, groupId },
        confidence_score: Math.max(...recommendations.map(r => r.confidence)),
        expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour
      });
    }

    return NextResponse.json({
      ok: true,
      recommendations,
      count: recommendations.length,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("Error generating scheduling recommendations:", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
