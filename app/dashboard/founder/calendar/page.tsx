"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import UnifiedCalendar from "@/components/calendar/UnifiedCalendar";
import EventModal from "@/components/calendar/EventModal";
import CalendarFilters from "@/components/calendar/CalendarFilters";

interface CalendarEvent {
  id: string | number;
  event_type: string;
  title: string;
  description?: string;
  start_date: string;
  end_date?: string;
  all_day: boolean;
  location?: string;
  status: string;
  color?: string;
  conflict_warnings?: any[];
}

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [filters, setFilters] = useState({});
  const [presentations, setPresentations] = useState<Array<{ id: string | number; topic: string; scheduled_date?: string }>>([]);
  const [volunteers, setVolunteers] = useState<Array<{ id: string | number; team_name: string }>>([]);

  useEffect(() => {
    fetchEvents();
    fetchRelatedData();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch("/api/calendar/events");
      const data = await res.json();
      if (data.ok) {
        setEvents(data.events || []);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedData = async () => {
    try {
      // Fetch presentations for event linking
      const presRes = await fetch("/api/presentations?limit=100");
      const presData = await presRes.json();
      if (presData.ok) {
        setPresentations(presData.presentations || []);
      }

      // Fetch volunteer teams
      const volRes = await fetch("/api/volunteers/teams");
      const volData = await volRes.json();
      if (volData.ok) {
        setVolunteers(volData.teams || []);
      }
    } catch (error) {
      console.error("Error fetching related data:", error);
    }
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const handleCreateEvent = () => {
    setSelectedEvent(null);
    setShowEventModal(true);
  };

  const handleSaveEvent = async (eventData: Omit<CalendarEvent, 'id'>) => {
    try {
      const method = selectedEvent ? "PUT" : "POST";
      const url = selectedEvent ? `/api/calendar/events/${selectedEvent.id}` : "/api/calendar/events";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData),
      });

      const data = await res.json();
      if (data.ok) {
        await fetchEvents(); // Refresh events
      } else {
        throw new Error(data.error || "Failed to save event");
      }
    } catch (error: any) {
      throw error;
    }
  };

  const handleDeleteEvent = async (eventId: string | number) => {
    try {
      const res = await fetch(`/api/calendar/events/${eventId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (data.ok) {
        await fetchEvents(); // Refresh events
      } else {
        throw new Error(data.error || "Failed to delete event");
      }
    } catch (error: any) {
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-600">Manage all events, presentations, and schedules</p>
        </div>
      </div>

      {/* Filters */}
      <CalendarFilters
        filters={filters}
        onFiltersChange={setFilters}
        availableTeams={volunteers}
        availableLocations={[...new Set(events.map(e => e.location).filter(Boolean))]}
      />

      {/* Calendar */}
      <UnifiedCalendar
        events={events}
        onEventClick={handleEventClick}
        onCreateEvent={handleCreateEvent}
        filters={filters}
        onFiltersChange={setFilters}
      />

      {/* Event Modal */}
      <EventModal
        isOpen={showEventModal}
        onClose={() => setShowEventModal(false)}
        event={selectedEvent}
        onSave={handleSaveEvent}
        onDelete={selectedEvent ? handleDeleteEvent : undefined}
        presentations={presentations}
        volunteers={volunteers}
      />
    </div>
  );
}

