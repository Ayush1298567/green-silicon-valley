import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const formId = params.id;

    // Get form with visibility check
    const { data: form, error: formError } = await supabase
      .from("forms")
      .select("*")
      .eq("id", formId)
      .eq("is_active", true)
      .single();

    if (formError || !form) {
      return NextResponse.json({ error: "Form not found or inactive" }, { status: 404 });
    }

    // Check visibility permissions
    if (form.visibility && form.visibility.length > 0) {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return NextResponse.json({ error: "Authentication required" }, { status: 401 });
      }

      // Get user role
      const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!userData || !form.visibility.includes(userData.role)) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }
    }

    return NextResponse.json({
      form: {
        id: form.id,
        title: form.title,
        description: form.description,
        schema: form.schema
      }
    });

  } catch (error: any) {
    console.error("Form render error:", error);
    return NextResponse.json({
      error: "Failed to load form"
    }, { status: 500 });
  }
}
