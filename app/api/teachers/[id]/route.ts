import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { getUserRoleServer } from "@/lib/auth/guards";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = await getUserRoleServer(supabase);
    if (!['founder', 'intern'].includes(role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    const teacherId = params.id;
    const body = await request.json();

    // Validate teacher exists
    const { data: existingTeacher, error: findError } = await supabase
      .from("schools")
      .select("*")
      .eq("id", teacherId)
      .single();

    if (findError || !existingTeacher) {
      return NextResponse.json({ error: "Teacher application not found" }, { status: 404 });
    }

    // Update teacher application
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    // Handle different update types
    if (body.application_status) {
      updateData.application_status = body.application_status;
      updateData.last_contacted = new Date().toISOString();
    }

    if (body.priority) {
      updateData.priority = body.priority;
    }

    if (body.internal_notes !== undefined) {
      updateData.internal_notes = body.internal_notes;
      updateData.last_contacted = new Date().toISOString();
    }

    if (body.teacher_notes !== undefined) {
      updateData.teacher_notes = body.teacher_notes;
    }

    if (body.relationship_score !== undefined) {
      updateData.relationship_score = body.relationship_score;
    }

    if (body.preferred_contact_method) {
      updateData.preferred_contact_method = body.preferred_contact_method;
    }

    if (body.follow_up_date) {
      updateData.follow_up_date = body.follow_up_date;
    }

    const { data: updatedTeacher, error: updateError } = await supabase
      .from("schools")
      .update(updateData)
      .eq("id", teacherId)
      .select()
      .single();

    if (updateError) throw updateError;

    // Log the update
    await supabase.from("system_logs").insert({
      actor_id: session.user.id,
      action_type: "teacher_application_updated",
      resource_type: "teacher_application",
      resource_id: teacherId,
      details: {
        changes: updateData,
        previous_status: existingTeacher.application_status,
        new_status: updatedTeacher.application_status
      },
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    });

    return NextResponse.json({
      success: true,
      data: updatedTeacher,
      message: "Teacher application updated successfully"
    });

  } catch (error: any) {
    console.error("Error updating teacher:", error);
    return NextResponse.json({
      error: "Failed to update teacher application",
      details: error.message
    }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = await getUserRoleServer(supabase);
    if (!['founder', 'intern'].includes(role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    const teacherId = params.id;

    const { data: teacher, error } = await supabase
      .from("schools")
      .select(`
        *,
        presentations(count)
      `)
      .eq("id", teacherId)
      .single();

    if (error || !teacher) {
      return NextResponse.json({ error: "Teacher application not found" }, { status: 404 });
    }

    // Process presentation count
    const processedTeacher = {
      ...teacher,
      total_presentations_hosted: Array.isArray(teacher.presentations)
        ? teacher.presentations.length
        : 0
    };

    return NextResponse.json({
      success: true,
      data: processedTeacher
    });

  } catch (error: any) {
    console.error("Error fetching teacher:", error);
    return NextResponse.json({
      error: "Failed to fetch teacher application",
      details: error.message
    }, { status: 500 });
  }
}
