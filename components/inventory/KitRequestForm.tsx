"use client";

import { useState, useEffect } from "react";
import { Truck, Calendar, MapPin, AlertTriangle, CheckCircle } from "lucide-react";

interface ActivityKit {
  id: string;
  name: string;
  description?: string;
  activity_type: string;
  location?: string;
  current_stock: number;
  min_stock: number;
  max_stock: number;
}

interface KitRequestFormProps {
  kits: ActivityKit[];
  onRequestSubmitted: () => void;
}

export default function KitRequestForm({ kits, onRequestSubmitted }: KitRequestFormProps) {
  const [selectedKit, setSelectedKit] = useState<string>("");
  const [formData, setFormData] = useState({
    quantity_requested: 0,
    priority: "medium" as "low" | "medium" | "high" | "urgent",
    scheduled_pickup: "",
    pickup_location: "",
    notes: ""
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const selectedKitData = kits.find(kit => kit.id === selectedKit);

  useEffect(() => {
    if (selectedKitData) {
      // Auto-suggest quantity based on kit data
      const suggestedQuantity = Math.max(
        selectedKitData.min_stock - selectedKitData.current_stock,
        selectedKitData.max_stock - selectedKitData.current_stock,
        1
      );

      // Auto-determine priority
      let priority: "low" | "medium" | "high" | "urgent" = "medium";
      if (selectedKitData.current_stock === 0) {
        priority = "urgent";
      } else if (selectedKitData.current_stock <= selectedKitData.min_stock * 0.5) {
        priority = "high";
      }

      setFormData(prev => ({
        ...prev,
        quantity_requested: suggestedQuantity,
        priority,
        pickup_location: selectedKitData.location || "",
        notes: `Current stock: ${selectedKitData.current_stock}, Minimum required: ${selectedKitData.min_stock}`
      }));
    }
  }, [selectedKit, selectedKitData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedKit || !formData.quantity_requested) {
      alert("Please select a kit and specify quantity");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/inventory/kits/${selectedKit}/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.ok) {
        setSubmitted(true);
        onRequestSubmitted();
        // Reset form after a delay
        setTimeout(() => {
          setSelectedKit("");
          setFormData({
            quantity_requested: 0,
            priority: "medium",
            scheduled_pickup: "",
            pickup_location: "",
            notes: ""
          });
          setSubmitted(false);
        }, 3000);
      } else {
        throw new Error(data.error || "Failed to submit request");
      }
    } catch (error: any) {
      alert("Error submitting request: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-green-900 mb-2">Request Submitted!</h3>
        <p className="text-green-700">
          Your kit restocking request has been submitted and will be reviewed shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Truck className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Request Kit Restock</h2>
            <p className="text-gray-600">Submit a request to restock activity kits</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Kit Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Kit to Restock *
            </label>
            <select
              value={selectedKit}
              onChange={(e) => setSelectedKit(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Choose a kit...</option>
              {kits.map((kit) => (
                <option key={kit.id} value={kit.id}>
                  {kit.name} - {kit.activity_type.replace("_", " ")} (Current: {kit.current_stock}/{kit.max_stock})
                </option>
              ))}
            </select>
          </div>

          {selectedKitData && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Kit Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Current Stock:</span>{" "}
                  <span className={selectedKitData.current_stock <= selectedKitData.min_stock ? "text-red-600 font-medium" : "text-gray-700"}>
                    {selectedKitData.current_stock}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Minimum Required:</span>{" "}
                  <span className="text-gray-700">{selectedKitData.min_stock}</span>
                </div>
                <div>
                  <span className="font-medium">Maximum Capacity:</span>{" "}
                  <span className="text-gray-700">{selectedKitData.max_stock}</span>
                </div>
                <div>
                  <span className="font-medium">Location:</span>{" "}
                  <span className="text-gray-700">{selectedKitData.location || "Not specified"}</span>
                </div>
              </div>

              {selectedKitData.current_stock <= selectedKitData.min_stock && (
                <div className="mt-3 flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-yellow-800">
                    <strong>Low Stock Alert:</strong> This kit is currently below minimum stock levels.
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quantity and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity Requested *
              </label>
              <input
                type="number"
                min="1"
                value={formData.quantity_requested || ""}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  quantity_requested: parseInt(e.target.value) || 0
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Suggested: {selectedKitData ? Math.max(selectedKitData.min_stock - selectedKitData.current_stock, 0) : 0} units
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority Level *
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Pickup Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Scheduled Pickup Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="datetime-local"
                  value={formData.scheduled_pickup}
                  onChange={(e) => setFormData(prev => ({ ...prev, scheduled_pickup: e.target.value }))}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pickup Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={formData.pickup_location}
                  onChange={(e) => setFormData(prev => ({ ...prev, pickup_location: e.target.value }))}
                  placeholder="Where to pick up the kits"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              placeholder="Any special instructions or requirements..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t">
            <button
              type="submit"
              disabled={loading || !selectedKit}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Submitting Request...
                </>
              ) : (
                <>
                  <Truck size={16} />
                  Submit Restock Request
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
