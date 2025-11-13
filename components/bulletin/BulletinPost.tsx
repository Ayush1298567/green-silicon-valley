"use client";
import { Pin, Calendar, User, Eye, MessageSquare } from "lucide-react";

interface BulletinPostProps {
  post: any; // Extended BulletinPostsRow with author info
  isPinned?: boolean;
}

export default function BulletinPost({ post, isPinned }: BulletinPostProps) {
  const getCategoryColor = (category?: string) => {
    if (category === "announcement") return "bg-blue-100 text-blue-800";
    if (category === "event") return "bg-purple-100 text-purple-800";
    if (category === "reminder") return "bg-yellow-100 text-yellow-800";
    if (category === "celebration") return "bg-pink-100 text-pink-800";
    return "bg-gray-100 text-gray-800";
  };

  return (
    <div className={`card p-6 ${isPinned ? "border-2 border-gsv-green" : ""} hover:shadow-lg transition`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {isPinned && (
            <div className="flex-shrink-0">
              <Pin className="w-5 h-5 text-gsv-green fill-gsv-green" />
            </div>
          )}
          <div>
            <h3 className="font-semibold text-xl text-gsv-charcoal">{post.title}</h3>
            <div className="flex items-center gap-3 mt-1 text-sm text-gsv-gray">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>{post.author?.name || "Unknown"}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{post.created_at ? new Date(post.created_at).toLocaleDateString() : ""}</span>
              </div>
            </div>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(post.category)}`}>
          {post.category}
        </span>
      </div>

      {/* Content */}
      <div className="prose prose-sm max-w-none mb-4">
        <p className="text-gsv-gray">{post.content}</p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t text-sm text-gsv-gray">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            <span>{post.view_count || 0} views</span>
          </div>
          {post.allow_comments && (
            <button className="flex items-center gap-1 hover:text-gsv-green transition">
              <MessageSquare className="w-4 h-4" />
              <span>Comments</span>
            </button>
          )}
        </div>
        {post.expires_at && new Date(post.expires_at) > new Date() && (
          <span className="text-xs">
            Expires {new Date(post.expires_at).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
}

