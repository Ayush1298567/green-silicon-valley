"use client";
import { Calendar, MapPin, Clock } from "lucide-react";
import Link from "next/link";

interface CalendarEvent {
  id: number;
  title: string;
  date: string;
  type: "presentation" | "meeting" | "event";
  location?: string;
}

interface UpcomingCalendarProps {
  events: CalendarEvent[];
}

export default function UpcomingCalendar({ events }: UpcomingCalendarProps) {
  const getEventColor = (type: string) => {
    if (type === "presentation") return "border-l-blue-500 bg-blue-50";
    if (type === "meeting") return "border-l-purple-500 bg-purple-50";
    if (type === "event") return "border-l-green-500 bg-green-50";
    return "border-l-gray-500 bg-gray-50";
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { 
      weekday: "short", 
      month: "short", 
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
    });
  };

  const formatDateShort = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gsv-green" />
          <h2 className="text-xl font-semibold">Upcoming Schedule</h2>
        </div>
        <Link
          href="/dashboard/founder/presentations"
          className="text-sm text-gsv-green hover:underline"
        >
          View All
        </Link>
      </div>

      <div className="space-y-3">
        {events.length === 0 ? (
          <p className="text-center text-gsv-gray py-8">No upcoming events scheduled</p>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              className={`border-l-4 ${getEventColor(event.type)} rounded-lg p-4 hover:shadow-md transition`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gsv-charcoal mb-1">{event.title}</h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gsv-gray">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(event.date)}
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {event.location}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <div className="text-lg font-bold text-gsv-charcoal">
                    {new Date(event.date).getDate()}
                  </div>
                  <div className="text-xs text-gsv-gray uppercase">
                    {new Date(event.date).toLocaleDateString("en-US", { month: "short" })}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

