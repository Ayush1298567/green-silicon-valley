"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff, Users, Lock, Globe, Check } from "lucide-react";
import { visibilityManager } from "@/lib/visibility/visibilityManager";

interface VisibilityControlProps {
  resourceType: string;
  resourceId: string;
  currentVisibility?: string[];
  onVisibilityChange?: (visibility: string[]) => void;
  className?: string;
  compact?: boolean;
}

const AVAILABLE_ROLES = [
  { value: 'public', label: 'Public', description: 'Visible to everyone', icon: Globe },
  { value: 'founder', label: 'Founders', description: 'Only founders can see', icon: Lock },
  { value: 'intern', label: 'Interns', description: 'Interns and above', icon: Users },
  { value: 'volunteer', label: 'Volunteers', description: 'Volunteers and above', icon: Users },
  { value: 'teacher', label: 'Teachers', description: 'Teachers and above', icon: Users },
  { value: 'outreach', label: 'Outreach', description: 'Outreach team only', icon: Users },
];

export default function VisibilityControl({
  resourceType,
  resourceId,
  currentVisibility = [],
  onVisibilityChange,
  className = "",
  compact = false
}: VisibilityControlProps) {
  const [selectedRoles, setSelectedRoles] = useState<string[]>(currentVisibility);
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setSelectedRoles(currentVisibility);
  }, [currentVisibility]);

  const handleRoleToggle = (role: string) => {
    let newRoles: string[];

    if (role === 'public') {
      // If selecting public, clear all other roles
      newRoles = selectedRoles.includes('public') ? [] : ['public'];
    } else {
      // If selecting a specific role, remove public
      newRoles = selectedRoles.includes(role)
        ? selectedRoles.filter(r => r !== role)
        : [...selectedRoles.filter(r => r !== 'public'), role];
    }

    setSelectedRoles(newRoles);
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!hasChanges) return;

    setIsLoading(true);
    try {
      await visibilityManager.setVisibility(
        resourceType,
        resourceId,
        selectedRoles.filter(role => role !== 'public'),
        { isPublic: selectedRoles.includes('public') }
      );

      onVisibilityChange?.(selectedRoles);
      setHasChanges(false);
    } catch (error) {
      console.error('Error updating visibility:', error);
      alert('Failed to update visibility settings');
    } finally {
      setIsLoading(false);
    }
  };

  const getVisibilityLabel = () => {
    if (selectedRoles.includes('public')) {
      return 'Public';
    }
    if (selectedRoles.length === 0) {
      return 'Private';
    }
    if (selectedRoles.length === 1) {
      const role = AVAILABLE_ROLES.find(r => r.value === selectedRoles[0]);
      return role?.label || selectedRoles[0];
    }
    return `${selectedRoles.length} roles`;
  };

  const getVisibilityIcon = () => {
    if (selectedRoles.includes('public')) {
      return <Globe className="w-4 h-4 text-green-600" />;
    }
    if (selectedRoles.length === 0) {
      return <Lock className="w-4 h-4 text-red-600" />;
    }
    return <Eye className="w-4 h-4 text-blue-600" />;
  };

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        {getVisibilityIcon()}
        <span className="text-sm text-gray-600">{getVisibilityLabel()}</span>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-gray-600" />
          <h3 className="text-sm font-medium text-gray-900">Visibility Settings</h3>
        </div>
        {hasChanges && (
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"
          >
            {isLoading ? (
              <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Check className="w-3 h-3" />
            )}
            Save
          </button>
        )}
      </div>

      <div className="space-y-3">
        <p className="text-sm text-gray-600">
          Choose who can see this {resourceType.replace('_', ' ')}:
        </p>

        <div className="grid grid-cols-2 gap-3">
          {AVAILABLE_ROLES.map((role) => {
            const isSelected = selectedRoles.includes(role.value);
            const Icon = role.icon;

            return (
              <button
                key={role.value}
                onClick={() => handleRoleToggle(role.value)}
                className={`p-3 border rounded-lg text-left transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 text-blue-900'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <div className="flex items-start gap-3">
                  <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                    isSelected ? 'text-blue-600' : 'text-gray-400'
                  }`} />
                  <div>
                    <div className="text-sm font-medium">{role.label}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {role.description}
                    </div>
                  </div>
                  {isSelected && (
                    <Check className="w-4 h-4 text-blue-600 ml-auto flex-shrink-0" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {selectedRoles.length === 0 && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <Lock className="w-4 h-4 text-red-600" />
            <span className="text-sm text-red-800">
              This {resourceType.replace('_', ' ')} is currently private and only visible to founders.
            </span>
          </div>
        )}

        {hasChanges && (
          <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <EyeOff className="w-4 h-4 text-yellow-600" />
            <span className="text-sm text-yellow-800">
              You have unsaved changes. Click "Save" to apply the new visibility settings.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// Compact visibility badge component
export function VisibilityBadge({
  visibility,
  className = ""
}: {
  visibility: string[];
  className?: string;
}) {
  const getVisibilityInfo = () => {
    if (visibility.includes('public')) {
      return { label: 'Public', color: 'bg-green-100 text-green-800', icon: Globe };
    }
    if (visibility.length === 0) {
      return { label: 'Private', color: 'bg-red-100 text-red-800', icon: Lock };
    }
    if (visibility.length === 1) {
      const role = AVAILABLE_ROLES.find(r => r.value === visibility[0]);
      return {
        label: role?.label || visibility[0],
        color: 'bg-blue-100 text-blue-800',
        icon: Users
      };
    }
    return {
      label: `${visibility.length} roles`,
      color: 'bg-blue-100 text-blue-800',
      icon: Users
    };
  };

  const { label, color, icon: Icon } = getVisibilityInfo();

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${color} ${className}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}

// Visibility selector dropdown
export function VisibilitySelector({
  currentVisibility,
  onChange,
  className = ""
}: {
  currentVisibility: string[];
  onChange: (visibility: string[]) => void;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const getVisibilityLabel = () => {
    if (currentVisibility.includes('public')) return 'Public';
    if (currentVisibility.length === 0) return 'Private';
    if (currentVisibility.length === 1) {
      const role = AVAILABLE_ROLES.find(r => r.value === currentVisibility[0]);
      return role?.label || currentVisibility[0];
    }
    return `${currentVisibility.length} roles`;
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
      >
        <Eye className="w-4 h-4 text-gray-600" />
        <span className="text-sm text-gray-700">{getVisibilityLabel()}</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
            <div className="p-2">
              {AVAILABLE_ROLES.map((role) => {
                const isSelected = currentVisibility.includes(role.value);
                const Icon = role.icon;

                return (
                  <button
                    key={role.value}
                    onClick={() => {
                      let newVisibility: string[];
                      if (role.value === 'public') {
                        newVisibility = isSelected ? [] : ['public'];
                      } else {
                        newVisibility = isSelected
                          ? currentVisibility.filter(r => r !== role.value)
                          : [...currentVisibility.filter(r => r !== 'public'), role.value];
                      }
                      onChange(newVisibility);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 rounded"
                  >
                    <Icon className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{role.label}</div>
                      <div className="text-xs text-gray-500">{role.description}</div>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-blue-600 ml-auto" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
