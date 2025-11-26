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

    // Create default schema based on template
    let schema = {
      fields: []
    };

    if (template === "volunteer_registration") {
      schema.fields = [
        {
          id: "full_name",
          type: "text",
          label: "Full Name",
          placeholder: "Enter your full name",
          required: true
        },
        {
          id: "email",
          type: "email",
          label: "Email Address",
          placeholder: "Enter your email",
          required: true
        },
        {
          id: "phone",
          type: "text",
          label: "Phone Number",
          placeholder: "Enter your phone number",
          required: false
        },
        {
          id: "school_org",
          type: "text",
          label: "School/Organization",
          placeholder: "Enter your school or organization",
          required: false
        },
        {
          id: "grade_level",
          type: "select",
          label: "Grade Level",
          required: false,
          options: ["9th", "10th", "11th", "12th", "College", "Other"]
        },
        {
          id: "interests",
          type: "multiselect",
          label: "Areas of Interest",
          required: false,
          options: ["Environmental Science", "STEM Education", "Community Outreach", "Event Planning", "Social Media", "Fundraising"]
        },
        {
          id: "availability",
          type: "multiselect",
          label: "Availability",
          required: false,
          options: ["Weekdays after school", "Weekends", "Summer break", "School holidays"]
        },
        {
          id: "experience",
          type: "textarea",
          label: "Previous Volunteering Experience",
          placeholder: "Tell us about your previous volunteering experience",
          required: false
        },
        {
          id: "how_heard",
          type: "select",
          label: "How did you hear about us?",
          required: false,
          options: ["School", "Social media", "Friend/family", "Website", "Event", "Other"]
        }
      ];
    } else if (template === "event_feedback") {
      schema.fields = [
        {
          id: "event_name",
          type: "text",
          label: "Event Name",
          placeholder: "Enter the event name",
          required: true
        },
        {
          id: "event_date",
          type: "date",
          label: "Event Date",
          required: true
        },
        {
          id: "your_name",
          type: "text",
          label: "Your Name",
          placeholder: "Enter your name",
          required: false
        },
        {
          id: "rating",
          type: "select",
          label: "Overall Rating",
          required: true,
          options: ["5 - Excellent", "4 - Very Good", "3 - Good", "2 - Fair", "1 - Poor"]
        },
        {
          id: "liked_most",
          type: "textarea",
          label: "What did you like most?",
          placeholder: "Tell us what you liked most about the event",
          required: false
        },
        {
          id: "improvements",
          type: "textarea",
          label: "What could be improved?",
          placeholder: "Any suggestions for improvement?",
          required: false
        },
        {
          id: "participate_again",
          type: "select",
          label: "Would you participate again?",
          required: true,
          options: ["Definitely", "Probably", "Maybe", "Probably not", "Definitely not"]
        },
        {
          id: "comments",
          type: "textarea",
          label: "Additional Comments",
          placeholder: "Any additional comments or feedback?",
          required: false
        }
      ];
    } else {
      // Basic template
      schema.fields = [
        {
          id: "full_name",
          type: "text",
          label: "Full Name",
          placeholder: "Enter your full name",
          required: true
        },
        {
          id: "email",
          type: "email",
          label: "Email Address",
          placeholder: "Enter your email",
          required: true
        },
        {
          id: "message",
          type: "textarea",
          label: "Message",
          placeholder: "Enter your message",
          required: false
        }
      ];
    }

    // Create the form with new schema
    const { data: form, error: formError } = await supabase
      .from("forms")
      .insert({
        title,
        description: description || "",
        schema,
        created_by: session.user.id,
        is_active: false
      })
      .select()
      .single();

    if (formError) throw formError;

    return NextResponse.json({
      ok: true,
      form,
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
