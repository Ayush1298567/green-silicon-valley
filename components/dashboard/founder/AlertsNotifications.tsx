"use client";
import { AlertTriangle, Clock, Calendar, Users, MessageSquare, FileText, CheckCircle2, Bell } from "lucide-react";
import Link from "next/link";

interface NotificationItem {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  icon: React.ReactNode;
  title: string;
  message: string;
  action: string;
  href: string;
  timestamp: string;
  priority: 'high' | 'medium' | 'low';
}

interface AlertsNotificationsProps {
  overdueTasks: number;
  urgentTasks: number;
  pendingPresentations: number;
  pendingReviews?: number;
  pendingHours?: number;
  pendingDocuments?: number;
  pendingApplications?: number;
  unreadMessages?: number;
  upcomingPresentations?: number;
  teamReadinessAlerts?: number;
  recentNotifications?: NotificationItem[];
}

export default function AlertsNotifications({
  overdueTasks,
  urgentTasks,
  pendingPresentations,
  pendingReviews = 0,
  pendingHours = 0,
  pendingDocuments = 0,
  pendingApplications = 0,
  unreadMessages = 0,
  upcomingPresentations = 0,
  teamReadinessAlerts = 0,
  recentNotifications = []
}: AlertsNotificationsProps) {
  const currentTime = new Date().toISOString();

  // Generate comprehensive notifications list
  const generateNotifications = (): NotificationItem[] => {
    const notifications: NotificationItem[] = [];

    // High priority alerts
    if (overdueTasks > 0) {
      notifications.push({
        id: 'overdue-tasks',
        type: "error",
        icon: <AlertTriangle className="w-5 h-5" />,
        title: "Overdue Tasks",
        message: `${overdueTasks} task${overdueTasks > 1 ? "s are" : " is"} overdue`,
        action: "View Tasks",
        href: "/dashboard/founder/tasks",
        timestamp: currentTime,
        priority: 'high'
      });
    }

    if (unreadMessages > 0) {
      notifications.push({
        id: 'unread-messages',
        type: "warning",
        icon: <MessageSquare className="w-5 h-5" />,
        title: "Unread Messages",
        message: `${unreadMessages} message${unreadMessages > 1 ? "s" : ""} from volunteers`,
        action: "View Messages",
        href: "/dashboard/founder/messages",
        timestamp: currentTime,
        priority: 'high'
      });
    }

    // Medium priority alerts
    if (urgentTasks > 0) {
      notifications.push({
        id: 'urgent-tasks',
        type: "warning",
        icon: <Clock className="w-5 h-5" />,
        title: "Urgent Tasks",
        message: `${urgentTasks} urgent task${urgentTasks > 1 ? "s" : ""} require${urgentTasks === 1 ? "s" : ""} attention`,
        action: "Review",
        href: "/dashboard/founder/tasks",
        timestamp: currentTime,
        priority: 'medium'
      });
    }

    if (pendingHours > 0) {
      notifications.push({
        id: 'pending-hours',
        type: "info",
        icon: <Clock className="w-5 h-5" />,
        title: "Hours Pending Approval",
        message: `${pendingHours} hour submission${pendingHours > 1 ? "s" : ""} waiting for approval`,
        action: "Review Hours",
        href: "/dashboard/founder/hours/pending",
        timestamp: currentTime,
        priority: 'medium'
      });
    }

    if (pendingReviews > 0) {
      notifications.push({
        id: 'pending-reviews',
        type: "info",
        icon: <CheckCircle2 className="w-5 h-5" />,
        title: "Presentations Pending Review",
        message: `${pendingReviews} presentation${pendingReviews > 1 ? "s" : ""} submitted for review`,
        action: "Review",
        href: "/dashboard/founder/reviews",
        timestamp: currentTime,
        priority: 'medium'
      });
    }

    // Lower priority alerts
    if (pendingApplications > 0) {
      notifications.push({
        id: 'pending-applications',
        type: "info",
        icon: <Users className="w-5 h-5" />,
        title: "Volunteer Applications",
        message: `${pendingApplications} new volunteer application${pendingApplications > 1 ? "s" : ""} to review`,
        action: "Review Apps",
        href: "/dashboard/founder/applications",
        timestamp: currentTime,
        priority: 'low'
      });
    }

    if (pendingDocuments > 0) {
      notifications.push({
        id: 'pending-documents',
        type: "info",
        icon: <FileText className="w-5 h-5" />,
        title: "Documents Pending Review",
        message: `${pendingDocuments} document${pendingDocuments > 1 ? "s" : ""} awaiting approval`,
        action: "Review",
        href: "/dashboard/founder/documents/pending",
        timestamp: currentTime,
        priority: 'low'
      });
    }

    if (teamReadinessAlerts > 0) {
      notifications.push({
        id: 'team-readiness',
        type: "warning",
        icon: <Bell className="w-5 h-5" />,
        title: "Team Readiness Alerts",
        message: `${teamReadinessAlerts} team${teamReadinessAlerts > 1 ? "s" : ""} not ready for upcoming presentations`,
        action: "Check Readiness",
        href: "/dashboard/founder/teams/readiness",
        timestamp: currentTime,
        priority: 'medium'
      });
    }

    if (upcomingPresentations > 0) {
      notifications.push({
        id: 'upcoming-presentations',
        type: "info",
        icon: <Calendar className="w-5 h-5" />,
        title: "Upcoming Presentations",
        message: `${upcomingPresentations} presentation${upcomingPresentations > 1 ? "s" : ""} scheduled in the next 7 days`,
        action: "View Calendar",
        href: "/dashboard/founder/calendar",
        timestamp: currentTime,
        priority: 'low'
      });
    }

    if (pendingPresentations > 0) {
      notifications.push({
        id: 'pending-presentations',
        type: "info",
        icon: <Calendar className="w-5 h-5" />,
        title: "Teacher Requests",
        message: `${pendingPresentations} teacher presentation request${pendingPresentations > 1 ? "s" : ""} pending approval`,
        action: "Review Requests",
        href: "/admin/teacher-requests",
        timestamp: currentTime,
        priority: 'medium'
      });
    }

    return notifications;
  };

  const notifications = generateNotifications();

  if (notifications.length === 0 && (!recentNotifications || recentNotifications.length === 0)) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <div>
            <p className="text-green-800 font-medium">All Clear!</p>
            <p className="text-green-700 text-sm">No urgent notifications at this time.</p>
          </div>
        </div>
      </div>
    );
  }

  const getPriorityStyles = (priority: string, type: string) => {
    const baseStyles = {
      high: {
        bg: type === "error" ? "bg-red-50 border-red-300" : "bg-orange-50 border-orange-300",
        text: type === "error" ? "text-red-900" : "text-orange-900",
        icon: type === "error" ? "text-red-600" : "text-orange-600"
      },
      medium: {
        bg: type === "warning" ? "bg-yellow-50 border-yellow-300" : "bg-blue-50 border-blue-300",
        text: type === "warning" ? "text-yellow-900" : "text-blue-900",
        icon: type === "warning" ? "text-yellow-600" : "text-blue-600"
      },
      low: {
        bg: "bg-gray-50 border-gray-300",
        text: "text-gray-900",
        icon: "text-gray-600"
      }
    };
    return baseStyles[priority as keyof typeof baseStyles] || baseStyles.low;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Notifications & Alerts</h3>
        <span className="text-sm text-gray-500">{notifications.length} active</span>
      </div>

      {/* Notifications List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {notifications.map((notification) => {
          const styles = getPriorityStyles(notification.priority, notification.type);

          return (
            <div
              key={notification.id}
              className={`${styles.bg} border rounded-lg p-4 transition-all hover:shadow-sm`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`${styles.icon} mt-0.5`}>
                    {notification.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={`font-medium ${styles.text} text-sm`}>
                        {notification.title}
                      </h4>
                      {notification.priority === 'high' && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                          HIGH
                        </span>
                      )}
                    </div>
                    <p className={`${styles.text} text-sm mb-2`}>
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(notification.timestamp)}
                      </span>
                      <Link
                        href={notification.href}
                        className={`${styles.text} text-sm font-medium hover:underline flex items-center gap-1`}
                      >
                        {notification.action}
                        <span className="text-xs">→</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Recent Notifications from Database */}
        {recentNotifications && recentNotifications.length > 0 && (
          <>
            <div className="border-t border-gray-200 pt-3 mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Activity</h4>
            </div>
            {recentNotifications.slice(0, 5).map((notification) => {
              const styles = getPriorityStyles(notification.priority, notification.type);

              return (
                <div
                  key={notification.id}
                  className={`${styles.bg} border rounded-lg p-3 transition-all hover:shadow-sm`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`${styles.icon} mt-0.5`}>
                      {notification.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className={`font-medium ${styles.text} text-sm mb-1`}>
                        {notification.title}
                      </h5>
                      <p className={`${styles.text} text-xs mb-2`}>
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {formatTimestamp(notification.timestamp)}
                        </span>
                        <Link
                          href={notification.href}
                          className={`${styles.text} text-xs hover:underline`}
                        >
                          View →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="border-t border-gray-200 pt-4">
        <div className="flex gap-3">
          <Link
            href="/dashboard/notifications"
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            View All Notifications →
          </Link>
          <Link
            href="/dashboard/founder/messages"
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            Messages →
          </Link>
        </div>
      </div>
    </div>
  );
}

