"use client";

import { useState, useEffect } from "react";
import { Settings, Save, Users, Target, FolderOpen } from "lucide-react";

interface DepartmentConfigProps {
  departmentId: string;
}

export default function DepartmentConfig({ departmentId }: DepartmentConfigProps) {
  const [config, setConfig] = useState({
    dashboard_layout: "default",
    custom_fields: {},
    notifications_enabled: true,
    auto_assign_tasks: false,
    resource_categories: [] as string[]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConfig();
  }, [departmentId]);

  const fetchConfig = async () => {
    try {
      const res = await fetch(`/api/departments/${departmentId}/config`);
      const data = await res.json();
      if (data.ok) {
        setConfig(data.config || config);
      }
    } catch (error) {
      console.error("Error fetching config:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    try {
      const res = await fetch(`/api/departments/${departmentId}/config`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      const data = await res.json();
      if (data.ok) {
        alert("Configuration saved successfully!");
      } else {
        alert("Error saving configuration: " + data.error);
      }
    } catch (error: any) {
      alert("Error saving configuration: " + error.message);
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
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Department Configuration</h2>
        <p className="text-gray-600">Customize settings and preferences for your department</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dashboard Settings */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Dashboard Settings
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dashboard Layout
              </label>
              <select
                value={config.dashboard_layout}
                onChange={(e) => setConfig(prev => ({ ...prev, dashboard_layout: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="default">Default Layout</option>
                <option value="compact">Compact Layout</option>
                <option value="detailed">Detailed Layout</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="notifications"
                checked={config.notifications_enabled}
                onChange={(e) => setConfig(prev => ({ ...prev, notifications_enabled: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <label htmlFor="notifications" className="text-sm text-gray-700">
                Enable email notifications for department updates
              </label>
            </div>
          </div>
        </div>

        {/* Task Management */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5" />
            Task Management
          </h3>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="auto-assign"
                checked={config.auto_assign_tasks}
                onChange={(e) => setConfig(prev => ({ ...prev, auto_assign_tasks: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <label htmlFor="auto-assign" className="text-sm text-gray-700">
                Auto-assign tasks to team members
              </label>
            </div>
          </div>
        </div>

        {/* Resource Categories */}
        <div className="border border-gray-200 rounded-lg p-6 md:col-span-2">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <FolderOpen className="w-5 h-5" />
            Resource Categories
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Resource Categories (comma-separated)
              </label>
              <input
                type="text"
                value={config.resource_categories.join(", ")}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  resource_categories: e.target.value.split(",").map(cat => cat.trim()).filter(Boolean)
                }))}
                placeholder="e.g., Templates, Guidelines, Training Materials"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveConfig}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Save size={16} />
          Save Configuration
        </button>
      </div>
    </div>
  );
}
