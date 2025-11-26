"use client";

import { useState } from "react";
import { CheckCircle, Circle, Clock, AlertTriangle } from "lucide-react";

interface ChecklistTask {
  id: string;
  task_name: string;
  task_type: "required" | "optional" | "custom";
  is_completed: boolean;
  completed_by?: string;
  completed_at?: string;
  due_date?: string;
}

interface PresentationChecklistProps {
  workspaceId: string;
  tasks: ChecklistTask[];
  onTaskUpdate: () => void;
}

export default function PresentationChecklist({
  workspaceId,
  tasks,
  onTaskUpdate
}: PresentationChecklistProps) {
  const [updatingTask, setUpdatingTask] = useState<string | null>(null);

  // Default checklist tasks (in a real app, these would be generated based on selected activity)
  const defaultTasks: Omit<ChecklistTask, 'id' | 'is_completed' | 'completed_by' | 'completed_at'>[] = [
    {
      task_name: "Upload presentation slides to workspace",
      task_type: "required",
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 1 week from now
    },
    {
      task_name: "Select and configure presentation activity",
      task_type: "required",
      due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days from now
    },
    {
      task_name: "Prepare activity materials and supplies",
      task_type: "required",
      due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days from now
    },
    {
      task_name: "Review presentation content for age-appropriateness",
      task_type: "required",
      due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days from now
    },
    {
      task_name: "Practice presentation timing (aim for 30-45 minutes)",
      task_type: "required",
      due_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day from now
    },
    {
      task_name: "Prepare backup plan for technical issues",
      task_type: "optional",
      due_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      task_name: "Create student handout or takeaway materials",
      task_type: "optional",
      due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      task_name: "Coordinate with teacher for classroom setup",
      task_type: "optional",
      due_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  const toggleTask = async (taskId: string, currentStatus: boolean) => {
    setUpdatingTask(taskId);
    try {
      const res = await fetch(`/api/presentations/workspace/${workspaceId}/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          is_completed: !currentStatus
        }),
      });

      const data = await res.json();
      if (data.ok) {
        onTaskUpdate();
      }
    } catch (error) {
      console.error("Error updating task:", error);
    } finally {
      setUpdatingTask(null);
    }
  };

  const addCustomTask = async () => {
    const taskName = prompt("Enter task name:");
    if (!taskName) return;

    try {
      const res = await fetch(`/api/presentations/workspace/${workspaceId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task_name: taskName,
          task_type: "custom"
        }),
      });

      const data = await res.json();
      if (data.ok) {
        onTaskUpdate();
      }
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const getTaskIcon = (task: ChecklistTask, isUpdating: boolean) => {
    if (isUpdating) {
      return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />;
    }

    if (task.is_completed) {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    }

    return <Circle className="w-5 h-5 text-gray-400" />;
  };

  const getTaskTypeColor = (type: string) => {
    switch (type) {
      case "required": return "text-red-600 bg-red-100";
      case "optional": return "text-blue-600 bg-blue-100";
      case "custom": return "text-purple-600 bg-purple-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getTaskStatusColor = (task: ChecklistTask) => {
    if (task.is_completed) return "bg-green-50 border-green-200";

    const dueDate = task.due_date ? new Date(task.due_date) : null;
    const now = new Date();
    const daysUntilDue = dueDate ? Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;

    if (daysUntilDue !== null && daysUntilDue < 0) {
      return "bg-red-50 border-red-200"; // Overdue
    } else if (daysUntilDue !== null && daysUntilDue <= 1) {
      return "bg-yellow-50 border-yellow-200"; // Due soon
    }

    return "bg-white border-gray-200";
  };

  const getDueDateText = (dueDate?: string) => {
    if (!dueDate) return null;

    const date = new Date(dueDate);
    const now = new Date();
    const daysUntilDue = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilDue < 0) {
      return `Overdue by ${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) !== 1 ? 's' : ''}`;
    } else if (daysUntilDue === 0) {
      return "Due today";
    } else if (daysUntilDue === 1) {
      return "Due tomorrow";
    } else {
      return `Due in ${daysUntilDue} days`;
    }
  };

  // Use existing tasks if available, otherwise show defaults
  const displayTasks = tasks.length > 0 ? tasks : defaultTasks.map((task, index) => ({
    ...task,
    id: `default_${index}`,
    is_completed: false,
    completed_by: undefined,
    completed_at: undefined
  }));

  const completedTasks = displayTasks.filter(task => task.is_completed);
  const requiredTasks = displayTasks.filter(task => task.task_type === "required");
  const completedRequiredTasks = requiredTasks.filter(task => task.is_completed);

  return (
    <div className="space-y-6">
      {/* Progress Summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Presentation Preparation Progress</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{completedTasks.length}</div>
            <div className="text-sm text-gray-600">Completed Tasks</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{completedRequiredTasks.length}/{requiredTasks.length}</div>
            <div className="text-sm text-gray-600">Required Tasks</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round((completedTasks.length / displayTasks.length) * 100)}%
            </div>
            <div className="text-sm text-gray-600">Overall Progress</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(completedTasks.length / displayTasks.length) * 100}%` }}
          />
        </div>

        <div className="flex justify-between text-sm text-gray-600">
          <span>{completedTasks.length} of {displayTasks.length} tasks completed</span>
          {completedRequiredTasks.length === requiredTasks.length && (
            <span className="text-green-600 font-medium">Ready for review!</span>
          )}
        </div>
      </div>

      {/* Task List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Preparation Checklist</h3>
          <button
            onClick={addCustomTask}
            className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            Add Custom Task
          </button>
        </div>

        <div className="divide-y divide-gray-200">
          {displayTasks.map((task) => (
            <div
              key={task.id}
              className={`p-6 ${getTaskStatusColor(task)} transition-colors`}
            >
              <div className="flex items-start gap-4">
                <button
                  onClick={() => toggleTask(task.id, task.is_completed)}
                  disabled={updatingTask === task.id}
                  className="flex-shrink-0 mt-0.5"
                >
                  {getTaskIcon(task, updatingTask === task.id)}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className={`font-medium ${task.is_completed ? 'text-gray-600 line-through' : 'text-gray-900'}`}>
                        {task.task_name}
                      </h4>

                      <div className="flex items-center gap-3 mt-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTaskTypeColor(task.task_type)}`}>
                          {task.task_type}
                        </span>

                        {task.due_date && (
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock size={12} />
                            {getDueDateText(task.due_date)}
                          </div>
                        )}

                        {task.is_completed && task.completed_at && (
                          <div className="flex items-center gap-1 text-xs text-green-600">
                            <CheckCircle size={12} />
                            Completed {new Date(task.completed_at).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>

                    {task.due_date && (() => {
                      const dueDate = new Date(task.due_date);
                      const now = new Date();
                      const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

                      if (daysUntilDue < 0) {
                        return (
                          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" title="Overdue" />
                        );
                      } else if (daysUntilDue <= 1) {
                        return (
                          <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0" title="Due soon" />
                        );
                      }

                      return null;
                    })()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {displayTasks.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <Circle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No tasks available</p>
            <p className="text-sm">Tasks will be generated based on your selected activity</p>
          </div>
        )}
      </div>

      {/* Next Steps */}
      {completedRequiredTasks.length === requiredTasks.length && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-6 h-6 text-green-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-green-900">All Required Tasks Completed!</h4>
              <p className="text-green-700 text-sm mt-1 mb-3">
                Your presentation is ready for review. Click "Submit for Review" in the slides tab to get feedback from your team.
              </p>
              <div className="text-sm text-green-600">
                <strong>Next steps:</strong> Submit for review → Incorporate feedback → Final approval → Present!
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
