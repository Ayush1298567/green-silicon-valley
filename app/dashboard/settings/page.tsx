"use client";

import { useState, useEffect } from "react";
import { Save, Bell, Mail, User, Shield, CheckCircle2 } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface NotificationPreferences {
  email_enabled: boolean;
  in_app_enabled: boolean;
  notification_types: Record<string, { email: boolean; in_app: boolean }>;
  quiet_hours_start: string | null;
  quiet_hours_end: string | null;
  digest_frequency: "immediate" | "daily" | "weekly";
}

export default function SettingsPage() {
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email_enabled: true,
    in_app_enabled: true,
    notification_types: {},
    quiet_hours_start: null,
    quiet_hours_end: null,
    digest_frequency: "immediate"
  });

  const [userProfile, setUserProfile] = useState({
    name: "",
    email: ""
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Load user profile
      const { data: user } = await supabase
        .from("users")
        .select("name, email")
        .eq("id", session.user.id)
        .single();

      if (user) {
        setUserProfile({
          name: user.name || "",
          email: user.email || ""
        });
      }

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
          quiet_hours_start: prefs.quiet_hours_start || null,
          quiet_hours_end: prefs.quiet_hours_end || null,
          digest_frequency: prefs.digest_frequency || "immediate"
        });
      }
    } catch (err) {
      console.error("Error loading settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess(false);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError("Not authenticated");
        return;
      }

      const { error: prefsError } = await supabase
        .from("user_notification_preferences")
        .upsert({
          user_id: session.user.id,
          ...preferences,
          updated_at: new Date().toISOString()
        });

      if (prefsError) throw prefsError;

      // Update user profile
      const { error: profileError } = await supabase
        .from("users")
        .update({ name: userProfile.name })
        .eq("id", session.user.id);

      if (profileError) throw profileError;

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const notificationTypes = [
    { key: "presentation_submitted", label: "Presentation Submitted" },
    { key: "presentation_approved", label: "Presentation Approved" },
    { key: "hours_submitted", label: "Hours Submitted" },
    { key: "hours_approved", label: "Hours Approved" },
    { key: "hours_rejected", label: "Hours Rejected" },
    { key: "comment_posted", label: "New Comment" },
    { key: "comment_reply", label: "Comment Reply" },
    { key: "application_approved", label: "Application Approved" },
    { key: "application_rejected", label: "Application Rejected" },
  ];

  if (loading) {
    return (
      <div className="container py-14">
        <div className="text-center py-12 text-gsv-gray">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="container py-14">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gsv-charcoal mb-2">Settings</h1>
          <p className="text-gsv-gray">Manage your account settings and preferences</p>
        </div>

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-800">
            <CheckCircle2 className="w-5 h-5" />
            <span>Settings saved successfully!</span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            {error}
          </div>
        )}

        {/* Profile Settings */}
        <div className="card p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-gsv-green" />
            <h2 className="text-xl font-semibold text-gsv-charcoal">Profile</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gsv-charcoal mb-2">
                Name
              </label>
              <input
                type="text"
                value={userProfile.name}
                onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gsv-green"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gsv-charcoal mb-2">
                Email
              </label>
              <input
                type="email"
                value={userProfile.email}
                disabled
                className="w-full border rounded-lg px-3 py-2 bg-gray-50 text-gray-500"
              />
              <p className="text-xs text-gsv-gray mt-1">Email cannot be changed</p>
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="card p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-gsv-green" />
            <h2 className="text-xl font-semibold text-gsv-charcoal">Notification Preferences</h2>
          </div>

          <div className="space-y-6">
            {/* Global Settings */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gsv-charcoal">Email Notifications</div>
                  <div className="text-sm text-gsv-gray">Receive notifications via email</div>
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

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gsv-charcoal">In-App Notifications</div>
                  <div className="text-sm text-gsv-gray">Show notifications in the app</div>
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

            {/* Notification Types */}
            {preferences.email_enabled || preferences.in_app_enabled ? (
              <div className="border-t pt-4">
                <h3 className="font-medium text-gsv-charcoal mb-3">Notification Types</h3>
                <div className="space-y-2">
                  {notificationTypes.map((type) => {
                    const typePrefs = preferences.notification_types[type.key] || {
                      email: preferences.email_enabled,
                      in_app: preferences.in_app_enabled
                    };
                    return (
                      <div key={type.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gsv-charcoal">{type.label}</span>
                        <div className="flex items-center gap-4">
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
                    );
                  })}
                </div>
              </div>
            ) : null}

            {/* Digest Frequency */}
            <div className="border-t pt-4">
              <label className="block text-sm font-medium text-gsv-charcoal mb-2">
                Notification Frequency
              </label>
              <select
                value={preferences.digest_frequency}
                onChange={(e) => setPreferences({ ...preferences, digest_frequency: e.target.value as any })}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gsv-green"
              >
                <option value="immediate">Immediate</option>
                <option value="daily">Daily Digest</option>
                <option value="weekly">Weekly Digest</option>
              </select>
              <p className="text-xs text-gsv-gray mt-1">
                {preferences.digest_frequency === "immediate" && "Receive notifications as they happen"}
                {preferences.digest_frequency === "daily" && "Receive a summary of all notifications once per day"}
                {preferences.digest_frequency === "weekly" && "Receive a summary of all notifications once per week"}
              </p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSavePreferences}
            disabled={saving}
            className="px-6 py-3 bg-gsv-green text-white rounded-lg hover:bg-gsv-greenDark transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}

