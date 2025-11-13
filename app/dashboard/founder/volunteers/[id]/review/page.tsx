"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ExternalLink, Check, X, MessageSquare, Calendar, Users, Clock, FileText, AlertCircle } from "lucide-react";
import CommentThread from "@/components/comments/CommentThread";
import { formatDistanceToNow } from "date-fns";

interface VolunteerData {
  id: number;
  team_name: string | null;
  presentation_draft_url: string | null;
  slides_shared: boolean;
  presentation_status: string;
  onboarding_step: string;
  selected_topic_id: number | null;
  hours_total: number;
  group_members: any[];
  topic: {
    name: string;
    description: string;
  } | null;
}

export default function VolunteerReviewPage() {
  const params = useParams();
  const router = useRouter();
  const volunteerId = params.id as string;
  
  const [volunteer, setVolunteer] = useState<VolunteerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [currentUserRole, setCurrentUserRole] = useState<string>("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadData();
  }, [volunteerId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const userRes = await fetch("/api/auth/session");
      const userData = await userRes.json();
      if (userData.user) {
        setCurrentUserId(userData.user.id);
        setCurrentUserRole(userData.user.role || "founder");
      }

      // Load volunteer data
      const res = await fetch(`/api/volunteers/${volunteerId}`);
      const data = await res.json();
      
      if (data.ok) {
        setVolunteer(data.volunteer);
      }
    } catch (error) {
      console.error("Error loading volunteer:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!confirm(`Change status to "${newStatus}"?`)) return;

    try {
      setUpdating(true);
      const res = await fetch(`/api/volunteers/${volunteerId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ presentation_status: newStatus })
      });

      const data = await res.json();
      if (data.ok) {
        await loadData();
      } else {
        alert(data.error || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
      case "completed":
        return "bg-green-100 text-green-800";
      case "submitted_for_review":
      case "in_review":
        return "bg-blue-100 text-blue-800";
      case "needs_changes":
        return "bg-yellow-100 text-yellow-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="container py-14">
        <div className="text-center py-12 text-gsv-gray">Loading...</div>
      </div>
    );
  }

  if (!volunteer) {
    return (
      <div className="container py-14">
        <div className="text-center py-12 text-gsv-gray">Volunteer not found</div>
      </div>
    );
  }

  return (
    <div className="container py-14">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-gsv-green hover:underline mb-4"
          >
            ← Back to Volunteers
          </button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gsv-charcoal mb-2">
                {volunteer.team_name || `Team #${volunteer.id}`}
              </h1>
              <div className="flex items-center gap-4 text-sm text-gsv-gray">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {volunteer.hours_total || 0} total hours
                </span>
                {volunteer.topic && (
                  <span className="flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    Topic: {volunteer.topic.name}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(volunteer.presentation_status || "draft")}`}>
                {volunteer.presentation_status || "draft"}
              </span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Presentation Link */}
            {volunteer.presentation_draft_url && (
              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gsv-charcoal flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Google Slides Presentation
                  </h2>
                  {volunteer.slides_shared ? (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Shared
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Not Shared
                    </span>
                  )}
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <a
                    href={volunteer.presentation_draft_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gsv-green hover:underline break-all flex items-center gap-2"
                  >
                    {volunteer.presentation_draft_url}
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                <a
                  href={volunteer.presentation_draft_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gsv-green text-white rounded-lg hover:bg-gsv-greenDark transition"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open Presentation
                </a>

                {!volunteer.slides_shared && (
                  <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      <strong>Note:</strong> The volunteer has not confirmed sharing the presentation with greensiliconvalley27@gmail.com. 
                      You may not have access to view it.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Comments Section */}
            <div className="card p-6">
              <CommentThread
                volunteerId={volunteer.id}
                currentUserId={currentUserId}
                currentUserRole={currentUserRole}
              />
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gsv-charcoal mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => handleStatusChange("approved")}
                  disabled={updating || volunteer.presentation_status === "approved"}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Approve Presentation
                </button>
                <button
                  onClick={() => handleStatusChange("needs_changes")}
                  disabled={updating}
                  className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  Request Changes
                </button>
                <button
                  onClick={() => {
                    const date = prompt("Schedule date (YYYY-MM-DD):");
                    if (date) {
                      // TODO: Implement scheduling
                      alert("Scheduling feature coming soon");
                    }
                  }}
                  disabled={updating || volunteer.presentation_status !== "approved"}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  Schedule Presentation
                </button>
              </div>
            </div>

            {/* Team Information */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gsv-charcoal mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Team Members
              </h3>
              {volunteer.group_members && volunteer.group_members.length > 0 ? (
                <div className="space-y-2">
                  {volunteer.group_members.map((member: any, index: number) => (
                    <div key={index} className="text-sm">
                      <div className="font-medium text-gsv-charcoal">{member.name}</div>
                      <div className="text-gsv-gray text-xs">{member.email}</div>
                      {member.phone && (
                        <div className="text-gsv-gray text-xs">{member.phone}</div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gsv-gray">No team members listed</p>
              )}
            </div>

            {/* Status History */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gsv-charcoal mb-4">Status</h3>
              <div className="space-y-2">
                <div>
                  <label className="text-sm font-medium text-gsv-charcoal block mb-2">
                    Current Status
                  </label>
                  <select
                    value={volunteer.presentation_status || "draft"}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    disabled={updating}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gsv-green"
                  >
                    <option value="draft">Draft</option>
                    <option value="submitted_for_review">Submitted for Review</option>
                    <option value="in_review">In Review</option>
                    <option value="needs_changes">Needs Changes</option>
                    <option value="approved">Approved</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div className="text-xs text-gsv-gray mt-2">
                  Onboarding Step: {volunteer.onboarding_step || "pending"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

