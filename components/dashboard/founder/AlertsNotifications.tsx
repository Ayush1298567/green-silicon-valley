"use client";
import { AlertTriangle, Clock, Calendar } from "lucide-react";
import Link from "next/link";

interface AlertsNotificationsProps {
  overdueTasks: number;
  urgentTasks: number;
  pendingPresentations: number;
  pendingReviews?: number;
  pendingHours?: number;
  pendingDocuments?: number;
}

export default function AlertsNotifications({ 
  overdueTasks, 
  urgentTasks, 
  pendingPresentations,
  pendingReviews = 0,
  pendingHours = 0,
  pendingDocuments = 0
}: AlertsNotificationsProps) {
  const alerts = [];

  if (overdueTasks > 0) {
    alerts.push({
      type: "error",
      icon: <AlertTriangle className="w-5 h-5" />,
      message: `${overdueTasks} task${overdueTasks > 1 ? "s are" : " is"} overdue`,
      action: "View Tasks",
      href: "/dashboard/founder/tasks",
    });
  }

  if (urgentTasks > 0) {
    alerts.push({
      type: "warning",
      icon: <Clock className="w-5 h-5" />,
      message: `${urgentTasks} urgent task${urgentTasks > 1 ? "s" : ""} require${urgentTasks === 1 ? "s" : ""} attention`,
      action: "Review",
      href: "/dashboard/founder/tasks",
    });
  }

  if (pendingReviews > 0) {
    alerts.push({
      type: "info",
      icon: <Calendar className="w-5 h-5" />,
      message: `${pendingReviews} presentation${pendingReviews > 1 ? "s" : ""} pending review`,
      action: "Review",
      href: "/dashboard/founder/reviews",
    });
  }

  if (pendingHours > 0) {
    alerts.push({
      type: "info",
      icon: <Clock className="w-5 h-5" />,
      message: `${pendingHours} hour submission${pendingHours > 1 ? "s" : ""} pending approval`,
      action: "Review",
      href: "/dashboard/founder/hours/pending",
    });
  }

  if (pendingDocuments > 0) {
    alerts.push({
      type: "info",
      icon: <Calendar className="w-5 h-5" />,
      message: `${pendingDocuments} document${pendingDocuments > 1 ? "s" : ""} pending review`,
      action: "Review",
      href: "/dashboard/founder/documents/pending",
    });
  }

  if (pendingPresentations > 0) {
    alerts.push({
      type: "info",
      icon: <Calendar className="w-5 h-5" />,
      message: `${pendingPresentations} presentation${pendingPresentations > 1 ? "s" : ""} pending approval`,
      action: "Review Requests",
      href: "/dashboard/founder/presentations",
    });
  }

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-3">
      {alerts.map((alert, idx) => {
        const bgColor =
          alert.type === "error"
            ? "bg-red-50 border-red-200"
            : alert.type === "warning"
            ? "bg-yellow-50 border-yellow-200"
            : "bg-blue-50 border-blue-200";

        const textColor =
          alert.type === "error"
            ? "text-red-800"
            : alert.type === "warning"
            ? "text-yellow-800"
            : "text-blue-800";

        const iconColor =
          alert.type === "error"
            ? "text-red-600"
            : alert.type === "warning"
            ? "text-yellow-600"
            : "text-blue-600";

        return (
          <div
            key={idx}
            className={`${bgColor} border rounded-lg p-4 flex items-center justify-between`}
          >
            <div className="flex items-center gap-3">
              <div className={iconColor}>{alert.icon}</div>
              <p className={`${textColor} font-medium`}>{alert.message}</p>
            </div>
            <Link
              href={alert.href as any}
              className={`${textColor} text-sm font-semibold hover:underline`}
            >
              {alert.action} →
            </Link>
          </div>
        );
      })}
    </div>
  );
}

