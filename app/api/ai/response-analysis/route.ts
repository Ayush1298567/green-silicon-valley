import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { getUserRoleServer } from "@/lib/auth/guards";
import { aiResponseAnalysis } from "@/lib/aiResponseAnalysis";

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const role = await getUserRoleServer(supabase as any);

  if (role !== "founder" && role !== "intern") {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { analysisType, formId, categories } = body;

    if (!analysisType) {
      return NextResponse.json({ ok: false, error: "Analysis type required" }, { status: 400 });
    }

    let result;

    switch (analysisType) {
      case 'form_responses':
        if (!formId) {
          return NextResponse.json({ ok: false, error: "Form ID required for form analysis" }, { status: 400 });
        }
        result = await aiResponseAnalysis.analyzeFormResponses(formId);
        break;

      case 'volunteer_performance':
        result = await aiResponseAnalysis.analyzeVolunteerPerformance();
        break;

      case 'categorize_responses':
        if (!formId || !categories) {
          return NextResponse.json({
            ok: false,
            error: "Form ID and categories required for categorization"
          }, { status: 400 });
        }

        // Get responses first
        const { data: responses } = await supabase
          .from('form_responses')
          .select('*')
          .eq('form_id', formId);

        if (!responses) {
          return NextResponse.json({ ok: false, error: "No responses found" }, { status: 404 });
        }

        result = await aiResponseAnalysis.categorizeResponses(responses, categories);
        break;

      case 'volunteer_predictions':
        // Get historical data and upcoming events
        const { data: volunteers } = await supabase
          .from('volunteers')
          .select('created_at, volunteer_hours(hours_logged)');

        const { data: presentations } = await supabase
          .from('presentations')
          .select('*')
          .gte('scheduled_date', new Date().toISOString())
          .eq('status', 'scheduled');

        result = await aiResponseAnalysis.predictVolunteerNeeds(
          volunteers || [],
          presentations || []
        );
        break;

      default:
        return NextResponse.json({ ok: false, error: "Unknown analysis type" }, { status: 400 });
    }

    // Log the analysis
    await supabase.from("ai_chat_history").insert({
      user_id: session.user.id,
      session_id: `analysis_${Date.now()}`,
      message_type: "analysis_request",
      message_content: `Analysis: ${analysisType}`,
      command_intent: "analyze",
      command_entity: analysisType,
      execution_status: "completed",
      execution_result: result,
      confidence_score: 0.9
    });

    return NextResponse.json({
      ok: true,
      analysisType,
      result,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error("AI response analysis error:", error);
    return NextResponse.json({
      ok: false,
      error: "Failed to perform analysis"
    }, { status: 500 });
  }
}
