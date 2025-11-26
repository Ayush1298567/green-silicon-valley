"use client";
import { useState, useEffect } from "react";
import { getServerComponentClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getDashboardPathForRole, type UserRole } from "@/lib/auth/roles";
import EventsManager from "@/components/admin/EventsManager";
import FAQManager from "@/components/admin/FAQManager";
import LeadershipManager from "@/components/admin/LeadershipManager";
import JoinRequestsManager from "@/components/admin/JoinRequestsManager";
import RichTextEditor from "@/components/admin/RichTextEditor";

export const dynamic = "force-dynamic";

const DEFAULT_KEYS = [
  { key: "home_hero_title", title: "Home Hero Title" },
  { key: "home_hero_subtitle", title: "Home Hero Subtitle" },
  { key: "about_body", title: "About Page Body" },
  { key: "footer_note", title: "Footer Note" }
];

type TabType = 'content' | 'events' | 'faqs' | 'leadership' | 'join-requests';

export default function ContentManagerPage() {
  const [activeTab, setActiveTab] = useState<TabType>('content');

  const tabs: { id: TabType; label: string; description: string }[] = [
    { id: 'content', label: 'Content Blocks', description: 'Edit public text blocks and page content' },
    { id: 'events', label: 'Events & Deadlines', description: 'Manage upcoming events and important dates' },
    { id: 'faqs', label: 'FAQ Management', description: 'Manage frequently asked questions' },
    { id: 'leadership', label: 'Leadership Profiles', description: 'Manage team member profiles and bios' },
    { id: 'join-requests', label: 'Team Join Requests', description: 'Review and manage volunteer team join requests' },
  ];

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
        <p className="text-gray-600 mt-2">Manage all aspects of your website content</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-gsv-green text-gsv-green'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'content' && <ContentBlocksTab />}
        {activeTab === 'events' && <EventsManager />}
        {activeTab === 'faqs' && <FAQManager />}
        {activeTab === 'leadership' && <LeadershipManager />}
        {activeTab === 'join-requests' && <JoinRequestsManager />}
      </div>
    </div>
  );
}

function ContentBlocksTab() {
  const [contentBlocks, setContentBlocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real implementation, this would fetch from the API
    setContentBlocks(DEFAULT_KEYS.map(key => ({
      ...key,
      content: '',
      title: key.title,
      version: 1,
      updated_at: new Date().toISOString()
    })));
    setLoading(false);
  }, []);

  const handleSave = async (key: string, title: string, content: string) => {
    try {
      const response = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, title, content }),
      });

      if (response.ok) {
        // Update local state
        setContentBlocks(prev =>
          prev.map(block =>
            block.key === key
              ? { ...block, title, content, version: block.version + 1, updated_at: new Date().toISOString() }
              : block
          )
        );
      } else {
        console.error('Failed to save content block');
      }
    } catch (error) {
      console.error('Error saving content block:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gsv-green"></div>
      </div>
    );
  }

  return (
    <>
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Content Blocks</h2>
        <p className="text-gray-600 mt-1">Edit public text blocks (safe HTML/markdown supported).</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {contentBlocks.map((block) => (
          <ContentBlockEditor
            key={block.key}
            block={block}
            onSave={handleSave}
          />
        ))}
      </div>
    </>
  );
}

function ContentBlockEditor({
  block,
  onSave
}: {
  block: any;
  onSave: (key: string, title: string, content: string) => void;
}) {
  const [title, setTitle] = useState(block.title || '');
  const [content, setContent] = useState(block.content || '');
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    onSave(block.key, title, content);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTitle(block.title || '');
    setContent(block.content || '');
    setIsEditing(false);
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-900">{block.title}</h3>
        <span className="text-xs text-gray-500">
          v{block.version} • {new Date(block.updated_at).toLocaleDateString()}
        </span>
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gsv-green focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <RichTextEditor
              content={content}
              onChange={setContent}
              placeholder="Enter rich content..."
              className="min-h-[200px]"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="bg-gsv-green text-white px-4 py-2 rounded-lg hover:bg-gsv-greenDark transition-colors"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">Title: {title || 'Not set'}</p>
            <p className="text-sm text-gray-600 mb-4">
              Content: {content ? `${content.substring(0, 100)}${content.length > 100 ? '...' : ''}` : 'Not set'}
            </p>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Edit
          </button>
        </div>
      )}
    </div>
  );
}

