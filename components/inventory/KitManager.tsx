"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, Package, MapPin, AlertTriangle, CheckCircle } from "lucide-react";

interface ActivityKit {
  id: string;
  name: string;
  description?: string;
  activity_type: string;
  location?: string;
  current_stock: number;
  min_stock: number;
  max_stock: number;
  status: string;
  created_at: string;
  updated_at: string;
}

interface KitManagerProps {
  kits: ActivityKit[];
  onKitUpdate: () => void;
}

export default function KitManager({ kits, onKitUpdate }: KitManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingKit, setEditingKit] = useState<ActivityKit | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    activity_type: "",
    location: "",
    current_stock: 0,
    min_stock: 5,
    max_stock: 50
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      activity_type: "",
      location: "",
      current_stock: 0,
      min_stock: 5,
      max_stock: 50
    });
    setEditingKit(null);
    setShowAddForm(false);
  };

  const handleEdit = (kit: ActivityKit) => {
    setFormData({
      name: kit.name,
      description: kit.description || "",
      activity_type: kit.activity_type,
      location: kit.location || "",
      current_stock: kit.current_stock,
      min_stock: kit.min_stock,
      max_stock: kit.max_stock
    });
    setEditingKit(kit);
    setShowAddForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const method = editingKit ? "PUT" : "POST";
      const url = editingKit ? `/api/inventory/kits/${editingKit.id}` : "/api/inventory/kits";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.ok) {
        onKitUpdate();
        resetForm();
      } else {
        alert("Error saving kit: " + data.error);
      }
    } catch (error: any) {
      alert("Error saving kit: " + error.message);
    }
  };

  const handleDelete = async (kitId: string) => {
    if (!confirm("Are you sure you want to delete this kit? This action cannot be undone.")) return;

    try {
      const res = await fetch(`/api/inventory/kits/${kitId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (data.ok) {
        onKitUpdate();
      } else {
        alert("Error deleting kit: " + data.error);
      }
    } catch (error: any) {
      alert("Error deleting kit: " + error.message);
    }
  };

  const getStatusColor = (kit: ActivityKit) => {
    if (kit.current_stock <= kit.min_stock) {
      return "bg-red-50 border-red-200";
    } else if (kit.current_stock >= kit.max_stock * 0.8) {
      return "bg-yellow-50 border-yellow-200";
    }
    return "bg-white border-gray-200";
  };

  const getStatusBadge = (kit: ActivityKit) => {
    if (kit.current_stock <= kit.min_stock) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">
          <AlertTriangle size={12} />
          Low Stock
        </span>
      );
    } else if (kit.current_stock >= kit.max_stock) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
          Full
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
        <CheckCircle size={12} />
        Available
      </span>
    );
  };

  const activityTypes = [
    { value: "circuit_design", label: "Circuit Design" },
    { value: "coding", label: "Coding/Programming" },
    { value: "robotics", label: "Robotics" },
    { value: "renewable_energy", label: "Renewable Energy" },
    { value: "3d_printing", label: "3D Printing" },
    { value: "science_experiment", label: "Science Experiment" },
    { value: "general_stem", label: "General STEM" }
  ];

  return (
    <div className="space-y-6">
      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              {editingKit ? "Edit Kit" : "Add New Kit"}
            </h3>
            <button
              onClick={resetForm}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kit Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Activity Type *
                </label>
                <select
                  value={formData.activity_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, activity_type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select activity type</option>
                  {activityTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe what's included in this kit..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Storage Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Room 204, Cabinet A"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Stock *
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.current_stock}
                  onChange={(e) => setFormData(prev => ({ ...prev, current_stock: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Stock
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.min_stock}
                  onChange={(e) => setFormData(prev => ({ ...prev, min_stock: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Stock
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.max_stock}
                  onChange={(e) => setFormData(prev => ({ ...prev, max_stock: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingKit ? "Update Kit" : "Add Kit"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Kit List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Activity Kits ({kits.length})</h3>
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus size={16} />
              Add Kit
            </button>
          )}
        </div>

        {kits.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h4 className="text-lg font-medium mb-2">No kits added yet</h4>
            <p className="mb-4">Create your first activity kit to get started</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add Your First Kit
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {kits.map((kit) => (
              <div
                key={kit.id}
                className={`border rounded-lg p-4 ${getStatusColor(kit)}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">{kit.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">{kit.activity_type.replace("_", " ")}</p>
                    {getStatusBadge(kit)}
                  </div>

                  <div className="flex gap-1 ml-2">
                    <button
                      onClick={() => handleEdit(kit)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                      title="Edit kit"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(kit.id)}
                      className="p-1 text-red-400 hover:text-red-600"
                      title="Delete kit"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  {kit.location && (
                    <div className="flex items-center gap-2">
                      <MapPin size={14} />
                      <span>{kit.location}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="font-medium text-gray-900">{kit.current_stock}</div>
                      <div className="text-xs">Current</div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{kit.min_stock}</div>
                      <div className="text-xs">Min</div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{kit.max_stock}</div>
                      <div className="text-xs">Max</div>
                    </div>
                  </div>

                  {kit.description && (
                    <p className="text-xs text-gray-500 line-clamp-2 mt-2">
                      {kit.description}
                    </p>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>Updated {new Date(kit.updated_at).toLocaleDateString()}</span>
                    <button className="text-blue-600 hover:text-blue-800">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
