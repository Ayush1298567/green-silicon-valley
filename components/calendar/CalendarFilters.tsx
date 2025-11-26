"use client";

import { useState } from "react";
import { Filter, X, Users, Calendar, MapPin } from "lucide-react";

interface CalendarFiltersProps {
  filters: {
    eventTypes?: string[];
    statuses?: string[];
    teams?: string[];
    locations?: string[];
  };
  onFiltersChange: (filters: any) => void;
  availableTeams?: Array<{ id: string; team_name: string }>;
  availableLocations?: string[];
}

export default function CalendarFilters({
  filters,
  onFiltersChange,
  availableTeams = [],
  availableLocations = []
}: CalendarFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const eventTypes = [
    { value: "presentation", label: "Presentations", color: "#3B82F6" },
    { value: "meeting", label: "Meetings", color: "#10B981" },
    { value: "deadline", label: "Deadlines", color: "#EF4444" },
    { value: "task", label: "Tasks", color: "#F59E0B" },
    { value: "orientation", label: "Orientations", color: "#8B5CF6" },
    { value: "event", label: "Events", color: "#EC4899" }
  ];

  const statuses = [
    { value: "scheduled", label: "Scheduled" },
    { value: "confirmed", label: "Confirmed" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" }
  ];

  const updateFilters = (key: string, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const toggleEventType = (eventType: string) => {
    const current = filters.eventTypes || [];
    const updated = current.includes(eventType)
      ? current.filter(t => t !== eventType)
      : [...current, eventType];
    updateFilters('eventTypes', updated);
  };

  const toggleStatus = (status: string) => {
    const current = filters.statuses || [];
    const updated = current.includes(status)
      ? current.filter(s => s !== status)
      : [...current, status];
    updateFilters('statuses', updated);
  };

  const toggleTeam = (teamId: string) => {
    const current = filters.teams || [];
    const updated = current.includes(teamId)
      ? current.filter(t => t !== teamId)
      : [...current, teamId];
    updateFilters('teams', updated);
  };

  const toggleLocation = (location: string) => {
    const current = filters.locations || [];
    const updated = current.includes(location)
      ? current.filter(l => l !== location)
      : [...current, location];
    updateFilters('locations', updated);
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.values(filters).some(value =>
    Array.isArray(value) ? value.length > 0 : value
  );

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-600" />
          <span className="font-medium text-gray-900">Filters</span>
          {hasActiveFilters && (
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              Active
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
            >
              <X size={14} />
              Clear All
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            {isExpanded ? "Collapse" : "Expand"}
          </button>
        </div>
      </div>

      {/* Quick Filter Summary */}
      {hasActiveFilters && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex flex-wrap gap-2">
            {filters.eventTypes?.map(type => {
              const eventType = eventTypes.find(et => et.value === type);
              return (
                <span
                  key={type}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-white"
                  style={{ backgroundColor: eventType?.color }}
                >
                  {eventType?.label}
                  <button
                    onClick={() => toggleEventType(type)}
                    className="ml-1 hover:bg-black hover:bg-opacity-20 rounded"
                  >
                    <X size={10} />
                  </button>
                </span>
              );
            })}
            {filters.statuses?.map(status => {
              const statusInfo = statuses.find(s => s.value === status);
              return (
                <span
                  key={status}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-gray-200 text-gray-800"
                >
                  {statusInfo?.label}
                  <button
                    onClick={() => toggleStatus(status)}
                    className="ml-1 hover:bg-gray-300 rounded"
                  >
                    <X size={10} />
                  </button>
                </span>
              );
            })}
            {filters.teams?.map(teamId => {
              const team = availableTeams.find(t => t.id === teamId);
              return (
                <span
                  key={teamId}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800"
                >
                  <Users size={10} />
                  {team?.team_name}
                  <button
                    onClick={() => toggleTeam(teamId)}
                    className="ml-1 hover:bg-purple-200 rounded"
                  >
                    <X size={10} />
                  </button>
                </span>
              );
            })}
            {filters.locations?.map(location => (
              <span
                key={location}
                className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800"
              >
                <MapPin size={10} />
                {location}
                <button
                  onClick={() => toggleLocation(location)}
                  className="ml-1 hover:bg-green-200 rounded"
                >
                  <X size={10} />
                  </button>
                </span>
              ))}
          </div>
        </div>
      )}

      {isExpanded && (
        <div className="space-y-6">
          {/* Event Types */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Calendar size={16} />
              Event Types
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {eventTypes.map(type => (
                <label key={type.value} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.eventTypes?.includes(type.value) || false}
                    onChange={() => toggleEventType(type.value)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm" style={{ color: type.color }}>
                    {type.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Status */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Status</h3>
            <div className="grid grid-cols-2 gap-2">
              {statuses.map(status => (
                <label key={status.value} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.statuses?.includes(status.value) || false}
                    onChange={() => toggleStatus(status.value)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{status.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Teams */}
          {availableTeams.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Users size={16} />
                Teams
              </h3>
              <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                {availableTeams.map(team => (
                  <label key={team.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.teams?.includes(team.id) || false}
                      onChange={() => toggleTeam(team.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{team.team_name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Locations */}
          {availableLocations.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                <MapPin size={16} />
                Locations
              </h3>
              <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                {availableLocations.map(location => (
                  <label key={location} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.locations?.includes(location) || false}
                      onChange={() => toggleLocation(location)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{location}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
