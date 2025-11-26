"use client";
import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Calendar, Clock, MapPin, Users } from "lucide-react";
import { toast } from "sonner";

interface Event {
  id: string;
  title: string;
  type: 'deadline' | 'recruitment' | 'presentation' | 'training' | 'meeting';
  description: string;
  date: string;
  endDate?: string;
  location?: string;
  isVirtual: boolean;
  capacity?: number;
  registeredCount?: number;
  isEditable: boolean;
}

export default function EventsManager() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    type: 'meeting' as Event['type'],
    description: '',
    date: '',
    endDate: '',
    location: '',
    isVirtual: false,
    capacity: '',
  });

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const response = await fetch('/api/admin/events');
      if (response.ok) {
        const data = await response.json();
        setEvents(data.events || []);
      }
    } catch (error) {
      console.error('Error loading events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const eventData = {
        ...formData,
        capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
      };

      const url = editingEvent ? `/api/admin/events/${editingEvent.id}` : '/api/admin/events';
      const method = editingEvent ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      });

      if (response.ok) {
        toast.success(editingEvent ? 'Event updated successfully' : 'Event created successfully');
        loadEvents();
        setShowForm(false);
        setEditingEvent(null);
        resetForm();
      } else {
        toast.error('Failed to save event');
      }
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error('Failed to save event');
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      type: event.type,
      description: event.description,
      date: new Date(event.date).toISOString().slice(0, 16),
      endDate: event.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : '',
      location: event.location || '',
      isVirtual: event.isVirtual,
      capacity: event.capacity?.toString() || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      const response = await fetch(`/api/admin/events/${eventId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Event deleted successfully');
        loadEvents();
      } else {
        toast.error('Failed to delete event');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      type: 'meeting',
      description: '',
      date: '',
      endDate: '',
      location: '',
      isVirtual: false,
      capacity: '',
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getTypeColor = (type: string) => {
    const colors = {
      deadline: 'bg-red-100 text-red-800',
      recruitment: 'bg-blue-100 text-blue-800',
      presentation: 'bg-green-100 text-green-800',
      training: 'bg-purple-100 text-purple-800',
      meeting: 'bg-yellow-100 text-yellow-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gsv-green"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Events & Deadlines</h2>
          <p className="text-gray-600">Manage upcoming events, deadlines, and recruitment periods</p>
        </div>
        <button
          onClick={() => {
            setEditingEvent(null);
            resetForm();
            setShowForm(true);
          }}
          className="bg-gsv-green text-white px-4 py-2 rounded-lg hover:bg-gsv-greenDark transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Event
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {editingEvent ? 'Edit Event' : 'Create New Event'}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gsv-green focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as Event['type'] }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gsv-green focus:border-transparent"
                  >
                    <option value="meeting">Meeting</option>
                    <option value="training">Training</option>
                    <option value="presentation">Presentation</option>
                    <option value="recruitment">Recruitment</option>
                    <option value="deadline">Deadline</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gsv-green focus:border-transparent"
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gsv-green focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.endDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gsv-green focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gsv-green focus:border-transparent"
                    placeholder="Physical location or virtual meeting link"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isVirtual}
                      onChange={(e) => setFormData(prev => ({ ...prev, isVirtual: e.target.checked }))}
                      className="rounded border-gray-300 text-gsv-green focus:ring-gsv-green"
                    />
                    <span className="text-sm text-gray-700">Virtual Event</span>
                  </label>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Capacity
                    </label>
                    <input
                      type="number"
                      value={formData.capacity}
                      onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gsv-green focus:border-transparent"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="bg-gsv-green text-white px-6 py-2 rounded-lg hover:bg-gsv-greenDark transition-colors"
                  >
                    {editingEvent ? 'Update Event' : 'Create Event'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingEvent(null);
                      resetForm();
                    }}
                    className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Events List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {events.length === 0 ? (
          <div className="p-8 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No events yet</h3>
            <p className="text-gray-600 mb-4">Create your first event to get started</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-gsv-green text-white px-4 py-2 rounded-lg hover:bg-gsv-greenDark transition-colors"
            >
              Create Event
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {events.map((event) => (
              <div key={event.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(event.type)}`}>
                        {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                      </span>
                      {event.isVirtual && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Virtual
                        </span>
                      )}
                      {new Date(event.date) < new Date() && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Past
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{event.title}</h3>
                    <p className="text-gray-600 mb-3">{event.description}</p>

                    <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(event.date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>
                          {formatTime(event.date)}
                          {event.endDate && ` - ${formatTime(event.endDate)}`}
                        </span>
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-2 md:col-span-2">
                          <MapPin className="w-4 h-4" />
                          <span>{event.location}</span>
                        </div>
                      )}
                      {event.capacity && (
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>
                            {event.registeredCount || 0} / {event.capacity} registered
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(event)}
                      className="text-gray-400 hover:text-gsv-green transition-colors p-2"
                      title="Edit event"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors p-2"
                      title="Delete event"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
