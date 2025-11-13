"use client";
import { useState } from "react";
import { X, Save } from "lucide-react";

interface CreateTemplateModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateTemplateModal({ onClose, onSuccess }: CreateTemplateModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    bodyHtml: "",
    bodyText: "",
    category: "presentation",
    variables: "{{name}}, {{date}}",
    isActive: true,
  });
  const [creating, setCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const res = await fetch("/api/email-templates/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        onSuccess();
        alert("Template created successfully!");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to create template");
      }
    } catch (error) {
      console.error("Error creating template:", error);
      alert("Error creating template");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full my-8">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-xl">
          <h2 className="text-2xl font-bold text-gsv-charcoal">Create Email Template</h2>
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
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gsv-charcoal mb-1">
                Template Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Welcome Email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gsv-charcoal mb-1">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="presentation">Presentation</option>
                <option value="volunteer">Volunteer</option>
                <option value="onboarding">Onboarding</option>
                <option value="reminder">Reminder</option>
                <option value="report">Report</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gsv-charcoal mb-1">
              Email Subject *
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Welcome to Green Silicon Valley!"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gsv-charcoal mb-1">
              Email Body (Plain Text) *
            </label>
            <textarea
              value={formData.bodyText}
              onChange={(e) => setFormData({ ...formData, bodyText: e.target.value })}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              placeholder="Hi {{name}},&#10;&#10;Welcome to GSV!&#10;&#10;Your next presentation is on {{date}}..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gsv-charcoal mb-1">
              Email Body (HTML) - Optional
            </label>
            <textarea
              value={formData.bodyHtml}
              onChange={(e) => setFormData({ ...formData, bodyHtml: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              placeholder="<p>Hi {{name}},</p><p>Welcome to GSV!</p>"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gsv-charcoal mb-1">
              Available Variables
            </label>
            <input
              type="text"
              value={formData.variables}
              onChange={(e) => setFormData({ ...formData, variables: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="{{name}}, {{date}}, {{school_name}}"
            />
            <p className="text-xs text-gsv-gray mt-1">
              Comma-separated list of variables that can be used in this template
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
            />
            <label htmlFor="isActive" className="text-sm text-gsv-charcoal">
              Mark as active
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gsv-charcoal rounded-lg hover:bg-gray-50 transition"
              disabled={creating}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="inline-flex items-center gap-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {creating ? "Creating..." : "Create Template"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

