import Fuse from 'fuse.js';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export interface SearchResult {
  id: string;
  type: 'presentation' | 'volunteer' | 'teacher' | 'school' | 'event' | 'faq' | 'blog' | 'resource' | 'team';
  title: string;
  description: string;
  url: string;
  relevanceScore: number;
  metadata?: Record<string, any>;
  highlights?: string[];
}

export interface SearchOptions {
  query: string;
  types?: SearchResult['type'][];
  filters?: Record<string, any>;
  limit?: number;
  offset?: number;
  sortBy?: 'relevance' | 'date' | 'title';
  fuzzyThreshold?: number;
}

export interface SearchFacets {
  types: Record<string, number>;
  categories: Record<string, number>;
  tags: Record<string, number>;
  dateRanges: Record<string, number>;
}

export class AdvancedSearchService {
  private supabase = createClientComponentClient();
  private fuseOptions = {
    threshold: 0.3, // 0.0 = exact match, 1.0 = match anything
    distance: 100,
    minMatchCharLength: 2,
    keys: [
      { name: 'title', weight: 0.7 },
      { name: 'description', weight: 0.3 },
      { name: 'content', weight: 0.2 },
      { name: 'tags', weight: 0.1 }
    ]
  };

  /**
   * Perform advanced search across all content types
   */
  async search(options: SearchOptions): Promise<{
    results: SearchResult[];
    facets: SearchFacets;
    total: number;
    queryTime: number;
  }> {
    const startTime = Date.now();
    const { query, types, filters, limit = 20, offset = 0, sortBy = 'relevance', fuzzyThreshold = 0.3 } = options;

    // Build search queries for each content type
    const searchPromises: Promise<SearchResult[]>[] = [];

    const searchTypes = types || [
      'presentation',
      'volunteer',
      'teacher',
      'school',
      'event',
      'faq',
      'blog',
      'resource',
      'team'
    ];

    // Search each content type
    for (const type of searchTypes) {
      searchPromises.push(this.searchByType(type, query, filters, fuzzyThreshold));
    }

    // Execute all searches in parallel
    const resultsArrays = await Promise.all(searchPromises);
    let allResults = resultsArrays.flat();

    // Apply filters
    if (filters) {
      allResults = this.applyFilters(allResults, filters);
    }

    // Sort results
    allResults = this.sortResults(allResults, sortBy);

    // Calculate facets
    const facets = this.calculateFacets(allResults);

    // Paginate
    const paginatedResults = allResults.slice(offset, offset + limit);
    const queryTime = Date.now() - startTime;

    return {
      results: paginatedResults,
      facets,
      total: allResults.length,
      queryTime
    };
  }

  /**
   * Search specific content type
   */
  private async searchByType(
    type: SearchResult['type'],
    query: string,
    filters?: Record<string, any>,
    fuzzyThreshold: number = 0.3
  ): Promise<SearchResult[]> {
    try {
      switch (type) {
        case 'presentation':
          return this.searchPresentations(query, filters, fuzzyThreshold);
        case 'volunteer':
          return this.searchVolunteers(query, filters, fuzzyThreshold);
        case 'teacher':
          return this.searchTeachers(query, filters, fuzzyThreshold);
        case 'school':
          return this.searchSchools(query, filters, fuzzyThreshold);
        case 'event':
          return this.searchEvents(query, filters, fuzzyThreshold);
        case 'faq':
          return this.searchFAQs(query, filters, fuzzyThreshold);
        case 'blog':
          return this.searchBlogPosts(query, filters, fuzzyThreshold);
        case 'resource':
          return this.searchResources(query, filters, fuzzyThreshold);
        case 'team':
          return this.searchTeams(query, filters, fuzzyThreshold);
        default:
          return [];
      }
    } catch (error) {
      console.error(`Error searching ${type}:`, error);
      return [];
    }
  }

  /**
   * Search presentations
   */
  private async searchPresentations(query: string, filters?: Record<string, any>, threshold: number = 0.3): Promise<SearchResult[]> {
    const { data: presentations } = await this.supabase
      .from('presentations')
      .select('*, schools(*), teams(*)')
      .limit(100);

    if (!presentations) return [];

    const searchableData = presentations.map(p => ({
      id: p.id,
      title: `${p.schools?.name || 'School'} - ${p.date}`,
      description: p.notes || p.learning_objectives || '',
      content: JSON.stringify(p),
      tags: [p.status, p.grade_level, p.schools?.city, p.schools?.state].filter(Boolean),
      ...p
    }));

    const fuse = new Fuse(searchableData, { ...this.fuseOptions, threshold });
    const fuseResults = fuse.search(query);

    return fuseResults.map(result => ({
      id: result.item.id,
      type: 'presentation' as const,
      title: result.item.title,
      description: result.item.description,
      url: `/dashboard/founder/presentations/${result.item.id}`,
      relevanceScore: 1 - result.score,
      metadata: {
        date: result.item.date,
        school: result.item.schools?.name,
        team: result.item.teams?.name,
        status: result.item.status
      },
      highlights: this.extractHighlights(result.matches || [], query)
    }));
  }

