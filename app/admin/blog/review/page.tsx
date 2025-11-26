"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  FileText,
  CheckCircle,
  XCircle,
  MessageSquare,
  Eye,
  Clock,
  User,
  Calendar,
  Tag,
  ArrowLeft,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  Edit3
} from "lucide-react";
import Link from "next/link";
import RichTextEditor from "@/components/admin/RichTextEditor";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  department: string;
  tags: string[];
  is_director_note: boolean;
  status: string;
  permitted_roles: string[];
  permitted_editors: string[];
  submitted_for_review_at?: string;
  reviewed_by?: string;
  review_notes?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  read_time: number;
  views: number;
  likes: number;
  author?: {
    name: string;
    email: string;
  };
}

export default function BlogReviewPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [reviewingPost, setReviewingPost] = useState<string | null>(null);

  const supabase = createClientComponentClient();

  useEffect(() => {
    loadPostsForReview();
  }, []);

  async function loadPostsForReview() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("intern_blog_posts")
        .select(`
          *,
          author:created_by(name, email)
        `)
        .eq("status", "submitted")
        .order("submitted_for_review_at", { ascending: true });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error("Error loading posts for review:", error);
    } finally {
      setLoading(false);
    }
  }

  async function reviewPost(postId: string, approved: boolean) {
    if (!approved && !reviewNotes.trim()) {
      alert("Please provide review notes for rejection.");
      return;
    }

    setReviewingPost(postId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) throw new Error("Not authenticated");

      const updateData: any = {
        status: approved ? "published" : "draft",
        reviewed_by: session.user.id,
        review_notes: reviewNotes,
        updated_at: new Date().toISOString()
      };

      if (approved) {
        updateData.published_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("intern_blog_posts")
        .update(updateData)
        .eq("id", postId);

      if (error) throw error;

      // Send notification to author
      await sendReviewNotification(postId, approved, reviewNotes);

      // Update local state
      setPosts(posts.filter(post => post.id !== postId));
      setSelectedPost(null);
      setReviewNotes("");

      alert(`Post ${approved ? 'approved and published' : 'rejected with feedback'}`);

    } catch (error: any) {
      console.error("Error reviewing post:", error);
      alert("Failed to review post: " + error.message);
    } finally {
      setReviewingPost(null);
    }
  }

  async function sendReviewNotification(postId: string, approved: boolean, notes: string) {
    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      await supabase.from("notifications").insert({
        user_id: post.created_by,
        notification_type: "blog_review",
        title: approved ? "Blog Post Approved!" : "Blog Post Needs Revision",
        message: approved
          ? `Your blog post "${post.title}" has been approved and published!`
          : `Your blog post "${post.title}" needs revision. ${notes}`,
        action_url: approved ? `/blog/${postId}` : `/interns/blog/${postId}/edit`,
        metadata: {
          post_id: postId,
          approved,
          review_notes: notes
        }
      });
    } catch (error) {
      console.error("Error sending review notification:", error);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link
            href="/admin/blog"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog Management
          </Link>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Blog Review Queue</h1>
            <p className="text-gray-600 mt-2">Review and approve submitted blog posts</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              <Clock className="w-4 h-4 mr-1" />
              {posts.length} Pending Review
            </span>
          </div>
        </div>
      </div>

      {/* Review Interface */}
      {selectedPost ? (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Post Header */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{selectedPost.title}</h2>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>{selectedPost.author?.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Submitted {new Date(selectedPost.submitted_for_review_at || selectedPost.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Tag className="w-4 h-4" />
                    <span>{selectedPost.department}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedPost(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Post Content */}
          <div className="p-6 max-h-96 overflow-y-auto">
            <div className="prose max-w-none">
              <div dangerouslySetInnerHTML={{ __html: selectedPost.content }} />
            </div>
          </div>

          {/* Review Actions */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Review Notes (Required for Rejection)
                </label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Provide feedback, suggestions, or reasons for rejection..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => reviewPost(selectedPost.id, false)}
                  disabled={reviewingPost === selectedPost.id}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {reviewingPost === selectedPost.id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border border-white border-t-transparent" />
                  ) : (
                    <ThumbsDown className="w-4 h-4" />
                  )}
                  Request Revisions
                </button>

                <button
                  onClick={() => reviewPost(selectedPost.id, true)}
                  disabled={reviewingPost === selectedPost.id}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {reviewingPost === selectedPost.id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border border-white border-t-transparent" />
                  ) : (
                    <ThumbsUp className="w-4 h-4" />
                  )}
                  Approve & Publish
                </button>

                <Link
                  href={`/admin/blog/${selectedPost.id}/edit`}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit First
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Posts List */
        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Review queue is empty!</h3>
              <p className="text-gray-600 mb-6">All submitted posts have been reviewed.</p>
              <Link
                href="/admin/blog"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Back to Blog Management
              </Link>
            </div>
          ) : (
            posts.map((post) => (
              <ReviewPostCard
                key={post.id}
                post={post}
                onReview={() => setSelectedPost(post)}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

function ReviewPostCard({ post, onReview }: { post: BlogPost; onReview: () => void }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            {post.is_director_note ? (
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-purple-600" />
              </div>
            ) : (
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
            )}
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{post.title}</h3>
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{post.excerpt}</p>

            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>{post.author?.name}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date(post.submitted_for_review_at || post.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Tag className="w-4 h-4" />
                <span>{post.department}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/blog/${post.id}`}
            className="flex items-center gap-1 px-3 py-1 text-gray-600 hover:text-gray-900 border border-gray-300 rounded hover:bg-gray-50"
          >
            <Eye className="w-4 h-4" />
            Preview
          </Link>

          <button
            onClick={onReview}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            Review
          </button>
        </div>
      </div>
    </div>
  );
}
