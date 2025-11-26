import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function GET(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  // Allow public access for viewing chapters, but enhance data for authenticated users
  try {
    // Get basic chapter information
    const { data: chapters, error } = await supabase
      .from("chapters")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    // If user is authenticated, enhance with additional stats
    let enhancedChapters = chapters || [];

    if (session) {
      enhancedChapters = await Promise.all(
        (chapters || []).map(async (chapter) => {
          // Count active volunteers in this chapter
          const { count: volunteerCount } = await supabase
            .from("volunteers")
            .select("*", { count: "exact", head: true })
            .eq("chapter_id", chapter.id);

          // Count presentations by teams in this chapter
          const { count: presentationCount } = await supabase
            .from("presentations")
            .select("*", { count: "exact", head: true })
            .eq("chapter_id", chapter.id);

          // Count active leadership
          const { count: leadershipCount } = await supabase
            .from("chapter_leadership")
            .select("*", { count: "exact", head: true })
            .eq("chapter_id", chapter.id)
            .eq("is_active", true);

          return {
            ...chapter,
            volunteer_count: volunteerCount || 0,
            presentation_count: presentationCount || 0,
            leadership_count: leadershipCount || 0
          };
        })
      );
    }

    return NextResponse.json({ ok: true, chapters: enhancedChapters });

  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  // Only founders and interns can create chapters
  const { data: userRole } = await supabase
    .from("users")
    .select("role")
    .eq("id", session.user.id)
    .single();

  if (!["founder", "intern"].includes(userRole?.role)) {
    return NextResponse.json({ ok: false, error: "Insufficient permissions" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const {
      name,
      country,
      language,
      timezone,
      currency,
      contact_email,
      website_url,
      social_media
    } = body;

    if (!name || !country) {
      return NextResponse.json({ ok: false, error: "Chapter name and country are required" }, { status: 400 });
    }

    const { data: chapter, error } = await supabase
      .from("chapters")
      .insert({
        name,
        country,
        language: language || "en",
        timezone: timezone || "UTC",
        currency: currency || "USD",
        contact_email,
        website_url,
        social_media: social_media || {},
        status: "forming"
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, chapter });

  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
