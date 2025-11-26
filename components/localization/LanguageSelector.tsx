"use client";

import { useState } from "react";
import { Globe, Plus, Edit, Trash2, CheckCircle, XCircle } from "lucide-react";

interface SupportedLanguage {
  code: string;
  name: string;
  native_name: string;
  is_active: boolean;
  is_default: boolean;
}

interface LanguageSelectorProps {
  languages: SupportedLanguage[];
  onLanguageUpdate: () => void;
}

export default function LanguageSelector({ languages, onLanguageUpdate }: LanguageSelectorProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingLanguage, setEditingLanguage] = useState<SupportedLanguage | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    native_name: "",
    is_active: true,
    is_default: false
  });

  const resetForm = () => {
    setFormData({
      code: "",
      name: "",
      native_name: "",
      is_active: true,
      is_default: false
    });
    setEditingLanguage(null);
    setShowAddForm(false);
  };

  const handleEdit = (language: SupportedLanguage) => {
    setFormData({
      code: language.code,
      name: language.name,
      native_name: language.native_name,
      is_active: language.is_active,
      is_default: language.is_default
    });
    setEditingLanguage(language);
    setShowAddForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const method = editingLanguage ? "PUT" : "POST";
      const url = editingLanguage
        ? `/api/localization/languages/${editingLanguage.code}`
        : "/api/localization/languages";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.ok) {
        onLanguageUpdate();
        resetForm();
      } else {
        alert("Error saving language: " + data.error);
      }
    } catch (error: any) {
      alert("Error saving language: " + error.message);
    }
  };

  const handleToggleActive = async (languageCode: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/localization/languages/${languageCode}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !isActive }),
      });

      const data = await res.json();
      if (data.ok) {
        onLanguageUpdate();
      } else {
        alert("Error updating language status: " + data.error);
      }
    } catch (error: any) {
      alert("Error updating language status: " + error.message);
    }
  };

  const handleSetDefault = async (languageCode: string) => {
    try {
      const res = await fetch(`/api/localization/languages/${languageCode}/default`, {
        method: "PUT",
      });

      const data = await res.json();
      if (data.ok) {
        onLanguageUpdate();
      } else {
        alert("Error setting default language: " + data.error);
      }
    } catch (error: any) {
      alert("Error setting default language: " + error.message);
    }
  };

  const handleDelete = async (languageCode: string) => {
    if (!confirm("Are you sure you want to delete this language? This will also delete all translations for this language.")) return;

    try {
      const res = await fetch(`/api/localization/languages/${languageCode}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (data.ok) {
        onLanguageUpdate();
      } else {
        alert("Error deleting language: " + data.error);
      }
    } catch (error: any) {
      alert("Error deleting language: " + error.message);
    }
  };

  // Predefined languages for quick addition
  const predefinedLanguages = [
    { code: "en", name: "English", native_name: "English" },
    { code: "es", name: "Spanish", native_name: "Español" },
    { code: "fr", name: "French", native_name: "Français" },
    { code: "de", name: "German", native_name: "Deutsch" },
    { code: "it", name: "Italian", native_name: "Italiano" },
    { code: "pt", name: "Portuguese", native_name: "Português" },
    { code: "zh", name: "Chinese", native_name: "中文" },
    { code: "ja", name: "Japanese", native_name: "日本語" },
    { code: "ko", name: "Korean", native_name: "한국어" },
    { code: "ar", name: "Arabic", native_name: "العربية" },
    { code: "hi", name: "Hindi", native_name: "हिन्दी" },
    { code: "ru", name: "Russian", native_name: "Русский" }
  ];

  const availableLanguages = predefinedLanguages.filter(
    lang => !languages.some(l => l.code === lang.code)
  );

  return (
    <div className="space-y-6">
      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              {editingLanguage ? "Edit Language" : "Add New Language"}
            </h3>
            <button
              onClick={resetForm}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Language Code *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toLowerCase() }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="en, es, fr, etc."
                  required
                  disabled={!!editingLanguage}
                />
                <p className="text-xs text-gray-500 mt-1">ISO 639-1 language code</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Language Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="English, Spanish, etc."
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Native Name *
              </label>
              <input
                type="text"
                value={formData.native_name}
                onChange={(e) => setFormData(prev => ({ ...prev, native_name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="English, Español, Français, etc."
                required
              />
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Active</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_default}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_default: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Default Language</span>
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingLanguage ? "Update Language" : "Add Language"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Quick Add Predefined Languages */}
      {!showAddForm && availableLanguages.length > 0 && (
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Quick Add Common Languages</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {availableLanguages.slice(0, 8).map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setFormData({
                    code: lang.code,
                    name: lang.name,
                    native_name: lang.native_name,
                    is_active: true,
                    is_default: false
                  });
                  setShowAddForm(true);
                }}
                className="p-2 text-left border border-gray-200 rounded hover:bg-gray-50 transition-colors"
              >
                <div className="font-medium text-sm">{lang.name}</div>
                <div className="text-xs text-gray-600">{lang.native_name}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Languages List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Supported Languages ({languages.length})</h3>
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus size={16} />
              Add Language
            </button>
          )}
        </div>

        {languages.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Globe className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h4 className="text-lg font-medium mb-2">No languages configured</h4>
            <p className="mb-4">Add languages to enable multi-language support for your platform</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add Your First Language
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {languages.map((language) => (
              <div key={language.code} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Globe className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">{language.name}</span>
                        <span className="text-sm text-gray-500">({language.code})</span>
                        {language.is_default && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded">
                            Default
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">{language.native_name}</div>
                    </div>
                  </div>

                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(language)}
                      className="p-1 text-gray-400 hover:text-blue-600"
                      title="Edit language"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => handleToggleActive(language.code, language.is_active)}
                      className={`p-1 ${language.is_active ? "text-green-600" : "text-gray-400"} hover:text-green-600`}
                      title={language.is_active ? "Deactivate" : "Activate"}
                    >
                      {language.is_active ? <CheckCircle size={14} /> : <XCircle size={14} />}
                    </button>
                    <button
                      onClick={() => handleSetDefault(language.code)}
                      className={`p-1 ${language.is_default ? "text-yellow-600" : "text-gray-400"} hover:text-yellow-600`}
                      title="Set as default"
                      disabled={language.is_default}
                    >
                      ⭐
                    </button>
                    <button
                      onClick={() => handleDelete(language.code)}
                      className="p-1 text-red-400 hover:text-red-600"
                      title="Delete language"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    language.is_active
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}>
                    {language.is_active ? "Active" : "Inactive"}
                  </span>

                  {language.is_default && (
                    <span className="text-xs text-gray-500">System Default</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
