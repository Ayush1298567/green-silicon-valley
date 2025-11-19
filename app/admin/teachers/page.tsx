"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { redirect } from "next/navigation";
import { getDashboardPathForRole, type UserRole } from "@/lib/auth/roles";
import { Search, Filter, Plus, Edit3, MessageSquare, Calendar, Phone, Mail, ExternalLink, Star } from "lucide-react";

interface SchoolApplication {
  id: number;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  state?: string;
  grade_levels?: string;
  preferred_months?: string[];
  topic_interests?: string[];
  classroom_needs?: string;
  additional_notes?: string;
  application_status: string;
  priority: string;
  internal_notes?: string;
  teacher_notes?: string;
  last_contacted?: string;
  follow_up_date?: string;
  relationship_score: number;
  preferred_contact_method: string;
  application_source: string;
  contact_history?: any[];
  created_at: string;
  total_presentations_hosted?: number;
}

export default function TeachersManagementPage() {
  const supabase = createClientComponentClient();
  const [applications, setApplications] = useState<SchoolApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selectedApplication, setSelectedApplication] = useState<SchoolApplication | null>(null);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [internalNotes, setInternalNotes] = useState("");

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        redirect("/login");
        return;
      }

      const { data: rows } = await supabase.from("users").select("role").eq("id", session.user.id).limit(1);
      const role = (rows?.[0]?.role as UserRole) ?? "volunteer";
      if (role !== "founder" && role !== "intern") {
        redirect(getDashboardPathForRole(role));
        return;
      }

      // Get all school applications with enhanced fields
      const { data: schools, error } = await supabase
        .from("schools")
        .select(`
          *,
          presentations:presentations(count)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Process the data to include presentation counts
      const processedSchools = schools?.map(school => ({
        ...school,
        total_presentations_hosted: Array.isArray(school.presentations)
          ? school.presentations.length
          : 0
      })) || [];

      setApplications(processedSchools);
    } catch (error) {
      console.error("Error loading applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (schoolId: number, status: string) => {
    try {
      const { error } = await supabase
        .from("schools")
        .update({
          application_status: status,
          last_contacted: new Date().toISOString()
        })
        .eq("id", schoolId);

      if (error) throw error;
      await loadApplications();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const updateApplicationPriority = async (schoolId: number, priority: string) => {
    try {
      const { error } = await supabase
        .from("schools")
        .update({ priority })
        .eq("id", schoolId);

      if (error) throw error;
      await loadApplications();
    } catch (error) {
      console.error("Error updating priority:", error);
    }
  };

  const saveInternalNotes = async () => {
    if (!selectedApplication) return;

    try {
      const { error } = await supabase
        .from("schools")
        .update({
          internal_notes: internalNotes,
          last_contacted: new Date().toISOString()
        })
        .eq("id", selectedApplication.id);

      if (error) throw error;
      await loadApplications();
      setShowNotesModal(false);
      setSelectedApplication(null);
      setInternalNotes("");
    } catch (error) {
      console.error("Error saving notes:", error);
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.city?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || app.application_status === statusFilter;
    const matchesPriority = priorityFilter === "all" || app.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "scheduled": return "bg-blue-100 text-blue-800";
      case "contacted": return "bg-yellow-100 text-yellow-800";
      case "reviewed": return "bg-purple-100 text-purple-800";
      case "rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="container py-10">
        <div className="text-center py-12 text-gsv-gray">Loading teacher applications...</div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gsv-charcoal mb-2">Teacher Applications</h1>
          <p className="text-gsv-gray">
            Manage teacher applications, track relationships, and coordinate presentations
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="card p-4">
            <div className="text-2xl font-bold text-gsv-green">{applications.length}</div>
            <div className="text-sm text-gsv-gray">Total Applications</div>
          </div>
          <div className="card p-4">
            <div className="text-2xl font-bold text-blue-600">
              {applications.filter(a => a.application_status === 'pending').length}
            </div>
            <div className="text-sm text-gsv-gray">Pending Review</div>
          </div>
          <div className="card p-4">
            <div className="text-2xl font-bold text-purple-600">
              {applications.filter(a => a.application_status === 'scheduled').length}
            </div>
            <div className="text-sm text-gsv-gray">Scheduled</div>
          </div>
          <div className="card p-4">
            <div className="text-2xl font-bold text-green-600">
              {applications.filter(a => a.application_status === 'completed').length}
            </div>
            <div className="text-sm text-gsv-gray">Completed</div>
          </div>
        </div>

        {/* Filters */}
        <div className="card p-4 mb-6">
          <div className="grid md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gsv-gray w-4 h-4" />
              <input
                type="text"
                placeholder="Search schools..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="contacted">Contacted</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>

            {/* AI Assistant Button */}
            <button
              onClick={() => window.open('/dashboard/founder/assistant?context=teachers', '_blank')}
              className="flex items-center gap-2 px-4 py-2 bg-gsv-green text-white rounded-lg hover:bg-gsv-green/90 transition"
            >
              <MessageSquare className="w-4 h-4" />
              AI Assistant
            </button>
          </div>
        </div>

        {/* Applications Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gsv-charcoal uppercase tracking-wider">
                    School
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gsv-charcoal uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gsv-charcoal uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gsv-charcoal uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gsv-charcoal uppercase tracking-wider">
                    Presentations
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gsv-charcoal uppercase tracking-wider">
                    Last Contacted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gsv-charcoal uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredApplications.map((application) => (
                  <tr key={application.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gsv-charcoal">
                          {application.name}
                        </div>
                        <div className="text-sm text-gsv-gray">
                          {application.city && application.state
                            ? `${application.city}, ${application.state}`
                            : 'Location not specified'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {application.preferred_contact_method === 'email' && (
                          <Mail className="w-4 h-4 text-gray-400" />
                        )}
                        {application.preferred_contact_method === 'phone' && (
                          <Phone className="w-4 h-4 text-gray-400" />
                        )}
                        <div>
                          <div className="text-sm text-gsv-charcoal">{application.email}</div>
                          {application.phone && (
                            <div className="text-sm text-gsv-gray">{application.phone}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={application.application_status}
                        onChange={(e) => updateApplicationStatus(application.id, e.target.value)}
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.application_status)}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="contacted">Contacted</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="completed">Completed</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={application.priority}
                        onChange={(e) => updateApplicationPriority(application.id, e.target.value)}
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(application.priority)}`}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gsv-charcoal">
                        {application.total_presentations_hosted || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gsv-gray">
                        {application.last_contacted
                          ? new Date(application.last_contacted).toLocaleDateString()
                          : 'Never'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedApplication(application);
                            setInternalNotes(application.internal_notes || '');
                            setShowNotesModal(true);
                          }}
                          className="text-gsv-green hover:text-gsv-green/80"
                          title="Add Notes"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => window.open(`/dashboard/founder/assistant?context=teacher&id=${application.id}`, '_blank')}
                          className="text-blue-600 hover:text-blue-600/80"
                          title="AI Assistant"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < Math.floor(application.relationship_score / 2)
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredApplications.length === 0 && (
            <div className="text-center py-12 text-gsv-gray">
              No teacher applications found matching your filters.
            </div>
          )}
        </div>

        {/* Notes Modal */}
        {showNotesModal && selectedApplication && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gsv-charcoal">
                  Internal Notes - {selectedApplication.name}
                </h3>
              </div>
              <div className="p-6">
                <textarea
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="Add internal notes about this teacher application..."
                  className="w-full h-64 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green resize-none"
                />
              </div>
              <div className="p-6 border-t flex justify-end gap-3">
                <button
                  onClick={() => setShowNotesModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={saveInternalNotes}
                  className="px-4 py-2 bg-gsv-green text-white rounded-lg hover:bg-gsv-green/90 transition"
                >
                  Save Notes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
