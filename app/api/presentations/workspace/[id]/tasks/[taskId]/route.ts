import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function PUT(
  req: Request,
  { params }: { params: { id: string; taskId: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { is_completed } = body;

    const updateData: any = {
      is_completed,
      updated_at: new Date().toISOString()
    };

    if (is_completed) {
      updateData.completed_by = session.user.id;
      updateData.completed_at = new Date().toISOString();
    } else {
      updateData.completed_by = null;
      updateData.completed_at = null;
    }

    const { data: task, error } = await supabase
      .from("workspace_tasks")
      .update(updateData)
      .eq("id", params.taskId)
      .eq("workspace_id", params.id) // Ensure task belongs to workspace
      .select()
      .single();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, task });

  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string; taskId: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { error } = await supabase
      .from("workspace_tasks")
      .delete()
      .eq("id", params.taskId)
      .eq("workspace_id", params.id); // Ensure task belongs to workspace

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, message: "Task deleted successfully" });

  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
