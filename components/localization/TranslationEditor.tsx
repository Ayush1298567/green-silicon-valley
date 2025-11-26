"use client";

import { useState } from "react";
import { Save, Plus, Search, Edit, Trash2, Languages } from "lucide-react";

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

interface TranslationEditorProps {
  translations: LocalizationContent[];
  languages: SupportedLanguage[];
  onTranslationUpdate: () => void;
}

export default function TranslationEditor({
  translations,
  languages,
  onTranslationUpdate
}: TranslationEditorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [editingTranslations, setEditingTranslations] = useState<Record<string, string>>({});
  const [newKey, setNewKey] = useState("");

  // Get unique content keys
  const contentKeys = Array.from(new Set(translations.map(t => t.content_key)))
    .filter(key => key.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort();

  const activeLanguages = languages.filter(l => l.is_active);

  const getTranslationForKeyAndLanguage = (key: string, languageCode: string) => {
    return translations.find(t => t.content_key === key && t.language === languageCode);
  };

  const handleEditKey = (key: string) => {
    setSelectedKey(key);
    const translationsForKey: Record<string, string> = {};

    activeLanguages.forEach(lang => {
      const translation = getTranslationForKeyAndLanguage(key, lang.code);
      translationsForKey[lang.code] = translation?.value || "";
    });

    setEditingTranslations(translationsForKey);
  };

  const handleSaveTranslations = async () => {
    if (!selectedKey) return;

    try {
      const promises = activeLanguages.map(async (lang) => {
        const value = editingTranslations[lang.code] || "";
        const existingTranslation = getTranslationForKeyAndLanguage(selectedKey, lang.code);

        if (existingTranslation) {
          // Update existing translation
          if (value !== existingTranslation.value) {
            const res = await fetch(`/api/localization/content/${existingTranslation.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ value }),
            });
            return res.json();
          }
        } else if (value.trim()) {
          // Create new translation
          const res = await fetch("/api/localization/content", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              content_key: selectedKey,
              language: lang.code,
              value: value.trim()
            }),
          });
          return res.json();
        }
      });

      await Promise.all(promises);
      onTranslationUpdate();
      setSelectedKey(null);
      setEditingTranslations({});
    } catch (error: any) {
      alert("Error saving translations: " + error.message);
    }
  };

  const handleAddNewKey = async () => {
    if (!newKey.trim()) return;

    try {
      // Create default translations for the new key (empty values)
      const promises = activeLanguages.map(async (lang) => {
        const res = await fetch("/api/localization/content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content_key: newKey.trim(),
            language: lang.code,
            value: "" // Empty value initially
          }),
        });
        return res.json();
      });

      await Promise.all(promises);
      onTranslationUpdate();
      setNewKey("");
    } catch (error: any) {
      alert("Error adding new key: " + error.message);
    }
  };

  const handleDeleteKey = async (key: string) => {
    if (!confirm(`Are you sure you want to delete all translations for "${key}"?`)) return;

    try {
      const keyTranslations = translations.filter(t => t.content_key === key);
      const promises = keyTranslations.map(async (translation) => {
        const res = await fetch(`/api/localization/content/${translation.id}`, {
          method: "DELETE",
        });
        return res.json();
      });

      await Promise.all(promises);
      onTranslationUpdate();
      if (selectedKey === key) {
        setSelectedKey(null);
        setEditingTranslations({});
      }
    } catch (error: any) {
      alert("Error deleting translations: " + error.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Add New Key */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search translation keys..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="New translation key"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={handleAddNewKey}
            disabled={!newKey.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            <Plus size={16} />
            Add Key
          </button>
        </div>
      </div>

      {/* Translation Editor */}
      {selectedKey ? (
        <div className="border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Editing: {selectedKey}</h3>
            <div className="flex gap-2">
              <button
                onClick={handleSaveTranslations}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Save size={16} />
                Save All
              </button>
              <button
                onClick={() => {
                  setSelectedKey(null);
                  setEditingTranslations({});
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeLanguages.map((language) => (
              <div key={language.code} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {language.name} ({language.native_name})
                </label>
                <textarea
                  value={editingTranslations[language.code] || ""}
                  onChange={(e) => setEditingTranslations(prev => ({
                    ...prev,
                    [language.code]: e.target.value
                  }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={`Translation in ${language.name}...`}
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Translation Keys List */
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Translation Keys ({contentKeys.length})</h3>

          {contentKeys.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Languages className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h4 className="text-lg font-medium mb-2">No translation keys found</h4>
              <p className="mb-4">
                {searchTerm ? "Try adjusting your search term" : "Add your first translation key above"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {contentKeys.map((key) => (
                <div key={key} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 mb-2">{key}</div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {activeLanguages.slice(0, 4).map((language) => {
                          const translation = getTranslationForKeyAndLanguage(key, language.code);
                          return (
                            <div key={language.code} className="text-sm">
                              <span className="text-gray-600">{language.code}:</span>{" "}
                              <span className={translation?.value ? "text-gray-900" : "text-gray-400 italic"}>
                                {translation?.value || "Not translated"}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      {activeLanguages.length > 4 && (
                        <div className="text-xs text-gray-500 mt-1">
                          +{activeLanguages.length - 4} more languages
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEditKey(key)}
                        className="flex items-center gap-1 px-3 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                      >
                        <Edit size={14} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteKey(key)}
                        className="flex items-center gap-1 px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Usage Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">How to Use Translations</h4>
        <div className="text-sm text-blue-800 space-y-1">
          <p>• <strong>Content Keys:</strong> Unique identifiers for translatable text (e.g., "nav.home", "button.save")</p>
          <p>• <strong>Languages:</strong> Add translations for each active language</p>
          <p>• <strong>Usage in Code:</strong> Use the translation service to get localized text</p>
          <p>• <strong>Context:</strong> Add context to help translators understand usage</p>
        </div>
      </div>
    </div>
  );
}
