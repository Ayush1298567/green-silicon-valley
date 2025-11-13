"use client";

import { useState, useEffect } from "react";
import { Bell, Check, Trash2, Filter } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface Notification {
  id: number;
  notification_type: string;
  title: string;
  message: string;
  action_url: string | null;
  is_read: boolean;
  created_at: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  useEffect(() => {
    loadNotifications();
  }, [filter]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("limit", "100");
      if (filter === "unread") {
        params.append("unread_only", "true");
      }

      const res = await fetch(`/api/notifications?${params.toString()}`);
      const data = await res.json();
      
      if (data.ok) {
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await fetch(`/api/notifications/${id}`, {
        method: "PUT"
      });
      loadNotifications();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch("/api/notifications/mark-all-read", {
        method: "POST"
      });
      loadNotifications();
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const deleteNotification = async (id: number) => {
    try {
      await fetch(`/api/notifications/${id}`, {
        method: "DELETE"
      });
      loadNotifications();
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "presentation_submitted":
      case "presentation_approved":
      case "presentation_scheduled":
        return "📊";
      case "hours_approved":
      case "hours_rejected":
      case "hours_submitted":
        return "⏰";
      case "comment_posted":
      case "comment_reply":
        return "💬";
      case "application_approved":
      case "application_rejected":
        return "✅";
      default:
        return "🔔";
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="container py-14">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gsv-charcoal mb-2">Notifications</h1>
            <p className="text-gsv-gray">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}` : "All caught up!"}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 bg-gsv-green text-white rounded-lg hover:bg-gsv-greenDark transition flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Mark all as read
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg transition ${
              filter === "all"
                ? "bg-gsv-green text-white"
                : "bg-gray-100 text-gsv-charcoal hover:bg-gray-200"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
              filter === "unread"
                ? "bg-gsv-green text-white"
                : "bg-gray-100 text-gsv-charcoal hover:bg-gray-200"
            }`}
          >
            <Filter className="w-4 h-4" />
            Unread ({unreadCount})
          </button>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="text-center py-12 text-gsv-gray">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gsv-gray text-lg">No notifications</p>
            <p className="text-gsv-gray text-sm mt-2">
              {filter === "unread" ? "You're all caught up!" : "You don't have any notifications yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`border rounded-lg p-4 hover:shadow-md transition ${
                  !notif.is_read ? "bg-blue-50 border-blue-200" : "bg-white border-gray-200"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl flex-shrink-0">
                    {getNotificationIcon(notif.notification_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className={`font-semibold text-lg mb-1 ${
                          !notif.is_read ? "text-gsv-charcoal" : "text-gray-700"
                        }`}>
                          {notif.title}
                        </div>
                        <div className="text-gsv-gray mb-2">{notif.message}</div>
                        <div className="text-xs text-gsv-gray">
                          {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!notif.is_read && (
                          <button
                            onClick={() => markAsRead(notif.id)}
                            className="p-2 text-gsv-green hover:bg-green-50 rounded-lg transition"
                            title="Mark as read"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notif.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {notif.action_url && (
                      <Link
                        href={notif.action_url}
                        className="inline-block mt-3 text-gsv-green hover:underline text-sm font-medium"
                        onClick={() => markAsRead(notif.id)}
                      >
                        View details →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

