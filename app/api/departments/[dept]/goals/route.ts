import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function GET(
  req: Request,
  { params }: { params: { dept: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const { data: goals, error } = await supabase
      .from("department_goals")
      .select("*")
      .eq("department", params.dept)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, goals: goals || [] });

  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { dept: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { goal, target, deadline } = body;

    if (!goal || !target || !deadline) {
      return NextResponse.json({ ok: false, error: "Goal, target, and deadline are required" }, { status: 400 });
    }

    const { data: newGoal, error } = await supabase
      .from("department_goals")
      .insert({
        department: params.dept,
        goal,
        target,
        current: 0,
        deadline,
        status: "active",
        created_by: session.user.id
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, goal: newGoal });

  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
