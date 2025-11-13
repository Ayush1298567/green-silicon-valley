"use client";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { type PresentationRow, type SchoolRow } from "@/types/db";

interface PresentationCalendarProps {
  presentations: PresentationRow[];
  schools: SchoolRow[];
  onPresentationClick: (presentation: PresentationRow) => void;
}

export default function PresentationCalendar({
  presentations,
  schools,
  onPresentationClick,
}: PresentationCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getPresentationsForDate = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return presentations.filter((p) => p.scheduled_date?.startsWith(dateStr));
  };

  const getStatusColor = (status?: string) => {
    if (status === "pending") return "bg-yellow-500";
    if (status === "scheduled") return "bg-blue-500";
    if (status === "confirmed") return "bg-purple-500";
    if (status === "completed") return "bg-green-500";
    if (status === "cancelled") return "bg-red-500";
    return "bg-gray-500";
  };

  const isToday = (day: number) => {
    const today = new Date();
    return today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
  };

  // Generate calendar grid
  const calendarDays = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null); // Empty cells before month starts
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  return (
    <div className="card p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">
          {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={previousMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-2 text-sm font-medium text-gsv-green hover:bg-green-50 rounded-lg transition"
          >
            Today
          </button>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            aria-label="Next month"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Days of Week */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-center text-sm font-semibold text-gsv-gray py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} className="aspect-square"></div>;
          }

          const dayPresentations = getPresentationsForDate(day);
          const today = isToday(day);

          return (
            <div
              key={day}
              className={`aspect-square border rounded-lg p-2 ${
                today ? "border-gsv-green bg-green-50" : "border-gray-200 hover:border-gray-300"
              } transition`}
            >
              <div className={`text-sm font-medium mb-1 ${today ? "text-gsv-green" : "text-gsv-charcoal"}`}>
                {day}
              </div>
              <div className="space-y-1">
                {dayPresentations.slice(0, 3).map((pres) => (
                  <button
                    key={pres.id}
                    onClick={() => onPresentationClick(pres)}
                    className={`w-full text-left text-xs px-1 py-0.5 rounded text-white truncate ${getStatusColor(
                      pres.status
                    )}`}
                    title={schools.find((s) => s.id === pres.school_id)?.name || "Unknown School"}
                  >
                    {schools.find((s) => s.id === pres.school_id)?.name || "Unknown"}
                  </button>
                ))}
                {dayPresentations.length > 3 && (
                  <div className="text-xs text-gsv-gray">+{dayPresentations.length - 3} more</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-6 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-yellow-500"></div>
          <span>Pending</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-blue-500"></div>
          <span>Scheduled</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-purple-500"></div>
          <span>Confirmed</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-green-500"></div>
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-red-500"></div>
          <span>Cancelled</span>
        </div>
      </div>
    </div>
  );
}

