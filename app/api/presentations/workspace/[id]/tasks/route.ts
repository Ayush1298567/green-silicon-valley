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
    const { data: tasks, error } = await supabase
      .from("workspace_tasks")
      .select("*")
      .eq("workspace_id", params.id)
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, tasks: tasks || [] });

  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

export async function POST(
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
    const { task_name, task_type, due_date } = body;

    if (!task_name) {
      return NextResponse.json({ ok: false, error: "Task name is required" }, { status: 400 });
    }

    const { data: task, error } = await supabase
      .from("workspace_tasks")
      .insert({
        workspace_id: params.id,
        task_name,
        task_type: task_type || "custom",
        due_date: due_date ? new Date(due_date).toISOString() : null
      })
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
