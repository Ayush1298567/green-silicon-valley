"use client";

import { useState, useEffect } from "react";
import { Bell, Mail, Save } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface NotificationsTabProps {
  userData: {
    role: string;
    name: string;
    email: string;
  };
  onSuccess: (message?: string) => void;
  onError: (error: string) => void;
}

interface NotificationPreferences {
  email_enabled: boolean;
  in_app_enabled: boolean;
  notification_types: Record<string, { email: boolean; in_app: boolean }>;
  digest_frequency: "immediate" | "daily" | "weekly";
}

export default function NotificationsTab({ userData, onSuccess, onError }: NotificationsTabProps) {
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email_enabled: true,
    in_app_enabled: true,
    notification_types: {},
    digest_frequency: "immediate"
  });

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Load notification preferences
      const { data: prefs } = await supabase
        .from("user_notification_preferences")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      if (prefs) {
        setPreferences({
          email_enabled: prefs.email_enabled ?? true,
          in_app_enabled: prefs.in_app_enabled ?? true,
          notification_types: prefs.notification_types || {},
          digest_frequency: prefs.digest_frequency || "immediate"
        });
      }
    } catch (err) {
      console.error("Error loading preferences:", err);
      onError("Failed to load notification preferences");
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    try {
      setSaving(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        onError("Not authenticated");
        return;
      }

      const { error } = await supabase
        .from("user_notification_preferences")
        .upsert({
          user_id: session.user.id,
          ...preferences,
          updated_at: new Date().toISOString()
        }, {
          onConflict: "user_id"
        });

      if (error) throw error;

      onSuccess("Notification preferences saved successfully");
    } catch (err: any) {
      console.error("Error saving preferences:", err);
      onError(err.message || "Failed to save notification preferences");
    } finally {
      setSaving(false);
    }
  };

  const notificationTypes = [
    { key: "presentation_submitted", label: "Presentation Submitted", description: "When someone submits a presentation" },
    { key: "presentation_approved", label: "Presentation Approved", description: "When your presentation is approved" },
    { key: "hours_submitted", label: "Hours Submitted", description: "When volunteer hours are submitted" },
    { key: "hours_approved", label: "Hours Approved", description: "When your hours are approved" },
    { key: "hours_rejected", label: "Hours Rejected", description: "When your hours are rejected" },
    { key: "comment_posted", label: "New Comment", description: "When someone comments on your content" },
    { key: "comment_reply", label: "Comment Reply", description: "When someone replies to your comment" },
    { key: "application_approved", label: "Application Approved", description: "When your application is approved" },
    { key: "application_rejected", label: "Application Rejected", description: "When your application is rejected" },
    { key: "task_assigned", label: "Task Assigned", description: "When you're assigned a new task" },
    { key: "deadline_approaching", label: "Deadline Approaching", description: "When a deadline is approaching" },
    { key: "system_update", label: "System Updates", description: "Important system announcements" }
  ];

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="text-gsv-gray">Loading notification preferences...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gsv-charcoal mb-2">Notification Preferences</h2>
        <p className="text-gsv-gray">Choose how and when you want to be notified about activities</p>
      </div>

      {/* Global Settings */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gsv-charcoal">Global Settings</h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gsv-green" />
              <div>
                <div className="font-medium text-gsv-charcoal">Email Notifications</div>
                <div className="text-sm text-gsv-gray">Receive notifications via email</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.email_enabled}
                onChange={(e) => setPreferences({ ...preferences, email_enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gsv-green/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gsv-green"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-gsv-green" />
              <div>
                <div className="font-medium text-gsv-charcoal">In-App Notifications</div>
                <div className="text-sm text-gsv-gray">Show notifications within the application</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.in_app_enabled}
                onChange={(e) => setPreferences({ ...preferences, in_app_enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gsv-green/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gsv-green"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Notification Types */}
      {preferences.email_enabled || preferences.in_app_enabled ? (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gsv-charcoal">Notification Types</h3>

          <div className="space-y-3">
            {notificationTypes.map((type) => {
              const typePrefs = preferences.notification_types[type.key] || {
                email: preferences.email_enabled,
                in_app: preferences.in_app_enabled
              };

              return (
                <div key={type.key} className="p-4 border rounded-lg hover:bg-gray-50 transition">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-gsv-charcoal">{type.label}</div>
                      <div className="text-sm text-gsv-gray mt-1">{type.description}</div>
                    </div>

                    <div className="flex items-center gap-4 ml-4">
                      {preferences.email_enabled && (
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={typePrefs.email}
                            onChange={(e) => {
                              setPreferences({
                                ...preferences,
                                notification_types: {
                                  ...preferences.notification_types,
                                  [type.key]: {
                                    ...typePrefs,
                                    email: e.target.checked
                                  }
                                }
                              });
                            }}
                            className="w-4 h-4 text-gsv-green rounded focus:ring-gsv-green"
                          />
                          <span className="text-xs text-gsv-gray">Email</span>
                        </label>
                      )}

                      {preferences.in_app_enabled && (
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={typePrefs.in_app}
                            onChange={(e) => {
                              setPreferences({
                                ...preferences,
                                notification_types: {
                                  ...preferences.notification_types,
                                  [type.key]: {
                                    ...typePrefs,
                                    in_app: e.target.checked
                                  }
                                }
                              });
                            }}
                            className="w-4 h-4 text-gsv-green rounded focus:ring-gsv-green"
                          />
                          <span className="text-xs text-gsv-gray">In-App</span>
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Digest Settings */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gsv-charcoal">Notification Frequency</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gsv-charcoal mb-3">
              How often would you like to receive notifications?
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="digest_frequency"
                  value="immediate"
                  checked={preferences.digest_frequency === "immediate"}
                  onChange={(e) => setPreferences({ ...preferences, digest_frequency: e.target.value as any })}
                  className="w-4 h-4 text-gsv-green focus:ring-gsv-green"
                />
                <div>
                  <div className="font-medium text-gsv-charcoal">Immediate</div>
                  <div className="text-sm text-gsv-gray">Receive notifications as they happen</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="digest_frequency"
                  value="daily"
                  checked={preferences.digest_frequency === "daily"}
                  onChange={(e) => setPreferences({ ...preferences, digest_frequency: e.target.value as any })}
                  className="w-4 h-4 text-gsv-green focus:ring-gsv-green"
                />
                <div>
                  <div className="font-medium text-gsv-charcoal">Daily Digest</div>
                  <div className="text-sm text-gsv-gray">Receive a summary of all notifications once per day</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="digest_frequency"
                  value="weekly"
                  checked={preferences.digest_frequency === "weekly"}
                  onChange={(e) => setPreferences({ ...preferences, digest_frequency: e.target.value as any })}
                  className="w-4 h-4 text-gsv-green focus:ring-gsv-green"
                />
                <div>
                  <div className="font-medium text-gsv-charcoal">Weekly Digest</div>
                  <div className="text-sm text-gsv-gray">Receive a summary of all notifications once per week</div>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-6 border-t">
        <button
          onClick={handleSavePreferences}
          disabled={saving}
          className="px-6 py-3 bg-gsv-green text-white rounded-lg hover:bg-gsv-greenDark transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save Preferences"}
        </button>
      </div>
    </div>
  );
}
