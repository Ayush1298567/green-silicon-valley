import { redirect } from "next/navigation";
import { getServerComponentClient } from "@/lib/supabase/server";
import { getDashboardPathForRole, type UserRole } from "@/lib/auth/roles";
import PageBuilderInterface from "@/components/pagebuilder/PageBuilderInterface";

export const dynamic = "force-dynamic";

export default async function PageBuilderPage() {
  const supabase = getServerComponentClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");
  
  const { data: rows } = await supabase.from("users").select("role").eq("id", session.user.id).limit(1);
  const role = (rows?.[0]?.role as UserRole) ?? "volunteer";
  
  // Allow founders and interns (interns can edit content but not structure)
  if (role !== "founder" && role !== "intern") redirect(getDashboardPathForRole(role));

  // Fetch all page templates
  const { data: pages } = await supabase
    .from("page_templates")
    .select("*")
    .order("page_name");

  // Fetch all content blocks
  const { data: contentBlocks } = await supabase
    .from("content_blocks")
    .select("*")
    .order("display_order");

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <PageBuilderInterface 
        initialPages={pages || []}
        initialContentBlocks={contentBlocks || []}
        currentUserId={session.user.id}
      />
    </div>
  );
}

