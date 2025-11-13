"use client";
import { useState } from "react";
import { X, Save, Zap } from "lucide-react";

interface CreateWorkflowModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const WORKFLOW_TEMPLATES = [
  {
    id: "presentation_reminder",
    name: "Presentation Reminder",
    description: "Send reminder emails 7 days, 3 days, and 1 day before presentations",
    icon: "⏰",
    taskType: "presentation_reminder",
    cronExpression: "0 9 * * *", // Daily at 9 AM
  },
  {
    id: "volunteer_onboarding",
    name: "Volunteer Onboarding",
    description: "Automated onboarding sequence for new volunteers",
    icon: "👋",
    taskType: "volunteer_onboarding",
    cronExpression: "0 10 * * 1", // Monday at 10 AM
  },
  {
    id: "chapter_checkin",
    name: "Chapter Check-in",
    description: "Monthly check-in emails to chapter leaders",
    icon: "✅",
    taskType: "chapter_checkin",
    cronExpression: "0 9 1 * *", // 1st of month at 9 AM
  },
  {
    id: "hours_reminder",
    name: "Hours Logging Reminder",
    description: "Remind volunteers to log their hours weekly",
    icon: "⏱️",
    taskType: "email_automation",
    cronExpression: "0 18 * * 5", // Friday at 6 PM
  },
  {
    id: "monthly_report",
    name: "Monthly Report",
    description: "Generate and send monthly impact report",
    icon: "📊",
    taskType: "report_generation",
    cronExpression: "0 8 1 * *", // 1st of month at 8 AM
  },
];

export default function CreateWorkflowModal({ onClose, onSuccess }: CreateWorkflowModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [customMode, setCustomMode] = useState(false);
  const [formData, setFormData] = useState({
    taskName: "",
    taskType: "email_automation",
    description: "",
    cronExpression: "0 9 * * *",
    status: "active",
  });
  const [creating, setCreating] = useState(false);

  const handleTemplateSelect = (template: typeof WORKFLOW_TEMPLATES[0]) => {
    setSelectedTemplate(template.id);
    setFormData({
      taskName: template.name,
      taskType: template.taskType,
      description: template.description,
      cronExpression: template.cronExpression,
      status: "active",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const res = await fetch("/api/workflows/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        onSuccess();
        alert("Workflow created successfully!");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to create workflow");
      }
    } catch (error) {
      console.error("Error creating workflow:", error);
      alert("Error creating workflow");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full my-8">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-xl">
          <div className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-purple-600" />
            <h2 className="text-2xl font-bold text-gsv-charcoal">Create Workflow</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {!customMode ? (
            /* Template Selection */
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">Choose a Template</h3>
                <button
                  onClick={() => setCustomMode(true)}
                  className="text-sm text-purple-600 hover:underline"
                >
                  Create custom workflow →
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {WORKFLOW_TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateSelect(template)}
                    className={`text-left p-4 border-2 rounded-lg transition ${
                      selectedTemplate === template.id
                        ? "border-purple-500 bg-purple-50"
                        : "border-gray-200 hover:border-purple-300"
                    }`}
                  >
                    <div className="flex items-start gap-3 mb-2">
                      <span className="text-2xl">{template.icon}</span>
                      <div>
                        <h4 className="font-semibold text-gsv-charcoal">{template.name}</h4>
                        <p className="text-sm text-gsv-gray mt-1">{template.description}</p>
                      </div>
                    </div>
                    <div className="text-xs text-gsv-gray">
                      Schedule: {template.cronExpression}
                    </div>
                  </button>
                ))}
              </div>

              {selectedTemplate && (
                <form onSubmit={handleSubmit} className="mt-6 pt-6 border-t">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gsv-charcoal mb-1">
                        Workflow Name
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
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4">
                      <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2 border border-gray-300 text-gsv-charcoal rounded-lg hover:bg-gray-50 transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={creating}
                        className="inline-flex items-center gap-2 px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" />
                        {creating ? "Creating..." : "Create Workflow"}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          ) : (
            /* Custom Workflow Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">Custom Workflow</h3>
                <button
                  type="button"
                  onClick={() => setCustomMode(false)}
                  className="text-sm text-purple-600 hover:underline"
                >
                  ← Use template
                </button>
              </div>

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

              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 border border-gray-300 text-gsv-charcoal rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="inline-flex items-center gap-2 px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {creating ? "Creating..." : "Create Workflow"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

