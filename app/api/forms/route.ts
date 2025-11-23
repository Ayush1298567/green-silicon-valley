import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { getUserRoleServer } from "@/lib/auth/guards";

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

    let query = supabase
      .from("forms")
      .select(`
        *,
        form_columns(*),
        form_responses(count)
      `)
      .eq("created_by", session.user.id)
      .order("updated_at", { ascending: false });

    // Founders can see all forms
    if (role === "founder") {
      query = supabase
        .from("forms")
        .select(`
          *,
          form_columns(*),
          form_responses(count),
          users!forms_created_by_fkey(name, email)
        `)
        .order("updated_at", { ascending: false });
    }

    if (status !== "all") {
      query = query.eq("status", status);
    }

    const { data: forms, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      ok: true,
      forms: forms || []
    });

  } catch (error: any) {
    console.error("Forms fetch error:", error);
    return NextResponse.json({
      ok: false,
      error: "Failed to fetch forms"
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
    const { title, description, template } = body;

    if (!title) {
      return NextResponse.json({ ok: false, error: "Title is required" }, { status: 400 });
    }

    // Create the form
    const { data: form, error: formError } = await supabase
      .from("forms")
      .insert({
        title,
        description: description || "",
        created_by: session.user.id,
        status: "draft"
      })
      .select()
      .single();

    if (formError) throw formError;

    // Create default columns based on template or basic structure
    let columns = [];

    if (template === "volunteer_registration") {
      columns = [
        { title: "Full Name", field_type: "text", required: true, column_index: 0 },
        { title: "Email", field_type: "email", required: true, column_index: 1 },
        { title: "Phone", field_type: "text", required: false, column_index: 2 },
        { title: "School/Organization", field_type: "text", required: false, column_index: 3 },
        { title: "Grade Level", field_type: "select", required: false, column_index: 4, options: ["9th", "10th", "11th", "12th", "College", "Other"] },
        { title: "Areas of Interest", field_type: "multiselect", required: false, column_index: 5, options: ["Environmental Science", "STEM Education", "Community Outreach", "Event Planning", "Social Media", "Fundraising"] },
        { title: "Availability", field_type: "multiselect", required: false, column_index: 6, options: ["Weekdays after school", "Weekends", "Summer break", "School holidays"] },
        { title: "Previous volunteering experience", field_type: "textarea", required: false, column_index: 7 },
        { title: "How did you hear about us?", field_type: "select", required: false, column_index: 8, options: ["School", "Social media", "Friend/family", "Website", "Event", "Other"] }
      ];
    } else if (template === "event_feedback") {
      columns = [
        { title: "Event Name", field_type: "text", required: true, column_index: 0 },
        { title: "Event Date", field_type: "date", required: true, column_index: 1 },
        { title: "Your Name", field_type: "text", required: false, column_index: 2 },
        { title: "Overall Rating", field_type: "rating", required: true, column_index: 3 },
        { title: "What did you like most?", field_type: "textarea", required: false, column_index: 4 },
        { title: "What could be improved?", field_type: "textarea", required: false, column_index: 5 },
        { title: "Would you participate again?", field_type: "select", required: true, column_index: 6, options: ["Definitely", "Probably", "Maybe", "Probably not", "Definitely not"] },
        { title: "Additional comments", field_type: "textarea", required: false, column_index: 7 }
      ];
    } else {
      // Basic template
      columns = [
        { title: "Full Name", field_type: "text", required: true, column_index: 0 },
        { title: "Email", field_type: "email", required: true, column_index: 1 },
        { title: "Message", field_type: "textarea", required: false, column_index: 2 }
      ];
    }

    // Insert columns
    for (const column of columns) {
      await supabase
        .from("form_columns")
        .insert({
          form_id: form.id,
          ...column,
          validation_rules: {},
          formatting: column.options ? { options: column.options } : {}
        });
    }

    return NextResponse.json({
      ok: true,
      form: {
        ...form,
        columns
      },
      message: "Form created successfully"
    });

  } catch (error: any) {
    console.error("Form creation error:", error);
    return NextResponse.json({
      ok: false,
      error: "Failed to create form"
    }, { status: 500 });
  }
}
