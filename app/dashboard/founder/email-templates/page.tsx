import { getServerComponentClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getDashboardPathForRole, type UserRole } from "@/lib/auth/roles";
import EmailTemplatesInterface from "@/components/email/EmailTemplatesInterface";

export const dynamic = "force-dynamic";

export default async function EmailTemplatesPage() {
  const supabase = getServerComponentClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const { data: userRow } = await supabase.from("users").select("*").eq("id", session.user.id).single();
  const role = (userRow?.role as UserRole) ?? "volunteer";

  // Check permissions
  const canManageEmails = role === "founder" || userRow?.permissions?.manage_email_templates || userRow?.permissions?.send_emails;
  if (!canManageEmails) {
    redirect(getDashboardPathForRole(role));
  }

  // Fetch email templates
  const { data: templates } = await supabase
    .from("email_templates")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gsv-charcoal">Email Templates</h1>
        <p className="text-gsv-gray mt-2">
          Create and manage reusable email templates for automated workflows and manual sending
        </p>
      </div>

      <EmailTemplatesInterface
        templates={templates || []}
        canEdit={role === "founder" || userRow?.permissions?.manage_email_templates}
      />
    </div>
  );
}

