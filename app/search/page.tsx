"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search } from "lucide-react";
import SearchBar from "@/components/SearchBar";

interface SearchResult {
  id: number;
  content_type: string;
  content_id: string;
  title: string;
  content: string;
  tags?: string[];
  metadata?: any;
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const typeFilter = searchParams.get("type") || "all";

  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentQuery, setCurrentQuery] = useState(query);

  useEffect(() => {
    if (query) {
      performSearch(query, typeFilter);
      setCurrentQuery(query);
    }
  }, [query, typeFilter]);

  const performSearch = async (searchQuery: string, type: string) => {
    if (searchQuery.length < 2) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({ q: searchQuery, limit: "20" });
      if (type !== "all") {
        params.append("type", type);
      }

      const res = await fetch(`/api/search?${params.toString()}`);
      const data = await res.json();
      if (data.ok) {
        setResults(data.results || []);
        setTotal(data.total || 0);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRouteForResult = (result: SearchResult) => {
    const routes: Record<string, string> = {
      blog_post: `/blog/${result.metadata?.slug || result.content_id}`,
      user: `/dashboard/founder/users/${result.content_id}`,
      volunteer: `/dashboard/founder/volunteers/${result.content_id}`,
      presentation: `/dashboard/founder/presentations/${result.content_id}`,
      event: `/dashboard/founder/calendar?event=${result.content_id}`,
      school: `/dashboard/founder/schools/${result.content_id}`,
      document: `/dashboard/founder/documents/${result.content_id}`,
      photo: `/gallery/${result.content_id}`
    };
    return routes[result.content_type] || "#";
  };

  const contentTypes = [
    { value: "all", label: "All" },
    { value: "blog_post", label: "Blog Posts" },
    { value: "volunteer", label: "Volunteers" },
    { value: "presentation", label: "Presentations" },
    { value: "event", label: "Events" },
    { value: "school", label: "Schools" },
    { value: "document", label: "Documents" }
  ];

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gsv-charcoal mb-6">Search</h1>

        <div className="mb-6">
          <SearchBar />
        </div>

        {currentQuery && (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="text-gsv-gray">
                {loading ? (
                  "Searching..."
                ) : (
                  <>
                    Found {total} result{total !== 1 ? "s" : ""} for "{currentQuery}"
                  </>
                )}
              </div>
              <div className="flex gap-2">
                {contentTypes.map((ct) => (
                  <button
                    key={ct.value}
                    onClick={() => {
                      const params = new URLSearchParams({ q: currentQuery });
                      if (ct.value !== "all") params.append("type", ct.value);
                      window.location.href = `/search?${params.toString()}`;
                    }}
                    className={`px-3 py-1 rounded text-sm ${
                      typeFilter === ct.value
                        ? "bg-gsv-green text-white"
                        : "bg-gray-100 text-gsv-charcoal hover:bg-gray-200"
                    }`}
                  >
                    {ct.label}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12 text-gsv-gray">Loading results...</div>
            ) : results.length === 0 ? (
              <div className="text-center py-12">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gsv-gray">No results found for "{currentQuery}"</p>
                <p className="text-sm text-gsv-gray mt-2">Try different keywords or check your spelling</p>
              </div>
            ) : (
              <div className="space-y-4">
                {results.map((result) => (
                  <Link
                    key={`${result.content_type}-${result.content_id}`}
                    href={getRouteForResult(result)}
                    className="block bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs px-2 py-1 bg-gsv-green/20 text-gsv-green rounded capitalize">
                            {result.content_type.replace("_", " ")}
                          </span>
                        </div>
                        <h3 className="text-xl font-semibold text-gsv-charcoal mb-2">
                          {result.title || "Untitled"}
                        </h3>
                        <p className="text-gsv-gray line-clamp-3">
                          {result.content?.substring(0, 300)}...
                        </p>
                        {result.tags && result.tags.length > 0 && (
                          <div className="flex gap-2 mt-3">
                            {result.tags.slice(0, 3).map((tag, idx) => (
                              <span
                                key={idx}
                                className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}

        {!currentQuery && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gsv-gray text-lg">Enter a search query to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}

