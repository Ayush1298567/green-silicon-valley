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
  const query = searchParams.get("query")?.trim();
  const entityType = searchParams.get("type"); // Optional filter by type
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);

  if (!query || query.length < 2) {
    return NextResponse.json({
      ok: true,
      results: [],
      total: 0,
      query: query || ""
    });
  }

  try {
    // Build search query with multiple strategies
    let searchQuery = supabase
      .from("search_index")
      .select(`
        entity_type,
        entity_id,
        search_text,
        metadata,
        updated_at
      `)
      .order("updated_at", { ascending: false })
      .limit(limit);

    // Filter by entity type if specified
    if (entityType) {
      searchQuery = searchQuery.eq("entity_type", entityType);
    }

    // Full-text search with ranking
    const { data: searchResults, error } = await searchQuery;

    if (error) throw error;

    // Perform client-side filtering and ranking for more sophisticated matching
    const results = searchResults
      ?.map(result => {
        const searchText = result.search_text.toLowerCase();
        const queryLower = query.toLowerCase();

        // Calculate relevance score
        let score = 0;

        // Exact matches get highest score
        if (searchText.includes(queryLower)) {
          score += 100;
          // Bonus for matches at the beginning
          if (searchText.startsWith(queryLower)) score += 50;
        }

        // Word boundary matches
        const words = queryLower.split(/\s+/);
        for (const word of words) {
          if (searchText.includes(word)) score += 20;
        }

        // Fuzzy matching for typos (simple implementation)
        const levenshteinDistance = (str1: string, str2: string): number => {
          const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

          for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
          for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

          for (let j = 1; j <= str2.length; j++) {
            for (let i = 1; i <= str1.length; i++) {
              const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
              matrix[j][i] = Math.min(
                matrix[j][i - 1] + 1,
                matrix[j - 1][i] + 1,
                matrix[j - 1][i - 1] + indicator
              );
            }
          }

          return matrix[str2.length][str1.length];
        };

        const distance = levenshteinDistance(queryLower, searchText.substring(0, queryLower.length));
        if (distance <= 2) score += Math.max(0, 20 - distance * 5);

        return {
          ...result,
          relevance_score: score
        };
      })
      .filter(result => result.relevance_score > 10) // Minimum relevance threshold
      .sort((a, b) => b.relevance_score - a.relevance_score)
      .slice(0, limit);

    // Enrich results with actual entity data
    const enrichedResults = await Promise.all(
      results?.map(async (result) => {
        let entityData = null;

        try {
          switch (result.entity_type) {
            case "group":
              const { data: group } = await supabase
                .from("volunteers")
                .select("id, team_name, status")
                .eq("id", result.entity_id)
                .single();
              entityData = group;
              break;

            case "volunteer":
              const { data: volunteer } = await supabase
                .from("users")
                .select("id, name, email")
                .eq("id", result.entity_id)
                .single();
              entityData = volunteer;
              break;

            case "presentation":
              const { data: presentation } = await supabase
                .from("presentations")
                .select("id, title, scheduled_date, status")
                .eq("id", result.entity_id)
                .single();
              entityData = presentation;
              break;

            case "school":
              const { data: school } = await supabase
                .from("schools")
                .select("id, name, location")
                .eq("id", result.entity_id)
                .single();
              entityData = school;
              break;
          }
        } catch (error) {
          console.error(`Error fetching ${result.entity_type} data:`, error);
        }

        return {
          ...result,
          entity_data: entityData,
          display_title: entityData?.team_name || entityData?.name || entityData?.title || `ID: ${result.entity_id.substring(0, 8)}`,
          display_subtitle: result.entity_type,
          url: `/${result.entity_type === "group" ? "dashboard/founder/groups" : result.entity_type + "s"}/${result.entity_id}`
        };
      }) || []
    );

    return NextResponse.json({
      ok: true,
      results: enrichedResults,
      total: enrichedResults.length,
      query,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error("Search error:", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
