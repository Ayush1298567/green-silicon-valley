"use client";
import { Camera, Image as ImageIcon, Video, Share2, TrendingUp, Calendar } from "lucide-react";
import Link from "next/link";
import { type UserRow, type BlogPostsRow, type BulletinPostsRow } from "@/types/db";

interface MediaDepartmentInterfaceProps {
  user: UserRow | null;
  blogPosts: BlogPostsRow[];
  bulletinPosts: BulletinPostsRow[];
}

export default function MediaDepartmentInterface({ user, blogPosts, bulletinPosts }: MediaDepartmentInterfaceProps) {
  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="card p-6">
        <h2 className="font-semibold text-lg mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-4 gap-3">
          <Link href="/admin/blog" className="p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-center">
            <Camera className="w-6 h-6 mx-auto mb-2" />
            <div className="text-sm font-medium">Create Post</div>
          </Link>
          <Link href="/admin/data" className="p-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-center">
            <TrendingUp className="w-6 h-6 mx-auto mb-2" />
            <div className="text-sm font-medium">Analytics</div>
          </Link>
          <button className="p-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition text-center">
            <ImageIcon className="w-6 h-6 mx-auto mb-2" />
            <div className="text-sm font-medium">Photo Gallery</div>
          </button>
          <button className="p-4 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition text-center">
            <Video className="w-6 h-6 mx-auto mb-2" />
            <div className="text-sm font-medium">Video Library</div>
          </button>
        </div>
      </div>

      {/* Media Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <StatCard icon={<Camera />} label="Blog Posts" value={blogPosts.length} color="blue" />
        <StatCard icon={<Share2 />} label="Published" value={blogPosts.filter(p => p.published).length} color="green" />
        <StatCard icon={<Calendar />} label="Bulletins" value={bulletinPosts.length} color="purple" />
        <StatCard icon={<TrendingUp />} label="Reach" value="Coming Soon" color="orange" />
      </div>

      {/* Content Management */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Blog Posts */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Recent Blog Posts</h3>
            <Link href="/admin/blog" className="text-sm text-gsv-green hover:underline">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {blogPosts.slice(0, 5).map((post) => (
              <div key={post.id} className="p-3 border rounded-lg hover:bg-gray-50 transition">
                <div className="font-medium text-sm">{post.title}</div>
                <div className="flex items-center justify-between mt-2 text-xs text-gsv-gray">
                  <span>{post.created_at ? new Date(post.created_at).toLocaleDateString() : ""}</span>
                  <span className={`px-2 py-0.5 rounded-full ${post.published ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                    {post.published ? "Published" : "Draft"}
                  </span>
                </div>
              </div>
            ))}
            {blogPosts.length === 0 && <p className="text-sm text-gsv-gray text-center py-4">No blog posts yet</p>}
          </div>
        </div>

        {/* Social Media Calendar */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Content Calendar</h3>
            <button className="text-sm text-gsv-green hover:underline">Add Event</button>
          </div>
          <div className="text-center text-gsv-gray py-8">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Content calendar integration coming soon</p>
          </div>
        </div>
      </div>

      {/* Department Resources */}
      <div className="card p-6">
        <h3 className="font-semibold text-lg mb-4">Media Resources & Guidelines</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <ResourceCard title="Brand Guidelines" description="Logo, colors, fonts, and visual identity standards" />
          <ResourceCard title="Photography Guide" description="Best practices for event and presentation photography" />
          <ResourceCard title="Social Media Policy" description="Guidelines for posting on GSV social channels" />
        </div>
      </div>
    </div>
  );
}

const StatCard = ({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number | string; color: string }) => {
  const colorClasses: { [key: string]: string } = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
  };

  return (
    <div className="card p-4">
      <div className={`inline-flex p-2 rounded-lg ${colorClasses[color]} mb-2`}>{icon}</div>
      <div className="text-2xl font-bold text-gsv-charcoal">{value}</div>
      <div className="text-sm text-gsv-gray">{label}</div>
    </div>
  );
};

const ResourceCard = ({ title, description }: { title: string; description: string }) => (
  <div className="border rounded-lg p-4 hover:border-gsv-green transition cursor-pointer">
    <h4 className="font-semibold text-sm mb-2">{title}</h4>
    <p className="text-xs text-gsv-gray">{description}</p>
  </div>
);

