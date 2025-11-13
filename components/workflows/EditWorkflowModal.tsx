"use client";
import { useState } from "react";
import { X, Save } from "lucide-react";
import { type ScheduledTasksRow } from "@/types/db";

interface EditWorkflowModalProps {
  workflow: ScheduledTasksRow;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditWorkflowModal({ workflow, onClose, onSuccess }: EditWorkflowModalProps) {
  const [formData, setFormData] = useState({
    taskName: workflow.task_name || "",
    taskType: workflow.task_type || "email_automation",
    description: (workflow.task_data && typeof workflow.task_data === 'object' && (workflow.task_data as any).description) || "",
    cronExpression: workflow.cron_expression || "0 9 * * *",
    status: workflow.status || "active",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`/api/workflows/${workflow.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        onSuccess();
        alert("Workflow updated successfully!");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update workflow");
      }
    } catch (error) {
      console.error("Error updating workflow:", error);
      alert("Error updating workflow");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
        {/* Header */}
        <div className="border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gsv-charcoal">Edit Workflow</h2>
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
          <div>
            <label className="block text-sm font-medium text-gsv-charcoal mb-1">
              Workflow Name *
            </label>
            <input
              type="text"
              value={formData.taskName}
              onChange={(e) => setFormData({ ...formData, taskName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gsv-charcoal mb-1">
              Type *
            </label>
            <select
              value={formData.taskType}
              onChange={(e) => setFormData({ ...formData, taskType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="presentation_reminder">Presentation Reminder</option>
              <option value="volunteer_onboarding">Volunteer Onboarding</option>
              <option value="chapter_checkin">Chapter Check-in</option>
              <option value="email_automation">Email Automation</option>
              <option value="report_generation">Report Generation</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gsv-charcoal mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gsv-charcoal mb-1">
              Cron Schedule *
            </label>
            <input
              type="text"
              value={formData.cronExpression}
              onChange={(e) => setFormData({ ...formData, cronExpression: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="0 9 * * *"
              required
            />
            <p className="text-xs text-gsv-gray mt-1">
              Example: “0 9 * * *” = Daily at 9 AM
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gsv-charcoal mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="active">Active</option>
              <option value="paused">Paused</option>
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
              className="inline-flex items-center gap-2 px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

