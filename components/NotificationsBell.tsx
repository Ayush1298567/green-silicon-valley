"use client";
import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Bell } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: number;
  notification_type: string;
  title: string;
  message: string;
  action_url: string | null;
  is_read: boolean;
  created_at: string;
}

export default function NotificationsBell() {
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
    
    // Subscribe to notification changes
    const supabase = createClientComponentClient();
    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications"
        },
        () => {
          loadNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/notifications?limit=5&unread_only=false");
      const data = await res.json();
      
      if (data.ok) {
        setNotifications(data.notifications || []);
        setCount(data.unread_count || 0);
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

  return (
    <div className="relative">
      <button
        className="relative rounded-full border border-gray-200 px-3 py-2 hover:bg-gray-50 hover:border-gsv-green transition-all"
        aria-label="Notifications"
        onClick={() => setOpen((v) => !v)}
      >
        <Bell className="w-5 h-5 text-gsv-charcoal" />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full px-1.5 py-0.5 font-semibold min-w-[18px] text-center">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>
      {open && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute right-0 mt-2 w-96 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-[600px] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="text-lg font-bold text-gsv-charcoal">Notifications</div>
              <div className="flex items-center gap-2">
                {count > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-gsv-green hover:underline"
                  >
                    Mark all read
                  </button>
                )}
                <Link
                  href="/dashboard/notifications"
                  className="text-xs text-gsv-green hover:underline"
                  onClick={() => setOpen(false)}
                >
                  View all
                </Link>
                <button 
                  onClick={() => setOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Close notifications"
                >
                  ✕
                </button>
              </div>
            </div>
            {loading ? (
              <div className="p-8 text-center text-gsv-gray">Loading...</div>
            ) : notifications.length > 0 ? (
              <div className="overflow-y-auto flex-1">
                <ul className="divide-y">
                  {notifications.map((notif) => (
                    <li
                      key={notif.id}
                      className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                        !notif.is_read ? "bg-blue-50" : ""
                      }`}
                      onClick={() => {
                        if (notif.action_url) {
                          markAsRead(notif.id);
                          window.location.href = notif.action_url;
                        } else {
                          markAsRead(notif.id);
                        }
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">{getNotificationIcon(notif.notification_type)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className={`font-semibold text-sm ${!notif.is_read ? "text-gsv-charcoal" : "text-gray-700"}`}>
                                {notif.title}
                              </div>
                              <div className="text-sm text-gsv-gray mt-1">{notif.message}</div>
                              <div className="text-xs text-gsv-gray mt-2">
                                {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                              </div>
                            </div>
                            {!notif.is_read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 flex-shrink-0" />
                            )}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="text-center py-12 text-gsv-gray">
                <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">No notifications</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}


