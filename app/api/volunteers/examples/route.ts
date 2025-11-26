import { NextResponse } from "next/server";
import { getServerComponentClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = getServerComponentClient();
    const { searchParams } = new URL(request.url);

    const gradeLevel = searchParams.get('gradeLevel');
    const topic = searchParams.get('topic');
    const featuredOnly = searchParams.get('featuredOnly') === 'true';

    let query = supabase
      .from("volunteer_examples")
      .select("*")
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false });

    // Apply filters
    if (featuredOnly) {
      query = query.eq("is_featured", true);
    }

    if (gradeLevel) {
      // Filter by grade levels array
      query = query.contains("grade_levels", [gradeLevel]);
    }

    if (topic) {
      // Filter by topics array
      query = query.contains("topics", [topic]);
    }

    const { data: slides, error } = await query;

    if (error) throw error;

    // Transform the data for the frontend
    const formattedSlides = slides?.map(slide => ({
      id: slide.id,
      title: slide.title,
      type: slide.type,
      fileUrl: slide.file_url,
      description: slide.description,
      gradeLevels: slide.grade_levels || [],
      topics: slide.topics || [],
      isFeatured: slide.is_featured,
    })) || [];

    return NextResponse.json({ slides: formattedSlides });
  } catch (error) {
    console.error("Error fetching example slides:", error);
    return NextResponse.json(
      { error: "Failed to fetch example slides" },
      { status: 500 }
    );
  }
}
