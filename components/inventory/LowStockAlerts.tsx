"use client";

import { useState } from "react";
import { AlertTriangle, Package, Truck, Mail, Bell } from "lucide-react";

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
}

interface LowStockAlertsProps {
  kits: ActivityKit[];
  onAlertResolved: () => void;
}

export default function LowStockAlerts({ kits, onAlertResolved }: LowStockAlertsProps) {
  const [sendingNotification, setSendingNotification] = useState<string | null>(null);

  const lowStockKits = kits.filter(kit => kit.current_stock <= kit.min_stock);
  const criticalKits = lowStockKits.filter(kit => kit.current_stock === 0);
  const warningKits = lowStockKits.filter(kit => kit.current_stock > 0);

  const handleSendNotification = async (kitId: string, notificationType: "email" | "in_app") => {
    setSendingNotification(kitId);

    try {
      const res = await fetch(`/api/inventory/kits/${kitId}/alert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: notificationType }),
      });

      const data = await res.json();
      if (data.ok) {
        // Could show success message
        console.log("Notification sent successfully");
      } else {
        alert("Failed to send notification: " + data.error);
      }
    } catch (error: any) {
      alert("Error sending notification: " + error.message);
    } finally {
      setSendingNotification(null);
    }
  };

  const handleCreateRestockRequest = async (kit: ActivityKit) => {
    const suggestedQuantity = kit.max_stock - kit.current_stock;

    try {
      const res = await fetch(`/api/inventory/kits/${kit.id}/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quantity_requested: suggestedQuantity,
          priority: kit.current_stock === 0 ? "urgent" : "high",
          notes: `Auto-generated restock request. Current stock: ${kit.current_stock}, Min required: ${kit.min_stock}`
        }),
      });

      const data = await res.json();
      if (data.ok) {
        onAlertResolved(); // Refresh the data
      } else {
        alert("Failed to create restock request: " + data.error);
      }
    } catch (error: any) {
      alert("Error creating restock request: " + error.message);
    }
  };

  if (lowStockKits.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
          <Package className="w-8 h-8 text-green-600" />
        </div>
        <h4 className="text-lg font-medium mb-2">All kits are well-stocked!</h4>
        <p>All activity kits are above their minimum stock levels.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-red-700">{criticalKits.length}</div>
              <div className="text-sm text-red-600">Out of Stock</div>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Package className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-700">{warningKits.length}</div>
              <div className="text-sm text-yellow-600">Low Stock</div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Bell className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-700">{lowStockKits.length}</div>
              <div className="text-sm text-blue-600">Total Alerts</div>
            </div>
          </div>
        </div>
      </div>

      {/* Critical Alerts (Out of Stock) */}
      {criticalKits.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 text-red-700 flex items-center gap-2">
            <AlertTriangle size={20} />
            Out of Stock - Urgent Action Required
          </h3>
          <div className="space-y-3">
            {criticalKits.map((kit) => (
              <div key={kit.id} className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-red-900">{kit.name}</h4>
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">
                        OUT OF STOCK
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-red-700">
                      <div>
                        <span className="font-medium">Current:</span> {kit.current_stock}
                      </div>
                      <div>
                        <span className="font-medium">Minimum:</span> {kit.min_stock}
                      </div>
                      <div>
                        <span className="font-medium">Type:</span> {kit.activity_type.replace("_", " ")}
                      </div>
                      {kit.location && (
                        <div>
                          <span className="font-medium">Location:</span> {kit.location}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleCreateRestockRequest(kit)}
                      className="px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 flex items-center gap-1"
                    >
                      <Truck size={14} />
                      Request Restock
                    </button>
                    <button
                      onClick={() => handleSendNotification(kit.id, "email")}
                      disabled={sendingNotification === kit.id}
                      className="px-3 py-2 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 flex items-center gap-1"
                    >
                      <Mail size={14} />
                      {sendingNotification === kit.id ? "Sending..." : "Notify"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warning Alerts (Low Stock) */}
      {warningKits.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 text-yellow-700 flex items-center gap-2">
            <Package size={20} />
            Low Stock Warnings
          </h3>
          <div className="space-y-3">
            {warningKits.map((kit) => (
              <div key={kit.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-yellow-900">{kit.name}</h4>
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                        LOW STOCK
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-yellow-700">
                      <div>
                        <span className="font-medium">Current:</span> {kit.current_stock}
                      </div>
                      <div>
                        <span className="font-medium">Minimum:</span> {kit.min_stock}
                      </div>
                      <div>
                        <span className="font-medium">Type:</span> {kit.activity_type.replace("_", " ")}
                      </div>
                      {kit.location && (
                        <div>
                          <span className="font-medium">Location:</span> {kit.location}
                        </div>
                      )}
                    </div>

                    <div className="mt-2 text-sm text-yellow-600">
                      <strong>Recommendation:</strong> Restock to {kit.max_stock} units
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleCreateRestockRequest(kit)}
                      className="px-3 py-2 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700 flex items-center gap-1"
                    >
                      <Truck size={14} />
                      Request Restock
                    </button>
                    <button
                      onClick={() => handleSendNotification(kit.id, "in_app")}
                      disabled={sendingNotification === kit.id}
                      className="px-3 py-2 bg-yellow-100 text-yellow-700 rounded text-sm hover:bg-yellow-200 flex items-center gap-1"
                    >
                      <Bell size={14} />
                      {sendingNotification === kit.id ? "Sending..." : "Alert"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {lowStockKits.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Bulk Actions</h4>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
              Generate Restock Report
            </button>
            <button className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm">
              Email All Suppliers
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm">
              Mark All as Ordered
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
