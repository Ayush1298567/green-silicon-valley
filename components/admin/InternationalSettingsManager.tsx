"use client";

import { useState, useEffect } from "react";
import { Globe, Lock, Unlock, Save, AlertTriangle } from "lucide-react";

interface InternationalSettings {
  international_enabled: boolean;
  coming_soon_message: string;
  supported_countries: string[];
  language_options: string[];
  timezone_support: boolean;
  compliance_requirements: {
    gdpr_enabled: boolean;
    ccpa_enabled: boolean;
    pipeda_enabled: boolean;
  };
  localized_content: Record<string, any>;
}

export default function InternationalSettingsManager() {
  const [settings, setSettings] = useState<InternationalSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load current settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/admin/international-settings');
        const data = await response.json();
        if (data.ok) {
          setSettings(data.settings || {
            international_enabled: false,
            coming_soon_message: 'International expansion coming Q3 2025',
            supported_countries: [],
            language_options: ['en'],
            timezone_support: false,
            compliance_requirements: {
              gdpr_enabled: false,
              ccpa_enabled: false,
              pipeda_enabled: false
            },
            localized_content: {}
          });
        }
      } catch (error) {
        console.error('Error loading international settings:', error);
        setMessage({ type: 'error', text: 'Failed to load settings' });
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/international-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });

      const data = await response.json();

      if (data.ok) {
        setSettings(data.settings);
        setMessage({ type: 'success', text: 'International settings updated successfully' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save settings' });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: string, value: any) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
    setMessage(null);
  };

  const updateComplianceRequirement = (key: string, value: boolean) => {
    if (!settings) return;
    setSettings({
      ...settings,
      compliance_requirements: {
        ...settings.compliance_requirements,
        [key]: value
      }
    });
    setMessage(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gsv-green"></div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center py-12">
        <p className="text-gsv-gray-600">Unable to load international settings.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gsv-gray-900">International Expansion</h2>
          <p className="text-sm text-gsv-gray-600 mt-1">
            Prepare for global growth with controlled feature rollout
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gsv-gray-600">
          <Globe className="w-4 h-4" />
          {settings.international_enabled ? 'Enabled' : 'Coming Soon'}
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success'
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Coming Soon Notice */}
      {!settings.international_enabled && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <Globe className="w-6 h-6 text-blue-600 mt-0.5" />
            <div>
              <h3 className="text-lg font-medium text-blue-900 mb-2">International Expansion - Coming Soon</h3>
              <p className="text-blue-800 mb-4">
                {settings.coming_soon_message}
              </p>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-blue-700">
                  International features are currently hidden from users.
                  Enable them below when infrastructure is ready.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enable/Disable Toggle */}
      <div className="bg-gsv-gray-50 border border-gsv-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gsv-gray-900 mb-2">Enable International Features</h3>
            <p className="text-sm text-gsv-gray-600">
              {settings.international_enabled
                ? 'International features are active and visible to users'
                : 'International features are hidden and show "Coming Soon" messages'
              }
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.international_enabled}
              onChange={(e) => updateSetting('international_enabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gsv-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gsv-green/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gsv-green"></div>
          </label>
        </div>

        {/* Coming Soon Message */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gsv-gray-700 mb-2">
            Coming Soon Message
          </label>
          <input
            type="text"
            value={settings.coming_soon_message}
            onChange={(e) => updateSetting('coming_soon_message', e.target.value)}
            className="w-full px-3 py-2 border border-gsv-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gsv-green focus:border-transparent"
            placeholder="e.g., International expansion coming Q3 2025"
          />
        </div>
      </div>

      {/* Infrastructure Preparation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Language & Region Support */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-gsv-info" />
            <h3 className="text-lg font-medium text-gsv-gray-900">Language & Region Support</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gsv-gray-700 mb-2">
                Supported Countries (comma-separated)
              </label>
              <input
                type="text"
                value={settings.supported_countries.join(', ')}
                onChange={(e) => updateSetting('supported_countries',
                  e.target.value.split(',').map(s => s.trim()).filter(s => s.length > 0)
                )}
                className="w-full px-3 py-2 border border-gsv-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gsv-green focus:border-transparent"
                placeholder="e.g., CA, UK, AU (leave empty for none)"
              />
              <p className="text-xs text-gsv-gray-500 mt-1">
                List country codes where international features are available
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gsv-gray-700 mb-2">
                Language Options (comma-separated)
              </label>
              <input
                type="text"
                value={settings.language_options.join(', ')}
                onChange={(e) => updateSetting('language_options',
                  e.target.value.split(',').map(s => s.trim()).filter(s => s.length > 0)
                )}
                className="w-full px-3 py-2 border border-gsv-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gsv-green focus:border-transparent"
                placeholder="e.g., en, es, fr"
              />
              <p className="text-xs text-gsv-gray-500 mt-1">
                Supported languages for content and interface
              </p>
            </div>

            <div className="flex items-center justify-between p-4 bg-gsv-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-gsv-gray-900">Timezone Support</div>
                <div className="text-sm text-gsv-gray-600">Handle scheduling across different time zones</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.timezone_support}
                  onChange={(e) => updateSetting('timezone_support', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gsv-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gsv-green/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gsv-green"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Compliance & Legal */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-gsv-warning" />
            <h3 className="text-lg font-medium text-gsv-gray-900">Compliance & Legal</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gsv-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-gsv-gray-900">GDPR Compliance</div>
                <div className="text-sm text-gsv-gray-600">European Union data protection requirements</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.compliance_requirements.gdpr_enabled}
                  onChange={(e) => updateComplianceRequirement('gdpr_enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gsv-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gsv-green/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gsv-green"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gsv-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-gsv-gray-900">CCPA Compliance</div>
                <div className="text-sm text-gsv-gray-600">California Consumer Privacy Act requirements</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.compliance_requirements.ccpa_enabled}
                  onChange={(e) => updateComplianceRequirement('ccpa_enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gsv-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gsv-green/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gsv-green"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gsv-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-gsv-gray-900">PIPEDA Compliance</div>
                <div className="text-sm text-gsv-gray-600">Canadian Personal Information Protection Act</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.compliance_requirements.pipeda_enabled}
                  onChange={(e) => updateComplianceRequirement('pipeda_enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gsv-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gsv-green/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gsv-green"></div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Warning for Enabling */}
      {settings.international_enabled && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="text-lg font-medium text-yellow-900 mb-2">International Features Enabled</h3>
              <p className="text-yellow-800 mb-4">
                International features are now active. Ensure you have:
              </p>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Multi-language content and translations</li>
                <li>• Timezone-aware scheduling systems</li>
                <li>• Compliance with local data protection laws</li>
                <li>• International payment processing capabilities</li>
                <li>• Localized customer support</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end pt-6 border-t border-gsv-gray-200">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-gsv-green text-white rounded-lg hover:bg-gsv-greenDark disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving Settings...' : 'Save International Settings'}
        </button>
      </div>
    </div>
  );
}
