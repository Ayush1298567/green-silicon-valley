"use client";

import { useState, useEffect } from "react";
import { Eye, Download, Trash2, Database, BarChart3, Save } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface PrivacyTabProps {
  userData: {
    role: string;
    name: string;
    email: string;
  };
  onSuccess: (message?: string) => void;
  onError: (error: string) => void;
}

interface PrivacySettings {
  analytics_opt_in: boolean;
  profile_visibility: "public" | "team" | "private";
  activity_status: "online" | "offline" | "hidden";
}

export default function PrivacyTab({ userData, onSuccess, onError }: PrivacyTabProps) {
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [settings, setSettings] = useState<PrivacySettings>({
    analytics_opt_in: true,
    profile_visibility: "team",
    activity_status: "online"
  });

  useEffect(() => {
    loadPrivacySettings();
  }, []);

  const loadPrivacySettings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/settings/privacy");
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (err) {
      console.error("Error loading privacy settings:", err);
      onError("Failed to load privacy settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      const response = await fetch("/api/settings/privacy", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        onSuccess("Privacy settings saved successfully");
      } else {
        const error = await response.json();
        onError(error.error || "Failed to save privacy settings");
      }
    } catch (err) {
      onError("Failed to save privacy settings");
    } finally {
      setSaving(false);
    }
  };

  const handleDataExport = async () => {
    try {
      setExporting(true);
      const response = await fetch("/api/settings/export-data", {
        method: "POST"
      });

      if (response.ok) {
        // Create download link
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = response.headers.get('content-disposition')?.split('filename=')[1]?.replace(/"/g, '') || 'data-export.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        onSuccess("Data export completed successfully");
      } else {
        onError("Failed to export data");
      }
    } catch (err) {
      onError("Failed to export data");
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="text-gsv-gray">Loading privacy settings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gsv-charcoal mb-2">Privacy & Data</h2>
        <p className="text-gsv-gray">Control your data sharing and privacy preferences</p>
      </div>

      {/* Data Sharing */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gsv-charcoal flex items-center gap-2">
          <Database className="w-5 h-5 text-gsv-green" />
          Data Sharing & Analytics
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-5 h-5 text-gsv-green" />
              <div>
                <div className="font-medium text-gsv-charcoal">Usage Analytics</div>
                <div className="text-sm text-gsv-gray">
                  Help improve the platform by sharing anonymous usage data
                </div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.analytics_opt_in}
                onChange={(e) => setSettings({ ...settings, analytics_opt_in: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gsv-green/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gsv-green"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Profile Visibility */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gsv-charcoal flex items-center gap-2">
          <Eye className="w-5 h-5 text-gsv-green" />
          Profile & Activity Visibility
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gsv-charcoal mb-3">
              Profile Visibility
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="profile_visibility"
                  value="public"
                  checked={settings.profile_visibility === "public"}
                  onChange={(e) => setSettings({ ...settings, profile_visibility: e.target.value as any })}
                  className="w-4 h-4 text-gsv-green focus:ring-gsv-green"
                />
                <div>
                  <div className="font-medium text-gsv-charcoal">Public</div>
                  <div className="text-sm text-gsv-gray">Anyone can view your profile information</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="profile_visibility"
                  value="team"
                  checked={settings.profile_visibility === "team"}
                  onChange={(e) => setSettings({ ...settings, profile_visibility: e.target.value as any })}
                  className="w-4 h-4 text-gsv-green focus:ring-gsv-green"
                />
                <div>
                  <div className="font-medium text-gsv-charcoal">Team Only</div>
                  <div className="text-sm text-gsv-gray">Only team members and organizers can view your profile</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="profile_visibility"
                  value="private"
                  checked={settings.profile_visibility === "private"}
                  onChange={(e) => setSettings({ ...settings, profile_visibility: e.target.value as any })}
                  className="w-4 h-4 text-gsv-green focus:ring-gsv-green"
                />
                <div>
                  <div className="font-medium text-gsv-charcoal">Private</div>
                  <div className="text-sm text-gsv-gray">Only you can view your profile information</div>
                </div>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gsv-charcoal mb-3">
              Activity Status
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="activity_status"
                  value="online"
                  checked={settings.activity_status === "online"}
                  onChange={(e) => setSettings({ ...settings, activity_status: e.target.value as any })}
                  className="w-4 h-4 text-gsv-green focus:ring-gsv-green"
                />
                <div>
                  <div className="font-medium text-gsv-charcoal">Show Online Status</div>
                  <div className="text-sm text-gsv-gray">Others can see when you&apos;re active</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="activity_status"
                  value="offline"
                  checked={settings.activity_status === "offline"}
                  onChange={(e) => setSettings({ ...settings, activity_status: e.target.value as any })}
                  className="w-4 h-4 text-gsv-green focus:ring-gsv-green"
                />
                <div>
                  <div className="font-medium text-gsv-charcoal">Appear Offline</div>
                  <div className="text-sm text-gsv-gray">Hide your online status from others</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="activity_status"
                  value="hidden"
                  checked={settings.activity_status === "hidden"}
                  onChange={(e) => setSettings({ ...settings, activity_status: e.target.value as any })}
                  className="w-4 h-4 text-gsv-green focus:ring-gsv-green"
                />
                <div>
                  <div className="font-medium text-gsv-charcoal">Invisible</div>
                  <div className="text-sm text-gsv-gray">Completely hide your activity status</div>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Data Export & Management */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gsv-charcoal flex items-center gap-2">
          <Download className="w-5 h-5 text-gsv-green" />
          Data Management
        </h3>

        <div className="space-y-4">
          <div className="p-4 border rounded-lg">
            <div className="flex items-start gap-4">
              <Download className="w-6 h-6 text-gsv-green mt-1" />
              <div className="flex-1">
                <h4 className="font-medium text-gsv-charcoal">Export Your Data</h4>
                <p className="text-sm text-gsv-gray mt-1 mb-3">
                  Download a complete copy of all your data stored in our system, including profile information, activity history, and preferences.
                </p>
                <button
                  onClick={handleDataExport}
                  disabled={exporting}
                  className="px-4 py-2 bg-gsv-green text-white rounded-lg hover:bg-gsv-greenDark transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  {exporting ? "Exporting..." : "Export Data"}
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
            <div className="flex items-start gap-4">
              <Trash2 className="w-6 h-6 text-red-600 mt-1" />
              <div className="flex-1">
                <h4 className="font-medium text-red-800">Delete Account</h4>
                <p className="text-sm text-red-700 mt-1 mb-3">
                  Permanently delete your account and all associated data. This action cannot be undone and will require a 30-day waiting period.
                </p>
                <button
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
                  onClick={() => onError("Account deletion is not yet implemented. Please contact support.")}
                >
                  <Trash2 className="w-4 h-4" />
                  Request Account Deletion
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Information */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-800 mb-2">Your Privacy Rights</h4>
        <div className="text-sm text-blue-700 space-y-2">
          <p>
            <strong>Right to Access:</strong> You can request a copy of all personal data we hold about you.
          </p>
          <p>
            <strong>Right to Rectification:</strong> You can update your personal information through this settings page.
          </p>
          <p>
            <strong>Right to Erasure:</strong> You can request deletion of your personal data (subject to legal requirements).
          </p>
          <p>
            <strong>Right to Portability:</strong> Your data export includes all information in a machine-readable format.
          </p>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-6 border-t">
        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="px-6 py-3 bg-gsv-green text-white rounded-lg hover:bg-gsv-greenDark transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save Privacy Settings"}
        </button>
      </div>
    </div>
  );
}
