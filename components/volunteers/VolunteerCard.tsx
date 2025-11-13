"use client";
import { Clock, Award, Mail, Phone, Calendar } from "lucide-react";
import { type VolunteerRow, type UserRow } from "@/types/db";

interface VolunteerCardProps {
  volunteer: VolunteerRow;
  user?: UserRow;
  totalHours: number;
  onClick: () => void;
}

export default function VolunteerCard({ volunteer, user, totalHours, onClick }: VolunteerCardProps) {
  const getStatusColor = (status?: string) => {
    if (status === "active") return "bg-green-100 text-green-800";
    if (status === "inactive") return "bg-gray-100 text-gray-800";
    if (status === "on_leave") return "bg-yellow-100 text-yellow-800";
    return "bg-gray-100 text-gray-800";
  };

  return (
    <button
      onClick={onClick}
      className="card p-6 hover:shadow-lg transition-all text-left w-full"
    >
      {/* Header with Name and Status */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-gsv-charcoal mb-1">
            {user?.name || "Unknown Volunteer"}
          </h3>
          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(volunteer.status)}`}>
            {volunteer.status || "active"}
          </span>
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-2 mb-4 text-sm text-gsv-gray">
        {user?.email && (
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{user.email}</span>
          </div>
        )}
        {user?.phone && (
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 flex-shrink-0" />
            <span>{user.phone}</span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 pt-4 border-t">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-orange-600 mb-1">
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-xl font-bold text-gsv-charcoal">{Math.round(totalHours)}</div>
          <div className="text-xs text-gsv-gray">Hours</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
            <Award className="w-4 h-4" />
          </div>
          <div className="text-xl font-bold text-gsv-charcoal">{volunteer.presentations_completed || 0}</div>
          <div className="text-xs text-gsv-gray">Presentations</div>
        </div>
      </div>

      {/* Join Date */}
      {volunteer.created_at && (
        <div className="mt-4 pt-4 border-t text-xs text-gsv-gray flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          Joined {new Date(volunteer.created_at).toLocaleDateString()}
        </div>
      )}

      {/* Orientation Status */}
      {volunteer.orientation_completed && (
        <div className="mt-2 text-xs text-green-600 font-medium">
          ✓ Orientation Complete
        </div>
      )}
    </button>
  );
}

