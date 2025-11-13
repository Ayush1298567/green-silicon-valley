"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Send, Eye } from "lucide-react";

export default function NewCampaignPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    preview_text: "",
    content_html: "",
    content_text: "",
    scheduled_for: ""
  });

  const handleSubmit = async (e: React.FormEvent, action: "save" | "send") => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/newsletter/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          scheduled_for: action === "send" ? null : formData.scheduled_for || null
        })
      });

      const data = await res.json();
      if (data.ok) {
        if (action === "send") {
          // Send campaign
          const sendRes = await fetch(`/api/newsletter/campaigns/${data.campaign.id}/send`, {
            method: "POST"
          });
          const sendData = await sendRes.json();
          if (sendData.ok) {
            router.push("/dashboard/founder/newsletter/campaigns");
          }
        } else {
          router.push("/dashboard/founder/newsletter/campaigns");
        }
      }
    } catch (error) {
      console.error("Error creating campaign:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gsv-charcoal">New Campaign</h1>
          <p className="text-gsv-gray mt-1">Create a new email campaign</p>
        </div>
      </div>

      <form onSubmit={(e) => handleSubmit(e, "save")} className="bg-white rounded-lg shadow p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gsv-charcoal mb-2">Campaign Name</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green"
            placeholder="Monthly Newsletter - November 2025"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gsv-charcoal mb-2">Subject Line</label>
          <input
            type="text"
            required
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green"
            placeholder="Your Monthly Update from Green Silicon Valley"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gsv-charcoal mb-2">Preview Text</label>
          <input
            type="text"
            value={formData.preview_text}
            onChange={(e) => setFormData({ ...formData, preview_text: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green"
            placeholder="A quick preview of what's inside..."
            maxLength={150}
          />
          <p className="text-xs text-gsv-gray mt-1">{formData.preview_text.length}/150</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gsv-charcoal mb-2">Email Content (HTML)</label>
          <textarea
            required
            value={formData.content_html}
            onChange={(e) => setFormData({ ...formData, content_html: e.target.value })}
            rows={15}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green font-mono text-sm"
            placeholder="<html><body><h1>Hello {name}!</h1><p>Your email content here...</p></body></html>"
          />
          <p className="text-xs text-gsv-gray mt-1">
            Use {"{name}"} and {"{email}"} for personalization
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gsv-charcoal mb-2">Plain Text Version</label>
          <textarea
            value={formData.content_text}
            onChange={(e) => setFormData({ ...formData, content_text: e.target.value })}
            rows={10}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green"
            placeholder="Plain text version of your email..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gsv-charcoal mb-2">Schedule Send (Optional)</label>
          <input
            type="datetime-local"
            value={formData.scheduled_for}
            onChange={(e) => setFormData({ ...formData, scheduled_for: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green"
          />
          <p className="text-xs text-gsv-gray mt-1">Leave empty to save as draft</p>
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-gray-200 text-gsv-charcoal rounded-lg hover:bg-gray-300 flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            Save Draft
          </button>
          <button
            type="button"
            onClick={(e) => handleSubmit(e, "send")}
            disabled={loading}
            className="px-6 py-2 bg-gsv-green text-white rounded-lg hover:bg-gsv-greenDark flex items-center gap-2 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            Send Now
          </button>
        </div>
      </form>
    </div>
  );
}

