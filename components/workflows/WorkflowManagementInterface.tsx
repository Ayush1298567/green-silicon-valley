"use client";
import { useState } from "react";
import { Zap, Plus, Filter, Play, Pause, Trash2, Edit } from "lucide-react";
import { type ScheduledTasksRow } from "@/types/db";
import WorkflowCard from "./WorkflowCard";
import CreateWorkflowModal from "./CreateWorkflowModal";
import EditWorkflowModal from "./EditWorkflowModal";

interface WorkflowManagementInterfaceProps {
  workflows: ScheduledTasksRow[];
  canEdit: boolean;
}

export default function WorkflowManagementInterface({ workflows, canEdit }: WorkflowManagementInterfaceProps) {
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<ScheduledTasksRow | null>(null);

  const filteredWorkflows = categoryFilter === "all"
    ? workflows
    : workflows.filter(w => w.task_type === categoryFilter);

  const activeWorkflows = workflows.filter(w => w.status === "active").length;
  const pausedWorkflows = workflows.filter(w => w.status === "paused").length;

  const categories = [
    { value: "all", label: "All Workflows" },
    { value: "presentation_reminder", label: "Presentation Reminders" },
    { value: "volunteer_onboarding", label: "Volunteer Onboarding" },
    { value: "chapter_checkin", label: "Chapter Check-ins" },
    { value: "email_automation", label: "Email Automation" },
    { value: "report_generation", label: "Report Generation" },
  ];

  const handleToggleStatus = async (workflowId: number, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "paused" : "active";
    
    try {
      const res = await fetch(`/api/workflows/${workflowId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        window.location.reload();
      } else {
        alert("Failed to update workflow status");
      }
    } catch (error) {
      console.error("Error updating workflow:", error);
      alert("Error updating workflow");
    }
  };

  const handleDelete = async (workflowId: number) => {
    if (!confirm("Are you sure you want to delete this workflow? This cannot be undone.")) return;

    try {
      const res = await fetch(`/api/workflows/${workflowId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        window.location.reload();
      } else {
        alert("Failed to delete workflow");
      }
    } catch (error) {
      console.error("Error deleting workflow:", error);
      alert("Error deleting workflow");
    }
  };

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="card p-6 bg-purple-50 border-2 border-purple-200">
        <div className="flex items-start gap-4">
          <Zap className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-purple-900 mb-2">About Workflows</h3>
            <p className="text-sm text-purple-800 mb-2">
              Workflows automate repetitive tasks like sending reminders, onboarding new volunteers, 
              generating reports, and checking in with chapters.
            </p>
            <ul className="text-sm text-purple-800 space-y-1">
              <li>• Create workflows from templates or build custom ones</li>
              <li>• Set triggers (time-based, event-based) and actions (send email, create task, etc.)</li>
              <li>• Pause/resume workflows anytime</li>
              <li>• View execution history and logs</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="card p-4 border-l-4 border-purple-500">
          <div className="text-2xl font-bold text-gsv-charcoal">{workflows.length}</div>
          <div className="text-sm text-gsv-gray">Total Workflows</div>
        </div>
        <div className="card p-4 border-l-4 border-green-500">
          <div className="text-2xl font-bold text-green-600">{activeWorkflows}</div>
          <div className="text-sm text-gsv-gray">Active</div>
        </div>
        <div className="card p-4 border-l-4 border-yellow-500">
          <div className="text-2xl font-bold text-yellow-600">{pausedWorkflows}</div>
          <div className="text-sm text-gsv-gray">Paused</div>
        </div>
        <div className="card p-4 border-l-4 border-blue-500">
          <div className="text-2xl font-bold text-blue-600">
            {workflows.reduce((sum, w) => sum + (w.execution_count || 0), 0)}
          </div>
          <div className="text-sm text-gsv-gray">Total Executions</div>
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
                    ? "bg-purple-500 text-white"
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
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
            >
              <Plus className="w-4 h-4" />
              New Workflow
            </button>
          )}
        </div>
      </div>

      {/* Workflows Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWorkflows.length === 0 ? (
          <div className="col-span-full card p-12 text-center">
            <Zap className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gsv-gray mb-4">No workflows found</p>
            {canEdit && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="text-sm text-purple-600 hover:underline"
              >
                Create your first workflow
              </button>
            )}
          </div>
        ) : (
          filteredWorkflows.map((workflow) => (
            <WorkflowCard
              key={workflow.id}
              workflow={workflow}
              canEdit={canEdit}
              onToggle={() => handleToggleStatus(Number(workflow.id), workflow.status || "paused")}
              onEdit={() => setEditingWorkflow(workflow)}
              onDelete={() => handleDelete(Number(workflow.id))}
            />
          ))
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateWorkflowModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            window.location.reload();
          }}
        />
      )}

      {editingWorkflow && (
        <EditWorkflowModal
          workflow={editingWorkflow}
          onClose={() => setEditingWorkflow(null)}
          onSuccess={() => {
            setEditingWorkflow(null);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}

