import { getServerComponentClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import MediaDepartmentInterface from "@/components/dashboard/intern/departments/MediaDepartmentInterface";

export const dynamic = "force-dynamic";

export default async function MediaDepartmentPage() {
  const supabase = getServerComponentClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const { data: userRow } = await supabase.from("users").select("*").eq("id", session.user.id).single();
  
  // Fetch media-specific data
  const [
    { data: blogPosts },
    { data: bulletinPosts },
  ] = await Promise.all([
    supabase.from("blog_posts").select("*").order("created_at", { ascending: false }).limit(10),
    supabase.from("bulletin_posts").select("*").order("created_at", { ascending: false }).limit(10),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gsv-charcoal">📸 Media Department</h1>
        <p className="text-gsv-gray mt-2">
          Manage social media, graphic design, photography, videography, and event documentation
        </p>
      </div>

      <MediaDepartmentInterface
        user={userRow}
        blogPosts={blogPosts || []}
        bulletinPosts={bulletinPosts || []}
      />
    </div>
  );
}