  /**
   * Search volunteers
   */
  private async searchVolunteers(query: string, filters?: Record<string, any>, threshold: number = 0.3): Promise<SearchResult[]> {
    const { data: volunteers } = await this.supabase
      .from('users')
      .select('*, teams(*)')
      .eq('role', 'volunteer')
      .limit(100);

    if (!volunteers) return [];

    const searchableData = volunteers.map(v => ({
      id: v.id,
      title: v.name || v.email,
      description: v.bio || '',
      content: `${v.name} ${v.email} ${v.bio || ''}`,
      tags: [v.status, v.teams?.name].filter(Boolean),
      ...v
    }));

    const fuse = new Fuse(searchableData, { ...this.fuseOptions, threshold });
    const fuseResults = fuse.search(query);

    return fuseResults.map(result => ({
      id: result.item.id,
      type: 'volunteer' as const,
      title: result.item.title,
      description: result.item.description,
      url: `/dashboard/founder/volunteers/${result.item.id}`,
      relevanceScore: 1 - result.score,
      metadata: {
        email: result.item.email,
        status: result.item.status,
        team: result.item.teams?.name
      },
      highlights: this.extractHighlights(result.matches || [], query)
    }));
  }

  /**
   * Search teachers
   */
  private async searchTeachers(query: string, filters?: Record<string, any>, threshold: number = 0.3): Promise<SearchResult[]> {
    const { data: teachers } = await this.supabase
      .from('teacher_requests')
      .select('*')
      .limit(100);

    if (!teachers) return [];

    const searchableData = teachers.map(t => ({
      id: t.id,
      title: `${t.contact_name} - ${t.school_name}`,
      description: t.message || '',
      content: `${t.contact_name} ${t.school_name} ${t.message || ''}`,
      tags: [t.status, t.grade_level, t.school_name].filter(Boolean),
      ...t
    }));

    const fuse = new Fuse(searchableData, { ...this.fuseOptions, threshold });
    const fuseResults = fuse.search(query);

    return fuseResults.map(result => ({
      id: result.item.id,
      type: 'teacher' as const,
      title: result.item.title,
      description: result.item.description,
      url: `/dashboard/founder/applications/${result.item.id}`,
      relevanceScore: 1 - result.score,
      metadata: {
        school: result.item.school_name,
        email: result.item.contact_email,
        status: result.item.status,
        gradeLevel: result.item.grade_level
      },
      highlights: this.extractHighlights(result.matches || [], query)
    }));
  }

  /**
   * Search schools
   */
  private async searchSchools(query: string, filters?: Record<string, any>, threshold: number = 0.3): Promise<SearchResult[]> {
    const { data: schools } = await this.supabase
      .from('schools')
      .select('*')
      .limit(100);

    if (!schools) return [];

    const searchableData = schools.map(s => ({
      id: s.id,
      title: s.name,
      description: `${s.city}, ${s.state}`,
      content: `${s.name} ${s.city} ${s.state} ${s.address || ''}`,
      tags: [s.city, s.state, s.district].filter(Boolean),
      ...s
    }));

    const fuse = new Fuse(searchableData, { ...this.fuseOptions, threshold });
    const fuseResults = fuse.search(query);

    return fuseResults.map(result => ({
      id: result.item.id,
      type: 'school' as const,
      title: result.item.title,
      description: result.item.description,
      url: `/schools/${result.item.id}`,
      relevanceScore: 1 - result.score,
      metadata: {
        city: result.item.city,
        state: result.item.state,
        district: result.item.district
      },
      highlights: this.extractHighlights(result.matches || [], query)
    }));
  }

