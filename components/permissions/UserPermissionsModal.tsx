"use client";
import { useState, useEffect } from "react";
import { X, Save, Shield } from "lucide-react";
import { type UserRow } from "@/types/db";

interface UserPermissionsModalProps {
  user: UserRow;
  availablePermissions: any;
  onClose: () => void;
  onSave: () => void;
}

export default function UserPermissionsModal({ user, availablePermissions, onClose, onSave }: UserPermissionsModalProps) {
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Load current permissions
    if (user.permissions && typeof user.permissions === 'object') {
      const current = new Set<string>();
      Object.entries(user.permissions).forEach(([key, value]) => {
        if (value === true) current.add(key);
      });
      setSelectedPermissions(current);
    }
  }, [user]);

  const togglePermission = (key: string) => {
    const newSet = new Set(selectedPermissions);
    if (newSet.has(key)) {
      newSet.delete(key);
    } else {
      newSet.add(key);
    }
    setSelectedPermissions(newSet);
  };

  const selectAllInCategory = (category: any) => {
    const newSet = new Set(selectedPermissions);
    category.permissions.forEach((perm: any) => {
      newSet.add(perm.key);
    });
    setSelectedPermissions(newSet);
  };

  const deselectAllInCategory = (category: any) => {
    const newSet = new Set(selectedPermissions);
    category.permissions.forEach((perm: any) => {
      newSet.delete(perm.key);
    });
    setSelectedPermissions(newSet);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const permissionsObj: any = {};
      selectedPermissions.forEach(key => {
        permissionsObj[key] = true;
      });

      const res = await fetch(`/api/users/${user.id}/permissions`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissions: permissionsObj }),
      });

      if (res.ok) {
        onSave();
        alert("Permissions updated successfully!");
      } else {
        alert("Failed to update permissions");
      }
    } catch (error) {
      console.error("Error updating permissions:", error);
      alert("Error updating permissions");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full my-8">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-xl">
          <div>
            <h2 className="text-2xl font-bold text-gsv-charcoal">Manage Permissions</h2>
            <p className="text-sm text-gsv-gray mt-1">{user.name} ({user.email})</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <div className="space-y-6">
            {Object.entries(availablePermissions).map(([categoryKey, category]: [string, any]) => {
              const allSelected = category.permissions.every((p: any) => selectedPermissions.has(p.key));
              const someSelected = category.permissions.some((p: any) => selectedPermissions.has(p.key));

              return (
                <div key={categoryKey} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg text-gsv-charcoal">{category.label}</h3>
                    <div className="flex gap-2">
                      {someSelected && !allSelected && (
                        <button
                          onClick={() => deselectAllInCategory(category)}
                          className="text-xs px-3 py-1 border border-red-300 text-red-600 rounded hover:bg-red-50"
                        >
                          Deselect All
                        </button>
                      )}
                      {!allSelected && (
                        <button
                          onClick={() => selectAllInCategory(category)}
                          className="text-xs px-3 py-1 border border-gsv-green text-gsv-green rounded hover:bg-green-50"
                        >
                          Select All
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    {category.permissions.map((permission: any) => (
                      <label
                        key={permission.key}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition"
                      >
                        <input
                          type="checkbox"
                          checked={selectedPermissions.has(permission.key)}
                          onChange={() => togglePermission(permission.key)}
                          className="rounded border-gray-300 text-gsv-green focus:ring-gsv-green"
                        />
                        <div>
                          <div className="text-sm font-medium text-gsv-charcoal">{permission.label}</div>
                          <div className="text-xs text-gsv-gray">{permission.key}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-blue-900">Permission Summary</span>
            </div>
            <p className="text-sm text-blue-800">
              {selectedPermissions.size} {selectedPermissions.size === 1 ? "permission" : "permissions"} selected
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="border-t px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gsv-charcoal rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2 bg-gsv-green text-white rounded-lg hover:bg-gsv-green/90 transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Permissions"}
          </button>
        </div>
      </div>
    </div>
  );
}

