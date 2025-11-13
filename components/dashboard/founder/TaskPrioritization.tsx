"use client";
import { CheckSquare, Clock, AlertTriangle } from "lucide-react";
import Link from "next/link";

interface Task {
  id: number;
  title: string;
  description?: string;
  due_date?: string;
  priority?: string;
  status?: string;
  assigned_to?: string;
}

interface TaskPrioritizationProps {
  tasks: Task[];
}

export default function TaskPrioritization({ tasks }: TaskPrioritizationProps) {
  const getPriorityColor = (priority?: string) => {
    if (priority === "urgent") return "bg-red-100 text-red-800";
    if (priority === "high") return "bg-orange-100 text-orange-800";
    if (priority === "medium") return "bg-yellow-100 text-yellow-800";
    if (priority === "low") return "bg-blue-100 text-blue-800";
    return "bg-gray-100 text-gray-800";
  };

  const getPriorityIcon = (priority?: string) => {
    if (priority === "urgent") return <AlertTriangle className="w-3 h-3" />;
    return <Clock className="w-3 h-3" />;
  };

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const formatDueDate = (dueDate?: string) => {
    if (!dueDate) return "No due date";
    const date = new Date(dueDate);
    const now = new Date();
    const diffInDays = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays < 0) return "Overdue";
    if (diffInDays === 0) return "Due today";
    if (diffInDays === 1) return "Due tomorrow";
    if (diffInDays < 7) return `Due in ${diffInDays} days`;
    return date.toLocaleDateString();
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-gsv-green" />
          <h2 className="text-xl font-semibold">Priority Tasks</h2>
        </div>
        <Link
          href="/dashboard/founder/tasks"
          className="text-sm text-gsv-green hover:underline"
        >
          View All
        </Link>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {tasks.length === 0 ? (
          <p className="text-center text-gsv-gray py-8">No pending tasks</p>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className="border rounded-lg p-3 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold text-sm text-gsv-charcoal">{task.title}</h3>
                <span className={`flex-shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                  {getPriorityIcon(task.priority)}
                  {task.priority}
                </span>
              </div>
              {task.description && (
                <p className="text-xs text-gsv-gray mb-2 line-clamp-2">{task.description}</p>
              )}
              <div className="flex items-center justify-between text-xs">
                <span className={`${isOverdue(task.due_date) ? "text-red-600 font-semibold" : "text-gsv-gray"}`}>
                  {formatDueDate(task.due_date)}
                </span>
                <span className="text-gsv-gray">{task.status}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

