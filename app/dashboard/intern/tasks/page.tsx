"use client";

import { useState, useEffect } from "react";
import { Plus, CheckCircle2, Clock, AlertCircle, Calendar, Filter } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { formatDistanceToNow } from "date-fns";

interface Task {
  id: number;
  department: string;
  task: string;
  due_date: string | null;
  status: string;
  notes: string | null;
  assigned_to: string | null;
  created_by: string | null;
  priority: string | null;
  created_at: string;
}

export default function InternTasksPage() {
  const supabase = createClientComponentClient();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({
    task: "",
    department: "",
    due_date: "",
    priority: "medium",
    notes: ""
  });

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from("intern_projects")
        .select("*")
        .or(`assigned_to.eq.${session.user.id},created_by.eq.${session.user.id}`)
        .order("due_date", { ascending: true });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error("Error loading tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async () => {
    if (!newTask.task.trim()) {
      alert("Please enter a task description");
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase.from("intern_projects").insert({
        task: newTask.task,
        department: newTask.department || "general",
        due_date: newTask.due_date || null,
        status: "pending",
        notes: newTask.notes || null,
        created_by: session.user.id,
        priority: newTask.priority || "medium"
      });

      if (error) throw error;

      setNewTask({ task: "", department: "", due_date: "", priority: "medium", notes: "" });
      setShowAddTask(false);
      await loadTasks();
    } catch (error: any) {
      alert(error.message || "Failed to create task");
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      const { error } = await supabase
        .from("intern_projects")
        .update({ status })
        .eq("id", id);

      if (error) throw error;
      await loadTasks();
    } catch (error: any) {
      alert(error.message || "Failed to update task");
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === "all") return true;
    if (filter === "pending") return task.status === "pending";
    if (filter === "in_progress") return task.status === "in_progress";
    if (filter === "completed") return task.status === "completed";
    if (filter === "overdue") {
      return task.status !== "completed" && task.due_date && new Date(task.due_date) < new Date();
    }
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string | null) => {
    switch (priority) {
      case "urgent":
        return "text-red-600";
      case "high":
        return "text-orange-600";
      case "medium":
        return "text-yellow-600";
      case "low":
        return "text-gray-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="container py-14">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gsv-charcoal mb-2">My Tasks</h1>
            <p className="text-gsv-gray">Manage your assigned tasks and projects</p>
          </div>
          <button
            onClick={() => setShowAddTask(true)}
            className="px-4 py-2 bg-gsv-green text-white rounded-lg hover:bg-gsv-greenDark transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Task
          </button>
        </div>

        {/* Filters */}
        <div className="card p-4 mb-6 flex flex-wrap gap-2">
          {["all", "pending", "in_progress", "completed", "overdue"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg transition ${
                filter === f
                  ? "bg-gsv-green text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {f.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
            </button>
          ))}
        </div>

        {/* Tasks List */}
        {loading ? (
          <div className="text-center py-12 text-gsv-gray">Loading tasks...</div>
        ) : filteredTasks.length === 0 ? (
          <div className="card p-12 text-center">
            <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gsv-gray text-lg">No tasks found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className={`card p-4 border-l-4 ${
                  task.due_date && new Date(task.due_date) < new Date() && task.status !== "completed"
                    ? "border-red-500"
                    : "border-gsv-green"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gsv-charcoal">{task.task}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(task.status)}`}>
                        {task.status.replace("_", " ")}
                      </span>
                      {task.priority && (
                        <span className={`text-xs font-medium ${getPriorityColor(task.priority)}`}>
                          {task.priority.toUpperCase()}
                        </span>
                      )}
                    </div>
                    {task.department && (
                      <p className="text-sm text-gsv-gray mb-1">Department: {task.department}</p>
                    )}
                    {task.due_date && (
                      <p className="text-sm text-gsv-gray flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Due: {new Date(task.due_date).toLocaleDateString()}
                        {new Date(task.due_date) < new Date() && task.status !== "completed" && (
                          <span className="text-red-600 ml-2">Overdue</span>
                        )}
                      </p>
                    )}
                    {task.notes && (
                      <p className="text-sm text-gsv-gray mt-2">{task.notes}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {task.status !== "completed" && (
                      <>
                        {task.status === "pending" && (
                          <button
                            onClick={() => handleUpdateStatus(task.id, "in_progress")}
                            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition"
                          >
                            Start
                          </button>
                        )}
                        <button
                          onClick={() => handleUpdateStatus(task.id, "completed")}
                          className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Complete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Task Modal */}
        {showAddTask && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-xl font-semibold text-gsv-charcoal mb-4">New Task</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gsv-charcoal mb-2">
                    Task Description <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newTask.task}
                    onChange={(e) => setNewTask({ ...newTask, task: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="Enter task description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gsv-charcoal mb-2">
                    Department
                  </label>
                  <input
                    type="text"
                    value={newTask.department}
                    onChange={(e) => setNewTask({ ...newTask, department: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="e.g., Marketing, Development"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gsv-charcoal mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={newTask.due_date}
                    onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gsv-charcoal mb-2">
                    Priority
                  </label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gsv-charcoal mb-2">
                    Notes
                  </label>
                  <textarea
                    value={newTask.notes}
                    onChange={(e) => setNewTask({ ...newTask, notes: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    rows={3}
                    placeholder="Additional notes..."
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => {
                    setShowAddTask(false);
                    setNewTask({ task: "", department: "", due_date: "", priority: "medium", notes: "" });
                  }}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddTask}
                  className="flex-1 px-4 py-2 bg-gsv-green text-white rounded-lg hover:bg-gsv-greenDark transition"
                >
                  Create Task
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

