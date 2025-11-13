import { getServerComponentClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import BulletinBoardInterface from "@/components/bulletin/BulletinBoardInterface";

export const dynamic = "force-dynamic";

export default async function BulletinBoardPage() {
  const supabase = getServerComponentClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const { data: userRow } = await supabase.from("users").select("*").eq("id", session.user.id).single();

  // Fetch all bulletin posts
  const { data: bulletinPosts } = await supabase
    .from("bulletin_posts")
    .select("*, author:users!bulletin_posts_author_id_fkey(name, email)")
    .eq("published", true)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gsv-charcoal">Bulletin Board</h1>
        <p className="text-gsv-gray mt-2">
          Stay updated with announcements, events, and important information
        </p>
      </div>

      <BulletinBoardInterface
        user={userRow}
        bulletinPosts={bulletinPosts || []}
      />
    </div>
  );
}