  /**
   * Search events
   */
  private async searchEvents(query: string, filters?: Record<string, any>, threshold: number = 0.3): Promise<SearchResult[]> {
    const { data: events } = await this.supabase
      .from('events_deadlines')
      .select('*')
      .limit(100);

    if (!events) return [];

    const searchableData = events.map(e => ({
      id: e.id,
      title: e.title,
      description: e.description || '',
      content: `${e.title} ${e.description || ''} ${e.type} ${e.location || ''}`,
      tags: [e.type, e.location].filter(Boolean),
      ...e
    }));

    const fuse = new Fuse(searchableData, { ...this.fuseOptions, threshold });
    const fuseResults = fuse.search(query);

    return fuseResults.map(result => ({
      id: result.item.id,
      type: 'event' as const,
      title: result.item.title,
      description: result.item.description,
      url: `/events/${result.item.id}`,
      relevanceScore: 1 - result.score,
      metadata: {
        date: result.item.date,
        type: result.item.type,
        location: result.item.location
      },
      highlights: this.extractHighlights(result.matches || [], query)
    }));
  }

  /**
   * Search FAQs
   */
  private async searchFAQs(query: string, filters?: Record<string, any>, threshold: number = 0.3): Promise<SearchResult[]> {
    const { data: faqs } = await this.supabase
      .from('faq_items')
      .select('*')
      .eq('is_published', true)
      .limit(100);

    if (!faqs) return [];

    const searchableData = faqs.map(f => ({
      id: f.id,
      title: f.question,
      description: f.answer,
      content: `${f.question} ${f.answer}`,
      tags: [f.category].filter(Boolean),
      ...f
    }));

    const fuse = new Fuse(searchableData, { ...this.fuseOptions, threshold });
    const fuseResults = fuse.search(query);

    return fuseResults.map(result => ({
      id: result.item.id,
      type: 'faq' as const,
      title: result.item.title,
      description: result.item.description,
      url: `/faq#${result.item.id}`,
      relevanceScore: 1 - result.score,
      metadata: {
        category: result.item.category
      },
      highlights: this.extractHighlights(result.matches || [], query)
    }));
  }

  /**
   * Search blog posts
   */
  private async searchBlogPosts(query: string, filters?: Record<string, any>, threshold: number = 0.3): Promise<SearchResult[]> {
    const { data: posts } = await this.supabase
      .from('intern_blog_posts')
      .select('*')
      .limit(100);

    if (!posts) return [];

    const searchableData = posts.map(p => ({
      id: p.id,
      title: p.title,
      description: p.content.substring(0, 200),
      content: p.content,
      tags: p.tags || [],
      ...p
    }));

    const fuse = new Fuse(searchableData, { ...this.fuseOptions, threshold });
    const fuseResults = fuse.search(query);

    return fuseResults.map(result => ({
      id: result.item.id,
      type: 'blog' as const,
      title: result.item.title,
      description: result.item.description,
      url: `/interns/blog/${result.item.id}`,
      relevanceScore: 1 - result.score,
      metadata: {
        author: result.item.author_name,
        publishedAt: result.item.published_at,
        tags: result.item.tags
      },
      highlights: this.extractHighlights(result.matches || [], query)
    }));
  }

  /**
   * Search resources
   */
  private async searchResources(query: string, filters?: Record<string, any>, threshold: number = 0.3): Promise<SearchResult[]> {
    const { data: resources } = await this.supabase
      .from('downloadable_resources')
      .select('*')
      .limit(100);

    if (!resources) return [];

    const searchableData = resources.map(r => ({
      id: r.id,
      title: r.title,
      description: r.description || '',
      content: `${r.title} ${r.description || ''} ${(r.tags || []).join(' ')}`,
      tags: r.tags || [],
      ...r
    }));

    const fuse = new Fuse(searchableData, { ...this.fuseOptions, threshold });
    const fuseResults = fuse.search(query);

    return fuseResults.map(result => ({
      id: result.item.id,
      type: 'resource' as const,
      title: result.item.title,
      description: result.item.description,
      url: `/resources/${result.item.id}`,
      relevanceScore: 1 - result.score,
      metadata: {
        category: result.item.category,
        audience: result.item.audience,
        tags: result.item.tags
      },
      highlights: this.extractHighlights(result.matches || [], query)
    }));
  }

