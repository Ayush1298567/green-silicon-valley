"use client";
import { useState } from "react";
import { Mail, Plus, Edit, Trash2, Send, Copy } from "lucide-react";
import { type EmailTemplatesRow } from "@/types/db";
import CreateTemplateModal from "./CreateTemplateModal";
import EditTemplateModal from "./EditTemplateModal";

interface EmailTemplatesInterfaceProps {
  templates: EmailTemplatesRow[];
  canEdit: boolean;
}

export default function EmailTemplatesInterface({ templates, canEdit }: EmailTemplatesInterfaceProps) {
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplatesRow | null>(null);

  const filteredTemplates = categoryFilter === "all"
    ? templates
    : templates.filter(t => t.category === categoryFilter);

  const categories = [
    { value: "all", label: "All Templates" },
    { value: "presentation", label: "Presentations" },
    { value: "volunteer", label: "Volunteers" },
    { value: "onboarding", label: "Onboarding" },
    { value: "reminder", label: "Reminders" },
    { value: "report", label: "Reports" },
  ];

  const handleDelete = async (templateId: number) => {
    if (!confirm("Are you sure you want to delete this template?")) return;

    try {
      const res = await fetch(`/api/email-templates/${templateId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        window.location.reload();
      } else {
        alert("Failed to delete template");
      }
    } catch (error) {
      console.error("Error deleting template:", error);
      alert("Error deleting template");
    }
  };

  const handleDuplicate = async (template: EmailTemplatesRow) => {
    try {
      const res = await fetch("/api/email-templates/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${template.name} (Copy)`,
          subject: template.subject,
          bodyHtml: template.body_html,
          bodyText: template.body_text,
          category: template.category,
          variables: template.variables,
        }),
      });

      if (res.ok) {
        window.location.reload();
      } else {
        alert("Failed to duplicate template");
      }
    } catch (error) {
      console.error("Error duplicating template:", error);
      alert("Error duplicating template");
    }
  };

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="card p-6 bg-blue-50 border-2 border-blue-200">
        <div className="flex items-start gap-4">
          <Mail className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">About Email Templates</h3>
            <p className="text-sm text-blue-800 mb-2">
              Email templates can be used in automated workflows or sent manually to users.
              Use variables like {"{{name}}"}, {"{{date}}"}, {"{{school_name}}"} to personalize emails.
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="card p-4 border-l-4 border-blue-500">
          <div className="text-2xl font-bold text-gsv-charcoal">{templates.length}</div>
          <div className="text-sm text-gsv-gray">Total Templates</div>
        </div>
        <div className="card p-4 border-l-4 border-green-500">
          <div className="text-2xl font-bold text-green-600">
            {templates.filter(t => t.is_active).length}
          </div>
          <div className="text-sm text-gsv-gray">Active</div>
        </div>
        <div className="card p-4 border-l-4 border-purple-500">
          <div className="text-2xl font-bold text-purple-600">
            {templates.filter(t => t.category === "presentation").length}
          </div>
          <div className="text-sm text-gsv-gray">Presentation Templates</div>
        </div>
        <div className="card p-4 border-l-4 border-yellow-500">
          <div className="text-2xl font-bold text-yellow-600">
            {templates.filter(t => t.category === "volunteer").length}
          </div>
          <div className="text-sm text-gsv-gray">Volunteer Templates</div>
        </div>
      </div>

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
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gsv-gray hover:bg-gray-200"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Create Button */}
          {canEdit && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              <Plus className="w-4 h-4" />
              New Template
            </button>
          )}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {filteredTemplates.length === 0 ? (
          <div className="col-span-full card p-12 text-center">
            <Mail className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gsv-gray mb-4">No email templates found</p>
            {canEdit && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="text-sm text-blue-600 hover:underline"
              >
                Create your first template
              </button>
            )}
          </div>
        ) : (
          filteredTemplates.map((template) => (
            <div key={template.id} className="card p-6 hover:shadow-lg transition">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gsv-charcoal mb-1">{template.name}</h3>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    template.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                  }`}>
                    {template.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              {/* Subject */}
              <div className="mb-4">
                <div className="text-xs text-gsv-gray mb-1">Subject:</div>
                <div className="text-sm text-gsv-charcoal font-medium">{template.subject}</div>
              </div>

              {/* Preview */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gsv-gray mb-1">Preview:</div>
                <div className="text-sm text-gsv-charcoal line-clamp-3">
                  {template.body_text?.substring(0, 150)}...
                </div>
              </div>

              {/* Metadata */}
              <div className="text-xs text-gsv-gray mb-4 space-y-1">
                <div>Category: {template.category}</div>
                {template.usage_count !== undefined && template.usage_count > 0 && (
                  <div>Used {template.usage_count} times</div>
                )}
              </div>

              {/* Actions */}
              {canEdit && (
                <div className="flex items-center gap-2 pt-4 border-t">
                  <button
                    onClick={() => setEditingTemplate(template)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition text-sm"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDuplicate(template)}
                    className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition"
                    title="Duplicate"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(Number(template.id))}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateTemplateModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            window.location.reload();
          }}
        />
      )}

      {editingTemplate && (
        <EditTemplateModal
          template={editingTemplate}
          onClose={() => setEditingTemplate(null)}
          onSuccess={() => {
            setEditingTemplate(null);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}

