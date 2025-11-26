"use client";

import { useState, useEffect } from "react";
import { Target, Plus, TrendingUp, TrendingDown, Calendar, CheckCircle, Clock, AlertTriangle, Edit, Trash2 } from "lucide-react";

interface DepartmentGoal {
  id: string;
  department_id: string;
  goal: string;
  target: number;
  current: number;
  deadline: string;
  status: "active" | "completed" | "overdue" | "paused";
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface DepartmentGoalsProps {
  departmentId: string;
}

export default function DepartmentGoals({ departmentId }: DepartmentGoalsProps) {
  const [goals, setGoals] = useState<DepartmentGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    goal: "",
    target: 0,
    deadline: ""
  });

  useEffect(() => {
    fetchGoals();
  }, [departmentId]);

  const fetchGoals = async () => {
    try {
      const res = await fetch(`/api/departments/${departmentId}/goals`);
      const data = await res.json();
      if (data.ok) {
        setGoals(data.goals || []);
      }
    } catch (error) {
      console.error("Error fetching goals:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch(`/api/departments/${departmentId}/goals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.ok) {
        fetchGoals();
        setShowAddForm(false);
        setFormData({ goal: "", target: 0, deadline: "" });
      } else {
        alert("Error adding goal: " + data.error);
      }
    } catch (error: any) {
      alert("Error adding goal: " + error.message);
    }
  };

  const handleUpdateProgress = async (goalId: string, newCurrent: number) => {
    try {
      const res = await fetch(`/api/departments/${departmentId}/goals/${goalId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current: newCurrent }),
      });

      const data = await res.json();
      if (data.ok) {
        fetchGoals();
      }
    } catch (error: any) {
      console.error("Error updating goal progress:", error);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm("Are you sure you want to delete this goal?")) return;

    try {
      const res = await fetch(`/api/departments/${departmentId}/goals/${goalId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (data.ok) {
        fetchGoals();
      }
    } catch (error: any) {
      alert("Error deleting goal: " + error.message);
    }
  };

  const getStatusBadge = (status: string, deadline: string) => {
    const isOverdue = new Date(deadline) < new Date() && status === "active";

    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
            <CheckCircle size={12} />
            Completed
          </span>
        );
      case "overdue":
      case "overdue_active":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
            <AlertTriangle size={12} />
            Overdue
          </span>
        );
      case "paused":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
            <Clock size={12} />
            Paused
          </span>
        );
      default:
        return isOverdue ? (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
            <AlertTriangle size={12} />
            Overdue
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
            <Target size={12} />
            Active
          </span>
        );
    }
  };

  const calculateProgress = (current: number, target: number) => {
    return Math.min(Math.round((current / target) * 100), 100);
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return "bg-green-500";
    if (progress >= 75) return "bg-blue-500";
    if (progress >= 50) return "bg-yellow-500";
    return "bg-red-500";
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Department Goals & Metrics</h2>
          <p className="text-gray-600">Track progress towards department objectives</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={16} />
          Add Goal
        </button>
      </div>

      {/* Add Goal Form */}
      {showAddForm && (
        <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Goal</h3>

          <form onSubmit={handleAddGoal} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Goal Description *
              </label>
              <input
                type="text"
                value={formData.goal}
                onChange={(e) => setFormData(prev => ({ ...prev, goal: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Increase volunteer outreach by 25%"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Value *
                </label>
                <input
                  type="number"
                  value={formData.target}
                  onChange={(e) => setFormData(prev => ({ ...prev, target: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 25"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deadline *
                </label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Goal
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Goals List */}
      {goals.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium mb-2">No goals set yet</h3>
          <p className="mb-4">Start by adding your first department goal</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add Your First Goal
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {goals.map((goal) => {
            const progress = calculateProgress(goal.current, goal.target);
            const daysLeft = Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            const isOverdue = daysLeft < 0 && goal.status === "active";

            return (
              <div key={goal.id} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{goal.goal}</h3>
                      {getStatusBadge(goal.status, goal.deadline)}
                    </div>

                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Target size={14} />
                        {goal.current} / {goal.target} ({progress}%)
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        Due: {new Date(goal.deadline).toLocaleDateString()}
                        {daysLeft > 0 && ` (${daysLeft} days left)`}
                        {isOverdue && ` (${Math.abs(daysLeft)} days overdue)`}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button className="p-1 text-gray-400 hover:text-blue-600">
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(progress)}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Update Progress */}
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Update Current Progress
                    </label>
                    <input
                      type="number"
                      value={goal.current}
                      onChange={(e) => handleUpdateProgress(goal.id, parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                      max={goal.target}
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={() => handleUpdateProgress(goal.id, Math.min(goal.current + 1, goal.target))}
                      className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                    >
                      +1
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Summary Stats */}
      {goals.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-3">Goals Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {goals.filter(g => g.status === "active").length}
              </div>
              <div className="text-sm text-gray-600">Active Goals</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {goals.filter(g => g.status === "completed").length}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {goals.filter(g => new Date(g.deadline) < new Date() && g.status === "active").length}
              </div>
              <div className="text-sm text-gray-600">Overdue</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(goals.reduce((sum, g) => sum + calculateProgress(g.current, g.target), 0) / goals.length)}%
              </div>
              <div className="text-sm text-gray-600">Avg Progress</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
