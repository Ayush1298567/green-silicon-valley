"use client";
import { useState, useEffect, useRef } from "react";
import { Search, X, Clock, ArrowRight, Filter } from "lucide-react";
import Link from "next/link";

interface SearchResult {
  entity_type: string;
  entity_id: string;
  search_text: string;
  metadata: any;
  relevance_score: number;
  entity_data?: any;
  display_title: string;
  display_subtitle: string;
  url: string;
}

interface SearchSuggestion {
  text: string;
  type: string;
  count?: number;
  entityType?: string;
}

interface GlobalSearchBarProps {
  placeholder?: string;
  className?: string;
}

export default function GlobalSearchBar({ placeholder = "Search groups, volunteers, presentations...", className = "" }: GlobalSearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    // Handle clicks outside to close results
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length === 0) {
      setResults([]);
      setSuggestions([]);
      return;
    }

    const debounceTimer = setTimeout(() => {
      if (query.length >= 2) {
        fetchSuggestions();
        if (query.length >= 3) {
          performSearch();
        }
      }
    }, 200);

    return () => clearTimeout(debounceTimer);
  }, [query]);

  const fetchSuggestions = async () => {
    try {
      const res = await fetch(`/api/search/suggestions?query=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.ok) {
        setSuggestions(data.suggestions);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const performSearch = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/search/global?query=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.ok) {
        setResults(data.results);
        setShowResults(true);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    if (searchQuery.trim()) {
      // Save to recent searches
      const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
    }
    setShowResults(false);
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setSuggestions([]);
    setShowResults(false);
  };

  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case 'group': return '👥';
      case 'volunteer': return '👤';
      case 'presentation': return '📊';
      case 'school': return '🏫';
      default: return '🔍';
    }
  };

  const getEntityColor = (entityType: string) => {
    switch (entityType) {
      case 'group': return 'text-blue-600';
      case 'volunteer': return 'text-green-600';
      case 'presentation': return 'text-purple-600';
      case 'school': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (query || suggestions.length > 0 || results.length > 0) {
              setShowResults(true);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch(query);
            } else if (e.key === 'Escape') {
              setShowResults(false);
              inputRef.current?.blur();
            }
          }}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green focus:border-transparent"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {loading && (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gsv-green mx-auto"></div>
              <span className="text-sm ml-2">Searching...</span>
            </div>
          )}

          {/* Suggestions */}
          {!loading && suggestions.length > 0 && results.length === 0 && (
            <div className="p-2">
              <div className="text-xs text-gray-500 uppercase tracking-wide px-2 py-1">Suggestions</div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSearch(suggestion.text)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <Search className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700">{suggestion.text}</span>
                    <span className="text-xs text-gray-400 capitalize">{suggestion.type}</span>
                  </div>
                  {suggestion.count && suggestion.count > 0 && (
                    <span className="text-xs text-gray-400">{suggestion.count}</span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Search Results */}
          {!loading && results.length > 0 && (
            <div className="p-2">
              <div className="text-xs text-gray-500 uppercase tracking-wide px-2 py-1 flex items-center justify-between">
                <span>Results</span>
                <span>{results.length}</span>
              </div>
              {results.map((result, index) => (
                <Link
                  key={index}
                  href={result.url}
                  onClick={() => setShowResults(false)}
                  className="block px-3 py-3 hover:bg-gray-50 rounded group"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-lg">{getEntityIcon(result.entity_type)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {result.display_title}
                      </div>
                      <div className={`text-sm ${getEntityColor(result.entity_type)} capitalize`}>
                        {result.display_subtitle}
                      </div>
                      {result.entity_data?.status && (
                        <div className="text-xs text-gray-500 mt-1">
                          Status: {result.entity_data.status}
                        </div>
                      )}
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gsv-green transition-colors flex-shrink-0 mt-1" />
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Recent Searches */}
          {!loading && query.length === 0 && recentSearches.length > 0 && (
            <div className="p-2">
              <div className="text-xs text-gray-500 uppercase tracking-wide px-2 py-1">Recent Searches</div>
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => setQuery(search)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded flex items-center gap-3 group"
                >
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700">{search}</span>
                </button>
              ))}
            </div>
          )}

          {/* No Results */}
          {!loading && query.length >= 3 && results.length === 0 && suggestions.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No results found for &quot;{query}&quot;</p>
              <p className="text-xs mt-1">Try different keywords or check spelling</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
