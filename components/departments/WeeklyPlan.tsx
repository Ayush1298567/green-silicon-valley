"use client";

import { useState, useEffect } from "react";
import { Calendar, Plus, CheckCircle, Clock, AlertCircle, Edit, Trash2 } from "lucide-react";

interface WeeklyTask {
  id: string;
  department_id: string;
  title: string;
  description?: string;
  status: "todo" | "in_progress" | "completed";
  priority: "low" | "medium" | "high";
  assigned_to?: string;
  due_date?: string;
  created_by: string;
  created_at: string;
}

interface WeeklyPlanProps {
  departmentId: string;
}

export default function WeeklyPlan({ departmentId }: WeeklyPlanProps) {
  const [tasks, setTasks] = useState<WeeklyTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium" as WeeklyTask["priority"],
    assigned_to: "",
    due_date: ""
  });

  useEffect(() => {
    fetchTasks();
  }, [departmentId]);

  const fetchTasks = async () => {
    try {
      const res = await fetch(`/api/departments/${departmentId}/tasks`);
      const data = await res.json();
      if (data.ok) {
        setTasks(data.tasks || []);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch(`/api/departments/${departmentId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.ok) {
        fetchTasks();
        setShowAddForm(false);
        setFormData({ title: "", description: "", priority: "medium", assigned_to: "", due_date: "" });
      } else {
        alert("Error adding task: " + data.error);
      }
    } catch (error: any) {
      alert("Error adding task: " + error.message);
    }
  };

  const handleUpdateStatus = async (taskId: string, newStatus: WeeklyTask["status"]) => {
    try {
      const res = await fetch(`/api/departments/${departmentId}/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (data.ok) {
        fetchTasks();
      }
    } catch (error: any) {
      console.error("Error updating task:", error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-red-600 bg-red-50 border-red-200";
      case "medium": return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "low": return "text-green-600 bg-green-50 border-green-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "in_progress":
        return <Clock className="w-4 h-4 text-blue-600" />;
      case "todo":
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Weekly Sprint Plan</h2>
          <p className="text-gray-600">Track tasks and progress for this week</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={16} />
          Add Task
        </button>
      </div>

      {showAddForm && (
        <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Task</h3>
          <form onSubmit={handleAddTask} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as WeeklyTask["priority"] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Add Task
              </button>
              <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {["todo", "in_progress", "completed"].map((status) => (
          <div key={status} className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-4 capitalize flex items-center gap-2">
              {getStatusBadge(status)}
              {status.replace("_", " ")} ({tasks.filter(t => t.status === status).length})
            </h3>

            <div className="space-y-3">
              {tasks.filter(task => task.status === status).map((task) => (
                <div key={task.id} className={`border rounded-lg p-3 ${getPriorityColor(task.priority)}`}>
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{task.title}</h4>
                    <div className="flex gap-1">
                      {status !== "completed" && (
                        <button
                          onClick={() => handleUpdateStatus(task.id, status === "todo" ? "in_progress" : "completed")}
                          className="p-1 text-gray-400 hover:text-green-600"
                          title="Mark complete"
                        >
                          <CheckCircle size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  {task.description && (
                    <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Priority: {task.priority}</span>
                    {task.due_date && <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-3">Weekly Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">{tasks.length}</div>
            <div className="text-sm text-gray-600">Total Tasks</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">{tasks.filter(t => t.status === "completed").length}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-600">{tasks.filter(t => t.status === "in_progress").length}</div>
            <div className="text-sm text-gray-600">In Progress</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-600">{tasks.filter(t => t.status === "todo").length}</div>
            <div className="text-sm text-gray-600">To Do</div>
          </div>
        </div>
      </div>
    </div>
  );
}
