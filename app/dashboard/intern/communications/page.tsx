import { getServerComponentClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import CommunicationsDepartmentInterface from "@/components/dashboard/intern/departments/CommunicationsDepartmentInterface";

export const dynamic = "force-dynamic";

export default async function CommunicationsDepartmentPage() {
  const supabase = getServerComponentClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const { data: userRow } = await supabase.from("users").select("*").eq("id", session.user.id).single();
  
  // Fetch communications-specific data
  const [
    { data: blogPosts },
    { data: bulletinPosts },
    { data: emailTemplates },
  ] = await Promise.all([
    supabase.from("blog_posts").select("*").order("created_at", { ascending: false }),
    supabase.from("bulletin_posts").select("*").order("created_at", { ascending: false }),
    supabase.from("email_templates").select("*").order("created_at", { ascending: false }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gsv-charcoal">📰 Communications Department</h1>
        <p className="text-gsv-gray mt-2">
          Produce newsletters, press releases, and manage public relations
        </p>
      </div>

      <CommunicationsDepartmentInterface
        user={userRow}
        blogPosts={blogPosts || []}
        bulletinPosts={bulletinPosts || []}
        emailTemplates={emailTemplates || []}
      />
    </div>
  );
}

