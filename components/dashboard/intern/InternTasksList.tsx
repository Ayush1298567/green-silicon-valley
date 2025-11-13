"use client";
import { CheckSquare, Clock, AlertTriangle } from "lucide-react";
import { type InternProjectRow } from "@/types/db";

interface InternTasksListProps {
  tasks: InternProjectRow[];
}

export default function InternTasksList({ tasks }: InternTasksListProps) {
  const getPriorityColor = (priority?: string) => {
    if (priority === "urgent") return "text-red-600 bg-red-50";
    if (priority === "high") return "text-orange-600 bg-orange-50";
    if (priority === "medium") return "text-yellow-600 bg-yellow-50";
    return "text-blue-600 bg-blue-50";
  };

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-gsv-green" />
          <h2 className="text-xl font-semibold">My Tasks</h2>
        </div>
        <span className="text-sm text-gsv-gray">{tasks.length} total</span>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {tasks.length === 0 ? (
          <p className="text-center text-gsv-gray py-8">No tasks assigned yet</p>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className="border rounded-lg p-4 hover:shadow-md transition">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold text-gsv-charcoal">{task.title}</h3>
                <span className={`flex-shrink-0 px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority ?? undefined)}`}>
                  {task.priority ?? "low"}
                </span>
              </div>
              {task.description && (
                <p className="text-sm text-gsv-gray mb-3">{task.description}</p>
              )}
              <div className="flex items-center justify-between text-xs">
                <span className={`flex items-center gap-1 ${isOverdue(task.due_date ?? undefined) ? "text-red-600 font-semibold" : "text-gsv-gray"}`}>
                  <Clock className="w-3 h-3" />
                  {task.due_date ? new Date(task.due_date).toLocaleDateString() : "No due date"}
                </span>
                <select
                  defaultValue={task.status || "not_started"}
                  className="border rounded px-2 py-1 text-xs"
                  onChange={(e) => {
                    // Handle status update
                    console.log("Update task status:", task.id, e.target.value);
                  }}
                >
                  <option value="not_started">Not Started</option>
                  <option value="in_progress">In Progress</option>
                  <option value="blocked">Blocked</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

