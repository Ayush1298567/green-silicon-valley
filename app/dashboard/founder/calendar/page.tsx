"use client";

import { useState, useEffect } from "react";
import { Calendar, ChevronLeft, ChevronRight, Plus, Filter } from "lucide-react";
import Link from "next/link";

interface Event {
  id: number;
  event_type: string;
  title: string;
  description?: string;
  start_date: string;
  end_date?: string;
  all_day: boolean;
  location?: string;
  status: string;
  color?: string;
}

export default function CalendarPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"month" | "week" | "day">("month");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  useEffect(() => {
    fetchEvents();
  }, [currentDate, view]);

  const fetchEvents = async () => {
    try {
      const start = new Date(currentDate);
      start.setDate(1);
      start.setHours(0, 0, 0, 0);

      const end = new Date(currentDate);
      if (view === "month") {
        end.setMonth(end.getMonth() + 1);
      } else if (view === "week") {
        end.setDate(end.getDate() + 7);
      } else {
        end.setDate(end.getDate() + 1);
      }
      end.setHours(23, 59, 59, 999);

      const res = await fetch(
        `/api/calendar/events?start=${start.toISOString()}&end=${end.toISOString()}`
      );
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

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const getEventsForDate = (date: Date) => {
    if (!date) return [];
    return events.filter((event) => {
      const eventDate = new Date(event.start_date);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const days = getDaysInMonth(currentDate);
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getEventColor = (eventType: string) => {
    const colors: Record<string, string> = {
      presentation: "bg-blue-500",
      orientation: "bg-green-500",
      meeting: "bg-purple-500",
      event: "bg-orange-500",
      deadline: "bg-red-500"
    };
    return colors[eventType] || "bg-gray-500";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gsv-charcoal">Calendar</h1>
          <p className="text-gsv-gray mt-1">View and manage all events</p>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setView("month")}
              className={`px-4 py-2 rounded ${
                view === "month" ? "bg-white shadow" : ""
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setView("week")}
              className={`px-4 py-2 rounded ${
                view === "week" ? "bg-white shadow" : ""
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setView("day")}
              className={`px-4 py-2 rounded ${
                view === "day" ? "bg-white shadow" : ""
              }`}
            >
              Day
            </button>
          </div>
          <Link
            href="/dashboard/founder/calendar/new"
            className="px-4 py-2 bg-gsv-green text-white rounded-lg hover:bg-gsv-greenDark flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Event
          </Link>
        </div>
      </div>

      {view === "month" && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigateMonth("prev")}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-semibold text-gsv-charcoal">
              {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </h2>
            <button
              onClick={() => navigateMonth("next")}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {weekDays.map((day) => (
              <div key={day} className="p-2 text-center text-sm font-semibold text-gsv-gray">
                {day}
              </div>
            ))}
            {days.map((day, idx) => {
              const dayEvents = day ? getEventsForDate(day) : [];
              const isToday =
                day &&
                day.getDate() === new Date().getDate() &&
                day.getMonth() === new Date().getMonth() &&
                day.getFullYear() === new Date().getFullYear();

              return (
                <div
                  key={idx}
                  className={`min-h-[100px] border border-gray-200 p-2 ${
                    isToday ? "bg-gsv-green/10" : ""
                  }`}
                >
                  {day && (
                    <>
                      <div
                        className={`text-sm font-medium mb-1 ${
                          isToday ? "text-gsv-green" : "text-gsv-charcoal"
                        }`}
                      >
                        {day.getDate()}
                      </div>
                      <div className="space-y-1">
                        {dayEvents.slice(0, 3).map((event) => (
                          <div
                            key={event.id}
                            onClick={() => setSelectedEvent(event)}
                            className={`text-xs p-1 rounded truncate cursor-pointer ${getEventColor(
                              event.event_type
                            )} text-white`}
                            title={event.title}
                          >
                            {event.title}
                          </div>
                        ))}
                        {dayEvents.length > 3 && (
                          <div className="text-xs text-gsv-gray">
                            +{dayEvents.length - 3} more
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gsv-charcoal mb-2">{selectedEvent.title}</h3>
            <p className="text-gsv-gray mb-4">{selectedEvent.description}</p>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-semibold">Date:</span>{" "}
                {new Date(selectedEvent.start_date).toLocaleString()}
              </div>
              {selectedEvent.location && (
                <div>
                  <span className="font-semibold">Location:</span> {selectedEvent.location}
                </div>
              )}
              <div>
                <span className="font-semibold">Status:</span> {selectedEvent.status}
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setSelectedEvent(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
              <Link
                href={`/dashboard/founder/calendar/${selectedEvent.id}`}
                className="flex-1 px-4 py-2 bg-gsv-green text-white rounded-lg hover:bg-gsv-greenDark text-center"
              >
                View Details
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

