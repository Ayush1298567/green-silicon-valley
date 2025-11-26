"use client";

import { useState, useEffect } from "react";
import { X, Clock, MapPin, Users, AlertTriangle } from "lucide-react";

interface CalendarEvent {
  id?: string | number;
  event_type: string;
  title: string;
  description?: string;
  start_date: string;
  end_date?: string;
  all_day: boolean;
  location?: string;
  location_type?: string;
  virtual_link?: string;
  color?: string;
  related_id?: string | number;
  recurrence_rule?: string;
  reminder_minutes?: number[];
  metadata?: any;
}

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event?: CalendarEvent | null;
  onSave: (event: Omit<CalendarEvent, 'id'>) => Promise<void>;
  onDelete?: (eventId: string | number) => Promise<void>;
  presentations?: Array<{ id: string | number; topic: string; scheduled_date?: string }>;
  volunteers?: Array<{ id: string | number; team_name: string }>;
}

export default function EventModal({
  isOpen,
  onClose,
  event,
  onSave,
  onDelete,
  presentations = [],
  volunteers = []
}: EventModalProps) {
  const [formData, setFormData] = useState<Omit<CalendarEvent, 'id'>>({
    event_type: "meeting",
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    all_day: false,
    location: "",
    location_type: "physical",
    virtual_link: "",
    color: "#3B82F6",
    related_id: "",
    recurrence_rule: "",
    reminder_minutes: [15],
    metadata: {}
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [conflicts, setConflicts] = useState<any[]>([]);

  useEffect(() => {
    if (event) {
      setFormData({
        event_type: event.event_type,
        title: event.title,
        description: event.description || "",
        start_date: event.start_date,
        end_date: event.end_date || "",
        all_day: event.all_day,
        location: event.location || "",
        location_type: event.location_type || "physical",
        virtual_link: event.virtual_link || "",
        color: event.color || "#3B82F6",
        related_id: event.related_id || "",
        recurrence_rule: event.recurrence_rule || "",
        reminder_minutes: event.reminder_minutes || [15],
        metadata: event.metadata || {}
      });
    } else {
      // Reset for new event
      const now = new Date();
      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

      setFormData({
        event_type: "meeting",
        title: "",
        description: "",
        start_date: now.toISOString().slice(0, 16),
        end_date: oneHourLater.toISOString().slice(0, 16),
        all_day: false,
        location: "",
        location_type: "physical",
        virtual_link: "",
        color: "#3B82F6",
        related_id: "",
        recurrence_rule: "",
        reminder_minutes: [15],
        metadata: {}
      });
    }
    setErrors({});
    setConflicts([]);
  }, [event, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.start_date) {
      newErrors.start_date = "Start date is required";
    }

    if (!formData.all_day && !formData.end_date) {
      newErrors.end_date = "End date is required for non-all-day events";
    }

    if (!formData.all_day && formData.end_date && new Date(formData.end_date) <= new Date(formData.start_date)) {
      newErrors.end_date = "End date must be after start date";
    }

    if (formData.event_type === "presentation" && !formData.related_id) {
      newErrors.related_id = "Presentation must be linked to a presentation record";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkConflicts = async () => {
    if (!formData.start_date || !formData.end_date) return;

    try {
      const res = await fetch(`/api/calendar/conflicts?startDate=${encodeURIComponent(formData.start_date)}&endDate=${encodeURIComponent(formData.end_date)}${event?.id ? `&eventId=${event.id}` : ''}`);
      const data = await res.json();
      if (data.ok) {
        setConflicts(data.conflicts || []);
      }
    } catch (error) {
      console.error("Error checking conflicts:", error);
    }
  };

  useEffect(() => {
    if (formData.start_date && formData.end_date) {
      checkConflicts();
    }
  }, [formData.start_date, formData.end_date]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error: any) {
      setErrors({ general: error.message || "Failed to save event" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!event?.id || !onDelete) return;

    if (!confirm("Are you sure you want to delete this event?")) return;

    setLoading(true);
    try {
      await onDelete(event.id);
      onClose();
    } catch (error: any) {
      setErrors({ general: error.message || "Failed to delete event" });
    } finally {
      setLoading(false);
    }
  };

  const eventTypes = [
    { value: "presentation", label: "Presentation", color: "#3B82F6" },
    { value: "meeting", label: "Meeting", color: "#10B981" },
    { value: "deadline", label: "Deadline", color: "#EF4444" },
    { value: "task", label: "Task", color: "#F59E0B" },
    { value: "orientation", label: "Orientation", color: "#8B5CF6" },
    { value: "event", label: "Event", color: "#EC4899" }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {event ? "Edit Event" : "Create Event"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {errors.general && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {errors.general}
            </div>
          )}

          {conflicts.length > 0 && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="text-yellow-600 mt-0.5" size={16} />
                <div>
                  <div className="text-yellow-800 font-medium">Scheduling Conflicts Detected</div>
                  <div className="text-yellow-700 text-sm mt-1">
                    {conflicts.map((conflict, idx) => (
                      <div key={idx}>{conflict.title}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Type *
              </label>
              <select
                value={formData.event_type}
                onChange={(e) => {
                  const selectedType = eventTypes.find(t => t.value === e.target.value);
                  setFormData(prev => ({
                    ...prev,
                    event_type: e.target.value,
                    color: selectedType?.color || prev.color
                  }));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {eventTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color
              </label>
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.title ? 'border-red-300' : 'border-gray-300'}`}
              placeholder="Event title"
            />
            {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Event description (optional)"
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.all_day}
                onChange={(e) => setFormData(prev => ({ ...prev, all_day: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <span className="text-sm font-medium text-gray-700">All Day</span>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date & Time *
              </label>
              <input
                type={formData.all_day ? "date" : "datetime-local"}
                value={formData.all_day ? formData.start_date.split('T')[0] : formData.start_date}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  start_date: e.target.value + (formData.all_day ? 'T00:00' : '')
                }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.start_date ? 'border-red-300' : 'border-gray-300'}`}
              />
              {errors.start_date && <p className="text-red-600 text-sm mt-1">{errors.start_date}</p>}
            </div>

            {!formData.all_day && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date & Time *
                </label>
                <input
                  type="datetime-local"
                  value={formData.end_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.end_date ? 'border-red-300' : 'border-gray-300'}`}
                />
                {errors.end_date && <p className="text-red-600 text-sm mt-1">{errors.end_date}</p>}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location Type
              </label>
              <select
                value={formData.location_type}
                onChange={(e) => setFormData(prev => ({ ...prev, location_type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="physical">Physical</option>
                <option value="virtual">Virtual</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Location or address"
              />
            </div>
          </div>

          {(formData.location_type === "virtual" || formData.location_type === "hybrid") && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Virtual Link
              </label>
              <input
                type="url"
                value={formData.virtual_link}
                onChange={(e) => setFormData(prev => ({ ...prev, virtual_link: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://meet.google.com/..."
              />
            </div>
          )}

          {formData.event_type === "presentation" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Linked Presentation *
              </label>
              <select
                value={formData.related_id}
                onChange={(e) => setFormData(prev => ({ ...prev, related_id: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.related_id ? 'border-red-300' : 'border-gray-300'}`}
              >
                <option value="">Select a presentation</option>
                {presentations.map((pres) => (
                  <option key={pres.id} value={pres.id}>
                    {pres.topic} {pres.scheduled_date ? `(${new Date(pres.scheduled_date).toLocaleDateString()})` : ""}
                  </option>
                ))}
              </select>
              {errors.related_id && <p className="text-red-600 text-sm mt-1">{errors.related_id}</p>}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reminders
            </label>
            <div className="flex gap-2 flex-wrap">
              {[5, 10, 15, 30, 60, 120, 1440].map((minutes) => (
                <label key={minutes} className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={formData.reminder_minutes?.includes(minutes) || false}
                    onChange={(e) => {
                      const current = formData.reminder_minutes || [];
                      if (e.target.checked) {
                        setFormData(prev => ({ ...prev, reminder_minutes: [...current, minutes] }));
                      } else {
                        setFormData(prev => ({
                          ...prev,
                          reminder_minutes: current.filter(m => m !== minutes)
                        }));
                      }
                    }}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">
                    {minutes < 60 ? `${minutes}m` : minutes === 60 ? '1h' : minutes === 1440 ? '1d' : `${minutes/60}h`}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div>
              {event?.id && onDelete && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-4 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg"
                  disabled={loading}
                >
                  Delete Event
                </button>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? "Saving..." : (event ? "Update Event" : "Create Event")}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
