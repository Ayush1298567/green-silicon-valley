"use client";
import { Activity, User, FileText, Calendar, Award, Settings } from "lucide-react";
import { useState } from "react";

interface ActivityItem {
  id: number;
  action: string;
  actor: string;
  timestamp: string;
  details: string;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
}

export default function ActivityFeed({ activities }: ActivityFeedProps) {
  const [filter, setFilter] = useState<string>("all");

  const getActivityIcon = (action: string) => {
    if (action.includes("user") || action.includes("volunteer")) return <User className="w-4 h-4" />;
    if (action.includes("presentation")) return <Calendar className="w-4 h-4" />;
    if (action.includes("document") || action.includes("file")) return <FileText className="w-4 h-4" />;
    if (action.includes("task") || action.includes("project")) return <Award className="w-4 h-4" />;
    if (action.includes("setting") || action.includes("config")) return <Settings className="w-4 h-4" />;
    return <Activity className="w-4 h-4" />;
  };

  const getActivityColor = (action: string) => {
    if (action.includes("created")) return "bg-green-50 text-green-600";
    if (action.includes("updated")) return "bg-blue-50 text-blue-600";
    if (action.includes("deleted")) return "bg-red-50 text-red-600";
    if (action.includes("completed")) return "bg-purple-50 text-purple-600";
    return "bg-gray-50 text-gray-600";
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-gsv-green" />
          <h2 className="text-xl font-semibold">Recent Activity</h2>
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="text-sm border rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-gsv-green"
        >
          <option value="all">All Activities</option>
          <option value="user">User Actions</option>
          <option value="presentation">Presentations</option>
          <option value="document">Documents</option>
          <option value="task">Tasks</option>
        </select>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {activities.length === 0 ? (
          <p className="text-center text-gsv-gray py-8">No recent activity</p>
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              className="flex gap-3 p-3 rounded-lg hover:bg-gray-50 transition"
            >
              <div className={`flex-shrink-0 p-2 rounded-lg ${getActivityColor(activity.action)}`}>
                {getActivityIcon(activity.action)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm text-gsv-charcoal">
                    <span className="font-semibold">{activity.actor}</span> {activity.action}
                  </p>
                  <span className="text-xs text-gsv-gray whitespace-nowrap">
                    {formatTimestamp(activity.timestamp)}
                  </span>
                </div>
                {activity.details && (
                  <p className="text-xs text-gsv-gray mt-1 truncate">{activity.details}</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

