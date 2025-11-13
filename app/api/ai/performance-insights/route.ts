import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { getUserRoleServer } from "@/lib/auth/guards";
import { aiService } from "@/lib/aiService";

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });
  const role = await getUserRoleServer(supabase as any);
  if (role !== "founder" && role !== "intern") {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  try {
    const insights = await aiService.analyzePerformance();

    // Store insights in database
    for (const insight of insights) {
      await supabase.from("ai_insights").upsert({
        insight_type: "performance",
        target_id: null, // Global insights
        insight_data: insight,
        confidence_score: insight.confidence,
        expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() // 2 hours
      });
    }

    return NextResponse.json({
      ok: true,
      insights,
      count: insights.length,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("Error analyzing performance:", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
