"use client";
import { Play, Pause, Edit, Trash2, Clock, Calendar, CheckCircle } from "lucide-react";
import { type ScheduledTasksRow } from "@/types/db";

interface WorkflowCardProps {
  workflow: ScheduledTasksRow;
  canEdit: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function WorkflowCard({ workflow, canEdit, onToggle, onEdit, onDelete }: WorkflowCardProps) {
  const getStatusColor = (status?: string) => {
    if (status === "active") return "bg-green-100 text-green-800 border-green-300";
    if (status === "paused") return "bg-yellow-100 text-yellow-800 border-yellow-300";
    if (status === "completed") return "bg-blue-100 text-blue-800 border-blue-300";
    return "bg-gray-100 text-gray-800 border-gray-300";
  };

  const getTypeIcon = (taskType?: string) => {
    if (taskType?.includes("reminder")) return "⏰";
    if (taskType?.includes("onboarding")) return "👋";
    if (taskType?.includes("checkin")) return "✅";
    if (taskType?.includes("email")) return "📧";
    if (taskType?.includes("report")) return "📊";
    return "⚡";
  };

  return (
    <div className="card p-6 hover:shadow-lg transition">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <span className="text-3xl">{getTypeIcon(workflow.task_type)}</span>
          <div>
            <h3 className="font-semibold text-gsv-charcoal mb-1">{workflow.task_name}</h3>
            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(workflow.status)}`}>
              {workflow.status || "unknown"}
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      {workflow.task_data && typeof workflow.task_data === 'object' && (workflow.task_data as any).description && (
        <p className="text-sm text-gsv-gray mb-4">{(workflow.task_data as any).description}</p>
      )}

      {/* Schedule Info */}
      <div className="space-y-2 text-xs text-gsv-gray mb-4">
        {workflow.schedule_type === "cron" && workflow.cron_expression && (
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>Runs: {workflow.cron_expression}</span>
          </div>
        )}
        {workflow.next_run_at && (
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>Next run: {new Date(workflow.next_run_at).toLocaleString()}</span>
          </div>
        )}
        {workflow.execution_count !== undefined && workflow.execution_count > 0 && (
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>Executed {workflow.execution_count} times</span>
          </div>
        )}
      </div>

      {/* Actions */}
      {canEdit && (
        <div className="flex items-center gap-2 pt-4 border-t">
          <button
            onClick={onToggle}
            className={`flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
              workflow.status === "active"
                ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                : "bg-green-100 text-green-800 hover:bg-green-200"
            }`}
          >
            {workflow.status === "active" ? (
              <>
                <Pause className="w-4 h-4" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Activate
              </>
            )}
          </button>
          <button
            onClick={onEdit}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

