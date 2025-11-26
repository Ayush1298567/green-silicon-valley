"use client";

import { useState, useEffect } from "react";
import { Shield, Eye, EyeOff, Mail, Camera, MapPin, Users, Lock, Unlock } from "lucide-react";

interface PrivacySetting {
  id: string;
  category: string;
  title: string;
  description: string;
  current_setting: "public" | "private" | "restricted";
  options: {
    public: string;
    private: string;
    restricted: string;
  };
  last_updated: string;
}

export default function PrivacyControls() {
  const [settings, setSettings] = useState<PrivacySetting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrivacySettings();
  }, []);

  const fetchPrivacySettings = async () => {
    try {
      // In a real implementation, this would fetch privacy settings from the database
      const sampleSettings: PrivacySetting[] = [
        {
          id: "1",
          category: "contact",
          title: "Contact Information",
          description: "Control who can see your contact details",
          current_setting: "private",
          options: {
            public: "Visible to all program participants",
            private: "Only visible to program administrators",
            restricted: "Visible only to assigned teachers and coordinators"
          },
          last_updated: "2024-01-15T10:30:00Z"
        },
        {
          id: "2",
          category: "photos",
          title: "Photography Permissions",
          description: "Control use of photos and videos",
          current_setting: "restricted",
          options: {
            public: "Photos can be used for marketing and social media",
            private: "Photos only used for internal records",
            restricted: "No photos allowed without specific written consent"
          },
          last_updated: "2024-01-10T14:20:00Z"
        },
        {
          id: "3",
          category: "attendance",
          title: "Attendance Records",
          description: "Control visibility of attendance data",
          current_setting: "private",
          options: {
            public: "Attendance visible to all program participants",
            private: "Attendance only visible to administrators",
            restricted: "Attendance only visible to assigned teachers"
          },
          last_updated: "2024-01-20T09:15:00Z"
        },
        {
          id: "4",
          category: "performance",
          title: "Performance Data",
          description: "Control sharing of learning progress",
          current_setting: "restricted",
          options: {
            public: "Progress shared with all participants",
            private: "Progress only shared with administrators",
            restricted: "Progress only shared with parents and teachers"
          },
          last_updated: "2024-01-18T16:45:00Z"
        },
        {
          id: "5",
          category: "social",
          title: "Social Media Integration",
          description: "Control social media and online sharing",
          current_setting: "private",
          options: {
            public: "Can participate in social media activities",
            private: "Limited social media participation",
            restricted: "No social media participation allowed"
          },
          last_updated: "2024-01-12T11:30:00Z"
        }
      ];

      setSettings(sampleSettings);
    } catch (error) {
      console.error("Error fetching privacy settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = async (settingId: string, newValue: "public" | "private" | "restricted") => {
    try {
      // In a real implementation, this would update the privacy setting in the database
      setSettings(prev => prev.map(setting =>
        setting.id === settingId
          ? { ...setting, current_setting: newValue, last_updated: new Date().toISOString() }
          : setting
      ));

      // Show success message
      // In a real app, you'd show a toast notification
    } catch (error) {
      console.error("Error updating privacy setting:", error);
      alert("Failed to update privacy setting. Please try again.");
    }
  };

  const getSettingIcon = (setting: string) => {
    switch (setting) {
      case "public": return <Unlock className="w-4 h-4 text-green-600" />;
      case "private": return <Lock className="w-4 h-4 text-yellow-600" />;
      case "restricted": return <Shield className="w-4 h-4 text-red-600" />;
      default: return <Lock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "contact": return <Mail className="w-5 h-5 text-blue-600" />;
      case "photos": return <Camera className="w-5 h-5 text-purple-600" />;
      case "attendance": return <MapPin className="w-5 h-5 text-green-600" />;
      case "performance": return <Users className="w-5 h-5 text-orange-600" />;
      case "social": return <Eye className="w-5 h-5 text-indigo-600" />;
      default: return <Shield className="w-5 h-5 text-gray-600" />;
    }
  };

  const getPrivacyLevelColor = (level: string) => {
    switch (level) {
      case "public": return "bg-green-100 text-green-800 border-green-200";
      case "private": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "restricted": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading privacy settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Privacy Controls</h2>
        <p className="text-gray-600">
          Manage how your child's information is shared and used. These settings help protect privacy
          while ensuring appropriate access for educational purposes.
        </p>
      </div>

      {/* Privacy Overview */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-6 h-6 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900">Privacy Protection Active</h3>
            <p className="text-sm text-blue-800 mt-1">
              Your privacy settings are automatically enforced across all Green Silicon Valley systems.
              Changes take effect immediately and are logged for compliance purposes.
            </p>
          </div>
        </div>
      </div>

      {/* Settings List */}
      <div className="space-y-6">
        {settings.map((setting) => (
          <div key={setting.id} className="border border-gray-200 rounded-lg p-6">
            {/* Setting Header */}
            <div className="flex items-start gap-4 mb-4">
              <div className="p-2 bg-gray-100 rounded-lg">
                {getCategoryIcon(setting.category)}
              </div>

              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{setting.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{setting.description}</p>

                {/* Current Setting Badge */}
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getPrivacyLevelColor(setting.current_setting)}`}>
                  {getSettingIcon(setting.current_setting)}
                  {setting.current_setting.charAt(0).toUpperCase() + setting.current_setting.slice(1)}
                </div>
              </div>
            </div>

            {/* Privacy Options */}
            <div className="space-y-3">
              {Object.entries(setting.options).map(([level, description]) => (
                <label key={level} className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name={`setting-${setting.id}`}
                    value={level}
                    checked={setting.current_setting === level}
                    onChange={() => handleSettingChange(setting.id, level as "public" | "private" | "restricted")}
                    className="mt-1 text-blue-600 focus:ring-blue-500"
                  />

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getSettingIcon(level)}
                      <span className="font-medium text-gray-900 capitalize">{level}</span>
                    </div>
                    <p className="text-sm text-gray-600">{description}</p>
                  </div>
                </label>
              ))}
            </div>

            {/* Last Updated */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Last updated: {new Date(setting.last_updated).toLocaleDateString()} at {new Date(setting.last_updated).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Bulk Actions */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-3">Bulk Privacy Actions</h3>
        <div className="flex flex-wrap gap-3">
          <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium">
            <Shield className="w-4 h-4 inline mr-2" />
            Make All Private
          </button>
          <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm font-medium">
            <Lock className="w-4 h-4 inline mr-2" />
            Restrict All Access
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
            <Eye className="w-4 h-4 inline mr-2" />
            Reset to Defaults
          </button>
        </div>
      </div>

      {/* Privacy Policy */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-medium text-yellow-900 mb-2">Privacy Policy & Rights</h4>
        <div className="text-sm text-yellow-800 space-y-1">
          <p>• Under COPPA and FERPA, you have the right to review and control all student data</p>
          <p>• Privacy settings can be changed at any time with immediate effect</p>
          <p>• All data access is logged and auditable for compliance purposes</p>
          <p>• You may request data deletion or export at any time</p>
          <p>• Contact privacy@gsv.org for additional privacy concerns</p>
        </div>
      </div>

      {/* Data Export */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-3">Data Management</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100">
            <Eye className="w-5 h-5" />
            <div className="text-left">
              <div className="font-medium">Export Data</div>
              <div className="text-sm">Download all student records</div>
            </div>
          </button>

          <button className="flex items-center gap-3 px-4 py-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100">
            <Shield className="w-5 h-5" />
            <div className="text-left">
              <div className="font-medium">Request Deletion</div>
              <div className="text-sm">Remove all stored data</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
