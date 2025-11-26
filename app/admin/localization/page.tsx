"use client";

import { useState, useEffect } from "react";
import { Globe, Plus, Edit, Trash2, Languages, Save } from "lucide-react";
import LanguageSelector from "@/components/localization/LanguageSelector";
import TranslationEditor from "@/components/localization/TranslationEditor";

interface SupportedLanguage {
  code: string;
  name: string;
  native_name: string;
  is_active: boolean;
  is_default: boolean;
}

interface LocalizationContent {
  id: string;
  content_key: string;
  language: string;
  value: string;
  context?: string;
  is_active: boolean;
}

interface RegionalSetting {
  id: string;
  region: string;
  calendar_format: string;
  date_format: string;
  time_format: string;
  currency: string;
  timezone: string;
}

export default function LocalizationManagementPage() {
  const [activeTab, setActiveTab] = useState<"languages" | "translations" | "regional">("languages");
  const [languages, setLanguages] = useState<SupportedLanguage[]>([]);
  const [translations, setTranslations] = useState<LocalizationContent[]>([]);
  const [regionalSettings, setRegionalSettings] = useState<RegionalSetting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLocalizationData();
  }, []);

  const fetchLocalizationData = async () => {
    try {
      // Fetch languages
      const langRes = await fetch("/api/localization/languages");
      const langData = await langRes.json();
      if (langData.ok) {
        setLanguages(langData.languages || []);
      }

      // Fetch translations
      const transRes = await fetch("/api/localization/content");
      const transData = await transRes.json();
      if (transData.ok) {
        setTranslations(transData.translations || []);
      }

      // Fetch regional settings
      const regRes = await fetch("/api/localization/regional");
      const regData = await regRes.json();
      if (regData.ok) {
        setRegionalSettings(regData.settings || []);
      }
    } catch (error) {
      console.error("Error fetching localization data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageUpdate = () => {
    fetchLocalizationData();
  };

  const handleTranslationUpdate = () => {
    fetchLocalizationData();
  };

  const handleRegionalUpdate = () => {
    fetchLocalizationData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading localization settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Localization Management</h1>
          <p className="text-gray-600">Manage multi-language support and regional settings</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Languages size={16} />
            {languages.filter(l => l.is_active).length} active languages
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setActiveTab("languages")}
              className={`px-6 py-4 text-sm font-medium border-b-2 ${
                activeTab === "languages"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Languages ({languages.length})
            </button>
            <button
              onClick={() => setActiveTab("translations")}
              className={`px-6 py-4 text-sm font-medium border-b-2 ${
                activeTab === "translations"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Translations ({translations.length})
            </button>
            <button
              onClick={() => setActiveTab("regional")}
              className={`px-6 py-4 text-sm font-medium border-b-2 ${
                activeTab === "regional"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Regional Settings ({regionalSettings.length})
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {activeTab === "languages" && (
          <LanguageSelector
            languages={languages}
            onLanguageUpdate={handleLanguageUpdate}
          />
        )}

        {activeTab === "translations" && (
          <TranslationEditor
            translations={translations}
            languages={languages}
            onTranslationUpdate={handleTranslationUpdate}
          />
        )}

        {activeTab === "regional" && (
          <RegionalSettingsManager
            settings={regionalSettings}
            onSettingsUpdate={handleRegionalUpdate}
          />
        )}
      </div>
    </div>
  );
}

// Regional Settings Manager Component
function RegionalSettingsManager({
  settings,
  onSettingsUpdate
}: {
  settings: RegionalSetting[];
  onSettingsUpdate: () => void;
}) {
  const [editingSettings, setEditingSettings] = useState<RegionalSetting | null>(null);
  const [formData, setFormData] = useState({
    region: "",
    calendar_format: "gregorian",
    date_format: "MM/DD/YYYY",
    time_format: "12h",
    currency: "USD",
    timezone: "UTC"
  });

  const handleEdit = (setting: RegionalSetting) => {
    setFormData({
      region: setting.region,
      calendar_format: setting.calendar_format,
      date_format: setting.date_format,
      time_format: setting.time_format,
      currency: setting.currency,
      timezone: setting.timezone
    });
    setEditingSettings(setting);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const method = editingSettings ? "PUT" : "POST";
      const url = editingSettings
        ? `/api/localization/regional/${editingSettings.id}`
        : "/api/localization/regional";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.ok) {
        onSettingsUpdate();
        setFormData({
          region: "",
          calendar_format: "gregorian",
          date_format: "MM/DD/YYYY",
          time_format: "12h",
          currency: "USD",
          timezone: "UTC"
        });
        setEditingSettings(null);
      } else {
        alert("Error saving regional settings: " + data.error);
      }
    } catch (error: any) {
      alert("Error saving regional settings: " + error.message);
    }
  };

  const handleDelete = async (settingId: string) => {
    if (!confirm("Are you sure you want to delete these regional settings?")) return;

    try {
      const res = await fetch(`/api/localization/regional/${settingId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (data.ok) {
        onSettingsUpdate();
      } else {
        alert("Error deleting regional settings: " + data.error);
      }
    } catch (error: any) {
      alert("Error deleting regional settings: " + error.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Add/Edit Form */}
      {(editingSettings || !editingSettings) && (
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">
            {editingSettings ? "Edit Regional Settings" : "Add Regional Settings"}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Region *
                </label>
                <input
                  type="text"
                  value={formData.region}
                  onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., North America, Europe, Asia"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Calendar Format
                </label>
                <select
                  value={formData.calendar_format}
                  onChange={(e) => setFormData(prev => ({ ...prev, calendar_format: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="gregorian">Gregorian</option>
                  <option value="hijri">Hijri</option>
                  <option value="hebrew">Hebrew</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date Format
                </label>
                <select
                  value={formData.date_format}
                  onChange={(e) => setFormData(prev => ({ ...prev, date_format: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time Format
                </label>
                <select
                  value={formData.time_format}
                  onChange={(e) => setFormData(prev => ({ ...prev, time_format: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="12h">12 Hour</option>
                  <option value="24h">24 Hour</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Currency
                </label>
                <input
                  type="text"
                  value={formData.currency}
                  onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="USD"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Default Timezone
              </label>
              <input
                type="text"
                value={formData.timezone}
                onChange={(e) => setFormData(prev => ({ ...prev, timezone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="America/Los_Angeles"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Save size={16} />
                {editingSettings ? "Update Settings" : "Add Settings"}
              </button>
              {editingSettings && (
                <button
                  type="button"
                  onClick={() => setEditingSettings(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Settings List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Regional Settings ({settings.length})</h3>

        {settings.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Globe className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No regional settings configured</p>
            <p className="text-sm">Add regional settings to customize formatting for different areas</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {settings.map((setting) => (
              <div key={setting.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900">{setting.region}</h4>
                    <p className="text-sm text-gray-600">{setting.timezone}</p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(setting)}
                      className="p-1 text-gray-400 hover:text-blue-600"
                      title="Edit settings"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(setting.id)}
                      className="p-1 text-red-400 hover:text-red-600"
                      title="Delete settings"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                  <div>Calendar: {setting.calendar_format}</div>
                  <div>Date: {setting.date_format}</div>
                  <div>Time: {setting.time_format}</div>
                  <div>Currency: {setting.currency}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
