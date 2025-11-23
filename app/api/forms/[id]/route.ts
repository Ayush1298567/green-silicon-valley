import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { getUserRoleServer } from "@/lib/auth/guards";

export async function GET(req: Request, { params }: { params: { id: string } }) {
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

    const formId = params.id;

    // Check if user has access to this form
    const { data: form, error: formError } = await supabase
      .from("forms")
      .select("*")
      .eq("id", formId)
      .single();

    if (formError || !form) {
      return NextResponse.json({ ok: false, error: "Form not found" }, { status: 404 });
    }

    if (form.created_by !== session.user.id && role !== "founder") {
      return NextResponse.json({ ok: false, error: "Access denied" }, { status: 403 });
    }

    // Get form with columns
    const { data: columns, error: columnsError } = await supabase
      .from("form_columns")
      .select("*")
      .eq("form_id", formId)
      .order("column_index");

    if (columnsError) throw columnsError;

    // Get response count
    const { count: responseCount } = await supabase
      .from("form_responses")
      .select("*", { count: "exact", head: true })
      .eq("form_id", formId);

    return NextResponse.json({
      ok: true,
      form: {
        ...form,
        columns: columns || [],
        responseCount: responseCount || 0
      }
    });

  } catch (error: any) {
    console.error("Form fetch error:", error);
    return NextResponse.json({
      ok: false,
      error: "Failed to fetch form"
    }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
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

    const formId = params.id;
    const body = await req.json();
    const { title, description, status, settings, notification_settings } = body;

    // Check if user has access to this form
    const { data: form, error: formError } = await supabase
      .from("forms")
      .select("*")
      .eq("id", formId)
      .single();

    if (formError || !form) {
      return NextResponse.json({ ok: false, error: "Form not found" }, { status: 404 });
    }

    if (form.created_by !== session.user.id && role !== "founder") {
      return NextResponse.json({ ok: false, error: "Access denied" }, { status: 403 });
    }

    // Update form
    const { data: updatedForm, error: updateError } = await supabase
      .from("forms")
      .update({
        title: title || form.title,
        description: description !== undefined ? description : form.description,
        status: status || form.status,
        settings: settings || form.settings,
        notification_settings: notification_settings || form.notification_settings,
        updated_at: new Date().toISOString()
      })
      .eq("id", formId)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({
      ok: true,
      form: updatedForm,
      message: "Form updated successfully"
    });

  } catch (error: any) {
    console.error("Form update error:", error);
    return NextResponse.json({
      ok: false,
      error: "Failed to update form"
    }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const supabase = createRouteHandlerClient({ cookies });
  const role = await getUserRoleServer(supabase as any);

  if (role !== "founder") {
    return NextResponse.json({ ok: false, error: "Only founders can delete forms" }, { status: 403 });
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const formId = params.id;

    // Archive the form instead of deleting
    const { data: updatedForm, error: updateError } = await supabase
      .from("forms")
      .update({
        status: "archived",
        updated_at: new Date().toISOString()
      })
      .eq("id", formId)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({
      ok: true,
      message: "Form archived successfully"
    });

  } catch (error: any) {
    console.error("Form deletion error:", error);
    return NextResponse.json({
      ok: false,
      error: "Failed to archive form"
    }, { status: 500 });
  }
}
