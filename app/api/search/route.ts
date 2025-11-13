import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";

    if (query.length < 2) {
      return NextResponse.json({ ok: true, results: [] });
    }

    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    
    const results: any[] = [];
    const searchTerm = `%${query.toLowerCase()}%`;

    // Search presentations
    const { data: presentations } = await supabase
      .from("presentations")
      .select("id, topic, scheduled_date, status")
      .or(`topic.ilike.${searchTerm},status.ilike.${searchTerm}`)
      .limit(5);

    if (presentations) {
      presentations.forEach((p) => {
        results.push({
          type: "presentation",
          id: p.id,
          title: p.topic || `Presentation #${p.id}`,
          description: `Scheduled: ${p.scheduled_date ? new Date(p.scheduled_date).toLocaleDateString() : "TBD"} • Status: ${p.status}`,
          url: `/dashboard/founder/presentations/${p.id}`
        });
      });
    }

    // Search volunteers (founders/interns only)
    if (session) {
      const { data: userRow } = await supabase.from("users").select("role").eq("id", session.user.id).single();
      const role = userRow?.role || "volunteer";
      
      if (role === "founder" || role === "intern") {
        const { data: volunteers } = await supabase
          .from("volunteers")
          .select("id, team_name")
          .ilike("team_name", searchTerm)
          .limit(5);

        if (volunteers) {
          volunteers.forEach((v) => {
            results.push({
              type: "volunteer",
              id: v.id,
              title: v.team_name || `Team #${v.id}`,
              description: "Volunteer team",
              url: `/dashboard/founder/volunteers/${v.id}`
            });
          });
        }

        // Search schools
        const { data: schools } = await supabase
          .from("schools")
          .select("id, name, district")
          .or(`name.ilike.${searchTerm},district.ilike.${searchTerm}`)
          .limit(5);

        if (schools) {
          schools.forEach((s) => {
            results.push({
              type: "school",
              id: s.id,
              title: s.name,
              description: s.district || "School",
              url: `/dashboard/founder/schools/${s.id}`
            });
          });
        }
      }
    }

    // Search blog posts (public)
    const { data: posts } = await supabase
      .from("blog_posts")
      .select("id, title, excerpt")
      .or(`title.ilike.${searchTerm},excerpt.ilike.${searchTerm}`)
      .eq("published", true)
      .limit(5);

    if (posts) {
      posts.forEach((post) => {
        results.push({
          type: "blog post",
          id: post.id,
          title: post.title,
          description: post.excerpt || "",
          url: `/blog/${post.id}`
        });
      });
    }

    return NextResponse.json({ ok: true, results });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
