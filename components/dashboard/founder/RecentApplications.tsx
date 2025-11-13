"use client";
import { UserPlus, Mail, Calendar } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

interface Application {
  id: number;
  type: "volunteer" | "intern";
  name: string;
  email: string;
  submittedDate: string;
  status: "pending" | "reviewed" | "accepted" | "rejected";
}

export default function RecentApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      // This would call an API route to fetch recent applications
      // For now, using placeholder data
      const placeholderData: Application[] = [
        {
          id: 1,
          type: "volunteer",
          name: "Sarah Johnson",
          email: "sarah.j@email.com",
          submittedDate: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          status: "pending",
        },
        {
          id: 2,
          type: "intern",
          name: "Michael Chen",
          email: "mchen@email.com",
          submittedDate: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          status: "pending",
        },
        {
          id: 3,
          type: "volunteer",
          name: "Emma Rodriguez",
          email: "emma.r@email.com",
          submittedDate: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
          status: "reviewed",
        },
      ];
      setApplications(placeholderData);
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    if (status === "pending") return "bg-yellow-100 text-yellow-800";
    if (status === "reviewed") return "bg-blue-100 text-blue-800";
    if (status === "accepted") return "bg-green-100 text-green-800";
    if (status === "rejected") return "bg-red-100 text-red-800";
    return "bg-gray-100 text-gray-800";
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-gsv-green" />
          <h2 className="text-xl font-semibold">Recent Applications</h2>
        </div>
        <Link
          href="/dashboard/founder/applications"
          className="text-sm text-gsv-green hover:underline"
        >
          View All
        </Link>
      </div>

      <div className="space-y-3">
        {loading ? (
          <p className="text-center text-gsv-gray py-8">Loading applications...</p>
        ) : applications.length === 0 ? (
          <p className="text-center text-gsv-gray py-8">No recent applications</p>
        ) : (
          applications.map((app) => (
            <div
              key={app.id}
              className="border rounded-lg p-4 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gsv-charcoal">{app.name}</h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        app.type === "intern" ? "bg-purple-100 text-purple-800" : "bg-green-100 text-green-800"
                      }`}
                    >
                      {app.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gsv-gray">
                    <Mail className="w-3 h-3" />
                    {app.email}
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                  {app.status}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-gsv-gray">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Submitted {formatDate(app.submittedDate)}
                </div>
                <button className="text-gsv-green hover:underline font-medium">
                  Review Application →
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

