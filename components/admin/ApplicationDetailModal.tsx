"use client";

import { X, Mail, Calendar, Users, School, FileText, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Application {
  id: number;
  type: "volunteer" | "intern" | "teacher";
  name: string;
  email: string;
  submittedDate: string;
  status: string;
  team_name?: string;
  group_members?: any[];
  department?: string;
  // Teacher request fields
  school_name?: string;
  request_type?: string;
  grade_levels?: string;
  preferred_months?: string[];
  topic_interests?: string[];
  classroom_needs?: string;
  additional_notes?: string;
}

interface ApplicationDetailModalProps {
  application: Application | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (id: number, type: string) => void;
  onReject: (id: number, type: string) => void;
}

export default function ApplicationDetailModal({
  application,
  isOpen,
  onClose,
  onApprove,
  onReject
}: ApplicationDetailModalProps) {
  if (!isOpen || !application) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
      case "accepted":
      case "contacted":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "waitlist":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "volunteer":
        return "bg-green-100 text-green-800";
      case "intern":
        return "bg-purple-100 text-purple-800";
      case "teacher":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(application.type)}`}>
                  {application.type}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                  {application.status}
                </span>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <h2 className="mt-4 text-2xl font-bold text-gsv-charcoal">{application.name}</h2>
            <div className="mt-2 flex items-center gap-4 text-sm text-gsv-gray">
              <div className="flex items-center gap-1">
                <Mail className="w-4 h-4" />
                {application.email}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDistanceToNow(new Date(application.submittedDate), { addSuffix: true })}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white px-6 py-6 max-h-[calc(100vh-200px)] overflow-y-auto">
            <div className="space-y-6">
              {/* Volunteer/Intern Specific Info */}
              {(application.type === "volunteer" || application.type === "intern") && (
                <>
                  {application.team_name && (
                    <div>
                      <h3 className="text-sm font-medium text-gsv-charcoal mb-2 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Team Information
                      </h3>
                      <p className="text-gsv-gray">{application.team_name}</p>
                    </div>
                  )}

                  {application.group_members && application.group_members.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gsv-charcoal mb-2 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Group Members ({application.group_members.length})
                      </h3>
                      <div className="space-y-2">
                        {application.group_members.map((member: any, index: number) => (
                          <div key={index} className="bg-gray-50 rounded-lg p-3">
                            <p className="font-medium text-gsv-charcoal">{member.name}</p>
                            {member.email && (
                              <p className="text-sm text-gsv-gray">{member.email}</p>
                            )}
                            {member.phone && (
                              <p className="text-sm text-gsv-gray">{member.phone}</p>
                            )}
                            {member.highschool && (
                              <p className="text-sm text-gsv-gray">High School: {member.highschool}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {application.department && (
                    <div>
                      <h3 className="text-sm font-medium text-gsv-charcoal mb-2">Department</h3>
                      <p className="text-gsv-gray">{application.department}</p>
                    </div>
                  )}
                </>
              )}

              {/* Teacher Request Specific Info */}
              {application.type === "teacher" && (
                <>
                  {application.school_name && (
                    <div>
                      <h3 className="text-sm font-medium text-gsv-charcoal mb-2 flex items-center gap-2">
                        <School className="w-4 h-4" />
                        School Information
                      </h3>
                      <p className="text-gsv-gray">{application.school_name}</p>
                    </div>
                  )}

                  {application.grade_levels && (
                    <div>
                      <h3 className="text-sm font-medium text-gsv-charcoal mb-2 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Grade Levels
                      </h3>
                      <p className="text-gsv-gray">{application.grade_levels}</p>
                    </div>
                  )}

                  {application.request_type && (
                    <div>
                      <h3 className="text-sm font-medium text-gsv-charcoal mb-2">Request Type</h3>
                      <p className="text-gsv-gray capitalize">{application.request_type.replace('_', ' ')}</p>
                    </div>
                  )}

                  {application.preferred_months && application.preferred_months.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gsv-charcoal mb-2">Preferred Months</h3>
                      <div className="flex flex-wrap gap-2">
                        {application.preferred_months.map((month, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                          >
                            {month}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {application.topic_interests && application.topic_interests.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gsv-charcoal mb-2">Topic Interests</h3>
                      <div className="flex flex-wrap gap-2">
                        {application.topic_interests.map((topic, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {application.classroom_needs && (
                    <div>
                      <h3 className="text-sm font-medium text-gsv-charcoal mb-2">Classroom Needs</h3>
                      <p className="text-gsv-gray whitespace-pre-wrap">{application.classroom_needs}</p>
                    </div>
                  )}

                  {application.additional_notes && (
                    <div>
                      <h3 className="text-sm font-medium text-gsv-charcoal mb-2">Additional Notes</h3>
                      <p className="text-gsv-gray whitespace-pre-wrap">{application.additional_notes}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          {application.status === "pending" && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Close
              </button>
              <button
                onClick={() => {
                  if (confirm(`Reject this ${application.type} application?`)) {
                    onReject(application.id, application.type);
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                Reject
              </button>
              <button
                onClick={() => {
                  if (confirm(`Approve this ${application.type} application?`)) {
                    onApprove(application.id, application.type);
                  }
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Approve
              </button>
            </div>
          )}

          {application.status !== "pending" && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gsv-green text-white rounded-lg hover:bg-gsv-greenDark transition"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
