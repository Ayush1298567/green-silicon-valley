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
    const { data: responses, error: responsesError } = await supabase
      .from("form_responses")
      .select(`
        id,
        form_id,
        responses,
        submitted_at,
        submitted_by,
        users!form_responses_submitted_by_fkey(name, email)
      `)
      .eq("form_id", formId)
      .order("submitted_at", { ascending: false })
      .range(offset, offset + limit - 1);

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

    // Verify form exists and is active
    const { data: form, error: formError } = await supabase
      .from("forms")
      .select("schema, notification_settings, title")
      .eq("id", formId)
      .eq("is_active", true)
      .single();

    if (formError || !form) {
      return NextResponse.json({ ok: false, error: "Form not found or inactive" }, { status: 404 });
    }

    // Validate responses against schema
    const validationErrors: string[] = [];
    const schema = form.schema as { fields: any[] };

    if (schema?.fields) {
      for (const field of schema.fields) {
        const responseValue = responses[field.id];

        // Check required fields
        if (field.required && (!responseValue || responseValue.toString().trim() === '')) {
          validationErrors.push(`${field.label} is required`);
        }

        // Additional validation based on field type
        if (responseValue) {
          if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(responseValue)) {
            validationErrors.push(`${field.label} must be a valid email address`);
          }
        }
      }
    }

    if (validationErrors.length > 0) {
      return NextResponse.json({
        ok: false,
        error: "Validation failed",
        details: validationErrors
      }, { status: 400 });
    }

    // Get user info if authenticated
    let submittedByUser = submittedBy;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        submittedByUser = user.id;
      }
    } catch (error) {
      // User not authenticated, continue with submittedBy from request
    }

    // Create response record
    const { data: responseRecord, error: responseError } = await supabase
      .from("form_responses")
      .insert({
        form_id: formId,
        responses,
        submitted_by: submittedByUser
      })
      .select()
      .single();

    if (responseError) throw responseError;

    // Send notifications if configured
    if (form.notification_settings?.emailNotifications) {
      await sendFormNotification(supabase, formId, responseRecord.id, responses, form.title);
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

async function sendFormNotification(supabase: any, formId: string, responseId: string, responses: any, formTitle: string) {
  try {
    // Get form details and creator
    const { data: form } = await supabase
      .from("forms")
      .select("created_by")
      .eq("id", formId)
      .single();

    if (!form?.created_by) return;

    // Get response summary (first few fields)
    const responseSummary = Object.entries(responses)
      .slice(0, 3) // First 3 fields for brevity
      .map(([key, value]) => {
        const displayValue = Array.isArray(value) ? value.join(", ") : String(value);
        return `${key}: ${displayValue}`;
      })
      .join('\n');

    // Send notification to form creator
    await supabase.from("notifications").insert({
      user_id: form.created_by,
      notification_type: "form_response",
      title: `New response to "${formTitle}"`,
      message: `A new form response has been submitted.\n\n${responseSummary}${Object.keys(responses).length > 3 ? '\n\n...and more fields' : ''}`,
      action_url: `/admin/forms/${formId}/responses`,
      metadata: {
        form_id: formId,
        response_id: responseId,
        response_count: Object.keys(responses).length
      }
    });

    // Additional email notification could be added here
    console.log("Form response notification sent");

  } catch (error) {
    console.error("Failed to send form notification:", error);
  }
}
