import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check permissions
  const { data: userRoleData } = await supabase
    .from("users")
    .select("role, permissions")
    .eq("id", session.user.id)
    .single();

  if (userRoleData?.role !== "founder" && !userRoleData?.permissions?.manage_email_templates) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { name, subject, bodyHtml, bodyText, category, variables, isActive } = await req.json();

  if (!name || !subject || !bodyText) {
    return NextResponse.json({ error: "Name, subject, and body text are required" }, { status: 400 });
  }

  const { error } = await supabase.from("email_templates").insert({
    name,
    subject,
    body_html: bodyHtml,
    body_text: bodyText,
    category: category || "general",
    variables,
    is_active: isActive ?? true,
    created_at: new Date().toISOString(),
    usage_count: 0,
  });

  if (error) {
    console.error("Error creating template:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Log the action
  await supabase.from("system_logs").insert({
    action: "created_email_template",
    actor_id: session.user.id,
    target_table: "email_templates",
    details: `Created email template: ${name}`,
    timestamp: new Date().toISOString(),
  });

  return NextResponse.json({ message: "Template created successfully" });
}

