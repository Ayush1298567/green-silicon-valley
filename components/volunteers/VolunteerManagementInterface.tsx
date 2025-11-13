"use client";
import { useState, useEffect, useCallback } from "react";
import { Search, Filter, Award, Clock, TrendingUp, UserPlus } from "lucide-react";
import { type VolunteerRow, type UserRow, type VolunteerHoursRow, type PresentationRow } from "@/types/db";
import VolunteerCard from "./VolunteerCard";
import VolunteerDetailsModal from "./VolunteerDetailsModal";
import VolunteerStatsGrid from "./VolunteerStatsGrid";

interface VolunteerManagementInterfaceProps {
  initialVolunteers: VolunteerRow[];
  users: UserRow[];
  volunteerHours: VolunteerHoursRow[];
  presentations: PresentationRow[];
  currentUserRole?: string; // 'founder' | 'intern' | etc.
}

export default function VolunteerManagementInterface({
  initialVolunteers,
  users,
  volunteerHours,
  presentations,
  currentUserRole,
}: VolunteerManagementInterfaceProps) {
  const [volunteers, setVolunteers] = useState<VolunteerRow[]>(initialVolunteers);
  const [filteredVolunteers, setFilteredVolunteers] = useState<VolunteerRow[]>(initialVolunteers);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedVolunteer, setSelectedVolunteer] = useState<VolunteerRow | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [sortBy, setSortBy] = useState<"name" | "hours" | "presentations">("hours");

  useEffect(() => {
    setVolunteers(initialVolunteers);
    setFilteredVolunteers(initialVolunteers);
  }, [initialVolunteers]);

  const getVolunteerHours = useCallback(
    (volunteerId: string | null) => {
      if (!volunteerId) return 0;
      return volunteerHours
        .filter((entry) => entry.volunteer_id === volunteerId && entry.status !== "rejected")
        .reduce((sum, entry) => sum + (entry.hours_logged || 0), 0);
    },
    [volunteerHours]
  );

  useEffect(() => {
    let filtered = volunteers;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((volunteer) => {
        const user = users.find((u) => u.id === volunteer.user_id);
        return user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
               user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((volunteer) => volunteer.status === statusFilter);
    }

    // Sorting
    filtered = [...filtered].sort((a, b) => {
      if (sortBy === "name") {
        const nameA = users.find((u) => u.id === a.user_id)?.name || "";
        const nameB = users.find((u) => u.id === b.user_id)?.name || "";
        return nameA.localeCompare(nameB);
      } else if (sortBy === "hours") {
        const hoursA = getVolunteerHours(a.user_id);
        const hoursB = getVolunteerHours(b.user_id);
        return hoursB - hoursA;
      } else if (sortBy === "presentations") {
        return (b.presentations_completed || 0) - (a.presentations_completed || 0);
      }
      return 0;
    });

    setFilteredVolunteers(filtered);
  }, [searchTerm, statusFilter, sortBy, volunteers, users, getVolunteerHours]);

  const handleVolunteerClick = (volunteer: VolunteerRow) => {
    setSelectedVolunteer(volunteer);
    setShowDetailsModal(true);
  };

  // Calculate statistics
  const totalHours = volunteerHours.reduce((sum, h) => sum + (h.hours_logged || 0), 0);
  const activeVolunteers = volunteers.filter((v) => v.status === "active").length;
  const avgHoursPerVolunteer = activeVolunteers > 0 ? totalHours / activeVolunteers : 0;
  const totalPresentations = volunteers.reduce((sum, v) => sum + (v.presentations_completed || 0), 0);

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <VolunteerStatsGrid
        totalVolunteers={volunteers.length}
        activeVolunteers={activeVolunteers}
        totalHours={totalHours}
        avgHoursPerVolunteer={avgHoursPerVolunteer}
        totalPresentations={totalPresentations}
      />

      {/* Filters & Search */}
      <div className="card p-6">
        <div className="grid md:grid-cols-4 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gsv-gray w-5 h-5" />
            <input
              type="text"
              placeholder="Search volunteers by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="on_leave">On Leave</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "name" | "hours" | "presentations")}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green"
          >
            <option value="hours">Sort by Hours</option>
            <option value="presentations">Sort by Presentations</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gsv-gray">
            Showing {filteredVolunteers.length} of {volunteers.length} volunteers
          </div>
        </div>
      </div>

      {/* Volunteers Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVolunteers.map((volunteer) => {
          const user = users.find((u) => u.id === volunteer.user_id);
          const hours = getVolunteerHours(volunteer.user_id);
          
          return (
            <VolunteerCard
              key={volunteer.id}
              volunteer={volunteer}
              user={user}
              totalHours={hours}
              onClick={() => handleVolunteerClick(volunteer)}
            />
          );
        })}
      </div>

      {filteredVolunteers.length === 0 && (
        <div className="card p-12 text-center">
          <p className="text-gsv-gray">No volunteers found matching your criteria</p>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedVolunteer && (
        <VolunteerDetailsModal
          volunteer={selectedVolunteer}
          user={users.find((u) => u.id === selectedVolunteer.user_id)}
          hours={volunteerHours.filter((h) => h.volunteer_id === selectedVolunteer.user_id)}
          presentations={presentations}
          onClose={() => setShowDetailsModal(false)}
          currentUserRole={currentUserRole}
        />
      )}
    </div>
  );
}

