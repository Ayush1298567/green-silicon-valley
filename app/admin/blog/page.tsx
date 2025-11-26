"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  FileText,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit3,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
  Tag,
  MessageSquare,
  Heart,
  Eye as EyeIcon
} from "lucide-react";
import Link from "next/link";
import { VisibilityBadge } from "@/components/admin/VisibilityControl";

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
  published_at?: string;
  created_by: string;
  read_time: number;
  views: number;
  likes: number;
  author?: {
    name: string;
    email: string;
  };
}

const STATUS_OPTIONS = [
  { value: "all", label: "All Posts", color: "bg-gray-100 text-gray-800" },
  { value: "draft", label: "Drafts", color: "bg-yellow-100 text-yellow-800" },
  { value: "submitted", label: "Under Review", color: "bg-blue-100 text-blue-800" },
  { value: "published", label: "Published", color: "bg-green-100 text-green-800" },
  { value: "archived", label: "Archived", color: "bg-red-100 text-red-800" }
];

export default function BlogManagementPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  const supabase = createClientComponentClient();

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("intern_blog_posts")
        .select(`
          *,
          author:created_by(name, email)
        `)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error("Error loading blog posts:", error);
    } finally {
      setLoading(false);
    }
  }

  async function updatePostStatus(postId: string, newStatus: string) {
    try {
      const updateData: any = { status: newStatus };

      if (newStatus === "published" && !posts.find(p => p.id === postId)?.published_at) {
        updateData.published_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("intern_blog_posts")
        .update(updateData)
        .eq("id", postId);

      if (error) throw error;

      setPosts(posts.map(post =>
        post.id === postId ? { ...post, ...updateData } : post
      ));
    } catch (error) {
      console.error("Error updating post status:", error);
      alert("Failed to update post status");
    }
  }

  async function deletePost(postId: string) {
    if (!confirm("Are you sure you want to delete this blog post? This action cannot be undone.")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("intern_blog_posts")
        .delete()
        .eq("id", postId);

      if (error) throw error;

      setPosts(posts.filter(post => post.id !== postId));
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Failed to delete post");
    }
  }

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.author?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || post.status === statusFilter;
    const matchesDepartment = departmentFilter === "all" || post.department === departmentFilter;

    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const departments = [...new Set(posts.map(post => post.department))];

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Blog Management</h1>
            <p className="text-gray-600 mt-2">Manage blog posts with publishing workflow</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/admin/blog/review"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              Review Queue
            </Link>
            <Link
              href="/admin/blog/new"
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Post
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          label="Total Posts"
          value={posts.length}
          icon={FileText}
          color="bg-blue-500"
        />
        <StatCard
          label="Published"
          value={posts.filter(p => p.status === "published").length}
          icon={CheckCircle}
          color="bg-green-500"
        />
        <StatCard
          label="Under Review"
          value={posts.filter(p => p.status === "submitted").length}
          icon={Clock}
          color="bg-yellow-500"
        />
        <StatCard
          label="Total Views"
          value={posts.reduce((sum, p) => sum + p.views, 0)}
          icon={EyeIcon}
          color="bg-purple-500"
        />
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {STATUS_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Posts List */}
      {filteredPosts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No blog posts found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || statusFilter !== "all" || departmentFilter !== "all"
              ? "Try adjusting your search or filters"
              : "Get started by creating your first blog post"}
          </p>
          <Link
            href="/admin/blog/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create First Post
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <BlogPostCard
              key={post.id}
              post={post}
              onStatusChange={(newStatus) => updatePostStatus(post.id, newStatus)}
              onDelete={() => deletePost(post.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }: {
  label: string;
  value: number;
  icon: any;
  color: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="ml-4">
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-600">{label}</p>
        </div>
      </div>
    </div>
  );
}

function BlogPostCard({
  post,
  onStatusChange,
  onDelete
}: {
  post: BlogPost;
  onStatusChange: (status: string) => void;
  onDelete: () => void;
}) {
  const [showActions, setShowActions] = useState(false);

  const getStatusBadge = (status: string) => {
    const option = STATUS_OPTIONS.find(opt => opt.value === status);
    return option || STATUS_OPTIONS[0];
  };

  const statusBadge = getStatusBadge(post.status);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                {post.is_director_note ? (
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-purple-600" />
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                    {post.title}
                  </h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge.color}`}>
                    {statusBadge.label}
                  </span>
                  {post.is_director_note && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      Director Note
                    </span>
                  )}
                </div>

                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {post.excerpt}
                </p>

                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>{post.author?.name || "Unknown"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(post.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <EyeIcon className="w-4 h-4" />
                    <span>{post.views} views</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    <span>{post.likes} likes</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Department:</span>
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-800">
                    {post.department}
                  </span>
                  <VisibilityBadge visibility={post.permitted_roles || []} />
                </div>

                {post.tags && post.tags.length > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    <Tag className="w-4 h-4 text-gray-400" />
                    <div className="flex gap-1">
                      {post.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                          {tag}
                        </span>
                      ))}
                      {post.tags.length > 3 && (
                        <span className="text-xs text-gray-500">+{post.tags.length - 3} more</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showActions && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowActions(false)} />
                <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                  <div className="py-1">
                    <Link
                      href={`/admin/blog/${post.id}/edit`}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit Post
                    </Link>
                    <Link
                      href={`/blog/${post.id}`}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Post
                    </Link>

                    {post.status === "draft" && (
                      <button
                        onClick={() => onStatusChange("submitted")}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Submit for Review
                      </button>
                    )}

                    {post.status === "submitted" && (
                      <>
                        <button
                          onClick={() => onStatusChange("published")}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Publish
                        </button>
                        <button
                          onClick={() => onStatusChange("draft")}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </button>
                      </>
                    )}

                    {post.status === "published" && (
                      <button
                        onClick={() => onStatusChange("archived")}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Archive
                      </button>
                    )}

                    <button
                      onClick={onDelete}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Delete
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}