"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { MessageSquare, Send, Edit2, Trash2, Lock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Comment {
  id: number;
  content: string;
  comment_type: string;
  is_internal: boolean;
  parent_comment_id: number | null;
  created_at: string;
  updated_at: string;
  author: {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
  };
}

interface CommentThreadProps {
  volunteerId?: number;
  presentationId?: number;
  currentUserId: string;
  currentUserRole: string;
}

export default function CommentThread({
  volunteerId,
  presentationId,
  currentUserId,
  currentUserRole
}: CommentThreadProps) {
  const supabase = createClientComponentClient();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [commentType, setCommentType] = useState<"update" | "question" | "feedback">("update");
  const [isInternal, setIsInternal] = useState(false);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");

  const isStaff = currentUserRole === "founder" || currentUserRole === "intern";

  useEffect(() => {
    loadComments();
    
    // Subscribe to new comments
    const channel = supabase
      .channel(`comments-${volunteerId || presentationId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "presentation_comments",
          filter: volunteerId ? `volunteer_id=eq.${volunteerId}` : `presentation_id=eq.${presentationId}`
        },
        () => {
          loadComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [volunteerId, presentationId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (volunteerId) params.append("volunteer_id", volunteerId.toString());
      if (presentationId) params.append("presentation_id", presentationId.toString());
      if (isStaff) params.append("include_internal", "true");

      const res = await fetch(`/api/comments?${params.toString()}`);
      const data = await res.json();
      
      if (data.ok) {
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error("Error loading comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          volunteer_id: volunteerId || null,
          presentation_id: presentationId || null,
          content: newComment,
          comment_type: commentType,
          is_internal: isInternal && isStaff,
          parent_comment_id: replyingTo
        })
      });

      const data = await res.json();
      if (data.ok) {
        setNewComment("");
        setReplyingTo(null);
        setIsInternal(false);
        loadComments();
      } else {
        alert(data.error || "Failed to post comment");
      }
    } catch (error) {
      console.error("Error posting comment:", error);
      alert("Failed to post comment");
    }
  };

  const handleEdit = async (id: number) => {
    if (!editContent.trim()) return;

    try {
      const res = await fetch(`/api/comments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editContent })
      });

      const data = await res.json();
      if (data.ok) {
        setEditingId(null);
        setEditContent("");
        loadComments();
      } else {
        alert(data.error || "Failed to update comment");
      }
    } catch (error) {
      console.error("Error updating comment:", error);
      alert("Failed to update comment");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    try {
      const res = await fetch(`/api/comments/${id}`, {
        method: "DELETE"
      });

      const data = await res.json();
      if (data.ok) {
        loadComments();
      } else {
        alert(data.error || "Failed to delete comment");
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert("Failed to delete comment");
    }
  };

  const getCommentTypeLabel = (type: string) => {
    switch (type) {
      case "update": return "Update";
      case "question": return "Question";
      case "feedback": return "Feedback";
      case "response": return "Response";
      default: return type;
    }
  };

  const renderComment = (comment: Comment, depth = 0) => {
    const isAuthor = comment.author.id === currentUserId;
    const canEdit = isAuthor || isStaff;
    const canDelete = isAuthor || isStaff;
    const isEditing = editingId === comment.id;

    return (
      <div
        key={comment.id}
        className={`${depth > 0 ? "ml-8 mt-3 border-l-2 border-gray-200 pl-4" : ""} ${
          comment.is_internal ? "bg-yellow-50 border-yellow-200" : "bg-white"
        } border rounded-lg p-4`}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="font-semibold text-gsv-charcoal">
              {comment.author.name || comment.author.email || "Unknown"}
            </div>
            {comment.is_internal && (
              <span className="flex items-center gap-1 text-xs text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded">
                <Lock className="w-3 h-3" />
                Internal
              </span>
            )}
            <span className="text-xs text-gsv-gray bg-gray-100 px-2 py-0.5 rounded">
              {getCommentTypeLabel(comment.comment_type)}
            </span>
            {comment.author.role === "founder" && (
              <span className="text-xs text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                Founder
              </span>
            )}
          </div>
          <div className="text-xs text-gsv-gray">
            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
          </div>
        </div>

        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              rows={3}
            />
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(comment.id)}
                className="px-3 py-1 bg-gsv-green text-white rounded hover:bg-gsv-greenDark text-sm"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setEditingId(null);
                  setEditContent("");
                }}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="text-gsv-charcoal mb-3 whitespace-pre-wrap">{comment.content}</div>
            <div className="flex items-center gap-2">
              {canEdit && (
                <button
                  onClick={() => {
                    setEditingId(comment.id);
                    setEditContent(comment.content);
                  }}
                  className="text-xs text-gsv-green hover:underline flex items-center gap-1"
                >
                  <Edit2 className="w-3 h-3" />
                  Edit
                </button>
              )}
              {canDelete && (
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="text-xs text-red-600 hover:underline flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete
                </button>
              )}
              {!replyingTo && (
                <button
                  onClick={() => {
                    setReplyingTo(comment.id);
                    setNewComment(`@${comment.author.name || comment.author.email} `);
                  }}
                  className="text-xs text-gsv-green hover:underline"
                >
                  Reply
                </button>
              )}
            </div>
          </>
        )}

        {/* Render replies */}
        {comments
          .filter((c) => c.parent_comment_id === comment.id)
          .map((reply) => renderComment(reply, depth + 1))}
      </div>
    );
  };

  if (loading) {
    return <div className="text-center py-8 text-gsv-gray">Loading comments...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5 text-gsv-green" />
        <h3 className="text-lg font-semibold text-gsv-charcoal">Comments</h3>
        <span className="text-sm text-gsv-gray">({comments.length})</span>
      </div>

      {/* Comments List */}
      <div className="space-y-3">
        {comments.filter((c) => !c.parent_comment_id).map((comment) => renderComment(comment))}
        {comments.length === 0 && (
          <div className="text-center py-8 text-gsv-gray">
            No comments yet. Be the first to comment!
          </div>
        )}
      </div>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="border-t pt-4 mt-6">
        {replyingTo && (
          <div className="mb-2 text-sm text-gsv-gray">
            Replying to comment.{" "}
            <button
              type="button"
              onClick={() => {
                setReplyingTo(null);
                setNewComment("");
              }}
              className="text-gsv-green hover:underline"
            >
              Cancel
            </button>
          </div>
        )}
        <div className="space-y-2">
          <div className="flex gap-2">
            <select
              value={commentType}
              onChange={(e) => setCommentType(e.target.value as any)}
              className="border rounded-lg px-3 py-2 text-sm"
            >
              <option value="update">Update</option>
              <option value="question">Question</option>
              <option value="feedback">Feedback</option>
            </select>
            {isStaff && (
              <label className="flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={isInternal}
                  onChange={(e) => setIsInternal(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm">Internal Note</span>
              </label>
            )}
          </div>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={
              replyingTo
                ? "Write your reply..."
                : commentType === "update"
                ? "Post an update (e.g., 'We finished the introduction slides')..."
                : commentType === "question"
                ? "Ask a question..."
                : "Share feedback..."
            }
            className="w-full border rounded-lg px-3 py-2 min-h-[100px]"
            rows={4}
          />
          <button
            type="submit"
            disabled={!newComment.trim()}
            className="px-4 py-2 bg-gsv-green text-white rounded-lg hover:bg-gsv-greenDark transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            Post {replyingTo ? "Reply" : "Comment"}
          </button>
        </div>
      </form>
    </div>
  );
}

