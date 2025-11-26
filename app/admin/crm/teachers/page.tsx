"use client";

import { useState, useEffect } from "react";
import { Users, Mail, Phone, Calendar, Plus, Filter, Search } from "lucide-react";
import TeacherRelationshipCard from "@/components/crm/TeacherRelationshipCard";
import InteractionTimeline from "@/components/crm/InteractionTimeline";

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

export default function TeachersCRMDashboard() {
  const [teachers, setTeachers] = useState<TeacherRelationship[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherRelationship | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [tagFilter, setTagFilter] = useState<string>("");

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const res = await fetch("/api/crm/teachers");
      const data = await res.json();
      if (data.ok) {
        setTeachers(data.teachers || []);
      }
    } catch (error) {
      console.error("Error fetching teachers:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = teacher.teacher_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         teacher.schools?.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !statusFilter || teacher.status === statusFilter;
    const matchesTag = !tagFilter || teacher.tags.includes(tagFilter);

    return matchesSearch && matchesStatus && matchesTag;
  });

  const getStatusStats = () => {
    const stats = {
      active: teachers.filter(t => t.status === "active").length,
      pending: teachers.filter(t => t.status === "pending").length,
      confirmed: teachers.filter(t => t.status === "confirmed").length,
      inactive: teachers.filter(t => t.status === "inactive").length,
    };
    return stats;
  };

  const stats = getStatusStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading teacher relationships...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teacher Relationship Manager</h1>
          <p className="text-gray-600">Manage relationships with teachers and track interactions</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus size={16} />
          Add Teacher
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.active}</div>
              <div className="text-sm text-gray-600">Active Relationships</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Calendar className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.pending}</div>
              <div className="text-sm text-gray-600">Pending Follow-up</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.confirmed}</div>
              <div className="text-sm text-gray-600">Confirmed Interest</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Phone className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.inactive}</div>
              <div className="text-sm text-gray-600">Inactive</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search teachers, schools, or emails..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="inactive">Inactive</option>
            <option value="do_not_contact">Do Not Contact</option>
          </select>

          <select
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Tags</option>
            <option value="high_priority">High Priority</option>
            <option value="vip">VIP</option>
            <option value="follow_up_needed">Follow-up Needed</option>
            <option value="presentation_completed">Presentation Completed</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Teacher List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">
                Teacher Relationships ({filteredTeachers.length})
              </h2>
            </div>

            <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
              {filteredTeachers.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No teachers found matching your criteria</p>
                  <p className="text-sm">Try adjusting your search or filters</p>
                </div>
              ) : (
                filteredTeachers.map((teacher) => (
                  <TeacherRelationshipCard
                    key={teacher.id}
                    teacher={teacher}
                    isSelected={selectedTeacher?.id === teacher.id}
                    onClick={() => setSelectedTeacher(teacher)}
                    onUpdate={fetchTeachers}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Interaction Timeline */}
        <div>
          {selectedTeacher ? (
            <InteractionTimeline
              teacherId={selectedTeacher.id}
              teacherName={selectedTeacher.teacher_name}
            />
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Teacher</h3>
              <p className="text-gray-600">
                Choose a teacher from the list to view their interaction history and manage the relationship.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
