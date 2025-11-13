"use client";
import { MessageSquare, Mail, FileText, Send, TrendingUp, Users } from "lucide-react";
import Link from "next/link";
import { type UserRow, type BlogPostsRow, type BulletinPostsRow, type EmailTemplatesRow } from "@/types/db";

interface CommunicationsDepartmentInterfaceProps {
  user: UserRow | null;
  blogPosts: BlogPostsRow[];
  bulletinPosts: BulletinPostsRow[];
  emailTemplates: EmailTemplatesRow[];
}

export default function CommunicationsDepartmentInterface({ user, blogPosts, bulletinPosts, emailTemplates }: CommunicationsDepartmentInterfaceProps) {
  const publishedBlogPosts = blogPosts.filter(p => p.published).length;
  const activeBulletins = bulletinPosts.filter(p => p.published).length;

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="card p-6">
        <h2 className="font-semibold text-lg mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-4 gap-3">
          <Link href="/admin/blog" className="p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-center">
            <FileText className="w-6 h-6 mx-auto mb-2" />
            <div className="text-sm font-medium">Write Blog Post</div>
          </Link>
          <Link href="/dashboard/founder/bulletin" className="p-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-center">
            <MessageSquare className="w-6 h-6 mx-auto mb-2" />
            <div className="text-sm font-medium">Create Bulletin</div>
          </Link>
          <button className="p-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition text-center">
            <Mail className="w-6 h-6 mx-auto mb-2" />
            <div className="text-sm font-medium">Send Newsletter</div>
          </button>
          <button className="p-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition text-center">
            <Send className="w-6 h-6 mx-auto mb-2" />
            <div className="text-sm font-medium">Press Release</div>
          </button>
        </div>
      </div>

      {/* Communications Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <StatCard icon={<FileText />} label="Blog Posts" value={blogPosts.length} color="blue" />
        <StatCard icon={<TrendingUp />} label="Published" value={publishedBlogPosts} color="green" />
        <StatCard icon={<MessageSquare />} label="Bulletins" value={bulletinPosts.length} color="purple" />
        <StatCard icon={<Mail />} label="Email Templates" value={emailTemplates.length} color="orange" />
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Blog Posts */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Recent Blog Posts</h3>
            <Link href="/admin/blog" className="text-sm text-gsv-green hover:underline">
              View All
            </Link>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {blogPosts.slice(0, 6).map((post) => (
              <div key={post.id} className="p-3 border rounded-lg hover:bg-gray-50 transition">
                <div className="font-medium text-sm">{post.title}</div>
                <div className="flex items-center justify-between mt-2 text-xs">
                  <span className="text-gsv-gray">
                    {post.created_at ? new Date(post.created_at).toLocaleDateString() : ""}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full ${
                    post.published ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                  }`}>
                    {post.published ? "Published" : "Draft"}
                  </span>
                </div>
              </div>
            ))}
            {blogPosts.length === 0 && <p className="text-sm text-gsv-gray text-center py-4">No blog posts yet</p>}
          </div>
        </div>

        {/* Recent Bulletins */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Recent Bulletins</h3>
            <Link href="/dashboard/founder/bulletin" className="text-sm text-gsv-green hover:underline">
              View All
            </Link>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {bulletinPosts.slice(0, 6).map((post) => (
              <div key={post.id} className="p-3 border rounded-lg hover:bg-gray-50 transition">
                <div className="font-medium text-sm">{post.title}</div>
                <div className="flex items-center justify-between mt-2 text-xs">
                  <span className="text-gsv-gray">
                    {post.created_at ? new Date(post.created_at).toLocaleDateString() : ""}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full ${
                    post.published ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                  }`}>
                    {post.published ? "Active" : "Draft"}
                  </span>
                </div>
              </div>
            ))}
            {bulletinPosts.length === 0 && <p className="text-sm text-gsv-gray text-center py-4">No bulletins yet</p>}
          </div>
        </div>
      </div>

      {/* Email Templates */}
      <div className="card p-6">
        <h3 className="font-semibold text-lg mb-4">Email Templates</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {emailTemplates.map((template) => (
            <button key={template.id} className="border rounded-lg p-4 hover:border-gsv-green hover:bg-green-50 transition text-left">
              <h4 className="font-semibold text-sm mb-2">{template.name}</h4>
              <p className="text-xs text-gsv-gray mb-2">{template.description || "No description"}</p>
              <span className="text-xs text-gsv-green font-medium">Use Template →</span>
            </button>
          ))}
          {emailTemplates.length === 0 && (
            <div className="col-span-3">
              <TemplateCard title="Welcome Email" description="For new volunteers and interns joining the team" />
              <TemplateCard title="Event Announcement" description="Announce upcoming events, trainings, or meetings" />
              <TemplateCard title="Newsletter Template" description="Monthly update newsletter for all stakeholders" />
            </div>
          )}
        </div>
      </div>

      {/* Communications Guidelines */}
      <div className="card p-6">
        <h3 className="font-semibold text-lg mb-4">Communications Best Practices</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <GuidelineItem 
            title="Tone & Voice" 
            description="Professional yet approachable. Emphasize impact, sustainability, and community." 
          />
          <GuidelineItem 
            title="Brand Consistency" 
            description="Use GSV colors, logos, and approved templates for all communications." 
          />
          <GuidelineItem 
            title="Approval Process" 
            description="All external communications must be reviewed by a founder before publishing." 
          />
          <GuidelineItem 
            title="Response Time" 
            description="Respond to inquiries within 24 hours. Acknowledge emails within 2 business days." 
          />
        </div>
      </div>
    </div>
  );
}

const StatCard = ({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) => {
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

const TemplateCard = ({ title, description }: { title: string; description: string }) => (
  <button className="border rounded-lg p-4 hover:border-gsv-green hover:bg-green-50 transition text-left mb-3">
    <h4 className="font-semibold text-sm mb-2">{title}</h4>
    <p className="text-xs text-gsv-gray">{description}</p>
  </button>
);

const GuidelineItem = ({ title, description }: { title: string; description: string }) => (
  <div className="p-4 bg-gray-50 rounded-lg">
    <h4 className="font-semibold text-sm mb-2">{title}</h4>
    <p className="text-xs text-gsv-gray">{description}</p>
  </div>
);

