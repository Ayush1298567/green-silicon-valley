"use client";

import { useState, useEffect } from "react";
import { Settings as SettingsIcon, Users, Briefcase, GraduationCap, Save } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface RoleSpecificTabProps {
  userData: {
    role: "founder" | "intern" | "volunteer" | "teacher";
    name: string;
    email: string;
  };
  onSuccess: (message?: string) => void;
  onError: (error: string) => void;
}

interface RoleSettings {
  // Founder settings
  system_defaults?: any;
  user_management_prefs?: any;

  // Intern settings
  task_preferences?: any;
  communication_style?: any;
  working_hours?: any;

  // Volunteer settings
  availability_schedule?: any;
  preferred_work_locations?: any;
  emergency_contacts?: any;

  // Teacher settings
  school_info?: any;
  contact_preferences?: any;
  presentation_availability?: any;
}

export default function RoleSpecificTab({ userData, onSuccess, onError }: RoleSpecificTabProps) {
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<RoleSettings>({});

  useEffect(() => {
    loadRoleSettings();
  }, [userData.role]);

  const loadRoleSettings = async () => {
    try {
      setLoading(true);
      // In a real implementation, you would load role-specific settings from the database
      // For now, we'll use default values
      setSettings({});
    } catch (err) {
      console.error("Error loading role settings:", err);
      onError("Failed to load role settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      // In a real implementation, you would save role-specific settings to the database
      onSuccess("Role settings saved successfully");
    } catch (err) {
      onError("Failed to save role settings");
    } finally {
      setSaving(false);
    }
  };

  const renderFounderSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <SettingsIcon className="w-5 h-5 text-gsv-green" />
        <h3 className="text-lg font-semibold text-gsv-charcoal">System Administration</h3>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">System Defaults</h4>
          <p className="text-sm text-blue-700 mb-3">
            Configure default settings for new users and system-wide preferences.
          </p>
          <div className="text-sm text-blue-600">
            Default notification preferences, theme settings, and role templates.
          </div>
        </div>

        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="font-medium text-green-800 mb-2">User Management</h4>
          <p className="text-sm text-green-700 mb-3">
            Manage user onboarding flows, permission templates, and bulk operations.
          </p>
          <div className="text-sm text-green-600">
            Automated welcome emails, permission presets, and user analytics.
          </div>
        </div>

        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <h4 className="font-medium text-purple-800 mb-2">Advanced Features</h4>
          <p className="text-sm text-purple-700 mb-3">
            Access to system-wide analytics, export tools, and administrative controls.
          </p>
          <div className="text-sm text-purple-600">
            System health monitoring, data export tools, and emergency controls.
          </div>
        </div>
      </div>
    </div>
  );

  const renderInternSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Briefcase className="w-5 h-5 text-gsv-green" />
        <h3 className="text-lg font-semibold text-gsv-charcoal">Operations Preferences</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gsv-charcoal mb-2">
            Task Assignment Preferences
          </label>
          <select className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gsv-green">
            <option value="balanced">Balanced workload</option>
            <option value="challenging">Prefer challenging tasks</option>
            <option value="varied">Prefer variety</option>
            <option value="focused">Prefer focused work</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gsv-charcoal mb-2">
            Communication Style
          </label>
          <select className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gsv-green">
            <option value="email">Email preferred</option>
            <option value="chat">Chat preferred</option>
            <option value="calls">Phone calls OK</option>
            <option value="flexible">Flexible</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gsv-charcoal mb-2">
            Working Hours
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gsv-gray mb-1">Start Time</label>
              <input
                type="time"
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gsv-green"
                defaultValue="09:00"
              />
            </div>
            <div>
              <label className="block text-xs text-gsv-gray mb-1">End Time</label>
              <input
                type="time"
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gsv-green"
                defaultValue="17:00"
              />
            </div>
          </div>
        </div>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">Intern Dashboard</h4>
          <p className="text-sm text-blue-700">
            Customize your operations dashboard with preferred widgets and shortcuts.
          </p>
        </div>
      </div>
    </div>
  );

  const renderVolunteerSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-gsv-green" />
        <h3 className="text-lg font-semibold text-gsv-charcoal">Volunteer Preferences</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gsv-charcoal mb-2">
            Preferred Work Locations
          </label>
          <div className="space-y-2">
            {["School Campus", "Community Center", "Online/Remote", "Field Work"].map((location) => (
              <label key={location} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-gsv-green rounded focus:ring-gsv-green"
                  defaultChecked={location === "School Campus"}
                />
                <span className="text-sm text-gsv-charcoal">{location}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gsv-charcoal mb-2">
            Availability Schedule
          </label>
          <div className="space-y-2">
            {["Weekdays", "Weekends", "Evenings", "Mornings", "Flexible"].map((time) => (
              <label key={time} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-gsv-green rounded focus:ring-gsv-green"
                  defaultChecked={time === "Weekdays"}
                />
                <span className="text-sm text-gsv-charcoal">{time}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="font-medium text-green-800 mb-2">Emergency Contacts</h4>
          <p className="text-sm text-green-700 mb-3">
            Keep your emergency contact information up to date for safety during activities.
          </p>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm">
            Manage Emergency Contacts
          </button>
        </div>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">Material Requests</h4>
          <p className="text-sm text-blue-700">
            Set preferences for how you prefer to handle material requests and kit orders.
          </p>
        </div>
      </div>
    </div>
  );

  const renderTeacherSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <GraduationCap className="w-5 h-5 text-gsv-green" />
        <h3 className="text-lg font-semibold text-gsv-charcoal">Teacher Preferences</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gsv-charcoal mb-2">
            School/Organization Information
          </label>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="School Name"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gsv-green"
            />
            <input
              type="text"
              placeholder="Grade Level"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gsv-green"
            />
            <input
              type="text"
              placeholder="Subject Areas"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gsv-green"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gsv-charcoal mb-2">
            Preferred Contact Method
          </label>
          <select className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gsv-green">
            <option value="email">Email</option>
            <option value="phone">Phone</option>
            <option value="school-office">School Office</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gsv-charcoal mb-2">
            Presentation Availability
          </label>
          <div className="space-y-2">
            {["Fall Semester", "Spring Semester", "Summer Break", "Flexible"].map((period) => (
              <label key={period} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-gsv-green rounded focus:ring-gsv-green"
                  defaultChecked={period === "Fall Semester" || period === "Spring Semester"}
                />
                <span className="text-sm text-gsv-charcoal">{period}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <h4 className="font-medium text-purple-800 mb-2">Presentation Preferences</h4>
          <p className="text-sm text-purple-700 mb-3">
            Specify your preferences for presentation topics, group sizes, and special requirements.
          </p>
          <div className="text-sm text-purple-600">
            Topic preferences, time constraints, classroom setup needs.
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="text-gsv-gray">Loading role settings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gsv-charcoal mb-2">
          {userData.role.charAt(0).toUpperCase() + userData.role.slice(1)} Settings
        </h2>
        <p className="text-gsv-gray">
          Customize settings specific to your role as a {userData.role}
        </p>
      </div>

      {/* Role-specific content */}
      {userData.role === "founder" && renderFounderSettings()}
      {userData.role === "intern" && renderInternSettings()}
      {userData.role === "volunteer" && renderVolunteerSettings()}
      {userData.role === "teacher" && renderTeacherSettings()}

      {/* Save Button */}
      <div className="flex justify-end pt-6 border-t">
        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="px-6 py-3 bg-gsv-green text-white rounded-lg hover:bg-gsv-greenDark transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
