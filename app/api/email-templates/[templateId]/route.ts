import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function PUT(req: Request, { params }: { params: { templateId: string } }) {
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

  const templateId = parseInt(params.templateId);
  const { name, subject, bodyHtml, bodyText, category, variables, isActive } = await req.json();

  const { error } = await supabase
    .from("email_templates")
    .update({
      name,
      subject,
      body_html: bodyHtml,
      body_text: bodyText,
      category,
      variables,
      is_active: isActive,
      updated_at: new Date().toISOString(),
    })
    .eq("id", templateId);

  if (error) {
    console.error("Error updating template:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Log the action
  await supabase.from("system_logs").insert({
    action: "updated_email_template",
    actor_id: session.user.id,
    target_table: "email_templates",
    target_id: templateId.toString(),
    details: `Updated email template: ${name}`,
    timestamp: new Date().toISOString(),
  });

  return NextResponse.json({ message: "Template updated successfully" });
}

export async function DELETE(req: Request, { params }: { params: { templateId: string } }) {
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

  const templateId = parseInt(params.templateId);

  const { error } = await supabase
    .from("email_templates")
    .delete()
    .eq("id", templateId);

  if (error) {
    console.error("Error deleting template:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Log the action
  await supabase.from("system_logs").insert({
    action: "deleted_email_template",
    actor_id: session.user.id,
    target_table: "email_templates",
    target_id: templateId.toString(),
    details: `Deleted email template ID: ${templateId}`,
    timestamp: new Date().toISOString(),
  });

  return NextResponse.json({ message: "Template deleted successfully" });
}

