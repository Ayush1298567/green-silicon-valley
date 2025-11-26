"use client";
import { useState, useEffect, useRef } from "react";
import { Search, X, Filter, Clock, TrendingUp, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface SearchResult {
  id: string;
  type: string;
  title: string;
  description: string;
  url: string;
  relevanceScore: number;
  metadata?: Record<string, any>;
  highlights?: string[];
}

interface SearchFacets {
  types: Record<string, number>;
  categories: Record<string, number>;
  tags: Record<string, number>;
  dateRanges: Record<string, number>;
}

export default function AdvancedSearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [trending, setTrending] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [facets, setFacets] = useState<SearchFacets | null>(null);
  const [total, setTotal] = useState(0);
  const [queryTime, setQueryTime] = useState(0);

  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load trending searches on mount
  useEffect(() => {
    loadTrendingSearches();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Load suggestions as user types
  useEffect(() => {
    if (query.length >= 2) {
      const timer = setTimeout(() => {
        loadSuggestions(query);
      }, 300);

      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
    }
  }, [query]);

  // Perform search
  useEffect(() => {
    if (query.length >= 2) {
      const timer = setTimeout(() => {
        performSearch();
      }, 500);

      return () => clearTimeout(timer);
    } else {
      setResults([]);
      setFacets(null);
      setTotal(0);
    }
  }, [query, selectedTypes]);

  const loadTrendingSearches = async () => {
    try {
      const response = await fetch('/api/search/suggestions?type=trending&limit=5');
      const data = await response.json();
      setTrending(data.suggestions || []);
    } catch (error) {
      console.error('Error loading trending searches:', error);
    }
  };

  const loadSuggestions = async (searchQuery: string) => {
    try {
      const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(searchQuery)}&limit=5`);
      const data = await response.json();
      setSuggestions(data.suggestions || []);
    } catch (error) {
      console.error('Error loading suggestions:', error);
    }
  };

  const performSearch = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        q: query,
        limit: '10',
        sortBy: 'relevance'
      });

      if (selectedTypes.length > 0) {
        params.append('types', selectedTypes.join(','));
      }

      const response = await fetch(`/api/search?${params.toString()}`);
      const data = await response.json();

      setResults(data.results || []);
      setFacets(data.facets || null);
      setTotal(data.total || 0);
      setQueryTime(data.queryTime || 0);
      setIsOpen(true);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResultClick = (url: string) => {
    router.push(url);
    setIsOpen(false);
    setQuery("");
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    inputRef.current?.focus();
  };

  const handleTrendingClick = (trend: string) => {
    setQuery(trend);
    inputRef.current?.focus();
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      presentation: 'bg-blue-100 text-blue-800',
      volunteer: 'bg-green-100 text-green-800',
      teacher: 'bg-orange-100 text-orange-800',
      school: 'bg-purple-100 text-purple-800',
      event: 'bg-red-100 text-red-800',
      faq: 'bg-yellow-100 text-yellow-800',
      blog: 'bg-indigo-100 text-indigo-800',
      resource: 'bg-pink-100 text-pink-800',
      team: 'bg-gray-100 text-gray-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getTypeIcon = (type: string) => {
    // Return appropriate icon based on type
    return '📄';
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder="Search presentations, volunteers, schools, events..."
          className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gsv-green focus:border-transparent"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setResults([]);
              setIsOpen(false);
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        {isLoading && (
          <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
            <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
          </div>
        )}
      </div>

      {/* Search Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-[600px] overflow-y-auto">
          {/* Filters */}
          {facets && Object.keys(facets.types).length > 0 && (
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filter by Type</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(facets.types).map(([type, count]) => (
                  <button
                    key={type}
                    onClick={() => {
                      if (selectedTypes.includes(type)) {
                        setSelectedTypes(selectedTypes.filter(t => t !== type));
                      } else {
                        setSelectedTypes([...selectedTypes, type]);
                      }
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      selectedTypes.includes(type)
                        ? 'bg-gsv-green text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {type} ({count})
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results */}
          {query.length >= 2 && (
            <div className="p-4">
              {results.length > 0 ? (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-600">
                      Found {total} result{total !== 1 ? 's' : ''} in {queryTime}ms
                    </span>
                  </div>
                  <div className="space-y-2">
                    {results.map((result) => (
                      <button
                        key={result.id}
                        onClick={() => handleResultClick(result.url)}
                        className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
                      >
                        <div className="flex items-start gap-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(result.type)}`}>
                            {result.type}
                          </span>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 mb-1 line-clamp-1">{result.title}</h4>
                            <p className="text-sm text-gray-600 line-clamp-2">{result.description}</p>
                            {result.highlights && result.highlights.length > 0 && (
                              <div className="mt-2 text-xs text-gray-500">
                                {result.highlights[0]}
                              </div>
                            )}
                          </div>
                          <div className="text-xs text-gray-400">
                            {Math.round(result.relevanceScore * 100)}%
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              ) : isLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Searching...</p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">No results found</p>
                  <p className="text-sm text-gray-500 mt-1">Try different keywords or check spelling</p>
                </div>
              )}
            </div>
          )}

          {/* Suggestions */}
          {query.length >= 2 && suggestions.length > 0 && results.length === 0 && !isLoading && (
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <Search className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Suggestions</span>
              </div>
              <div className="space-y-1">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-3 py-2 rounded hover:bg-gray-50 text-sm text-gray-700"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Trending Searches */}
          {query.length === 0 && trending.length > 0 && (
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Trending Searches</span>
              </div>
              <div className="space-y-1">
                {trending.map((trend, index) => (
                  <button
                    key={index}
                    onClick={() => handleTrendingClick(trend)}
                    className="w-full text-left px-3 py-2 rounded hover:bg-gray-50 text-sm text-gray-700 flex items-center gap-2"
                  >
                    <Clock className="w-3 h-3 text-gray-400" />
                    {trend}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {query.length === 0 && results.length === 0 && suggestions.length === 0 && (
            <div className="p-8 text-center">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Start typing to search</p>
              <p className="text-sm text-gray-500">Search across presentations, volunteers, schools, events, and more</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
