"use client";
import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, List, Plus, Filter } from "lucide-react";
import PresentationCalendar from "./PresentationCalendar";
import PresentationsList from "./PresentationsList";
import PresentationModal from "./PresentationModal";
import { type PresentationRow, type SchoolRow, type VolunteerRow, type UserRow } from "@/types/db";

interface PresentationManagementInterfaceProps {
  initialPresentations: PresentationRow[];
  schools: SchoolRow[];
  volunteers: VolunteerRow[];
  users: UserRow[];
}

export default function PresentationManagementInterface({
  initialPresentations,
  schools,
  volunteers,
  users,
}: PresentationManagementInterfaceProps) {
  const [presentations, setPresentations] = useState<PresentationRow[]>(initialPresentations);
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const [showModal, setShowModal] = useState(false);
  const [selectedPresentation, setSelectedPresentation] = useState<PresentationRow | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    setPresentations(initialPresentations);
  }, [initialPresentations]);

  const filteredPresentations =
    statusFilter === "all"
      ? presentations
      : presentations.filter((p) => p.status === statusFilter);

  const handleCreatePresentation = () => {
    setSelectedPresentation(null);
    setShowModal(true);
  };

  const handleEditPresentation = (presentation: PresentationRow) => {
    setSelectedPresentation(presentation);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPresentation(null);
  };

  const getStatusCounts = () => {
    return {
      all: presentations.length,
      pending: presentations.filter((p) => p.status === "pending").length,
      scheduled: presentations.filter((p) => p.status === "scheduled").length,
      confirmed: presentations.filter((p) => p.status === "confirmed").length,
      completed: presentations.filter((p) => p.status === "completed").length,
      cancelled: presentations.filter((p) => p.status === "cancelled").length,
    };
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="card p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* View Toggle */}
          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg w-fit">
            <button
              onClick={() => setView("calendar")}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                view === "calendar"
                  ? "bg-white text-gsv-green shadow-sm"
                  : "text-gsv-gray hover:text-gsv-charcoal"
              }`}
            >
              <CalendarIcon className="w-4 h-4" />
              Calendar View
            </button>
            <button
              onClick={() => setView("list")}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                view === "list"
                  ? "bg-white text-gsv-green shadow-sm"
                  : "text-gsv-gray hover:text-gsv-charcoal"
              }`}
            >
              <List className="w-4 h-4" />
              List View
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green"
            >
              <option value="all">All Status ({statusCounts.all})</option>
              <option value="pending">Pending ({statusCounts.pending})</option>
              <option value="scheduled">Scheduled ({statusCounts.scheduled})</option>
              <option value="confirmed">Confirmed ({statusCounts.confirmed})</option>
              <option value="completed">Completed ({statusCounts.completed})</option>
              <option value="cancelled">Cancelled ({statusCounts.cancelled})</option>
            </select>
            <button
              onClick={handleCreatePresentation}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gsv-green text-white rounded-lg hover:bg-gsv-green/90 transition"
            >
              <Plus className="w-4 h-4" />
              New Presentation
            </button>
          </div>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatusCard label="Pending" count={statusCounts.pending} color="yellow" />
        <StatusCard label="Scheduled" count={statusCounts.scheduled} color="blue" />
        <StatusCard label="Confirmed" count={statusCounts.confirmed} color="purple" />
        <StatusCard label="Completed" count={statusCounts.completed} color="green" />
        <StatusCard label="Cancelled" count={statusCounts.cancelled} color="red" />
      </div>

      {/* Main Content */}
      {view === "calendar" ? (
        <PresentationCalendar
          presentations={filteredPresentations}
          schools={schools}
          onPresentationClick={handleEditPresentation}
        />
      ) : (
        <PresentationsList
          presentations={filteredPresentations}
          schools={schools}
          volunteers={volunteers}
          users={users}
          onPresentationClick={handleEditPresentation}
        />
      )}

      {/* Modal */}
      {showModal && (
        <PresentationModal
          presentation={selectedPresentation}
          schools={schools}
          volunteers={volunteers}
          users={users}
          onClose={handleCloseModal}
          onSave={() => {
            handleCloseModal();
            // Refresh would happen here
          }}
        />
      )}
    </div>
  );
}

const StatusCard = ({
  label,
  count,
  color,
}: {
  label: string;
  count: number;
  color: "yellow" | "blue" | "purple" | "green" | "red";
}) => {
  const colorClasses = {
    yellow: "bg-yellow-50 border-yellow-200 text-yellow-800",
    blue: "bg-blue-50 border-blue-200 text-blue-800",
    purple: "bg-purple-50 border-purple-200 text-purple-800",
    green: "bg-green-50 border-green-200 text-green-800",
    red: "bg-red-50 border-red-200 text-red-800",
  };

  return (
    <div className={`border-2 rounded-lg p-4 ${colorClasses[color]}`}>
      <div className="text-2xl font-bold">{count}</div>
      <div className="text-sm">{label}</div>
    </div>
  );
};

