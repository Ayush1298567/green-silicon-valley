"use client";
import { useState, useEffect } from "react";
import { X, Save, Users, Calendar, MapPin, Book } from "lucide-react";
import { type PresentationRow, type SchoolRow, type VolunteerRow, type UserRow } from "@/types/db";

interface PresentationModalProps {
  presentation: PresentationRow | null;
  schools: SchoolRow[];
  volunteers: VolunteerRow[];
  users: UserRow[];
  onClose: () => void;
  onSave: () => void;
}

export default function PresentationModal({
  presentation,
  schools,
  volunteers,
  users,
  onClose,
  onSave,
}: PresentationModalProps) {
  const [formData, setFormData] = useState<Partial<PresentationRow>>(
    presentation || {
      school_id: null,
      topic: null,
      scheduled_date: null,
      status: "pending",
      grade_level: null,
      student_count: null,
      requesting_teacher_name: null,
      requesting_teacher_email: null,
      notes: null,
    }
  );
  const [selectedVolunteers, setSelectedVolunteers] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (presentation) {
      setFormData(presentation);
      // Load assigned volunteers if they exist
      // This would come from a join table or JSON field
    }
  }, [presentation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const endpoint = presentation ? `/api/presentations/${presentation.id}` : "/api/presentations/create";
      const method = presentation ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          assigned_volunteers: selectedVolunteers,
        }),
      });

      if (res.ok) {
        onSave();
        alert(presentation ? "Presentation updated successfully" : "Presentation created successfully");
      } else {
        alert("Failed to save presentation");
      }
    } catch (error) {
      console.error("Error saving presentation:", error);
      alert("Error saving presentation");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof PresentationRow, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleVolunteer = (volunteerId: string) => {
    setSelectedVolunteers((prev) =>
      prev.includes(volunteerId) ? prev.filter((id) => id !== volunteerId) : [...prev, volunteerId]
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full my-8">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-xl">
          <h2 className="text-2xl font-bold text-gsv-charcoal">
            {presentation ? "Edit Presentation" : "Create New Presentation"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* School Selection */}
          <div>
            <label htmlFor="school_id" className="block text-sm font-medium text-gsv-charcoal mb-1 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              School *
            </label>
            <select
              id="school_id"
              value={formData.school_id || ""}
              onChange={(e) => handleChange("school_id", parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green"
              required
            >
              <option value="">Select a school</option>
              {schools.map((school) => (
                <option key={school.id} value={school.id}>
                  {school.name} - {school.city}, {school.state}
                </option>
              ))}
            </select>
          </div>

          {/* Date and Time */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="scheduled_date" className="block text-sm font-medium text-gsv-charcoal mb-1 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Date & Time *
              </label>
              <input
                type="datetime-local"
                id="scheduled_date"
                value={formData.scheduled_date || ""}
                onChange={(e) => handleChange("scheduled_date", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green"
                required
              />
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gsv-charcoal mb-1">
                Status
              </label>
              <select
                id="status"
                value={formData.status || "pending"}
                onChange={(e) => handleChange("status", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green"
              >
                <option value="pending">Pending</option>
                <option value="scheduled">Scheduled</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Presentation Details */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="topic" className="block text-sm font-medium text-gsv-charcoal mb-1 flex items-center gap-2">
                <Book className="w-4 h-4" />
                Topic/Theme
              </label>
              <input
                type="text"
                id="topic"
                value={formData.topic || ""}
                onChange={(e) => handleChange("topic", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green"
                placeholder="e.g., Renewable Energy, Recycling"
              />
            </div>
            <div>
              <label htmlFor="grade_level" className="block text-sm font-medium text-gsv-charcoal mb-1">
                Grade Level
              </label>
              <input
                type="text"
                id="grade_level"
                value={formData.grade_level || ""}
                onChange={(e) => handleChange("grade_level", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green"
                placeholder="e.g., 3rd, 5-6, K-2"
              />
            </div>
          </div>

          {/* Student Count */}
          <div>
            <label htmlFor="student_count" className="block text-sm font-medium text-gsv-charcoal mb-1">
              Expected Number of Students
            </label>
            <input
              type="number"
              id="student_count"
              value={formData.student_count || ""}
              onChange={(e) => handleChange("student_count", parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green"
              min="1"
            />
          </div>

          {/* Teacher Contact */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="requesting_teacher_name" className="block text-sm font-medium text-gsv-charcoal mb-1">
                Requesting Teacher Name
              </label>
              <input
                type="text"
                id="requesting_teacher_name"
                value={formData.requesting_teacher_name || ""}
                onChange={(e) => handleChange("requesting_teacher_name", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green"
              />
            </div>
            <div>
              <label htmlFor="requesting_teacher_email" className="block text-sm font-medium text-gsv-charcoal mb-1">
                Teacher Email
              </label>
              <input
                type="email"
                id="requesting_teacher_email"
                value={formData.requesting_teacher_email || ""}
                onChange={(e) => handleChange("requesting_teacher_email", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green"
              />
            </div>
          </div>

          {/* Volunteer Assignment */}
          <div>
            <label className="block text-sm font-medium text-gsv-charcoal mb-2 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Assign Volunteers
            </label>
            <div className="border border-gray-300 rounded-lg p-4 max-h-48 overflow-y-auto">
              {volunteers.length === 0 ? (
                <p className="text-sm text-gsv-gray">No volunteers available</p>
              ) : (
                <div className="space-y-2">
                  {volunteers.map((volunteer) => {
                    const user = users.find((u) => u.id === volunteer.user_id);
                    const userId = volunteer.user_id;
                    if (!userId) return null;
                    return (
                      <label key={volunteer.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                        <input
                          type="checkbox"
                          checked={selectedVolunteers.includes(userId)}
                          onChange={() => toggleVolunteer(userId)}
                          className="rounded border-gray-300 text-gsv-green focus:ring-gsv-green"
                        />
                        <span className="text-sm">{user?.name || "Unknown Volunteer"}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
            <p className="text-xs text-gsv-gray mt-1">{selectedVolunteers.length} volunteer(s) selected</p>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gsv-charcoal mb-1">
              Internal Notes
            </label>
            <textarea
              id="notes"
              value={formData.notes || ""}
              onChange={(e) => handleChange("notes", e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green"
              placeholder="Any additional information or special requirements..."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 border-t pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gsv-charcoal rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2 bg-gsv-green text-white rounded-lg hover:bg-gsv-green/90 transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : presentation ? "Update Presentation" : "Create Presentation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

