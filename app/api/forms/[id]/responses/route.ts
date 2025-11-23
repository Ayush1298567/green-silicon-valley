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
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "100"), 1000);
    const offset = parseInt(searchParams.get("offset") || "0");
    const status = searchParams.get("status") || "all";

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

    // Get responses
    let query = supabase
      .from("form_responses")
      .select(`
        *,
        users!form_responses_submitted_by_fkey(name, email)
      `)
      .eq("form_id", formId)
      .order("submitted_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status !== "all") {
      query = query.eq("status", status);
    }

    const { data: responses, error: responsesError } = await query;

    if (responsesError) throw responsesError;

    // Get total count
    const { count } = await supabase
      .from("form_responses")
      .select("*", { count: "exact", head: true })
      .eq("form_id", formId);

    return NextResponse.json({
      ok: true,
      responses: responses || [],
      total: count || 0,
      offset,
      limit
    });

  } catch (error: any) {
    console.error("Form responses fetch error:", error);
    return NextResponse.json({
      ok: false,
      error: "Failed to fetch responses"
    }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  // This endpoint handles public form submissions (no auth required)
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const formId = params.id;
    const body = await req.json();
    const { responses, submittedBy } = body;

    if (!responses || typeof responses !== 'object') {
      return NextResponse.json({ ok: false, error: "Responses data required" }, { status: 400 });
    }

    // Verify form exists and is published
    const { data: form, error: formError } = await supabase
      .from("forms")
      .select("status, notification_settings")
      .eq("id", formId)
      .single();

    if (formError || !form) {
      return NextResponse.json({ ok: false, error: "Form not found" }, { status: 404 });
    }

    if (form.status !== "published") {
      return NextResponse.json({ ok: false, error: "Form is not currently accepting responses" }, { status: 400 });
    }

    // Get the highest row index for this form
    const { data: lastResponse } = await supabase
      .from("form_responses")
      .select("row_index")
      .eq("form_id", formId)
      .order("row_index", { ascending: false })
      .limit(1)
      .single();

    const nextRowIndex = (lastResponse?.row_index || 0) + 1;

    // Get form columns to validate responses
    const { data: columns } = await supabase
      .from("form_columns")
      .select("id, title, field_type, required, validation_rules")
      .eq("form_id", formId)
      .order("column_index");

    // Validate required fields
    const validationErrors = [];
    for (const column of columns || []) {
      const responseValue = responses[column.title];
      if (column.required && (!responseValue || responseValue.toString().trim() === '')) {
        validationErrors.push(`${column.title} is required`);
      }
    }

    if (validationErrors.length > 0) {
      return NextResponse.json({
        ok: false,
        error: "Validation failed",
        details: validationErrors
      }, { status: 400 });
    }

    // Create response record
    const { data: responseRecord, error: responseError } = await supabase
      .from("form_responses")
      .insert({
        form_id: formId,
        row_index: nextRowIndex,
        response_data: responses,
        submitted_by: submittedBy || null,
        status: "unread"
      })
      .select()
      .single();

    if (responseError) throw responseError;

    // Send notifications if configured
    if (form.notification_settings?.emailNotifications) {
      await sendFormNotification(supabase, formId, responseRecord.id, responses);
    }

    return NextResponse.json({
      ok: true,
      message: "Response submitted successfully",
      responseId: responseRecord.id
    });

  } catch (error: any) {
    console.error("Form submission error:", error);
    return NextResponse.json({
      ok: false,
      error: "Failed to submit response"
    }, { status: 500 });
  }
}

async function sendFormNotification(supabase: any, formId: string, responseId: string, responses: any) {
  try {
    // Get form details
    const { data: form } = await supabase
      .from("forms")
      .select("title, notification_settings")
      .eq("id", formId)
      .single();

    if (!form?.notification_settings?.notifyUsers?.length) return;

    // Get response summary
    const responseSummary = Object.entries(responses)
      .slice(0, 5) // First 5 fields
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');

    // Send notifications to configured users
    for (const userId of form.notification_settings.notifyUsers) {
      await supabase.from("notifications").insert({
        user_id: userId,
        notification_type: "form_response",
        title: `New response to "${form.title}"`,
        message: `A new form response has been submitted.\n\n${responseSummary}${Object.keys(responses).length > 5 ? '\n\n...and more fields' : ''}`,
        action_url: `/admin/forms/${formId}/responses`,
        metadata: {
          form_id: formId,
          response_id: responseId,
          response_count: Object.keys(responses).length
        }
      });
    }

    // Send email notifications if configured
    if (form.notification_settings.emailNotifications) {
      // Email sending logic would go here
      console.log("Email notification would be sent for form response");
    }

  } catch (error) {
    console.error("Failed to send form notification:", error);
  }
}
