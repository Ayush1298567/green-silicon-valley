import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { getUserRoleServer } from "@/lib/auth/guards";
import { generateChatCompletion } from "@/lib/ai/clients";

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
    const { query, context = "general" } = body;

    if (!query) {
      return NextResponse.json({ ok: false, error: "Query required" }, { status: 400 });
    }

    // Get relevant data based on context
    let dataContext = {};

    switch (context) {
      case "volunteers":
        dataContext = await getVolunteerAnalytics(supabase);
        break;
      case "forms":
        dataContext = await getFormAnalytics(supabase, session.user.id, role);
        break;
      case "presentations":
        dataContext = await getPresentationAnalytics(supabase);
        break;
      case "general":
      default:
        dataContext = await getGeneralAnalytics(supabase);
        break;
    }

    // Generate AI-powered analysis
    const analysisPrompt = `
You are a data analyst for Green Silicon Valley, a nonprofit focused on environmental STEM education.

User Query: "${query}"

Available Data Context:
${JSON.stringify(dataContext, null, 2)}

Please provide a clear, actionable analysis answering the user's query. Include:
- Key insights and trends
- Specific numbers and percentages where relevant
- Recommendations or next steps
- Visual or tabular representations where helpful

Format your response in a natural, conversational way that would be helpful for nonprofit administrators.
`;

    const analysis = await generateChatCompletion([
      { role: "system", content: "You are an expert data analyst specializing in nonprofit organizations, particularly environmental education and volunteer management." },
      { role: "user", content: analysisPrompt }
    ]);

    // Log the analytics query
    await supabase.from("ai_chat_history").insert({
      user_id: session.user.id,
      session_id: `analytics_${Date.now()}`,
      message_type: "analytics_query",
      message_content: query,
      command_intent: "analyze",
      command_entity: context,
      execution_status: "completed",
      execution_result: { analysis, dataContext },
      confidence_score: 0.9
    });

    return NextResponse.json({
      ok: true,
      analysis,
      dataContext,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error("AI analytics error:", error);
    return NextResponse.json({
      ok: false,
      error: "Failed to generate analytics"
    }, { status: 500 });
  }
}

async function getGeneralAnalytics(supabase: any) {
  const [
    { count: volunteerCount },
    { count: schoolCount },
    { count: presentationCount },
    { count: formCount }
  ] = await Promise.all([
    supabase.from("volunteers").select("*", { count: "exact", head: true }),
    supabase.from("schools").select("*", { count: "exact", head: true }),
    supabase.from("presentations").select("*", { count: "exact", head: true }),
    supabase.from("forms").select("*", { count: "exact", head: true })
  ]);

  // Get recent activity
  const { data: recentPresentations } = await supabase
    .from("presentations")
    .select("topic, scheduled_date, status")
    .gte("scheduled_date", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    .order("scheduled_date", { ascending: false })
    .limit(5);

  const { data: recentVolunteers } = await supabase
    .from("volunteers")
    .select("team_name, application_status, created_at")
    .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .order("created_at", { ascending: false })
    .limit(10);

  return {
    overview: {
      totalVolunteers: volunteerCount || 0,
      totalSchools: schoolCount || 0,
      totalPresentations: presentationCount || 0,
      totalForms: formCount || 0
    },
    recentActivity: {
      presentations: recentPresentations || [],
      newVolunteers: recentVolunteers || []
    },
    timeRange: "Last 30 days"
  };
}

async function getVolunteerAnalytics(supabase: any) {
  // Volunteer status breakdown
  const { data: statusBreakdown } = await supabase
    .from("volunteers")
    .select("application_status");

  const statusCounts = statusBreakdown?.reduce((acc: any, vol: any) => {
    acc[vol.application_status] = (acc[vol.application_status] || 0) + 1;
    return acc;
  }, {}) || {};

  // Monthly volunteer growth
  const { data: monthlyGrowth } = await supabase
    .rpc("get_volunteer_growth_last_12_months");

  // Top volunteer activities
  const { data: topActivities } = await supabase
    .from("volunteer_hours")
    .select("presentation_id, hours_logged");

  return {
    statusBreakdown: statusCounts,
    monthlyGrowth: monthlyGrowth || [],
    totalHours: topActivities?.reduce((sum, activity) => sum + (activity.hours_logged || 0), 0) || 0,
    averageHoursPerVolunteer: 0 // Would need additional calculation
  };
}

async function getFormAnalytics(supabase: any, userId: string, role: string) {
  let formQuery = supabase.from("forms").select("*");

  if (role !== "founder") {
    formQuery = formQuery.eq("created_by", userId);
  }

  const { data: forms } = await formQuery;

  if (!forms || forms.length === 0) {
    return { forms: [], totalResponses: 0, responseRate: 0 };
  }

  // Get response counts for each form
  const formIds = forms.map(f => f.id);
  const { data: responses } = await supabase
    .from("form_responses")
    .select("form_id, status")
    .in("form_id", formIds);

  const responseCounts = responses?.reduce((acc: any, resp: any) => {
    if (!acc[resp.form_id]) acc[resp.form_id] = { total: 0, read: 0 };
    acc[resp.form_id].total++;
    if (resp.status === "read") acc[resp.form_id].read++;
    return acc;
  }, {}) || {};

  // Calculate analytics
  const totalResponses = Object.values(responseCounts).reduce((sum: number, counts: any) => sum + counts.total, 0) as number;
  const averageResponseRate = forms.length > 0 ? totalResponses / forms.length : 0;

  return {
    forms: forms.map(form => ({
      ...form,
      responses: responseCounts[form.id] || { total: 0, read: 0 }
    })),
    totalResponses,
    averageResponseRate: Math.round(averageResponseRate * 100) / 100,
    mostPopularForm: forms.reduce((prev, current) =>
      (responseCounts[current.id]?.total || 0) > (responseCounts[prev.id]?.total || 0) ? current : prev
    )
  };
}

async function getPresentationAnalytics(supabase: any) {
  // Presentation status breakdown
  const { data: presentations } = await supabase
    .from("presentations")
    .select("status, scheduled_date, topic");

  const statusCounts = presentations?.reduce((acc: any, pres: any) => {
    acc[pres.status] = (acc[pres.status] || 0) + 1;
    return acc;
  }, {}) || {};

  // Monthly presentation count
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyCount = presentations?.filter(p =>
    new Date(p.scheduled_date).getMonth() === currentMonth &&
    new Date(p.scheduled_date).getFullYear() === currentYear
  ).length || 0;

  // Top presentation topics
  const topicCounts = presentations?.reduce((acc: any, pres: any) => {
    acc[pres.topic] = (acc[pres.topic] || 0) + 1;
    return acc;
  }, {}) || {};

  const topTopics = Object.entries(topicCounts)
    .sort(([,a]: any, [,b]: any) => b - a)
    .slice(0, 5);

  return {
    statusBreakdown: statusCounts,
    monthlyPresentations: monthlyCount,
    totalPresentations: presentations?.length || 0,
    topTopics,
    upcomingPresentations: presentations?.filter(p =>
      new Date(p.scheduled_date) > new Date() &&
      p.status !== "cancelled"
    ).length || 0
  };
}
