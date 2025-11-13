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
    const stuckGroups = await aiService.analyzeStuckGroups();

    // Store insights in database for caching and tracking
    for (const group of stuckGroups) {
      await supabase.from("ai_insights").upsert({
        insight_type: "stuck_groups",
        target_id: group.groupId,
        insight_data: group,
        confidence_score: group.priority / 10, // Normalize priority to 0-1
        expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutes
      });
    }

    return NextResponse.json({
      ok: true,
      stuckGroups,
      count: stuckGroups.length,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("Error in stuck groups analysis:", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
