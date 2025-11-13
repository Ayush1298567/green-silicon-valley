"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FileText, Clock, CheckCircle2, AlertCircle, Filter, Search } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ReviewItem {
  id: number;
  team_name: string | null;
  presentation_draft_url: string | null;
  slides_shared: boolean;
  presentation_status: string;
  last_comment_at: string | null;
  comment_count: number;
  created_at: string;
  topic: {
    name: string;
  } | null;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadReviews();
  }, [statusFilter]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/volunteers/reviews");
      const data = await res.json();
      
      if (data.ok) {
        let filtered = data.reviews || [];
        
        // Apply status filter
        if (statusFilter !== "all") {
          filtered = filtered.filter((r: ReviewItem) => r.presentation_status === statusFilter);
        }
        
        // Apply search filter
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          filtered = filtered.filter((r: ReviewItem) =>
            r.team_name?.toLowerCase().includes(query) ||
            r.topic?.name?.toLowerCase().includes(query)
          );
        }
        
        setReviews(filtered);
      }
    } catch (error) {
      console.error("Error loading reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
      case "completed":
        return "bg-green-100 text-green-800";
      case "submitted_for_review":
      case "in_review":
        return "bg-blue-100 text-blue-800";
      case "needs_changes":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle2 className="w-4 h-4" />;
      case "needs_changes":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const pendingCount = reviews.filter(r => 
    r.presentation_status === "submitted_for_review" || 
    r.presentation_status === "in_review"
  ).length;

  return (
    <div className="container py-14">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gsv-charcoal mb-2">Presentation Reviews</h1>
        <p className="text-gsv-gray">
          Review volunteer presentations and provide feedback
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6 flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[300px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gsv-gray w-4 h-4" />
            <input
              type="text"
              placeholder="Search by team name or topic..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                loadReviews();
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green"
            />
          </div>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green"
        >
          <option value="all">All Status</option>
          <option value="submitted_for_review">Pending Review ({pendingCount})</option>
          <option value="in_review">In Review</option>
          <option value="needs_changes">Needs Changes</option>
          <option value="approved">Approved</option>
          <option value="scheduled">Scheduled</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="text-center py-12 text-gsv-gray">Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div className="card p-12 text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gsv-gray text-lg">No reviews found</p>
          <p className="text-gsv-gray text-sm mt-2">
            {statusFilter === "all" 
              ? "No presentations submitted for review yet."
              : `No presentations with status "${statusFilter}".`}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {reviews.map((review) => (
            <Link
              key={review.id}
              href={`/dashboard/founder/volunteers/${review.id}/review`}
              className="card p-6 hover:shadow-lg transition border-l-4 border-l-gsv-green"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gsv-charcoal mb-1">
                    {review.team_name || `Team #${review.id}`}
                  </h3>
                  {review.topic && (
                    <p className="text-sm text-gsv-gray mb-2">{review.topic.name}</p>
                  )}
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(review.presentation_status || "draft")}`}>
                  {getStatusIcon(review.presentation_status || "draft")}
                  {review.presentation_status || "draft"}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                {review.presentation_draft_url ? (
                  <div className="flex items-center gap-2 text-gsv-green">
                    <FileText className="w-4 h-4" />
                    <span className="truncate">Presentation link available</span>
                    {review.slides_shared ? (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Shared</span>
                    ) : (
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">Not Shared</span>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-gsv-gray">
                    <FileText className="w-4 h-4" />
                    <span>No presentation link yet</span>
                  </div>
                )}

                {review.comment_count > 0 && (
                  <div className="flex items-center gap-2 text-gsv-gray">
                    <span>{review.comment_count} comment{review.comment_count !== 1 ? "s" : ""}</span>
                    {review.last_comment_at && (
                      <span className="text-xs">
                        • Last {formatDistanceToNow(new Date(review.last_comment_at), { addSuffix: true })}
                      </span>
                    )}
                  </div>
                )}

                <div className="text-xs text-gsv-gray">
                  Submitted {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <span className="text-gsv-green hover:underline text-sm font-medium">
                  Review →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

