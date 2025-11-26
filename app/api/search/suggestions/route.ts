import { NextRequest, NextResponse } from 'next/server';
import { advancedSearch } from '@/lib/search/advanced-search';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const type = searchParams.get('type') || 'suggestions'; // 'suggestions' or 'trending'
    const limit = parseInt(searchParams.get('limit') || '5');

    if (type === 'trending') {
      const trending = await advancedSearch.getTrendingSearches(limit);
      return NextResponse.json({ suggestions: trending });
    }

    if (!query || query.length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    const suggestions = await advancedSearch.getSuggestions(query, limit);
    return NextResponse.json({ suggestions });

  } catch (error) {
    console.error('Search suggestions error:', error);
    return NextResponse.json({ suggestions: [] }, { status: 500 });
  }
}