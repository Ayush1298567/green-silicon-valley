"use client";
import { useState } from "react";
import { X, Link as LinkIcon, Save } from "lucide-react";

interface AddLinkModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddLinkModal({ onClose, onSuccess }: AddLinkModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    url: "",
    description: "",
    subcategory: "orientation",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate Google Docs URL
    if (!formData.url.includes("docs.google.com")) {
      alert("Please enter a valid Google Docs, Slides, or Sheets URL");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch("/api/resources/create-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          category: "training",
        }),
      });

      if (res.ok) {
        onSuccess();
        alert("Google link added successfully!");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to add link");
      }
    } catch (error) {
      console.error("Error adding link:", error);
      alert("Error adding link");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
        {/* Header */}
        <div className="border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gsv-charcoal">Add Google Docs/Slides Link</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
            <strong>Tip:</strong> Make sure your Google Doc/Slide/Sheet is set to “Anyone with the link can view” in sharing settings before adding it here.
          </div>

          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gsv-charcoal mb-1">
              Google Docs/Slides/Sheets URL *
            </label>
            <input
              type="url"
              id="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green"
              placeholder="https://docs.google.com/..."
              required
            />
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gsv-charcoal mb-1">
              Title *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green"
              placeholder="e.g., Presentation Slides Template"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gsv-charcoal mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green"
              placeholder="Brief description..."
            />
          </div>

          <div>
            <label htmlFor="subcategory" className="block text-sm font-medium text-gsv-charcoal mb-1">
              Category *
            </label>
            <select
              id="subcategory"
              value={formData.subcategory}
              onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green"
            >
              <option value="orientation">Orientation</option>
              <option value="presentation_skills">Presentation Skills</option>
              <option value="classroom_management">Classroom Management</option>
              <option value="safety">Safety & Protocols</option>
              <option value="activities">Activity Guides</option>
              <option value="general">General</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gsv-charcoal rounded-lg hover:bg-gray-50 transition"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? "Adding..." : "Add Link"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

