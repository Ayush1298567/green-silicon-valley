"use client";
import { useState } from "react";
import { MessageSquare, Pin, Calendar, User, Filter } from "lucide-react";
import { type UserRow, type BulletinPostsRow } from "@/types/db";
import BulletinPost from "./BulletinPost";
import CreateBulletinModal from "./CreateBulletinModal";

interface BulletinBoardInterfaceProps {
  user: UserRow | null;
  bulletinPosts: any[]; // Extended with author info
}

export default function BulletinBoardInterface({ user, bulletinPosts }: BulletinBoardInterfaceProps) {
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const canPost = user?.role === "founder" || user?.role === "intern";

  // Filter posts
  const filteredPosts = categoryFilter === "all"
    ? bulletinPosts
    : bulletinPosts.filter(p => p.category === categoryFilter);

  // Separate pinned and regular posts
  const pinnedPosts = filteredPosts.filter(p => p.pinned);
  const regularPosts = filteredPosts.filter(p => !p.pinned);

  const categories = [
    { value: "all", label: "All Posts" },
    { value: "announcement", label: "Announcements" },
    { value: "event", label: "Events" },
    { value: "reminder", label: "Reminders" },
    { value: "celebration", label: "Celebrations" },
  ];

  return (
    <div className="space-y-6">
      {/* Filters & Actions */}
      <div className="card p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Category Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategoryFilter(cat.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  categoryFilter === cat.value
                    ? "bg-gsv-green text-white"
                    : "bg-gray-100 text-gsv-gray hover:bg-gray-200"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Create Button */}
          {canPost && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gsv-green text-white rounded-lg hover:bg-gsv-green/90 transition"
            >
              <MessageSquare className="w-4 h-4" />
              New Post
            </button>
          )}
        </div>
      </div>

      {/* Pinned Posts */}
      {pinnedPosts.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Pin className="w-5 h-5 text-gsv-green" />
            <h2 className="text-xl font-semibold">Pinned Posts</h2>
          </div>
          <div className="space-y-4">
            {pinnedPosts.map((post) => (
              <BulletinPost key={post.id} post={post} isPinned />
            ))}
          </div>
        </div>
      )}

      {/* Regular Posts */}
      <div>
        {pinnedPosts.length > 0 && (
          <h2 className="text-xl font-semibold mb-4">All Posts</h2>
        )}
        <div className="space-y-4">
          {regularPosts.length === 0 ? (
            <div className="card p-12 text-center">
              <MessageSquare className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gsv-gray">No posts to display</p>
              {canPost && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-4 text-sm text-gsv-green hover:underline"
                >
                  Create the first post
                </button>
              )}
            </div>
          ) : (
            regularPosts.map((post) => (
              <BulletinPost key={post.id} post={post} />
            ))
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateBulletinModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            // Refresh would happen here
          }}
        />
      )}
    </div>
  );
}