  /**
   * Search teams
   */
  private async searchTeams(query: string, filters?: Record<string, any>, threshold: number = 0.3): Promise<SearchResult[]> {
    const { data: teams } = await this.supabase
      .from('teams')
      .select('*')
      .limit(100);

    if (!teams) return [];

    const searchableData = teams.map(t => ({
      id: t.id,
      title: t.name,
      description: t.description || '',
      content: `${t.name} ${t.description || ''}`,
      tags: [t.status, t.location].filter(Boolean),
      ...t
    }));

    const fuse = new Fuse(searchableData, { ...this.fuseOptions, threshold });
    const fuseResults = fuse.search(query);

    return fuseResults.map(result => ({
      id: result.item.id,
      type: 'team' as const,
      title: result.item.title,
      description: result.item.description,
      url: `/dashboard/founder/volunteers/teams/${result.item.id}`,
      relevanceScore: 1 - result.score,
      metadata: {
        status: result.item.status,
        location: result.item.location,
        memberCount: result.item.member_count
      },
      highlights: this.extractHighlights(result.matches || [], query)
    }));
  }

  /**
   * Apply filters to results
   */
  private applyFilters(results: SearchResult[], filters: Record<string, any>): SearchResult[] {
    return results.filter(result => {
      for (const [key, value] of Object.entries(filters)) {
        if (result.metadata?.[key] !== value) {
          return false;
        }
      }
      return true;
    });
  }

  /**
   * Sort results
   */
  private sortResults(results: SearchResult[], sortBy: string): SearchResult[] {
    switch (sortBy) {
      case 'date':
        return results.sort((a, b) => {
          const dateA = new Date(a.metadata?.date || 0).getTime();
          const dateB = new Date(b.metadata?.date || 0).getTime();
          return dateB - dateA;
        });

      case 'title':
        return results.sort((a, b) => a.title.localeCompare(b.title));

      case 'relevance':
      default:
        return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
    }
  }

  /**
   * Calculate search facets
   */
  private calculateFacets(results: SearchResult[]): SearchFacets {
    const facets: SearchFacets = {
      types: {},
      categories: {},
      tags: {},
      dateRanges: {}
    };

    results.forEach(result => {
      // Type facet
      facets.types[result.type] = (facets.types[result.type] || 0) + 1;

      // Category facet
      if (result.metadata?.category) {
        facets.categories[result.metadata.category] = (facets.categories[result.metadata.category] || 0) + 1;
      }

      // Tags facet
      if (result.metadata?.tags && Array.isArray(result.metadata.tags)) {
        result.metadata.tags.forEach((tag: string) => {
          facets.tags[tag] = (facets.tags[tag] || 0) + 1;
        });
      }

      // Date range facet
      if (result.metadata?.date) {
        const date = new Date(result.metadata.date);
        const now = new Date();
        const daysDiff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

        let range = 'older';
        if (daysDiff < 7) range = 'this_week';
        else if (daysDiff < 30) range = 'this_month';
        else if (daysDiff < 90) range = 'this_quarter';
        else if (daysDiff < 365) range = 'this_year';

        facets.dateRanges[range] = (facets.dateRanges[range] || 0) + 1;
      }
    });

    return facets;
  }

  /**
   * Extract highlights from search matches
   */
  private extractHighlights(matches: any[], query: string): string[] {
    const highlights: string[] = [];
    const queryWords = query.toLowerCase().split(/\s+/);

    matches.forEach(match => {
      if (match.value) {
        const text = match.value.toLowerCase();
        queryWords.forEach(word => {
          if (text.includes(word) && word.length > 2) {
            const index = text.indexOf(word);
            const start = Math.max(0, index - 20);
            const end = Math.min(text.length, index + word.length + 20);
            const snippet = match.value.substring(start, end);
            if (!highlights.includes(snippet)) {
              highlights.push(snippet);
            }
          }
        });
      }
    });

    return highlights.slice(0, 3); // Return top 3 highlights
  }

  /**
   * Get search suggestions/autocomplete
   */
  async getSuggestions(query: string, limit: number = 5): Promise<string[]> {
    if (query.length < 2) return [];

    // Search across all types and get unique titles
    const { results } = await this.search({
      query,
      limit: 50
    });

    // Extract unique titles
    const suggestions = new Set<string>();
    results.forEach(result => {
      if (result.title.toLowerCase().includes(query.toLowerCase())) {
        suggestions.add(result.title);
      }
    });

    return Array.from(suggestions).slice(0, limit);
  }

  /**
   * Get trending searches
   */
  async getTrendingSearches(limit: number = 10): Promise<string[]> {
    // In production, this would come from a search_logs table
    // For now, return common searches
    return [
      'volunteer application',
      'presentation request',
      'environmental education',
      'STEM activities',
      'school partnership',
      'volunteer hours',
      'team formation',
      'presentation materials',
      'teacher resources',
      'impact metrics'
    ].slice(0, limit);
  }
}

export const advancedSearch = new AdvancedSearchService();
