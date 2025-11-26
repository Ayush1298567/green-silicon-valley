"use client";

import { useState, useEffect } from "react";
import { Plus, AlertTriangle, Package, Truck, MapPin } from "lucide-react";
import Link from "next/link";
import KitManager from "@/components/inventory/KitManager";
import LowStockAlerts from "@/components/inventory/LowStockAlerts";

interface ActivityKit {
  id: string;
  name: string;
  description?: string;
  activity_type: string;
  location?: string;
  current_stock: number;
  min_stock: number;
  max_stock: number;
  status: string;
  created_at: string;
  updated_at: string;
}

interface KitRequest {
  id: string;
  kit_id: string;
  requested_by: string;
  quantity_requested: number;
  priority: string;
  status: string;
  scheduled_pickup?: string;
  pickup_location?: string;
  notes?: string;
  created_at: string;
  activity_kits?: {
    name: string;
    location: string;
  };
}

export default function KitsManagementPage() {
  const [kits, setKits] = useState<ActivityKit[]>([]);
  const [requests, setRequests] = useState<KitRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"inventory" | "requests" | "alerts">("inventory");

  useEffect(() => {
    fetchKits();
    fetchRequests();
  }, []);

  const fetchKits = async () => {
    try {
      const res = await fetch("/api/inventory/kits");
      const data = await res.json();
      if (data.ok) {
        setKits(data.kits || []);
      }
    } catch (error) {
      console.error("Error fetching kits:", error);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/inventory/kits/requests");
      const data = await res.json();
      if (data.ok) {
        setRequests(data.requests || []);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleKitUpdate = () => {
    fetchKits();
  };

  const handleRequestUpdate = () => {
    fetchRequests();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading inventory...</p>
        </div>
      </div>
    );
  }

  const lowStockKits = kits.filter(kit => kit.current_stock <= kit.min_stock);
  const pendingRequests = requests.filter(req => req.status === "pending");
  const totalKits = kits.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activity Kit Inventory</h1>
          <p className="text-gray-600">Manage supplies and materials for presentations</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Package size={16} />
              {totalKits} kits
            </span>
            <span className="flex items-center gap-1 text-yellow-600">
              <AlertTriangle size={16} />
              {lowStockKits.length} low stock
            </span>
            <span className="flex items-center gap-1 text-blue-600">
              <Truck size={16} />
              {pendingRequests.length} pending requests
            </span>
          </div>
          <button
            onClick={() => setActiveTab("inventory")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus size={16} />
            Add New Kit
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{totalKits}</div>
              <div className="text-sm text-gray-600">Total Kits</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{lowStockKits.length}</div>
              <div className="text-sm text-gray-600">Low Stock</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Package className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {kits.filter(k => k.status === "available").length}
              </div>
              <div className="text-sm text-gray-600">Available</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Truck className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{pendingRequests.length}</div>
              <div className="text-sm text-gray-600">Pending Requests</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex">
            {[
              { id: "inventory", label: "Inventory", count: totalKits },
              { id: "requests", label: "Requests", count: pendingRequests.length },
              { id: "alerts", label: "Alerts", count: lowStockKits.length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                    activeTab === tab.id ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "inventory" && (
            <KitManager
              kits={kits}
              onKitUpdate={handleKitUpdate}
            />
          )}

          {activeTab === "requests" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Kit Requests</h3>
                <Link
                  href="/admin/inventory/kits/request"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  New Request
                </Link>
              </div>

              {pendingRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Truck className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No pending requests</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingRequests.map((request) => (
                    <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-medium text-gray-900">
                              {request.activity_kits?.name}
                            </h4>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              request.priority === "urgent" ? "bg-red-100 text-red-800" :
                              request.priority === "high" ? "bg-orange-100 text-orange-800" :
                              "bg-yellow-100 text-yellow-800"
                            }`}>
                              {request.priority}
                            </span>
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                              {request.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Quantity:</span> {request.quantity_requested}
                            </div>
                            <div>
                              <span className="font-medium">Location:</span> {request.activity_kits?.location}
                            </div>
                            {request.scheduled_pickup && (
                              <div>
                                <span className="font-medium">Pickup:</span>{" "}
                                {new Date(request.scheduled_pickup).toLocaleDateString()}
                              </div>
                            )}
                            <div>
                              <span className="font-medium">Requested:</span>{" "}
                              {new Date(request.created_at).toLocaleDateString()}
                            </div>
                          </div>

                          {request.notes && (
                            <p className="text-sm text-gray-600 mt-2">{request.notes}</p>
                          )}
                        </div>

                        <div className="flex gap-2 ml-4">
                          <button className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200">
                            Approve
                          </button>
                          <button className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200">
                            Deny
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "alerts" && (
            <LowStockAlerts
              kits={lowStockKits}
              onAlertResolved={handleKitUpdate}
            />
          )}
        </div>
      </div>
    </div>
  );
}
