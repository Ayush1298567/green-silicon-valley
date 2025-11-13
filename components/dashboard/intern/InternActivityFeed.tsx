"use client";
import { Activity } from "lucide-react";
import { type SystemLogRow } from "@/types/db";

interface InternActivityFeedProps {
  activities: SystemLogRow[];
}

export default function InternActivityFeed({ activities }: InternActivityFeedProps) {
  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return "Unknown time";
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="card p-6">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-gsv-green" />
        <h2 className="text-xl font-semibold">My Recent Activity</h2>
      </div>

      <div className="space-y-3">
        {activities.length === 0 ? (
          <p className="text-center text-gsv-gray py-8">No recent activity</p>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="flex gap-3 p-3 rounded-lg hover:bg-gray-50 transition">
              <div className="w-2 h-2 bg-gsv-green rounded-full mt-2 flex-shrink-0"></div>
              <div className="flex-1">
                <p className="text-sm text-gsv-charcoal">{activity.action}</p>
                {activity.details && (
                  <p className="text-xs text-gsv-gray mt-1">{activity.details}</p>
                )}
                <span className="text-xs text-gsv-gray">{formatTimestamp(activity.timestamp)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

