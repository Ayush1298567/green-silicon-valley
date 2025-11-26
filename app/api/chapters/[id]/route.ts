import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    // Get chapter details with enhanced information
    const { data: chapter, error } = await supabase
      .from("chapters")
      .select("*")
      .eq("id", params.id)
      .single();

    if (error || !chapter) {
      return NextResponse.json({ ok: false, error: "Chapter not found" }, { status: 404 });
    }

    // Enhance with stats if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    let enhancedChapter = chapter;

    if (session) {
      // Count active volunteers
      const { count: volunteerCount } = await supabase
        .from("volunteers")
        .select("*", { count: "exact", head: true })
        .eq("chapter_id", chapter.id);

      // Count presentations
      const { count: presentationCount } = await supabase
        .from("presentations")
        .select("*", { count: "exact", head: true })
        .eq("chapter_id", chapter.id);

      // Count leadership
      const { count: leadershipCount } = await supabase
        .from("chapter_leadership")
        .select("*", { count: "exact", head: true })
        .eq("chapter_id", chapter.id)
        .eq("is_active", true);

      enhancedChapter = {
        ...chapter,
        volunteer_count: volunteerCount || 0,
        presentation_count: presentationCount || 0,
        leadership_count: leadershipCount || 0
      };
    }

    return NextResponse.json({ ok: true, chapter: enhancedChapter });

  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      name,
      country,
      language,
      timezone,
      currency,
      status,
      contact_email,
      website_url,
      social_media
    } = body;

    const { data: chapter, error } = await supabase
      .from("chapters")
      .update({
        name,
        country,
        language,
        timezone,
        currency,
        status,
        contact_email,
        website_url,
        social_media,
        updated_at: new Date().toISOString()
      })
      .eq("id", params.id)
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
