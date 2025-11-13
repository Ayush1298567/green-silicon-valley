"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { X, CheckCircle2, Clock, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: "low" | "medium" | "high" | "urgent";
  status: "not_started" | "in_progress" | "blocked" | "completed" | "cancelled";
  due_date: string | null;
  task_type: string;
  assigned_by_name: string | null;
  created_at: string;
}

interface TaskSidePanelProps {
  userId: string;
  userRole: string;
}

export default function TaskSidePanel({ userId, userRole }: TaskSidePanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "completed">("active");

  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("tasks")
        .select("id, title, status, due_date, priority")
        .order("due_date", { ascending: true })
        .limit(20);

      if (error) throw error;

      // Map the data to Task interface with defaults for missing fields
      const mappedTasks: Task[] = (data ?? []).map((task: any) => ({
        id: task.id,
        title: task.title || "",
        description: null,
        priority: task.priority || "medium",
        status: task.status || "not_started",
        due_date: task.due_date || null,
        task_type: "other",
        assigned_by_name: null,
        created_at: new Date().toISOString(),
      }));

      setTasks(mappedTasks);
    } catch (error) {
      // noop for now
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (response.ok) {
        fetchTasks(); // Refresh tasks
      }
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case "in_progress":
        return <Clock className="w-4 h-4 text-blue-600" />;
      case "blocked":
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getDaysUntilDue = (dueDate: string | null) => {
    if (!dueDate) return null;
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const activeTasks = tasks.filter(t => t.status !== "completed" && t.status !== "cancelled");
  const completedTasks = tasks.filter(t => t.status === "completed");

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed right-0 top-1/2 -translate-y-1/2 bg-gsv-green text-white p-3 rounded-l-lg shadow-lg hover:bg-gsv-green/90 transition-all hover:scale-105 active:scale-95"
        style={{ zIndex: 90 }}
        aria-label="Toggle tasks panel"
      >
        <div className="flex flex-col items-center gap-1">
          <Clock className="w-5 h-5" />
          <span className="text-xs font-semibold">Tasks</span>
          {activeTasks.length > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
              {activeTasks.length}
            </span>
          )}
        </div>
      </button>

      {/* Side Panel */}
      <div
        className={`fixed right-0 top-0 h-full w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } overflow-hidden flex flex-col`}
        style={{ zIndex: 95 }}
      >
        {/* Header */}
        <div className="bg-gsv-green text-white p-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">My Tasks</h2>
            <p className="text-sm text-white/80">{activeTasks.length} active</p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-white/20 rounded"
            aria-label="Close panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex border-b bg-gray-50">
          <button
            onClick={() => setFilter("active")}
            className={`flex-1 py-2 px-4 text-sm font-medium ${
              filter === "active"
                ? "border-b-2 border-gsv-green text-gsv-green"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Active ({activeTasks.length})
          </button>
          <button
            onClick={() => setFilter("completed")}
            className={`flex-1 py-2 px-4 text-sm font-medium ${
              filter === "completed"
                ? "border-b-2 border-gsv-green text-gsv-green"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Completed ({completedTasks.length})
          </button>
          <button
            onClick={() => setFilter("all")}
            className={`flex-1 py-2 px-4 text-sm font-medium ${
              filter === "all"
                ? "border-b-2 border-gsv-green text-gsv-green"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            All ({tasks.length})
          </button>
        </div>

        {/* Task List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-8 h-8 animate-spin mx-auto mb-2" />
              Loading tasks...
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p className="font-medium">No tasks found</p>
              <p className="text-sm mt-1">You&apos;re all caught up!</p>
            </div>
          ) : (
            tasks.map((task) => {
              const daysUntil = getDaysUntilDue(task.due_date);
              const isOverdue = daysUntil !== null && daysUntil < 0;
              const isDueSoon = daysUntil !== null && daysUntil >= 0 && daysUntil <= 3;
              const isExpanded = expandedTask === task.id;

              return (
                <div
                  key={task.id}
                  className={`border rounded-lg p-3 hover:shadow-md transition-shadow ${
                    isOverdue ? "border-red-300 bg-red-50" : "border-gray-200"
                  }`}
                >
                  {/* Task Header */}
                  <div className="flex items-start gap-2">
                    <div className="mt-1">{getStatusIcon(task.status)}</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-gray-900 truncate">
                        {task.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full border ${getPriorityColor(
                            task.priority
                          )}`}
                        >
                          {task.priority}
                        </span>
                        <span className="text-xs text-gray-500">{task.task_type}</span>
                        {task.due_date && (
                          <span
                            className={`text-xs ${
                              isOverdue
                                ? "text-red-600 font-semibold"
                                : isDueSoon
                                ? "text-orange-600 font-medium"
                                : "text-gray-500"
                            }`}
                          >
                            {isOverdue
                              ? `Overdue by ${Math.abs(daysUntil!)} days`
                              : isDueSoon
                              ? `Due in ${daysUntil} days`
                              : `Due ${new Date(task.due_date).toLocaleDateString()}`}
                          </span>
                        )}
                      </div>
                      {task.assigned_by_name && (
                        <p className="text-xs text-gray-500 mt-1">
                          Assigned by {task.assigned_by_name}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => setExpandedTask(isExpanded ? null : task.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t space-y-3">
                      {task.description && (
                        <p className="text-sm text-gray-600">{task.description}</p>
                      )}

                      {/* Status Update Buttons */}
                      {task.status !== "completed" && task.status !== "cancelled" && (
                        <div className="flex flex-wrap gap-2">
                          {task.status !== "in_progress" && (
                            <button
                              onClick={() => updateTaskStatus(task.id, "in_progress")}
                              className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                            >
                              Start
                            </button>
                          )}
                          {task.status === "in_progress" && (
                            <button
                              onClick={() => updateTaskStatus(task.id, "completed")}
                              className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                            >
                              Mark Complete
                            </button>
                          )}
                          {task.status !== "blocked" && (
                            <button
                              onClick={() => updateTaskStatus(task.id, "blocked")}
                              className="text-xs px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                            >
                              Block
                            </button>
                          )}
                        </div>
                      )}

                      {task.status === "completed" && (
                        <div className="text-xs text-green-600 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" />
                          Completed
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
          style={{ zIndex: 90 }}
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}

