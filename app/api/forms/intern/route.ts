import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { saveInternApplication } from "@/lib/db";
import { trackUserActivity } from "@/lib/auth/routing";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const name = String(form.get("name") ?? "");
    const email = String(form.get("email") ?? "");
    const department = String(form.get("department") ?? "");
    
    const supabase = createRouteHandlerClient({ cookies });
    const userAgent = req.headers.get("user-agent") || "";
    const referrer = req.headers.get("referer") || "";

    const { data: internProject, error } = await saveInternApplication({ name, email, department });
    
    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    // Track form submission activity
    await trackUserActivity(supabase, {
      email: email,
      activity_type: "form_submit",
      activity_source: "intern_form",
      user_category: "intern",
      user_agent: userAgent,
      referrer: referrer,
      metadata: {
        department,
        intern_project_id: internProject?.id,
      },
    });

    return NextResponse.redirect(new URL("/get-involved?intern=1", req.url));
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message || "Failed to submit form" }, { status: 500 });
  }
}


