import { NextRequest, NextResponse } from 'next/server';
import { advancedSearch } from '@/lib/search/advanced-search';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const types = searchParams.get('types')?.split(',') as any;
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const sortBy = searchParams.get('sortBy') as 'relevance' | 'date' | 'title' || 'relevance';
    const fuzzyThreshold = parseFloat(searchParams.get('fuzzyThreshold') || '0.3');

    // Parse filters from query params
    const filters: Record<string, any> = {};
    searchParams.forEach((value, key) => {
      if (key.startsWith('filter_')) {
        const filterKey = key.replace('filter_', '');
        filters[filterKey] = value;
      }
    });

    if (!query || query.length < 2) {
      return NextResponse.json({
        results: [],
        facets: {
          types: {},
          categories: {},
          tags: {},
          dateRanges: {}
        },
        total: 0,
        queryTime: 0
      });
    }

    const searchResults = await advancedSearch.search({
      query,
      types,
      filters: Object.keys(filters).length > 0 ? filters : undefined,
      limit,
      offset,
      sortBy,
      fuzzyThreshold
    });

    return NextResponse.json(searchResults);

  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Search failed', results: [], facets: {}, total: 0, queryTime: 0 },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, types, filters, limit, offset, sortBy, fuzzyThreshold } = body;

    if (!query || query.length < 2) {
      return NextResponse.json({
        results: [],
        facets: {
          types: {},
          categories: {},
          tags: {},
          dateRanges: {}
        },
        total: 0,
        queryTime: 0
      });
    }

    const searchResults = await advancedSearch.search({
      query,
      types,
      filters,
      limit: limit || 20,
      offset: offset || 0,
      sortBy: sortBy || 'relevance',
      fuzzyThreshold: fuzzyThreshold || 0.3
    });

    return NextResponse.json(searchResults);

  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Search failed', results: [], facets: {}, total: 0, queryTime: 0 },
      { status: 500 }
    );
  }
}