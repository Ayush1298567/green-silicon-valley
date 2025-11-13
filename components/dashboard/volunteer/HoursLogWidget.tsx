"use client";
import { Clock, Plus, Calendar } from "lucide-react";
import { useState } from "react";
import { type VolunteerHoursRow } from "@/types/db";

interface HoursLogWidgetProps {
  hours: VolunteerHoursRow[];
}

export default function HoursLogWidget({ hours }: HoursLogWidgetProps) {
  const [showLogForm, setShowLogForm] = useState(false);

  const recentHours = hours.slice(0, 5);
  const totalThisMonth = hours
    .filter(h => {
      const date = new Date(h.date || "");
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    })
    .reduce((sum, h) => sum + (h.hours_logged || 0), 0);

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-gsv-green" />
          <h2 className="text-xl font-semibold">Hours Log</h2>
        </div>
        <button
          onClick={() => setShowLogForm(!showLogForm)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gsv-green text-white rounded-lg hover:bg-gsv-green/90 transition text-sm"
        >
          <Plus className="w-4 h-4" />
          Log Hours
        </button>
      </div>

      {/* This Month Summary */}
      <div className="mb-4 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm text-blue-900 font-medium">This Month</span>
          <span className="text-2xl font-bold text-blue-900">{Math.round(totalThisMonth)}h</span>
        </div>
      </div>

      {/* Log Form */}
      {showLogForm && (
        <form className="mb-6 p-4 border-2 border-gsv-green rounded-lg bg-green-50">
          <h3 className="font-semibold mb-3 text-sm">Log New Hours</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium mb-1">Date</label>
              <input
                type="date"
                className="w-full px-3 py-2 border rounded-lg text-sm"
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Hours</label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="24"
                className="w-full px-3 py-2 border rounded-lg text-sm"
                placeholder="e.g., 2.5"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Activity Description</label>
              <textarea
                rows={2}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                placeholder="What did you do?"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-gsv-green text-white rounded-lg text-sm hover:bg-gsv-green/90"
              >
                Submit
              </button>
              <button
                type="button"
                onClick={() => setShowLogForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Recent Hours */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gsv-gray mb-3">Recent Activity</h3>
        {recentHours.length === 0 ? (
          <p className="text-sm text-gsv-gray text-center py-4">No hours logged yet</p>
        ) : (
          recentHours.map((hour) => (
            <div key={hour.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gsv-gray" />
                <div>
                  <div className="text-sm font-medium">
                    {hour.date ? new Date(hour.date).toLocaleDateString() : "Unknown date"}
                  </div>
                  {hour.activity_description && (
                    <div className="text-xs text-gsv-gray truncate max-w-xs">{hour.activity_description}</div>
                  )}
                </div>
              </div>
              <div className="text-sm font-semibold text-gsv-charcoal">
                {hour.hours_logged}h
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

