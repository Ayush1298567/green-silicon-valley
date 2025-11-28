"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, MapPin } from "lucide-react";

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

interface UnifiedCalendarProps {
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onCreateEvent: () => void;
  filters?: any;
  onFiltersChange?: (filters: any) => void;
}

export default function UnifiedCalendar({
  events,
  onEventClick,
  onCreateEvent,
  filters = {},
  onFiltersChange
}: UnifiedCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');

  const filteredEvents = useMemo(() => {
    let filtered = events;

    if (filters.eventType && filters.eventType !== 'all') {
      filtered = filtered.filter(e => e.event_type === filters.eventType);
    }

    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(e => e.status === filters.status);
    }

    return filtered;
  }, [events, filters]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add previous month's days to fill the first week
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({
        date: prevDate,
        isCurrentMonth: false,
        events: []
      });
    }

    // Add current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayEvents = filteredEvents.filter(event => {
        const eventDate = new Date(event.start_date);
        return eventDate.toDateString() === date.toDateString();
      });

      days.push({
        date,
        isCurrentMonth: true,
        events: dayEvents
      });
    }

    return days;
  };

  const monthDays = getDaysInMonth(currentDate);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case 'presentation': return 'bg-blue-500';
      case 'meeting': return 'bg-green-500';
      case 'deadline': return 'bg-red-500';
      case 'task': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronLeft size={20} />
          </button>

          <h2 className="text-xl font-semibold">
            {currentDate.toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric'
            })}
          </h2>

          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-gray-200">
            {(['month', 'week', 'day'] as const).map((viewType) => (
              <button
                key={viewType}
                onClick={() => setView(viewType)}
                className={`px-3 py-1 text-sm capitalize ${
                  view === viewType
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                } ${viewType === 'month' ? 'rounded-l' : viewType === 'day' ? 'rounded-r' : ''}`}
              >
                {viewType}
              </button>
            ))}
          </div>

          <button
            onClick={onCreateEvent}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={16} />
            New Event
          </button>
        </div>
      </div>

      {/* Month View */}
      {view === 'month' && (
        <>
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-gray-200">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-4 text-center font-medium text-gray-600 border-r border-gray-100 last:border-r-0">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7">
            {monthDays.map((day, index) => (
              <div
                key={index}
                className={`min-h-[120px] p-2 border-r border-b border-gray-100 last:border-r-0 ${
                  day.isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                <div className="text-sm font-medium text-gray-600 mb-2">
                  {day.date.getDate()}
                </div>

                <div className="space-y-1">
                  {day.events.slice(0, 3).map(event => (
                    <div
                      key={event.id}
                      onClick={() => onEventClick(event)}
                      className={`text-xs p-1 rounded cursor-pointer hover:opacity-80 ${getEventColor(event.event_type)} text-white truncate`}
                      title={event.title}
                    >
                      {event.title}
                    </div>
                  ))}

                  {day.events.length > 3 && (
                    <div className="text-xs text-gray-500">
                      +{day.events.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Week/Day Views - Simplified for now */}
      {(view === 'week' || view === 'day') && (
        <div className="p-8 text-center text-gray-500">
          <CalendarIcon size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">Week/Day View Coming Soon</p>
          <p className="text-sm">Currently showing month view only</p>
        </div>
      )}
    </div>
  );
}
