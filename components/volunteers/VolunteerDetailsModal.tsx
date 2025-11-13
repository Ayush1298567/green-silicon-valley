"use client";
import { useState } from "react";
import { X, Mail, Phone, Calendar, Clock, Award, TrendingUp, CheckCircle } from "lucide-react";
import { type VolunteerRow, type UserRow, type VolunteerHoursRow, type PresentationRow } from "@/types/db";

interface VolunteerDetailsModalProps {
  volunteer: VolunteerRow;
  user?: UserRow;
  hours: VolunteerHoursRow[];
  presentations: PresentationRow[];
  onClose: () => void;
  currentUserRole?: string; // 'founder' | 'intern' | etc.
}

export default function VolunteerDetailsModal({
  volunteer,
  user,
  hours,
  presentations,
  onClose,
  currentUserRole,
}: VolunteerDetailsModalProps) {
  const [approving, setApproving] = useState(false);
  const [approveMessage, setApproveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleApprove = async () => {
    if (!volunteer) return;
    
    const groupMembers = volunteer.group_members || [];
    const memberCount = Array.isArray(groupMembers) ? groupMembers.length : 0;
    
    if (!confirm(`Approve this volunteer team? This will create user accounts for all ${memberCount} team members.`)) {
      return;
    }

    setApproving(true);
    setApproveMessage(null);

    try {
      const response = await fetch(`/api/volunteers/${volunteer.id}/approve`, {
        method: "POST",
      });

      const result = await response.json();
      
      if (result.ok) {
        setApproveMessage({
          type: "success",
          text: `Team approved! Created ${result.created_users?.length || 0} user account(s).${result.errors?.length > 0 ? ` Note: ${result.errors.length} error(s) occurred.` : ""}`,
        });
        // Refresh the page after 2 seconds
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setApproveMessage({
          type: "error",
          text: `Error: ${result.error}`,
        });
      }
    } catch (error: any) {
      setApproveMessage({
        type: "error",
        text: `Failed to approve: ${error.message}`,
      });
    } finally {
      setApproving(false);
    }
  };

  const canApprove = (currentUserRole === "founder" || currentUserRole === "intern") && 
                     volunteer.application_status === "pending";
  const totalHours = hours.reduce((sum, h) => sum + (h.hours_logged || 0), 0);
  const recentHours = hours
    .filter((h) => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return new Date(h.date || "") >= thirtyDaysAgo;
    })
    .reduce((sum, h) => sum + (h.hours_logged || 0), 0);

  const sortedHours = [...hours].sort((a, b) => 
    new Date(b.date || "").getTime() - new Date(a.date || "").getTime()
  ).slice(0, 10);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full my-8">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-xl">
          <div>
            <h2 className="text-2xl font-bold text-gsv-charcoal">{user?.name || "Volunteer Details"}</h2>
            <p className="text-sm text-gsv-gray mt-1">Volunteer Profile & Activity</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Approve Button (for founders/interns) */}
          {canApprove && (
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-yellow-900 mb-1">Pending Approval</h3>
                  <p className="text-sm text-yellow-800">
                    This volunteer team is waiting for approval. Approving will create user accounts for all team members.
                  </p>
                </div>
                <button
                  onClick={handleApprove}
                  disabled={approving}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {approving ? (
                    <>
                      <Clock className="w-4 h-4 animate-spin" />
                      Approving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Approve Team & Create Accounts
                    </>
                  )}
                </button>
              </div>
              {approveMessage && (
                <div className={`mt-4 p-3 rounded-lg ${
                  approveMessage.type === "success" 
                    ? "bg-green-100 text-green-800 border border-green-300" 
                    : "bg-red-100 text-red-800 border border-red-300"
                }`}>
                  {approveMessage.text}
                </div>
              )}
            </div>
          )}

          {/* Contact Information */}
          <div className="card p-4">
            <h3 className="font-semibold text-lg mb-3">Contact Information</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              {user?.email && (
                <div className="flex items-center gap-2 text-gsv-gray">
                  <Mail className="w-4 h-4" />
                  <span>{user.email}</span>
                </div>
              )}
              {user?.phone && (
                <div className="flex items-center gap-2 text-gsv-gray">
                  <Phone className="w-4 h-4" />
                  <span>{user.phone}</span>
                </div>
              )}
              {user?.school_affiliation && (
                <div className="text-gsv-gray">
                  <strong>School:</strong> {user.school_affiliation}
                </div>
              )}
              {volunteer.emergency_contact_name && (
                <div className="text-gsv-gray">
                  <strong>Emergency Contact:</strong> {volunteer.emergency_contact_name}
                  {volunteer.emergency_contact_phone && ` (${volunteer.emergency_contact_phone})`}
                </div>
              )}
            </div>
          </div>

          {/* Statistics */}
          <div className="grid md:grid-cols-4 gap-4">
            <div className="card p-4 bg-blue-50">
              <div className="flex items-center gap-2 text-blue-600 mb-2">
                <Clock className="w-5 h-5" />
                <span className="text-sm font-medium">Total Hours</span>
              </div>
              <div className="text-3xl font-bold text-blue-900">{Math.round(totalHours)}</div>
            </div>
            <div className="card p-4 bg-green-50">
              <div className="flex items-center gap-2 text-green-600 mb-2">
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm font-medium">Last 30 Days</span>
              </div>
              <div className="text-3xl font-bold text-green-900">{Math.round(recentHours)}h</div>
            </div>
            <div className="card p-4 bg-purple-50">
              <div className="flex items-center gap-2 text-purple-600 mb-2">
                <Award className="w-5 h-5" />
                <span className="text-sm font-medium">Presentations</span>
              </div>
              <div className="text-3xl font-bold text-purple-900">{volunteer.presentations_completed || 0}</div>
            </div>
            <div className="card p-4 bg-orange-50">
              <div className="flex items-center gap-2 text-orange-600 mb-2">
                <Calendar className="w-5 h-5" />
                <span className="text-sm font-medium">Member Since</span>
              </div>
              <div className="text-sm font-bold text-orange-900">
                {volunteer.created_at ? new Date(volunteer.created_at).toLocaleDateString() : "Unknown"}
              </div>
            </div>
          </div>

          {/* Volunteer Info */}
          <div className="card p-4">
            <h3 className="font-semibold text-lg mb-3">Volunteer Information</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong className="text-gsv-charcoal">Status:</strong>
                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                  volunteer.status === "active" ? "bg-green-100 text-green-800" :
                  volunteer.status === "inactive" ? "bg-gray-100 text-gray-800" :
                  "bg-yellow-100 text-yellow-800"
                }`}>
                  {volunteer.status || "active"}
                </span>
              </div>
              <div className="text-gsv-gray">
                <strong className="text-gsv-charcoal">Orientation:</strong>{" "}
                {volunteer.orientation_completed ? (
                  <span className="text-green-600">
                    ✓ Completed {volunteer.orientation_date ? `on ${new Date(volunteer.orientation_date).toLocaleDateString()}` : ""}
                  </span>
                ) : (
                  <span className="text-yellow-600">Pending</span>
                )}
              </div>
              {volunteer.availability && (
                <div className="text-gsv-gray">
                  <strong className="text-gsv-charcoal">Availability:</strong> {volunteer.availability}
                </div>
              )}
              {volunteer.skills_interests && (
                <div className="text-gsv-gray">
                  <strong className="text-gsv-charcoal">Skills/Interests:</strong> {volunteer.skills_interests}
                </div>
              )}
            </div>
          </div>

          {/* Recent Hours Log */}
          <div className="card p-4">
            <h3 className="font-semibold text-lg mb-3">Recent Hours Logged</h3>
            {sortedHours.length === 0 ? (
              <p className="text-sm text-gsv-gray">No hours logged yet</p>
            ) : (
              <div className="space-y-2">
                {sortedHours.map((hour) => (
                  <div key={hour.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-gsv-gray" />
                      <div>
                        <div className="text-sm font-medium text-gsv-charcoal">
                          {hour.date ? new Date(hour.date).toLocaleDateString() : "Unknown Date"}
                        </div>
                        {hour.activity_description && (
                          <div className="text-xs text-gsv-gray">{hour.activity_description}</div>
                        )}
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-gsv-charcoal">
                      {hour.hours_logged} {hour.hours_logged === 1 ? "hour" : "hours"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

