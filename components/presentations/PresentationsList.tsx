"use client";
import { Calendar, MapPin, Users, ExternalLink } from "lucide-react";
import { type PresentationRow, type SchoolRow, type VolunteerRow, type UserRow } from "@/types/db";

interface PresentationsListProps {
  presentations: PresentationRow[];
  schools: SchoolRow[];
  volunteers: VolunteerRow[];
  users: UserRow[];
  onPresentationClick: (presentation: PresentationRow) => void;
}

export default function PresentationsList({
  presentations,
  schools,
  volunteers,
  users,
  onPresentationClick,
}: PresentationsListProps) {
  const getStatusBadgeColor = (status?: string) => {
    if (status === "pending") return "bg-yellow-100 text-yellow-800";
    if (status === "scheduled") return "bg-blue-100 text-blue-800";
    if (status === "confirmed") return "bg-purple-100 text-purple-800";
    if (status === "completed") return "bg-green-100 text-green-800";
    if (status === "cancelled") return "bg-red-100 text-red-800";
    return "bg-gray-100 text-gray-800";
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Not scheduled";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gsv-charcoal">School</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gsv-charcoal">Date & Time</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gsv-charcoal">Topic</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gsv-charcoal">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gsv-charcoal">Grade Level</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gsv-charcoal">Students</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gsv-charcoal">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {presentations.map((pres) => {
              const school = schools.find((s) => s.id === pres.school_id);
              return (
                <tr key={pres.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gsv-charcoal">{school?.name || "Unknown School"}</div>
                      {school?.city && (
                        <div className="text-sm text-gsv-gray flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {school.city}, {school.state}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gsv-gray flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(pres.scheduled_date || undefined)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gsv-charcoal">{pres.topic || "General Environmental Education"}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                        pres.status
                      )}`}
                    >
                      {pres.status || "pending"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gsv-gray">{pres.grade_level || "N/A"}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gsv-gray flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {pres.student_count || "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => onPresentationClick(pres)}
                      className="text-gsv-green hover:text-gsv-green/80 inline-flex items-center gap-1 text-sm font-medium"
                    >
                      View Details
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {presentations.length === 0 && (
        <div className="text-center py-12 text-gsv-gray">No presentations found</div>
      )}
    </div>
  );
}

