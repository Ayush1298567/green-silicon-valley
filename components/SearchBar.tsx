"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

interface SearchResult {
  id: number;
  content_type: string;
  content_id: string;
  title: string;
  content: string;
  metadata?: any;
}

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length >= 2) {
      const timeoutId = setTimeout(() => {
        performSearch();
        fetchSuggestions();
      }, 300);

      return () => clearTimeout(timeoutId);
    } else {
      setResults([]);
      setSuggestions([]);
    }
  }, [query]);

  const performSearch = async () => {
    if (query.length < 2) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=5`);
      const data = await res.json();
      if (data.ok) {
        setResults(data.results || []);
        setShowResults(true);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestions = async () => {
    try {
      const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.ok) {
        setSuggestions(data.suggestions || []);
      }
    } catch (error) {
      // Ignore suggestions errors
    }
  };

  const handleResultClick = (result: SearchResult) => {
    setShowResults(false);
    setQuery("");

    // Navigate based on content type
    const routes: Record<string, string> = {
      blog_post: `/blog/${result.metadata?.slug || result.content_id}`,
      user: `/dashboard/founder/users/${result.content_id}`,
      volunteer: `/dashboard/founder/volunteers/${result.content_id}`,
      presentation: `/dashboard/founder/presentations/${result.content_id}`,
      event: `/dashboard/founder/calendar?event=${result.content_id}`,
      school: `/dashboard/founder/schools/${result.content_id}`
    };

    const route = routes[result.content_type];
    if (route) {
      router.push(route);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setShowResults(false);
    } else if (e.key === "Enter" && query.length >= 2) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
      setShowResults(false);
    }
  };

  return (
    <div ref={searchRef} className="relative flex-1 max-w-2xl">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gsv-gray w-5 h-5" />
        <input
          type="text"
          placeholder="Search... (Ctrl+K)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && setShowResults(true)}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setResults([]);
              setShowResults(false);
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gsv-gray hover:text-gsv-charcoal"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {showResults && (results.length > 0 || suggestions.length > 0 || loading) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {loading && (
            <div className="p-4 text-center text-gsv-gray">Searching...</div>
          )}

          {!loading && results.length > 0 && (
            <div className="py-2">
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Results</div>
              {results.map((result) => (
                <button
                  key={`${result.content_type}-${result.content_id}`}
                  onClick={() => handleResultClick(result)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-0"
                >
                  <div className="font-medium text-gsv-charcoal">{result.title || "Untitled"}</div>
                  <div className="text-sm text-gsv-gray mt-1 line-clamp-2">
                    {result.content?.substring(0, 100)}...
                  </div>
                  <div className="text-xs text-gray-400 mt-1 capitalize">{result.content_type.replace("_", " ")}</div>
                </button>
              ))}
              <div className="px-4 py-2 border-t border-gray-200">
                <button
                  onClick={() => {
                    router.push(`/search?q=${encodeURIComponent(query)}`);
                    setShowResults(false);
                  }}
                  className="text-sm text-gsv-green hover:text-gsv-greenDark font-medium"
                >
                  View all results →
                </button>
              </div>
            </div>
          )}

          {!loading && results.length === 0 && suggestions.length > 0 && (
            <div className="py-2">
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Suggestions</div>
              {suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuery(suggestion);
                    performSearch();
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 text-gsv-charcoal"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {!loading && results.length === 0 && suggestions.length === 0 && query.length >= 2 && (
            <div className="p-4 text-center text-gsv-gray">No results found</div>
          )}
        </div>
      )}
    </div>
  );
}

