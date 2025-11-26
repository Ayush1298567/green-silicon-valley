import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get workspace with related data
    const { data: workspace, error } = await supabase
      .from("presentation_workspaces")
      .select(`
        *,
        presentations (
          topic,
          scheduled_date,
          schools (
            name
          )
        ),
        workspace_slides (
          id,
          slide_number,
          slide_url,
          slide_content,
          version,
          created_by,
          created_at,
          updated_at
        ),
        workspace_tasks (
          id,
          task_name,
          task_type,
          is_completed,
          completed_by,
          completed_at,
          due_date,
          created_at
        )
      `)
      .eq("id", params.id)
      .single();

    if (error || !workspace) {
      return NextResponse.json({ ok: false, error: "Workspace not found" }, { status: 404 });
    }

    // Check if user has access (team member or founder/intern)
    const isTeamMember = await supabase
      .from("team_members")
      .select("id")
      .eq("user_id", session.user.id)
      .eq("team_name", workspace.team_id)
      .single();

    const { data: userRole } = await supabase
      .from("users")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (!isTeamMember && !["founder", "intern"].includes(userRole?.role)) {
      return NextResponse.json({ ok: false, error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json({ ok: true, workspace });

  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { slides_url, selected_activity_id, status } = body;

    // Update workspace
    const { data: workspace, error } = await supabase
      .from("presentation_workspaces")
      .update({
        slides_url,
        selected_activity_id,
        status,
        updated_at: new Date().toISOString()
      })
      .eq("id", params.id)
      .select(`
        *,
        presentations (
          topic,
          scheduled_date,
          schools (
            name
          )
        ),
        workspace_slides (
          id,
          slide_number,
          slide_url,
          slide_content,
          version,
          created_by,
          created_at,
          updated_at
        ),
        workspace_tasks (
          id,
          task_name,
          task_type,
          is_completed,
          completed_by,
          completed_at,
          due_date,
          created_at
        )
      `)
      .single();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, workspace });

  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
