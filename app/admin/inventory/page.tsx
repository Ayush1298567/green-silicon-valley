"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { redirect } from "next/navigation";
import { getDashboardPathForRole, type UserRole } from "@/lib/auth/roles";
import { Plus, Package, AlertTriangle, CheckCircle, Wrench, Calendar, Edit3, Trash2, Search } from "lucide-react";
import ProfessionalButton from "@/components/ui/ProfessionalButton";

interface EquipmentItem {
  id: string;
  category_id: string;
  name: string;
  description: string;
  serial_number?: string;
  purchase_date?: string;
  purchase_price?: number;
  current_value?: number;
  condition_status: string;
  location?: string;
  assigned_to?: string;
  is_available: boolean;
  requires_maintenance: boolean;
  last_maintenance_date?: string;
  next_maintenance_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  category?: {
    name: string;
    maintenance_required: boolean;
  };
}

interface EquipmentCategory {
  id: string;
  name: string;
  description?: string;
  maintenance_required: boolean;
  maintenance_interval_days?: number;
}

export default function InventoryManagementPage() {
  const supabase = createClientComponentClient();
  const [items, setItems] = useState<EquipmentItem[]>([]);
  const [categories, setCategories] = useState<EquipmentCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddItem, setShowAddItem] = useState(false);
  const [selectedItem, setSelectedItem] = useState<EquipmentItem | null>(null);
  const [showMaintenance, setShowMaintenance] = useState(false);

  const [newItem, setNewItem] = useState({
    category_id: '',
    name: '',
    description: '',
    serial_number: '',
    purchase_date: '',
    purchase_price: '',
    location: '',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        redirect("/login");
        return;
      }

      const { data: rows } = await supabase.from("users").select("role").eq("id", session.user.id).limit(1);
      const role = (rows?.[0]?.role as UserRole) ?? "volunteer";
      if (!['founder', 'intern'].includes(role)) {
        redirect(getDashboardPathForRole(role));
        return;
      }

      // Load equipment items with categories
      const { data: itemsData, error: itemsError } = await supabase
        .from("equipment_items")
        .select(`
          *,
          equipment_categories(name, maintenance_required)
        `)
        .order("created_at", { ascending: false });

      if (itemsError) throw itemsError;

      // Load categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("equipment_categories")
        .select("*")
        .order("name");

      if (categoriesError) throw categoriesError;

      setItems(itemsData || []);
      setCategories(categoriesData || []);
    } catch (error) {
      console.error("Error loading inventory data:", error);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async () => {
    try {
      const itemData = {
        category_id: newItem.category_id,
        name: newItem.name,
        description: newItem.description,
        serial_number: newItem.serial_number || null,
        purchase_date: newItem.purchase_date || null,
        purchase_price: newItem.purchase_price ? parseFloat(newItem.purchase_price) : null,
        location: newItem.location || null,
        notes: newItem.notes || null
      };

      const { error } = await supabase
        .from("equipment_items")
        .insert(itemData);

      if (error) throw error;

      // Reset form
      setNewItem({
        category_id: '',
        name: '',
        description: '',
        serial_number: '',
        purchase_date: '',
        purchase_price: '',
        location: '',
        notes: ''
      });
      setShowAddItem(false);
      await loadData();
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

  const updateItemStatus = async (itemId: string, status: string) => {
    try {
      const { error } = await supabase
        .from("equipment_items")
        .update({ condition_status: status })
        .eq("id", itemId);

      if (error) throw error;
      await loadData();
    } catch (error) {
      console.error("Error updating item status:", error);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.serial_number?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === "all" || item.category_id === categoryFilter;
    const matchesStatus = statusFilter === "all" || item.condition_status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getConditionColor = (status: string) => {
    switch (status) {
      case "excellent": return "bg-green-100 text-green-800";
      case "good": return "bg-blue-100 text-blue-800";
      case "fair": return "bg-yellow-100 text-yellow-800";
      case "poor": return "bg-orange-100 text-orange-800";
      case "broken": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getConditionIcon = (status: string) => {
    switch (status) {
      case "excellent": return <CheckCircle className="w-4 h-4" />;
      case "good": return <CheckCircle className="w-4 h-4" />;
      case "fair": return <AlertTriangle className="w-4 h-4" />;
      case "poor": return <AlertTriangle className="w-4 h-4" />;
      case "broken": return <AlertTriangle className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="container py-10">
        <div className="text-center py-12 text-gsv-gray">Loading inventory...</div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gsv-charcoal mb-2">Equipment Inventory</h1>
          <p className="text-gsv-gray">
            Track, maintain, and manage all presentation equipment and supplies
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="card p-4">
            <div className="text-2xl font-bold text-gsv-green">{items.length}</div>
            <div className="text-sm text-gsv-gray">Total Items</div>
          </div>
          <div className="card p-4">
            <div className="text-2xl font-bold text-blue-600">
              {items.filter(i => i.is_available).length}
            </div>
            <div className="text-sm text-gsv-gray">Available</div>
          </div>
          <div className="card p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {items.filter(i => i.requires_maintenance).length}
            </div>
            <div className="text-sm text-gsv-gray">Needs Maintenance</div>
          </div>
          <div className="card p-4">
            <div className="text-2xl font-bold text-red-600">
              {items.filter(i => i.condition_status === 'broken').length}
            </div>
            <div className="text-sm text-gsv-gray">Broken Items</div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="card p-4 mb-6">
          <div className="grid md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gsv-gray w-4 h-4" />
              <input
                type="text"
                placeholder="Search equipment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green"
              />
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green"
            >
              <option value="all">All Conditions</option>
              <option value="excellent">Excellent</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="poor">Poor</option>
              <option value="broken">Broken</option>
            </select>

            {/* Add Item Button */}
            <ProfessionalButton
              onClick={() => setShowAddItem(true)}
              className="flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Equipment
            </ProfessionalButton>
          </div>
        </div>

        {/* Equipment Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gsv-charcoal uppercase tracking-wider">
                    Equipment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gsv-charcoal uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gsv-charcoal uppercase tracking-wider">
                    Condition
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gsv-charcoal uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gsv-charcoal uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gsv-charcoal uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gsv-charcoal uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gsv-charcoal">
                          {item.name}
                        </div>
                        <div className="text-sm text-gsv-gray">
                          {item.serial_number && `SN: ${item.serial_number}`}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gsv-gray">
                      {item.category?.name || 'Uncategorized'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={item.condition_status}
                        onChange={(e) => updateItemStatus(item.id, e.target.value)}
                        className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getConditionColor(item.condition_status)}`}
                      >
                        <option value="excellent">Excellent</option>
                        <option value="good">Good</option>
                        <option value="fair">Fair</option>
                        <option value="poor">Poor</option>
                        <option value="broken">Broken</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {item.is_available ? (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Available
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            In Use
                          </span>
                        )}
                        {item.requires_maintenance && (
                          <Wrench className="w-4 h-4 text-orange-600" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gsv-gray">
                      {item.location || 'Not specified'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {item.current_value ? `$${item.current_value.toFixed(2)}` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedItem(item)}
                          className="text-gsv-green hover:text-gsv-green/80"
                          title="View Details"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        {item.requires_maintenance && (
                          <button
                            onClick={() => setShowMaintenance(true)}
                            className="text-orange-600 hover:text-orange-600/80"
                            title="Maintenance Required"
                          >
                            <Wrench className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredItems.length === 0 && (
            <div className="text-center py-12 text-gsv-gray">
              No equipment found matching your filters.
            </div>
          )}
        </div>

        {/* Add Equipment Modal */}
        {showAddItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gsv-charcoal">Add Equipment</h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gsv-charcoal mb-1">
                    Category *
                  </label>
                  <select
                    value={newItem.category_id}
                    onChange={(e) => setNewItem(prev => ({ ...prev, category_id: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green"
                    required
                  >
                    <option value="">Select category...</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gsv-charcoal mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={newItem.name}
                    onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green"
                    placeholder="Equipment name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gsv-charcoal mb-1">
                    Description
                  </label>
                  <textarea
                    value={newItem.description}
                    onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green resize-none"
                    rows={3}
                    placeholder="Equipment description..."
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gsv-charcoal mb-1">
                      Serial Number
                    </label>
                    <input
                      type="text"
                      value={newItem.serial_number}
                      onChange={(e) => setNewItem(prev => ({ ...prev, serial_number: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green"
                      placeholder="Optional"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gsv-charcoal mb-1">
                      Purchase Price
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={newItem.purchase_price}
                      onChange={(e) => setNewItem(prev => ({ ...prev, purchase_price: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gsv-charcoal mb-1">
                      Purchase Date
                    </label>
                    <input
                      type="date"
                      value={newItem.purchase_date}
                      onChange={(e) => setNewItem(prev => ({ ...prev, purchase_date: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gsv-charcoal mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      value={newItem.location}
                      onChange={(e) => setNewItem(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green"
                      placeholder="Storage location"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gsv-charcoal mb-1">
                    Notes
                  </label>
                  <textarea
                    value={newItem.notes}
                    onChange={(e) => setNewItem(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green resize-none"
                    rows={2}
                    placeholder="Additional notes..."
                  />
                </div>
              </div>
              <div className="p-6 border-t flex justify-end gap-3">
                <button
                  onClick={() => setShowAddItem(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <ProfessionalButton
                  onClick={addItem}
                  disabled={!newItem.category_id || !newItem.name}
                >
                  Add Equipment
                </ProfessionalButton>
              </div>
            </div>
          </div>
        )}

        {/* Equipment Details Modal */}
        {selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gsv-charcoal">{selectedItem.name}</h3>
              </div>
              <div className="p-6 overflow-y-auto max-h-96">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gsv-charcoal mb-3">Equipment Details</h4>
                    <dl className="space-y-2">
                      <div>
                        <dt className="text-sm text-gsv-gray">Category</dt>
                        <dd className="text-sm font-medium">{selectedItem.category?.name || 'Uncategorized'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-gsv-gray">Serial Number</dt>
                        <dd className="text-sm font-medium">{selectedItem.serial_number || 'N/A'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-gsv-gray">Purchase Date</dt>
                        <dd className="text-sm font-medium">
                          {selectedItem.purchase_date ? new Date(selectedItem.purchase_date).toLocaleDateString() : 'N/A'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm text-gsv-gray">Purchase Price</dt>
                        <dd className="text-sm font-medium">
                          {selectedItem.purchase_price ? `$${selectedItem.purchase_price.toFixed(2)}` : 'N/A'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm text-gsv-gray">Current Value</dt>
                        <dd className="text-sm font-medium">
                          {selectedItem.current_value ? `$${selectedItem.current_value.toFixed(2)}` : 'N/A'}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div>
                    <h4 className="font-medium text-gsv-charcoal mb-3">Status & Maintenance</h4>
                    <dl className="space-y-2">
                      <div>
                        <dt className="text-sm text-gsv-gray">Condition</dt>
                        <dd className="text-sm font-medium capitalize">{selectedItem.condition_status}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-gsv-gray">Availability</dt>
                        <dd className="text-sm font-medium">{selectedItem.is_available ? 'Available' : 'In Use'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-gsv-gray">Location</dt>
                        <dd className="text-sm font-medium">{selectedItem.location || 'Not specified'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-gsv-gray">Last Maintenance</dt>
                        <dd className="text-sm font-medium">
                          {selectedItem.last_maintenance_date ? new Date(selectedItem.last_maintenance_date).toLocaleDateString() : 'Never'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm text-gsv-gray">Next Maintenance</dt>
                        <dd className="text-sm font-medium">
                          {selectedItem.next_maintenance_date ? new Date(selectedItem.next_maintenance_date).toLocaleDateString() : 'Not scheduled'}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>

                {selectedItem.description && (
                  <div className="mt-6">
                    <h4 className="font-medium text-gsv-charcoal mb-2">Description</h4>
                    <p className="text-sm text-gsv-gray">{selectedItem.description}</p>
                  </div>
                )}

                {selectedItem.notes && (
                  <div className="mt-4">
                    <h4 className="font-medium text-gsv-charcoal mb-2">Notes</h4>
                    <p className="text-sm text-gsv-gray">{selectedItem.notes}</p>
                  </div>
                )}
              </div>
              <div className="p-6 border-t flex justify-end gap-3">
                <button
                  onClick={() => setSelectedItem(null)}
                  className="px-4 py-2 bg-gsv-green text-white rounded-lg hover:bg-gsv-green/90 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
