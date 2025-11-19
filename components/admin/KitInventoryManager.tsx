"use client";

import { useState, useEffect } from "react";
import { Package, Plus, Edit, Trash2, ExternalLink, Save, X } from "lucide-react";

interface KitItem {
  id?: string;
  name: string;
  description: string;
  category: 'science_equipment' | 'presentation_materials' | 'activity_supplies';
  estimated_cost: number;
  supplier_name?: string;
  supplier_url?: string;
  availability_status: 'available' | 'limited' | 'out_of_stock';
  max_quantity?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export default function KitInventoryManager() {
  const [kits, setKits] = useState<KitItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingKit, setEditingKit] = useState<KitItem | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load kits (for now, using localStorage since we don't have a database table for this)
  useEffect(() => {
    const loadKits = () => {
      try {
        const savedKits = localStorage.getItem('gsv_kit_inventory');
        if (savedKits) {
          setKits(JSON.parse(savedKits));
        }
      } catch (error) {
        console.error('Error loading kits:', error);
      } finally {
        setLoading(false);
      }
    };

    loadKits();
  }, []);

  // Save kits to localStorage
  const saveKits = (updatedKits: KitItem[]) => {
    try {
      localStorage.setItem('gsv_kit_inventory', JSON.stringify(updatedKits));
      setKits(updatedKits);
    } catch (error) {
      console.error('Error saving kits:', error);
      setMessage({ type: 'error', text: 'Failed to save kit inventory' });
    }
  };

  const handleAddKit = () => {
    const newKit: KitItem = {
      name: '',
      description: '',
      category: 'science_equipment',
      estimated_cost: 0,
      availability_status: 'available',
      supplier_name: '',
      supplier_url: '',
      max_quantity: undefined,
      notes: ''
    };
    setEditingKit(newKit);
    setIsAdding(true);
  };

  const handleEditKit = (kit: KitItem) => {
    setEditingKit({ ...kit });
    setIsAdding(false);
  };

  const handleSaveKit = () => {
    if (!editingKit) return;

    // Validation
    if (!editingKit.name.trim()) {
      setMessage({ type: 'error', text: 'Kit name is required' });
      return;
    }

    if (editingKit.estimated_cost <= 0) {
      setMessage({ type: 'error', text: 'Estimated cost must be greater than $0' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      let updatedKits: KitItem[];

      if (isAdding) {
        // Add new kit
        const newKit = {
          ...editingKit,
          id: Date.now().toString(), // Simple ID generation
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        updatedKits = [...kits, newKit];
      } else {
        // Update existing kit
        updatedKits = kits.map(kit =>
          kit.id === editingKit.id
            ? { ...editingKit, updated_at: new Date().toISOString() }
            : kit
        );
      }

      saveKits(updatedKits);
      setEditingKit(null);
      setIsAdding(false);
      setMessage({ type: 'success', text: `Kit ${isAdding ? 'added' : 'updated'} successfully` });
    } catch (error) {
      console.error('Error saving kit:', error);
      setMessage({ type: 'error', text: 'Failed to save kit' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteKit = (kitId: string) => {
    const kit = kits.find(k => k.id === kitId);
    if (!kit) return;

    if (!confirm(`Are you sure you want to delete "${kit.name}"?`)) {
      return;
    }

    const updatedKits = kits.filter(k => k.id !== kitId);
    saveKits(updatedKits);
    setMessage({ type: 'success', text: 'Kit deleted successfully' });
  };

  const handleCancel = () => {
    setEditingKit(null);
    setIsAdding(false);
    setMessage(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-green-600 bg-green-50';
      case 'limited': return 'text-yellow-600 bg-yellow-50';
      case 'out_of_stock': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'science_equipment': return '🧪';
      case 'presentation_materials': return '📊';
      case 'activity_supplies': return '🎯';
      default: return '📦';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gsv-green"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gsv-gray-900">Kit Inventory Management</h2>
          <p className="text-sm text-gsv-gray-600 mt-1">
            Manage available kits that volunteers can purchase for their presentations
          </p>
        </div>
        <button
          onClick={handleAddKit}
          className="flex items-center gap-2 px-4 py-2 bg-gsv-green text-white rounded-lg hover:bg-gsv-greenDark transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Kit
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

      {/* Edit/Add Form */}
      {editingKit && (
        <div className="bg-gsv-gray-50 border border-gsv-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gsv-gray-900">
              {isAdding ? 'Add New Kit' : 'Edit Kit'}
            </h3>
            <button
              onClick={handleCancel}
              className="text-gsv-gray-400 hover:text-gsv-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gsv-gray-700 mb-2">
                Kit Name *
              </label>
              <input
                type="text"
                value={editingKit.name}
                onChange={(e) => setEditingKit({ ...editingKit, name: e.target.value })}
                className="w-full px-3 py-2 border border-gsv-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gsv-green focus:border-transparent"
                placeholder="e.g., Basic Science Kit"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gsv-gray-700 mb-2">
                Category *
              </label>
              <select
                value={editingKit.category}
                onChange={(e) => setEditingKit({ ...editingKit, category: e.target.value as any })}
                className="w-full px-3 py-2 border border-gsv-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gsv-green focus:border-transparent"
              >
                <option value="science_equipment">Science Equipment</option>
                <option value="presentation_materials">Presentation Materials</option>
                <option value="activity_supplies">Activity Supplies</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gsv-gray-700 mb-2">
                Estimated Cost ($) *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={editingKit.estimated_cost}
                onChange={(e) => setEditingKit({ ...editingKit, estimated_cost: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gsv-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gsv-green focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gsv-gray-700 mb-2">
                Availability Status
              </label>
              <select
                value={editingKit.availability_status}
                onChange={(e) => setEditingKit({ ...editingKit, availability_status: e.target.value as any })}
                className="w-full px-3 py-2 border border-gsv-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gsv-green focus:border-transparent"
              >
                <option value="available">Available</option>
                <option value="limited">Limited Stock</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gsv-gray-700 mb-2">
                Supplier Name
              </label>
              <input
                type="text"
                value={editingKit.supplier_name || ''}
                onChange={(e) => setEditingKit({ ...editingKit, supplier_name: e.target.value })}
                className="w-full px-3 py-2 border border-gsv-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gsv-green focus:border-transparent"
                placeholder="e.g., Amazon, Carolina Biological"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gsv-gray-700 mb-2">
                Supplier URL
              </label>
              <input
                type="url"
                value={editingKit.supplier_url || ''}
                onChange={(e) => setEditingKit({ ...editingKit, supplier_url: e.target.value })}
                className="w-full px-3 py-2 border border-gsv-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gsv-green focus:border-transparent"
                placeholder="https://..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gsv-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={editingKit.description}
                onChange={(e) => setEditingKit({ ...editingKit, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gsv-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gsv-green focus:border-transparent resize-none"
                placeholder="Describe what's included in this kit..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gsv-gray-700 mb-2">
                Max Quantity (Optional)
              </label>
              <input
                type="number"
                min="1"
                value={editingKit.max_quantity || ''}
                onChange={(e) => setEditingKit({ ...editingKit, max_quantity: parseInt(e.target.value) || undefined })}
                className="w-full px-3 py-2 border border-gsv-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gsv-green focus:border-transparent"
                placeholder="Leave empty for unlimited"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gsv-gray-700 mb-2">
                Additional Notes
              </label>
              <textarea
                value={editingKit.notes || ''}
                onChange={(e) => setEditingKit({ ...editingKit, notes: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gsv-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gsv-green focus:border-transparent resize-none"
                placeholder="Any special instructions or requirements..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={handleCancel}
              className="px-4 py-2 border border-gsv-gray-300 rounded-lg text-gsv-gray-700 hover:bg-gsv-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveKit}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-gsv-green text-white rounded-lg hover:bg-gsv-greenDark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Kit'}
            </button>
          </div>
        </div>
      )}

      {/* Kit Inventory List */}
      <div className="space-y-4">
        {kits.length === 0 ? (
          <div className="text-center py-12 bg-gsv-gray-50 border border-gsv-gray-200 rounded-xl">
            <Package className="w-12 h-12 text-gsv-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gsv-gray-900 mb-2">No Kits Added Yet</h3>
            <p className="text-gsv-gray-600 mb-4">
              Add your first kit to help volunteers find materials for their presentations.
            </p>
            <button
              onClick={handleAddKit}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gsv-green text-white rounded-lg hover:bg-gsv-greenDark transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add First Kit
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {kits.map((kit) => (
              <div key={kit.id} className="bg-white border border-gsv-gray-200 rounded-xl p-6 hover:shadow-soft transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="text-2xl">{getCategoryIcon(kit.category)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-medium text-gsv-gray-900">{kit.name}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(kit.availability_status)}`}>
                          {kit.availability_status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>

                      <p className="text-gsv-gray-600 mb-3">{kit.description}</p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gsv-gray-500">Cost:</span>
                          <div className="font-medium text-gsv-gray-900">${kit.estimated_cost.toFixed(2)}</div>
                        </div>
                        {kit.supplier_name && (
                          <div>
                            <span className="text-gsv-gray-500">Supplier:</span>
                            <div className="font-medium text-gsv-gray-900">{kit.supplier_name}</div>
                          </div>
                        )}
                        {kit.max_quantity && (
                          <div>
                            <span className="text-gsv-gray-500">Max Qty:</span>
                            <div className="font-medium text-gsv-gray-900">{kit.max_quantity}</div>
                          </div>
                        )}
                        <div>
                          <span className="text-gsv-gray-500">Category:</span>
                          <div className="font-medium text-gsv-gray-900 capitalize">
                            {kit.category.replace('_', ' ')}
                          </div>
                        </div>
                      </div>

                      {kit.notes && (
                        <div className="mt-3 p-3 bg-gsv-gray-50 rounded-lg">
                          <div className="text-sm text-gsv-gray-600">{kit.notes}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {kit.supplier_url && (
                      <a
                        href={kit.supplier_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gsv-gray-400 hover:text-gsv-green transition-colors"
                        title="View supplier website"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    <button
                      onClick={() => handleEditKit(kit)}
                      className="p-2 text-gsv-gray-400 hover:text-gsv-green transition-colors"
                      title="Edit kit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteKit(kit.id!)}
                      className="p-2 text-gsv-gray-400 hover:text-red-500 transition-colors"
                      title="Delete kit"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Export/Import Functionality */}
      <div className="bg-gsv-gray-50 border border-gsv-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-medium text-gsv-gray-900 mb-4">Kit Inventory Management</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => {
              const dataStr = JSON.stringify(kits, null, 2);
              const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
              const exportFileDefaultName = 'kit-inventory.json';
              const linkElement = document.createElement('a');
              linkElement.setAttribute('href', dataUri);
              linkElement.setAttribute('download', exportFileDefaultName);
              linkElement.click();
            }}
            className="px-4 py-2 bg-gsv-gray-600 text-white rounded-lg hover:bg-gsv-gray-700 transition-colors text-sm"
          >
            Export Inventory
          </button>
          <label className="px-4 py-2 bg-gsv-gray-600 text-white rounded-lg hover:bg-gsv-gray-700 transition-colors text-sm cursor-pointer">
            Import Inventory
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    try {
                      const importedKits = JSON.parse(e.target?.result as string);
                      if (Array.isArray(importedKits)) {
                        saveKits(importedKits);
                        setMessage({ type: 'success', text: 'Inventory imported successfully' });
                      } else {
                        setMessage({ type: 'error', text: 'Invalid file format' });
                      }
                    } catch (error) {
                      setMessage({ type: 'error', text: 'Failed to import inventory' });
                    }
                  };
                  reader.readAsText(file);
                }
              }}
            />
          </label>
        </div>
        <p className="text-xs text-gsv-gray-500 mt-2">
          Export your kit inventory as JSON or import from a previously exported file.
        </p>
      </div>
    </div>
  );
}
