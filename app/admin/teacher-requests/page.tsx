"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, CheckCircle2, XCircle, MessageSquare, Users, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";

interface TeacherRequest {
  id: string;
  teacher_name: string;
  email: string;
  phone?: string;
  school_name: string;
  school_district?: string;
  grade_levels: string[];
  preferred_topics: string[];
  preferred_dates: string;
  student_count?: string;
  special_requirements?: string;
  presentation_history?: string;
  status: string;
  submitted_at: string;
  assigned_to?: string;
  scheduled_date?: string;
  notes?: string;
}

export default function TeacherRequestsPage() {
  const [requests, setRequests] = useState<TeacherRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<TeacherRequest | null>(null);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/admin/teacher-requests");
      const data = await res.json();
      if (data.ok) {
        setRequests(data.requests || []);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (requestId: string, status: string, additionalData?: any) => {
    try {
      const res = await fetch(`/api/admin/teacher-requests/${requestId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, ...additionalData }),
      });

      const data = await res.json();
      if (data.ok) {
        toast.success(`Request ${status}`);
        fetchRequests();
      } else {
        toast.error(data.error || "Failed to update request");
      }
    } catch (error) {
      toast.error("Network error");
    }
  };

  const filteredRequests = requests.filter(req => {
    if (filter === "all") return true;
    return req.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-800 border-green-200";
      case "scheduled": return "bg-blue-100 text-blue-800 border-blue-200";
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "rejected": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teacher Presentation Requests</h1>
          <p className="text-gray-600">Manage and schedule teacher presentation requests</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-yellow-600" />
            <div>
              <div className="text-2xl font-bold">{requests.filter(r => r.status === "pending").length}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-blue-600" />
            <div>
              <div className="text-2xl font-bold">{requests.filter(r => r.status === "scheduled").length}</div>
              <div className="text-sm text-gray-600">Scheduled</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-green-600" />
            <div>
              <div className="text-2xl font-bold">{requests.filter(r => r.status === "completed").length}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <XCircle className="w-8 h-8 text-red-600" />
            <div>
              <div className="text-2xl font-bold">{requests.filter(r => r.status === "rejected").length}</div>
              <div className="text-sm text-gray-600">Rejected</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex gap-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="all">All Requests</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Requests List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">
                Requests ({filteredRequests.length})
              </h2>
            </div>

            <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
              {filteredRequests.map((request) => (
                <div
                  key={request.id}
                  className="p-6 hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedRequest(request)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {request.teacher_name}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                      </div>

                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          {request.school_name}
                        </div>
                        {request.student_count && (
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            {request.student_count} students
                          </div>
                        )}
                        {request.scheduled_date && (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Scheduled: {new Date(request.scheduled_date).toLocaleDateString()}
                          </div>
                        )}
                      </div>

                      <div className="mt-2 flex flex-wrap gap-1">
                        {request.preferred_topics.slice(0, 3).map((topic, idx) => (
                          <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                            {topic}
                          </span>
                        ))}
                        {request.preferred_topics.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                            +{request.preferred_topics.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right text-sm text-gray-500">
                      {new Date(request.submitted_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Request Details */}
        <div>
          {selectedRequest ? (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">Request Details</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Teacher</label>
                  <div className="mt-1 text-sm text-gray-900">{selectedRequest.teacher_name}</div>
                  <div className="text-sm text-gray-600">{selectedRequest.email}</div>
                  {selectedRequest.phone && (
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Phone className="w-3 h-3" />
                      {selectedRequest.phone}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">School</label>
                  <div className="mt-1 text-sm text-gray-900">{selectedRequest.school_name}</div>
                  {selectedRequest.school_district && (
                    <div className="text-sm text-gray-600">District: {selectedRequest.school_district}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Topics</label>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {selectedRequest.preferred_topics.map((topic, idx) => (
                      <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Grade Levels</label>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {selectedRequest.grade_levels.map((grade, idx) => (
                      <span key={idx} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                        {grade}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Preferred Dates</label>
                  <div className="mt-1 text-sm text-gray-900">{selectedRequest.preferred_dates}</div>
                </div>

                {selectedRequest.special_requirements && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Special Requirements</label>
                    <div className="mt-1 text-sm text-gray-900">{selectedRequest.special_requirements}</div>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex gap-2">
                    {selectedRequest.status === "pending" && (
                      <>
                        <button
                          onClick={() => updateRequestStatus(selectedRequest.id, "approved")}
                          className="flex-1 px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => updateRequestStatus(selectedRequest.id, "rejected")}
                          className="flex-1 px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {selectedRequest.status === "approved" && (
                      <button
                        onClick={() => {
                          const date = prompt("Enter scheduled date (YYYY-MM-DD):");
                          if (date) {
                            updateRequestStatus(selectedRequest.id, "scheduled", { scheduled_date: date });
                          }
                        }}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                      >
                        Schedule
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Request</h3>
              <p className="text-gray-600">
                Choose a teacher request from the list to view details and manage the scheduling.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
