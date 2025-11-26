"use client";

import { useState, useEffect } from "react";
import { UserPlus, Mail, Calendar, Check, X, Search, Filter, Download, Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import ApplicationDetailModal from "@/components/admin/ApplicationDetailModal";

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

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<"all" | "volunteer" | "intern" | "teacher">("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    loadApplications();
  }, [typeFilter, statusFilter]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/applications");
      const data = await res.json();
      
      if (data.ok) {
        let filtered = data.applications || [];
        
        if (typeFilter !== "all") {
          filtered = filtered.filter((app: Application) => app.type === typeFilter);
        }
        
        if (statusFilter !== "all") {
          filtered = filtered.filter((app: Application) => app.status === statusFilter);
        }
        
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          filtered = filtered.filter((app: Application) =>
            app.name?.toLowerCase().includes(query) ||
            app.email?.toLowerCase().includes(query) ||
            app.team_name?.toLowerCase().includes(query)
          );
        }
        
        setApplications(filtered);
      }
    } catch (error) {
      console.error("Error loading applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number, type: string) => {
    try {
      const res = await fetch(`/api/applications/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type })
      });

      const data = await res.json();
      if (data.ok) {
        setShowDetailModal(false);
        setSelectedApplication(null);
        loadApplications();
      } else {
        alert(data.error || "Failed to approve application");
      }
    } catch (error) {
      console.error("Error approving application:", error);
      alert("Failed to approve application");
    }
  };

  const handleReject = async (id: number, type: string) => {
    const reason = prompt("Rejection reason:");
    if (!reason) return;

    try {
      const res = await fetch(`/api/applications/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, reason })
      });

      const data = await res.json();
      if (data.ok) {
        setShowDetailModal(false);
        setSelectedApplication(null);
        loadApplications();
      } else {
        alert(data.error || "Failed to reject application");
      }
    } catch (error) {
      console.error("Error rejecting application:", error);
      alert("Failed to reject application");
    }
  };

  const handleViewDetails = (app: Application) => {
    setSelectedApplication(app);
    setShowDetailModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
      case "accepted":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "contacted":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const pendingCount = applications.filter(a => a.status === "pending").length;

  return (
    <div className="container py-14">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gsv-charcoal mb-2">Applications</h1>
        <p className="text-gsv-gray">
          Review and manage volunteer and intern applications
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6 flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[300px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gsv-gray w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name, email, or team..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                loadApplications();
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green"
            />
          </div>
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green"
        >
          <option value="all">All Types</option>
          <option value="volunteer">Volunteers</option>
          <option value="intern">Interns</option>
          <option value="teacher">Teacher Requests</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending ({pendingCount})</option>
          <option value="contacted">Contacted</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="text-center py-12 text-gsv-gray">Loading applications...</div>
      ) : applications.length === 0 ? (
        <div className="card p-12 text-center">
          <UserPlus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gsv-gray text-lg">No applications found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div
              key={app.id}
              className="card p-6 border-l-4 border-l-gsv-green hover:shadow-lg transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-gsv-charcoal">{app.name}</h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        app.type === "intern" 
                          ? "bg-purple-100 text-purple-800" 
                          : app.type === "teacher"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {app.type}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                      {app.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gsv-gray">
                    <div className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {app.email}
                    </div>
                    {app.team_name && (
                      <div className="flex items-center gap-1">
                        <span>Team: {app.team_name}</span>
                      </div>
                    )}
                    {app.department && (
                      <div className="flex items-center gap-1">
                        <span>Department: {app.department}</span>
                      </div>
                    )}
                    {app.school_name && (
                      <div className="flex items-center gap-1">
                        <span>School: {app.school_name}</span>
                      </div>
                    )}
                    {app.grade_levels && (
                      <div className="flex items-center gap-1">
                        <span>Grades: {app.grade_levels}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDistanceToNow(new Date(app.submittedDate), { addSuffix: true })}
                    </div>
                  </div>
                  {app.group_members && app.group_members.length > 0 && (
                    <div className="mt-3 text-sm">
                      <span className="font-medium text-gsv-charcoal">Group Members: </span>
                      <span className="text-gsv-gray">
                        {app.group_members.map((m: any) => m.name).join(", ")}
                      </span>
                    </div>
                  )}
                  {app.type === "teacher" && (
                    <div className="mt-3 space-y-2 text-sm">
                      {app.request_type && (
                        <div>
                          <span className="font-medium text-gsv-charcoal">Request Type: </span>
                          <span className="text-gsv-gray">{app.request_type}</span>
                        </div>
                      )}
                      {app.preferred_months && app.preferred_months.length > 0 && (
                        <div>
                          <span className="font-medium text-gsv-charcoal">Preferred Months: </span>
                          <span className="text-gsv-gray">{app.preferred_months.join(", ")}</span>
                        </div>
                      )}
                      {app.topic_interests && app.topic_interests.length > 0 && (
                        <div>
                          <span className="font-medium text-gsv-charcoal">Topic Interests: </span>
                          <span className="text-gsv-gray">{app.topic_interests.join(", ")}</span>
                        </div>
                      )}
                      {app.classroom_needs && (
                        <div>
                          <span className="font-medium text-gsv-charcoal">Classroom Needs: </span>
                          <span className="text-gsv-gray">{app.classroom_needs}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {app.status === "pending" && (
                <div className="flex gap-2 pt-4 border-t">
                  <button
                    onClick={() => handleViewDetails(app)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                  <button
                    onClick={() => handleApprove(app.id, app.type)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(app.id, app.type)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              )}
              
              {app.status !== "pending" && (
                <div className="flex gap-2 pt-4 border-t">
                  <button
                    onClick={() => handleViewDetails(app)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Application Detail Modal */}
      <ApplicationDetailModal
        application={selectedApplication}
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedApplication(null);
        }}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
}

