import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { getUserRoleServer } from "@/lib/auth/guards";
import { aiAgentService } from "@/lib/aiAgentService";

export async function GET(req: Request) {
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

    // Get user's workflows
    let query = supabase
      .from("ai_workflows")
      .select("*")
      .eq("created_by", session.user.id)
      .order("created_at", { ascending: false });

    // Founders can see all workflows
    if (role === "founder") {
      query = supabase
        .from("ai_workflows")
        .select("*, users(name, email)")
        .order("created_at", { ascending: false });
    }

    const { data: workflows, error } = await query;

    if (error) throw error;

    // Get workflow templates
    const templates = await aiAgentService.getAvailableWorkflowTemplates();

    return NextResponse.json({
      ok: true,
      workflows: workflows || [],
      templates
    });

  } catch (error: any) {
    console.error("AI workflows fetch error:", error);
    return NextResponse.json({
      ok: false,
      error: "Failed to fetch AI workflows"
    }, { status: 500 });
  }
}

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
    const { templateId, customWorkflow } = body;

    let workflowData;

    if (templateId) {
      // Create from template
      const templates = await aiAgentService.getAvailableWorkflowTemplates();
      const template = templates.find(t => t.name === templateId);

      if (!template) {
        return NextResponse.json({ ok: false, error: "Template not found" }, { status: 404 });
      }

      workflowData = await aiAgentService.createWorkflowFromTemplate(template, session.user.id);

    } else if (customWorkflow) {
      // Create custom workflow
      const { name, description, triggers, actions, schedule } = customWorkflow;

      if (!name || !triggers || !actions) {
        return NextResponse.json({
          ok: false,
          error: "Name, triggers, and actions are required"
        }, { status: 400 });
      }

      workflowData = await aiAgentService.createWorkflow({
        name,
        description,
        triggers,
        actions,
        schedule
      }, session.user.id);

    } else {
      return NextResponse.json({
        ok: false,
        error: "Either templateId or customWorkflow required"
      }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      message: "Workflow created successfully",
      workflow: workflowData
    });

  } catch (error: any) {
    console.error("AI workflow creation error:", error);
    return NextResponse.json({
      ok: false,
      error: "Failed to create AI workflow"
    }, { status: 500 });
  }
}
