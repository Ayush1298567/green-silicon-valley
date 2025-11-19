"use client";

import { useState, useEffect } from "react";
import { Save, Package, DollarSign, Link, FileText, Users } from "lucide-react";

interface ProcurementSettings {
  id?: string;
  procurement_enabled: boolean;
  max_budget_per_group: number;
  volunteer_self_fund_allowed: boolean;
  kit_recommendations_enabled: boolean;
  kit_inventory_link?: string;
  procurement_instructions: string;
  require_budget_justification: boolean;
  notify_on_request: boolean;
  notify_on_approval: boolean;
}

export default function ProcurementSettingsManager() {
  const [settings, setSettings] = useState<ProcurementSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load current settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/admin/procurement-settings');
        const data = await response.json();
        if (data.ok) {
          setSettings(data.settings || {
            procurement_enabled: false,
            max_budget_per_group: 25,
            volunteer_self_fund_allowed: true,
            kit_recommendations_enabled: true,
            procurement_instructions: 'Please specify exactly what materials you need for your presentation. Include quantities and any specific requirements.',
            require_budget_justification: true,
            notify_on_request: true,
            notify_on_approval: true
          });
        }
      } catch (error) {
        console.error('Error loading settings:', error);
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
      const response = await fetch('/api/admin/procurement-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });

      const data = await response.json();

      if (data.ok) {
        setSettings(data.settings);
        setMessage({ type: 'success', text: 'Settings saved successfully' });
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

  const updateSetting = (key: keyof ProcurementSettings, value: any) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
    setMessage(null); // Clear any previous messages
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
        <p className="text-gsv-gray-600">Unable to load procurement settings.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gsv-gray-900">Procurement Settings</h2>
          <p className="text-sm text-gsv-gray-600 mt-1">
            Control how volunteers can request materials for their presentations
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-gsv-green text-white rounded-lg hover:bg-gsv-greenDark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Procurement Options */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Package className="w-5 h-5 text-gsv-green" />
            <h3 className="text-lg font-medium text-gsv-gray-900">Procurement Options</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gsv-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-gsv-gray-900">Enable GSV Material Procurement</div>
                <div className="text-sm text-gsv-gray-600">Allow GSV to purchase and deliver materials</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.procurement_enabled}
                  onChange={(e) => updateSetting('procurement_enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gsv-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gsv-green/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gsv-green"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gsv-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-gsv-gray-900">Allow Volunteer Self-Funding</div>
                <div className="text-sm text-gsv-gray-600">Volunteers can purchase materials themselves</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.volunteer_self_fund_allowed}
                  onChange={(e) => updateSetting('volunteer_self_fund_allowed', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gsv-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gsv-green/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gsv-green"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gsv-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-gsv-gray-900">Show Kit Recommendations</div>
                <div className="text-sm text-gsv-gray-600">Display links to available kits and suppliers</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.kit_recommendations_enabled}
                  onChange={(e) => updateSetting('kit_recommendations_enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gsv-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gsv-green/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gsv-green"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Budget Settings */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <DollarSign className="w-5 h-5 text-gsv-warm" />
            <h3 className="text-lg font-medium text-gsv-gray-900">Budget Controls</h3>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-gsv-gray-50 rounded-lg">
              <label className="block text-sm font-medium text-gsv-gray-700 mb-2">
                Maximum Budget Per Group ($)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={settings.max_budget_per_group}
                onChange={(e) => updateSetting('max_budget_per_group', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gsv-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gsv-green focus:border-transparent"
              />
              <p className="text-xs text-gsv-gray-500 mt-1">
                Maximum amount GSV will spend on materials per volunteer group (4-5 students)
              </p>
            </div>

          </div>
        </div>

        {/* Kit Inventory Link */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Link className="w-5 h-5 text-gsv-info" />
            <h3 className="text-lg font-medium text-gsv-gray-900">Kit Inventory</h3>
          </div>

          <div className="p-4 bg-gsv-gray-50 rounded-lg">
            <label className="block text-sm font-medium text-gsv-gray-700 mb-2">
              Kit Inventory Link (Optional)
            </label>
            <input
              type="url"
              value={settings.kit_inventory_link || ''}
              onChange={(e) => updateSetting('kit_inventory_link', e.target.value)}
              placeholder="https://example.com/available-kits"
              className="w-full px-3 py-2 border border-gsv-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gsv-green focus:border-transparent"
            />
            <p className="text-xs text-gsv-gray-500 mt-1">
              Link to a page showing currently available kits that volunteers can purchase
            </p>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-gsv-eco" />
            <h3 className="text-lg font-medium text-gsv-gray-900">Notifications</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gsv-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-gsv-gray-900">Notify on New Requests</div>
                <div className="text-sm text-gsv-gray-600">Send notification when volunteers submit requests</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notify_on_request}
                  onChange={(e) => updateSetting('notify_on_request', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gsv-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gsv-green/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gsv-green"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gsv-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-gsv-gray-900">Notify on Approvals</div>
                <div className="text-sm text-gsv-gray-600">Send notification when requests are approved/rejected</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notify_on_approval}
                  onChange={(e) => updateSetting('notify_on_approval', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gsv-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gsv-green/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gsv-green"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gsv-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-gsv-gray-900">Require Budget Justification</div>
                <div className="text-sm text-gsv-gray-600">Force volunteers to explain why materials are needed</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.require_budget_justification}
                  onChange={(e) => updateSetting('require_budget_justification', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gsv-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gsv-green/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gsv-green"></div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-gsv-gray-600" />
          <h3 className="text-lg font-medium text-gsv-gray-900">Volunteer Instructions</h3>
        </div>

        <div className="p-4 bg-gsv-gray-50 rounded-lg">
          <label className="block text-sm font-medium text-gsv-gray-700 mb-2">
            Instructions for Volunteers
          </label>
          <textarea
            value={settings.procurement_instructions}
            onChange={(e) => updateSetting('procurement_instructions', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gsv-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gsv-green focus:border-transparent resize-none"
            placeholder="Instructions that will be shown to volunteers when requesting materials..."
          />
          <p className="text-xs text-gsv-gray-500 mt-1">
            These instructions will be displayed to volunteers when they request materials
          </p>
        </div>
      </div>

      {/* Save Button (Bottom) */}
      <div className="flex justify-end pt-6 border-t border-gsv-gray-200">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-gsv-green text-white rounded-lg hover:bg-gsv-greenDark disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving Settings...' : 'Save All Settings'}
        </button>
      </div>
    </div>
  );
}
