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

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "all";
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);

    let query = supabase
      .from("ai_actions")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (status !== "all") {
      query = query.eq("status", status);
    }

    // Founders can see all actions
    if (role === "founder") {
      query = supabase
        .from("ai_actions")
        .select("*, users(name, email)")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (status !== "all") {
        query = query.eq("status", status);
      }
    }

    const { data: actions, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      ok: true,
      actions: actions || []
    });

  } catch (error: any) {
    console.error("AI actions fetch error:", error);
    return NextResponse.json({
      ok: false,
      error: "Failed to fetch AI actions"
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
    const { actionId, approve = false } = body;

    if (!actionId) {
      return NextResponse.json({ ok: false, error: "Action ID required" }, { status: 400 });
    }

    // Get the action
    const { data: action, error: fetchError } = await supabase
      .from("ai_actions")
      .select("*")
      .eq("id", actionId)
      .single();

    if (fetchError || !action) {
      return NextResponse.json({ ok: false, error: "Action not found" }, { status: 404 });
    }

    if (approve) {
      // Execute the action
      const result = await aiAgentService.executeAction(action, session.user.id);

      // Update action status
      await supabase
        .from("ai_actions")
        .update({
          status: result.success ? "executed" : "rejected",
          approved_by: session.user.id,
          approved_at: new Date().toISOString(),
          executed_at: result.success ? new Date().toISOString() : null,
          results: result.result
        })
        .eq("id", actionId);

      return NextResponse.json({
        ok: true,
        message: result.message,
        result: result.result
      });

    } else {
      // Reject the action
      await supabase
        .from("ai_actions")
        .update({
          status: "rejected",
          approved_by: session.user.id,
          approved_at: new Date().toISOString()
        })
        .eq("id", actionId);

      return NextResponse.json({
        ok: true,
        message: "Action rejected"
      });
    }

  } catch (error: any) {
    console.error("AI action execution error:", error);
    return NextResponse.json({
      ok: false,
      error: "Failed to process AI action"
    }, { status: 500 });
  }
}
