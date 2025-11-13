import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function GET(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  // Require authentication
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const partial = searchParams.get("query")?.trim();
  const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 20);

  if (!partial || partial.length < 1) {
    return NextResponse.json({ ok: true, suggestions: [] });
  }

  try {
    // Get recent searches from current session (in a real app, this would be stored)
    // For now, provide contextual suggestions based on common search patterns

    const suggestions = [];

    // Add common search prefixes
    const commonPrefixes = ["group", "volunteer", "presentation", "school"];
    for (const prefix of commonPrefixes) {
      if (prefix.startsWith(partial.toLowerCase())) {
        suggestions.push({
          text: prefix,
          type: "category",
          count: 0 // Would be populated from actual data
        });
      }
    }

    // Get actual suggestions from search index
    const { data: searchData } = await supabase
      .from("search_index")
      .select("search_text, entity_type")
      .ilike("search_text", `${partial}%`)
      .limit(limit * 2);

    // Group and count suggestions
    const suggestionMap = new Map<string, { count: number; type: string }>();

    for (const item of searchData || []) {
      const words = item.search_text.split(/\s+/);
      for (const word of words) {
        if (word.toLowerCase().startsWith(partial.toLowerCase()) && word.length > partial.length) {
          const key = word.toLowerCase();
          if (suggestionMap.has(key)) {
            suggestionMap.get(key)!.count++;
          } else {
            suggestionMap.set(key, { count: 1, type: item.entity_type });
          }
        }
      }
    }

    // Convert to array and sort by frequency
    const wordSuggestions = Array.from(suggestionMap.entries())
      .map(([text, data]) => ({
        text,
        type: "term",
        count: data.count,
        entityType: data.type
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit - suggestions.length);

    suggestions.push(...wordSuggestions);

    // Add some intelligent suggestions based on context
    if (partial.toLowerCase().includes("stuck")) {
      suggestions.push({
        text: "stuck groups",
        type: "query",
        count: 0
      });
    }

    if (partial.toLowerCase().includes("upcoming")) {
      suggestions.push({
        text: "upcoming presentations",
        type: "query",
        count: 0
      });
    }

    return NextResponse.json({
      ok: true,
      suggestions: suggestions.slice(0, limit),
      query: partial
    });

  } catch (error: any) {
    console.error("Suggestions error:", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}