"use client";

import { useState } from "react";
import { User, Mail, Calendar, Clock, AlertTriangle, CheckCircle, MoreVertical } from "lucide-react";

interface PipelineApplicant {
  id: string;
  applicant_id: string;
  applicant_type: string;
  current_stage: string;
  status: string;
  assigned_to?: string;
  priority: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  users?: {
    name: string;
    email: string;
  };
}

interface ApplicantCardProps {
  applicant: PipelineApplicant;
  onUpdate: () => void;
}

export default function ApplicantCard({ applicant, onUpdate }: ApplicantCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "urgent": return <AlertTriangle size={14} className="text-red-600" />;
      case "high": return <AlertTriangle size={14} className="text-orange-600" />;
      case "medium": return <Clock size={14} className="text-yellow-600" />;
      case "low": return <CheckCircle size={14} className="text-green-600" />;
      default: return null;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "border-red-300 bg-red-50";
      case "high": return "border-orange-300 bg-orange-50";
      case "medium": return "border-yellow-300 bg-yellow-50";
      case "low": return "border-green-300 bg-green-50";
      default: return "border-gray-300 bg-white";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted": return "bg-green-100 text-green-800";
      case "rejected": return "bg-red-100 text-red-800";
      case "onboarded": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      const res = await fetch(`/api/recruitment/applicants/${applicant.id}`, {
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

  const daysSinceApplication = Math.floor(
    (new Date().getTime() - new Date(applicant.created_at).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className={`border-2 rounded-lg p-4 transition-all hover:shadow-md ${getPriorityColor(applicant.priority)}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h4 className="font-medium text-gray-900 text-sm">
              {applicant.users?.name || "Unknown Applicant"}
            </h4>
            <p className="text-xs text-gray-600 capitalize">
              {applicant.applicant_type}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {getPriorityIcon(applicant.priority)}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <MoreVertical size={14} />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-6 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                <div className="py-1">
                  <button
                    onClick={() => handleStatusChange("accepted")}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 text-green-700"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleStatusChange("rejected")}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 text-red-700"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleStatusChange("onboarded")}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 text-purple-700"
                  >
                    Onboard
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-1 mb-3">
        {applicant.users?.email && (
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Mail size={12} />
            <span className="truncate">{applicant.users.email}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <Calendar size={12} />
          <span>{daysSinceApplication} days ago</span>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center justify-between">
        <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getStatusColor(applicant.status)}`}>
          {applicant.status}
        </span>

        {applicant.assigned_to && (
          <span className="text-xs text-gray-500">
            Assigned
          </span>
        )}
      </div>

      {/* Notes Preview */}
      {applicant.notes && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-600 line-clamp-2">
            {applicant.notes}
          </p>
        </div>
      )}
    </div>
  );
}
