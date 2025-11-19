"use client";

import { useState, useEffect } from "react";
import { Palette, Monitor, Sun, Moon, Type, Layout, Save, Eye } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useTheme } from "@/lib/theme-context";

interface AppearanceTabProps {
  userData: {
    role: string;
    name: string;
    email: string;
  };
  onSuccess: (message?: string) => void;
  onError: (error: string) => void;
}

interface AppearancePreferences {
  theme: "light" | "dark" | "system";
  compact_mode: boolean;
  sidebar_collapsed: boolean;
  high_contrast: boolean;
  font_size: "small" | "medium" | "large";
  language: string;
  timezone: string;
  date_format: string;
  time_format: "12h" | "24h";
}

export default function AppearanceTab({ userData, onSuccess, onError }: AppearanceTabProps) {
  const supabase = createClientComponentClient();
  const { theme: currentTheme, setTheme: setGlobalTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<AppearancePreferences>({
    theme: currentTheme,
    compact_mode: false,
    sidebar_collapsed: false,
    high_contrast: false,
    font_size: "medium",
    language: "en",
    timezone: "America/Los_Angeles",
    date_format: "MM/DD/YYYY",
    time_format: "12h"
  });

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: prefs } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      if (prefs) {
        setPreferences({
          theme: prefs.theme || "system",
          compact_mode: prefs.compact_mode || false,
          sidebar_collapsed: prefs.sidebar_collapsed || false,
          high_contrast: prefs.high_contrast || false,
          font_size: prefs.font_size || "medium",
          language: prefs.language || "en",
          timezone: prefs.timezone || "America/Los_Angeles",
          date_format: prefs.date_format || "MM/DD/YYYY",
          time_format: prefs.time_format || "12h"
        });
      }
    } catch (err) {
      console.error("Error loading preferences:", err);
      onError("Failed to load appearance preferences");
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
        .from("user_preferences")
        .upsert({
          user_id: session.user.id,
          ...preferences,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: "user_id"
        });

      if (error) throw error;

      onSuccess("Appearance preferences saved successfully");
    } catch (err: any) {
      console.error("Error saving preferences:", err);
      onError(err.message || "Failed to save appearance preferences");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="text-gsv-gray">Loading appearance preferences...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gsv-charcoal mb-2">Appearance & Display</h2>
        <p className="text-gsv-gray">Customize how the application looks and feels</p>
      </div>

      {/* Theme Settings */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gsv-charcoal flex items-center gap-2">
          <Palette className="w-5 h-5 text-gsv-green" />
          Theme
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                preferences.theme === "light"
                  ? "border-gsv-green bg-green-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}>
            <input
              type="radio"
              name="theme"
              value="light"
              checked={preferences.theme === "light"}
              onChange={(e) => {
                const newTheme = e.target.value as "light";
                setPreferences({ ...preferences, theme: newTheme });
                setGlobalTheme(newTheme);
              }}
              className="sr-only"
            />
            <div className="text-center">
              <Sun className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
              <div className="font-medium text-gsv-charcoal">Light</div>
              <div className="text-sm text-gsv-gray">Always use light theme</div>
            </div>
          </label>

          <label className={`p-4 border-2 rounded-lg cursor-pointer transition ${
            preferences.theme === "dark"
              ? "border-gsv-green bg-green-50"
              : "border-gray-200 hover:border-gray-300"
          }`}>
            <input
              type="radio"
              name="theme"
              value="dark"
              checked={preferences.theme === "dark"}
              onChange={(e) => {
                const newTheme = e.target.value as "dark";
                setPreferences({ ...preferences, theme: newTheme });
                setGlobalTheme(newTheme);
              }}
              className="sr-only"
            />
            <div className="text-center">
              <Moon className="w-8 h-8 mx-auto mb-2 text-blue-500" />
              <div className="font-medium text-gsv-charcoal">Dark</div>
              <div className="text-sm text-gsv-gray">Always use dark theme</div>
            </div>
          </label>

          <label className={`p-4 border-2 rounded-lg cursor-pointer transition ${
            preferences.theme === "system"
              ? "border-gsv-green bg-green-50"
              : "border-gray-200 hover:border-gray-300"
          }`}>
            <input
              type="radio"
              name="theme"
              value="system"
              checked={preferences.theme === "system"}
              onChange={(e) => {
                const newTheme = e.target.value as "system";
                setPreferences({ ...preferences, theme: newTheme });
                setGlobalTheme(newTheme);
              }}
              className="sr-only"
            />
            <div className="text-center">
              <Monitor className="w-8 h-8 mx-auto mb-2 text-gray-500" />
              <div className="font-medium text-gsv-charcoal">System</div>
              <div className="text-sm text-gsv-gray">Follow system preference</div>
            </div>
          </label>
        </div>

        {/* High Contrast */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <Eye className="w-5 h-5 text-gsv-green" />
            <div>
              <div className="font-medium text-gsv-charcoal">High Contrast</div>
              <div className="text-sm text-gsv-gray">Increase contrast for better visibility</div>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.high_contrast}
              onChange={(e) => setPreferences({ ...preferences, high_contrast: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gsv-green/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gsv-green"></div>
          </label>
        </div>
      </div>

      {/* Layout Settings */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gsv-charcoal flex items-center gap-2">
          <Layout className="w-5 h-5 text-gsv-green" />
          Layout & Display
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium text-gsv-charcoal">Compact Mode</div>
              <div className="text-sm text-gsv-gray">Reduce spacing and padding for more content</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.compact_mode}
                onChange={(e) => setPreferences({ ...preferences, compact_mode: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gsv-green/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gsv-green"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium text-gsv-charcoal">Sidebar Collapsed</div>
              <div className="text-sm text-gsv-gray">Start with sidebar collapsed by default</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.sidebar_collapsed}
                onChange={(e) => setPreferences({ ...preferences, sidebar_collapsed: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gsv-green/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gsv-green"></div>
            </label>
          </div>
        </div>

        {/* Font Size */}
        <div>
          <label className="block text-sm font-medium text-gsv-charcoal mb-3">
            Font Size
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: "small", label: "Small", icon: "Aa" },
              { value: "medium", label: "Medium", icon: "Aa" },
              { value: "large", label: "Large", icon: "Aa" }
            ].map((size) => (
              <label
                key={size.value}
                className={`p-3 border-2 rounded-lg cursor-pointer text-center transition ${
                  preferences.font_size === size.value
                    ? "border-gsv-green bg-green-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="font_size"
                  value={size.value}
                  checked={preferences.font_size === size.value}
                  onChange={(e) => setPreferences({ ...preferences, font_size: e.target.value as any })}
                  className="sr-only"
                />
                <div className={`text-lg font-bold mb-1 ${
                  size.value === "small" ? "text-sm" :
                  size.value === "large" ? "text-xl" : "text-base"
                }`}>
                  {size.icon}
                </div>
                <div className="text-sm font-medium">{size.label}</div>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Localization Settings */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gsv-charcoal flex items-center gap-2">
          <Type className="w-5 h-5 text-gsv-green" />
          Language & Localization
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gsv-charcoal mb-2">
              Language
            </label>
            <select
              value={preferences.language}
              onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gsv-green"
            >
              <option value="en">English</option>
              <option value="es">Español (Coming Soon)</option>
              <option value="fr">Français (Coming Soon)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gsv-charcoal mb-2">
              Timezone
            </label>
            <select
              value={preferences.timezone}
              onChange={(e) => setPreferences({ ...preferences, timezone: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gsv-green"
            >
              <option value="America/Los_Angeles">Pacific Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/New_York">Eastern Time</option>
              <option value="UTC">UTC</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gsv-charcoal mb-2">
              Date Format
            </label>
            <select
              value={preferences.date_format}
              onChange={(e) => setPreferences({ ...preferences, date_format: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gsv-green"
            >
              <option value="MM/DD/YYYY">MM/DD/YYYY (US)</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY (European)</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gsv-charcoal mb-2">
              Time Format
            </label>
            <select
              value={preferences.time_format}
              onChange={(e) => setPreferences({ ...preferences, time_format: e.target.value as any })}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gsv-green"
            >
              <option value="12h">12 Hour (AM/PM)</option>
              <option value="24h">24 Hour</option>
            </select>
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
