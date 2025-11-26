"use client";

import { useState } from "react";
import { Mail, Phone, Calendar, MapPin, Tag, MoreVertical, Edit, UserCheck, UserX } from "lucide-react";

interface TeacherRelationship {
  id: string;
  school_id: string;
  teacher_name: string;
  email: string;
  phone?: string;
  last_interaction?: string;
  status: string;
  assigned_to?: string;
  notes?: string;
  internal_notes?: string;
  tags: string[];
  schools: {
    name: string;
    district?: string;
    teacher_name?: string;
  };
  interaction_count?: number;
  presentation_count?: number;
}

interface TeacherRelationshipCardProps {
  teacher: TeacherRelationship;
  isSelected: boolean;
  onClick: () => void;
  onUpdate: () => void;
}

export default function TeacherRelationshipCard({
  teacher,
  isSelected,
  onClick,
  onUpdate
}: TeacherRelationshipCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "confirmed": return "bg-blue-100 text-blue-800";
      case "inactive": return "bg-gray-100 text-gray-800";
      case "do_not_contact": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return <UserCheck size={14} />;
      case "inactive":
      case "do_not_contact": return <UserX size={14} />;
      default: return null;
    }
  };

  const updateStatus = async (newStatus: string) => {
    try {
      const res = await fetch(`/api/crm/teachers/${teacher.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (data.ok) {
        onUpdate();
      } else {
        alert("Error updating status: " + data.error);
      }
    } catch (error: any) {
      alert("Error updating status: " + error.message);
    }
    setShowMenu(false);
  };

  const addTag = async (tag: string) => {
    const newTags = [...teacher.tags, tag];
    try {
      const res = await fetch(`/api/crm/teachers/${teacher.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tags: newTags }),
      });

      const data = await res.json();
      if (data.ok) {
        onUpdate();
      }
    } catch (error: any) {
      alert("Error adding tag: " + error.message);
    }
  };

  const removeTag = async (tagToRemove: string) => {
    const newTags = teacher.tags.filter(tag => tag !== tagToRemove);
    try {
      const res = await fetch(`/api/crm/teachers/${teacher.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tags: newTags }),
      });

      const data = await res.json();
      if (data.ok) {
        onUpdate();
      }
    } catch (error: any) {
      alert("Error removing tag: " + error.message);
    }
  };

  const formatLastInteraction = (dateString?: string) => {
    if (!dateString) return "Never";

    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  return (
    <div
      className={`p-4 cursor-pointer transition-colors ${
        isSelected ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50"
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-semibold text-gray-900 truncate">
              {teacher.teacher_name}
            </h3>
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(teacher.status)}`}>
              {getStatusIcon(teacher.status)}
              {teacher.status.replace("_", " ")}
            </span>
          </div>

          {/* School Info */}
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <MapPin size={14} />
            <span className="truncate">{teacher.schools?.name}</span>
            {teacher.schools?.district && (
              <span className="text-gray-400">• {teacher.schools.district}</span>
            )}
          </div>

          {/* Contact Info */}
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
            <div className="flex items-center gap-1">
              <Mail size={14} />
              <span className="truncate">{teacher.email}</span>
            </div>
            {teacher.phone && (
              <div className="flex items-center gap-1">
                <Phone size={14} />
                <span>{teacher.phone}</span>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
            <span>{teacher.interaction_count || 0} interactions</span>
            <span>{teacher.presentation_count || 0} presentations</span>
            <span>Last contact: {formatLastInteraction(teacher.last_interaction)}</span>
          </div>

          {/* Tags */}
          {teacher.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {teacher.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                >
                  <Tag size={10} />
                  {tag.replace("_", " ")}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeTag(tag);
                    }}
                    className="ml-1 hover:text-red-600"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Notes Preview */}
          {teacher.notes && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {teacher.notes}
            </p>
          )}
        </div>

        {/* Actions Menu */}
        <div className="relative ml-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <MoreVertical size={16} />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[160px]">
              <div className="py-1">
                <button
                  onClick={() => updateStatus("active")}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                >
                  Mark as Active
                </button>
                <button
                  onClick={() => updateStatus("pending")}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                >
                  Mark as Pending
                </button>
                <button
                  onClick={() => updateStatus("confirmed")}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                >
                  Mark as Confirmed
                </button>
                <button
                  onClick={() => updateStatus("inactive")}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                >
                  Mark as Inactive
                </button>
                <div className="border-t my-1"></div>
                <button
                  onClick={() => addTag("high_priority")}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                >
                  Add High Priority Tag
                </button>
                <button
                  onClick={() => addTag("follow_up_needed")}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                >
                  Add Follow-up Tag
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
