"use client";

import { useState, useEffect } from "react";
import { Search, Filter, X, Command } from "lucide-react";

interface SearchResult {
  id: string;
  type: "presentation" | "user" | "chapter" | "resource" | "event";
  title: string;
  subtitle?: string;
  url: string;
}

interface StickyTopBarProps {
  onSearch?: (query: string) => void;
  onFilter?: (filters: any) => void;
}

export default function StickyTopBar({ onSearch, onFilter }: StickyTopBarProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === "Escape") {
        setIsSearchOpen(false);
        setSearchQuery("");
        setSearchResults([]);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      performSearch(searchQuery);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const performSearch = async (query: string) => {
    setIsSearching(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=8`);
      const data = await res.json();
      if (data.ok) {
        setSearchResults(data.results || []);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch?.(searchQuery);
      setIsSearchOpen(false);
    }
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case "presentation": return "📄";
      case "user": return "👤";
      case "chapter": return "🌍";
      case "resource": return "📁";
      case "event": return "📅";
      default: return "🔍";
    }
  };

  const filters = [
    { key: "type", label: "Content Type", options: ["All", "Presentations", "Users", "Chapters", "Resources", "Events"] },
    { key: "date", label: "Date Range", options: ["Any time", "Today", "This week", "This month", "This year"] },
    { key: "status", label: "Status", options: ["All", "Active", "Completed", "Pending", "Archived"] }
  ];

  return (
    <>
      {/* Sticky Top Bar */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="w-full flex items-center gap-3 px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-left text-sm text-gray-600 transition-colors"
              >
                <Search size={16} />
                <span>Search...</span>
                <div className="ml-auto flex items-center gap-1 text-xs text-gray-400">
                  <Command size={12} />
                  <span>K</span>
                </div>
              </button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  showFilters
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <Filter size={16} />
                Filters
              </button>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="border-t border-gray-200 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {filters.map((filter) => (
                  <div key={filter.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {filter.label}
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm">
                      {filter.options.map((option) => (
                        <option key={option} value={option.toLowerCase()}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => setShowFilters(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-25" onClick={() => setIsSearchOpen(false)}>
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 w-full max-w-2xl mx-4">
            <div className="bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden">
              {/* Search Input */}
              <form onSubmit={handleSearchSubmit} className="p-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <Search size={20} className="text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search presentations, users, chapters, resources..."
                    className="flex-1 text-lg border-0 focus:ring-0 focus:outline-none"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSearchQuery("");
                      setSearchResults([]);
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={20} />
                  </button>
                </div>
              </form>

              {/* Search Results */}
              <div className="max-h-96 overflow-y-auto">
                {searchQuery.length < 2 ? (
                  <div className="p-8 text-center text-gray-500">
                    <Search size={48} className="mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium mb-2">Start typing to search</p>
                    <p className="text-sm">Search across presentations, users, chapters, and resources</p>
                  </div>
                ) : isSearching ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Searching...</p>
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <Search size={48} className="mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium mb-2">No results found</p>
                    <p className="text-sm">Try adjusting your search terms</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {searchResults.map((result) => (
                      <a
                        key={result.id}
                        href={result.url}
                        onClick={() => setIsSearchOpen(false)}
                        className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-2xl">{getResultIcon(result.type)}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">
                            {result.title}
                          </div>
                          {result.subtitle && (
                            <div className="text-sm text-gray-600 truncate">
                              {result.subtitle}
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 capitalize px-2 py-1 bg-gray-100 rounded">
                          {result.type}
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 px-4 py-3 bg-gray-50">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center gap-4">
                    <span>Press ↵ to search</span>
                    <span>Press ⎋ to close</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Command size={12} />
                    <span>K</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
