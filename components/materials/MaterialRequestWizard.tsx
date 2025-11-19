"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, DollarSign, Package, Truck, FileText } from "lucide-react";

interface MaterialItem {
  category: 'science_equipment' | 'presentation_materials' | 'activity_supplies';
  name: string;
  quantity: number;
  estimated_cost: number;
}

interface ProcurementSettings {
  procurement_enabled: boolean;
  max_budget_per_group: number;
  volunteer_self_fund_allowed: boolean;
  kit_recommendations_enabled: boolean;
  kit_inventory_link?: string;
  procurement_instructions: string;
}

interface MaterialRequestWizardProps {
  presentationId: string;
  onComplete?: (requestId: string) => void;
}

export default function MaterialRequestWizard({ presentationId, onComplete }: MaterialRequestWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [settings, setSettings] = useState<ProcurementSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form data
  const [requestType, setRequestType] = useState<'gsv_provided' | 'volunteer_funded' | 'kit_recommendation'>('gsv_provided');
  const [items, setItems] = useState<MaterialItem[]>([]);
  const [deliveryPreference, setDeliveryPreference] = useState<'school_address' | 'volunteer_address'>('school_address');
  const [neededByDate, setNeededByDate] = useState('');
  const [budgetJustification, setBudgetJustification] = useState('');

  const totalSections = 5;

  // Load procurement settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/admin/procurement-settings');
        const data = await response.json();
        if (data.ok) {
          setSettings(data.settings);
        }
      } catch (error) {
        console.error('Error loading procurement settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Calculate total cost
  const totalCost = items.reduce((sum, item) => sum + (item.estimated_cost * item.quantity), 0);

  // Check if budget is exceeded
  const budgetExceeded = settings ? totalCost > settings.max_budget_per_group : false;

  const handleSubmit = async () => {
    if (!settings) return;

    setSubmitting(true);
    try {
      const requestData = {
        presentationId,
        requestType,
        items,
        deliveryPreference,
        neededByDate,
        budgetJustification: budgetJustification.trim()
      };

      const response = await fetch('/api/materials/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      const data = await response.json();

      if (data.ok) {
        onComplete?.(data.request.id);
        // Redirect to success page or show success message
        router.push('/dashboard/volunteer/materials?success=true');
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      alert('Failed to submit material request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const addItem = () => {
    setItems([...items, {
      category: 'science_equipment',
      name: '',
      quantity: 1,
      estimated_cost: 0
    }]);
  };

  const updateItem = (index: number, field: keyof MaterialItem, value: string | number) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gsv-green"></div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center py-12">
        <p className="text-gsv-gray-600">Unable to load procurement settings. Please try again later.</p>
      </div>
    );
  }

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {Array.from({ length: totalSections }, (_, i) => (
        <div key={i} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            i + 1 <= currentStep
              ? 'bg-gsv-green text-white'
              : 'bg-gsv-gray-200 text-gsv-gray-500'
          }`}>
            {i + 1 <= currentStep ? <Check className="w-4 h-4" /> : i + 1}
          </div>
          {i < totalSections - 1 && (
            <div className={`w-12 h-0.5 mx-2 ${
              i + 1 < currentStep ? 'bg-gsv-green' : 'bg-gsv-gray-200'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gsv-gray-900 mb-2">Request Materials</h1>
        <p className="text-gsv-gray-600">Get the supplies you need for your presentation</p>
      </div>

      {renderStepIndicator()}

      {/* Step 1: Procurement Options */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-medium text-gsv-gray-900 mb-4">Choose Procurement Method</h2>
            <p className="text-sm text-gsv-gray-600 mb-6">{settings.procurement_instructions}</p>
          </div>

          <div className="space-y-3">
            {settings.procurement_enabled && (
              <label className="flex items-center p-4 border border-gsv-gray-200 rounded-lg cursor-pointer hover:bg-gsv-gray-50">
                <input
                  type="radio"
                  name="requestType"
                  value="gsv_provided"
                  checked={requestType === 'gsv_provided'}
                  onChange={(e) => setRequestType(e.target.value as any)}
                  className="mr-3"
                />
                <div className="flex-1">
                  <div className="font-medium text-gsv-gray-900">GSV Provided Materials</div>
                  <div className="text-sm text-gsv-gray-600">We purchase and deliver materials (budget limit: ${settings.max_budget_per_group})</div>
                </div>
                <Package className="w-5 h-5 text-gsv-green" />
              </label>
            )}

            {settings.volunteer_self_fund_allowed && (
              <label className="flex items-center p-4 border border-gsv-gray-200 rounded-lg cursor-pointer hover:bg-gsv-gray-50">
                <input
                  type="radio"
                  name="requestType"
                  value="volunteer_funded"
                  checked={requestType === 'volunteer_funded'}
                  onChange={(e) => setRequestType(e.target.value as any)}
                  className="mr-3"
                />
                <div className="flex-1">
                  <div className="font-medium text-gsv-gray-900">Volunteer Funded</div>
                  <div className="text-sm text-gsv-gray-600">Purchase materials yourself and get reimbursed</div>
                </div>
                <DollarSign className="w-5 h-5 text-gsv-warm" />
              </label>
            )}

            {settings.kit_recommendations_enabled && (
              <label className="flex items-center p-4 border border-gsv-gray-200 rounded-lg cursor-pointer hover:bg-gsv-gray-50">
                <input
                  type="radio"
                  name="requestType"
                  value="kit_recommendation"
                  checked={requestType === 'kit_recommendation'}
                  onChange={(e) => setRequestType(e.target.value as any)}
                  className="mr-3"
                />
                <div className="flex-1">
                  <div className="font-medium text-gsv-gray-900">Kit Recommendations</div>
                  <div className="text-sm text-gsv-gray-600">Get recommendations for available kits and suppliers</div>
                </div>
                <Truck className="w-5 h-5 text-gsv-info" />
              </label>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Material Selection */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-medium text-gsv-gray-900 mb-4">Specify Materials Needed</h2>
            <p className="text-sm text-gsv-gray-600">List each item you need for your presentation</p>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="p-4 border border-gsv-gray-200 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gsv-gray-700 mb-1">Category</label>
                    <select
                      value={item.category}
                      onChange={(e) => updateItem(index, 'category', e.target.value)}
                      className="w-full px-3 py-2 border border-gsv-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gsv-green focus:border-transparent"
                    >
                      <option value="science_equipment">Science Equipment</option>
                      <option value="presentation_materials">Presentation Materials</option>
                      <option value="activity_supplies">Activity Supplies</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gsv-gray-700 mb-1">Item Name</label>
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => updateItem(index, 'name', e.target.value)}
                      placeholder="e.g., pH testing strips"
                      className="w-full px-3 py-2 border border-gsv-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gsv-green focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gsv-gray-700 mb-1">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 border border-gsv-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gsv-green focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gsv-gray-700 mb-1">Estimated Cost ($)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.estimated_cost}
                      onChange={(e) => updateItem(index, 'estimated_cost', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gsv-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gsv-green focus:border-transparent"
                    />
                  </div>
                </div>
                <button
                  onClick={() => removeItem(index)}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Remove Item
                </button>
              </div>
            ))}

            <button
              onClick={addItem}
              className="w-full py-3 border-2 border-dashed border-gsv-gray-300 rounded-lg text-gsv-gray-600 hover:border-gsv-green hover:text-gsv-green transition-colors"
            >
              + Add Another Item
            </button>
          </div>

          {requestType === 'gsv_provided' && (
            <div className="bg-gsv-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gsv-gray-900">Total Estimated Cost:</span>
                <span className={`font-semibold ${budgetExceeded ? 'text-red-600' : 'text-gsv-gray-900'}`}>
                  ${totalCost.toFixed(2)}
                </span>
              </div>
              {budgetExceeded && (
                <p className="text-red-600 text-sm mt-2">
                  Budget exceeds the ${settings.max_budget_per_group} limit. Consider reducing quantities or choosing volunteer-funded option.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Step 3: Delivery & Timeline */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-medium text-gsv-gray-900 mb-4">Delivery & Timeline</h2>
            <p className="text-sm text-gsv-gray-600">When and where do you need these materials?</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gsv-gray-700 mb-2">Delivery Preference</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="delivery"
                    value="school_address"
                    checked={deliveryPreference === 'school_address'}
                    onChange={(e) => setDeliveryPreference(e.target.value as any)}
                    className="mr-2"
                  />
                  <span className="text-sm">Deliver to school address (recommended for presentations)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="delivery"
                    value="volunteer_address"
                    checked={deliveryPreference === 'volunteer_address'}
                    onChange={(e) => setDeliveryPreference(e.target.value as any)}
                    className="mr-2"
                  />
                  <span className="text-sm">Deliver to my address</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gsv-gray-700 mb-2">Needed By Date</label>
              <input
                type="date"
                value={neededByDate}
                onChange={(e) => setNeededByDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gsv-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gsv-green focus:border-transparent"
              />
              <p className="text-xs text-gsv-gray-500 mt-1">We recommend requesting materials at least 1 week before your presentation</p>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Budget Justification */}
      {currentStep === 4 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-medium text-gsv-gray-900 mb-4">Budget Justification</h2>
            <p className="text-sm text-gsv-gray-600">Explain why these materials are necessary for your presentation</p>
          </div>

          <div>
            <textarea
              value={budgetJustification}
              onChange={(e) => setBudgetJustification(e.target.value)}
              placeholder="Describe how these materials will enhance your environmental STEM presentation..."
              rows={6}
              className="w-full px-3 py-2 border border-gsv-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gsv-green focus:border-transparent resize-none"
            />
            <p className="text-xs text-gsv-gray-500 mt-1">
              {budgetJustification.length}/500 characters (minimum 50 required)
            </p>
          </div>
        </div>
      )}

      {/* Step 5: Review & Submit */}
      {currentStep === 5 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-medium text-gsv-gray-900 mb-4">Review Your Request</h2>
            <p className="text-sm text-gsv-gray-600">Please review all details before submitting</p>
          </div>

          <div className="space-y-4">
            <div className="bg-gsv-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gsv-gray-900 mb-3">Request Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gsv-gray-600">Procurement Method:</span>
                  <span className="font-medium">
                    {requestType === 'gsv_provided' ? 'GSV Provided' :
                     requestType === 'volunteer_funded' ? 'Volunteer Funded' : 'Kit Recommendations'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gsv-gray-600">Total Items:</span>
                  <span className="font-medium">{items.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gsv-gray-600">Estimated Cost:</span>
                  <span className="font-medium">${totalCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gsv-gray-600">Delivery:</span>
                  <span className="font-medium">
                    {deliveryPreference === 'school_address' ? 'School Address' : 'Volunteer Address'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gsv-gray-600">Needed By:</span>
                  <span className="font-medium">{new Date(neededByDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-gsv-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gsv-gray-900 mb-3">Materials List</h3>
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gsv-gray-600">
                      {item.quantity}x {item.name} ({item.category.replace('_', ' ')})
                    </span>
                    <span className="font-medium">${(item.estimated_cost * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {budgetJustification && (
              <div className="bg-gsv-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gsv-gray-900 mb-2">Budget Justification</h3>
                <p className="text-sm text-gsv-gray-600">{budgetJustification}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <button
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
          className="flex items-center gap-2 px-4 py-2 text-gsv-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {currentStep < totalSections ? (
          <button
            onClick={() => setCurrentStep(Math.min(totalSections, currentStep + 1))}
            disabled={
              (currentStep === 2 && items.length === 0) ||
              (currentStep === 3 && !neededByDate) ||
              (currentStep === 4 && budgetJustification.length < 50)
            }
            className="flex items-center gap-2 px-6 py-2 bg-gsv-green text-white rounded-lg hover:bg-gsv-greenDark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Continue
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting || budgetExceeded}
            className="flex items-center gap-2 px-6 py-2 bg-gsv-green text-white rounded-lg hover:bg-gsv-greenDark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? 'Submitting...' : 'Submit Request'}
            <FileText className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
