"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Clock, Package, DollarSign, User, Calendar, MapPin, FileText, AlertCircle } from "lucide-react";

interface MaterialRequest {
  id: string;
  group_id: string;
  presentation_id: string;
  request_type: 'gsv_provided' | 'volunteer_funded' | 'kit_recommendation';
  estimated_cost: number;
  budget_justification?: string;
  items: any[];
  delivery_preference: 'school_address' | 'volunteer_address';
  needed_by_date: string;
  status: 'draft' | 'submitted' | 'approved' | 'purchased' | 'shipped' | 'delivered' | 'cancelled';
  approved_by?: string;
  approved_at?: string;
  purchased_at?: string;
  shipped_at?: string;
  delivered_at?: string;
  tracking_number?: string;
  purchase_notes?: string;
  delivery_notes?: string;
  cancellation_reason?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  presentation?: {
    title: string;
    scheduled_date: string;
  };
  group?: {
    team_name: string;
  };
  created_by_user?: {
    name: string;
    email: string;
  };
  approved_by_user?: {
    name: string;
    email: string;
  };
}

export default function MaterialRequestsManager() {
  const [requests, setRequests] = useState<MaterialRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [processingRequest, setProcessingRequest] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load material requests
  useEffect(() => {
    const loadRequests = async () => {
      try {
        const response = await fetch('/api/materials/request');
        const data = await response.json();
        if (data.ok) {
          setRequests(data.requests || []);
        } else {
          setMessage({ type: 'error', text: 'Failed to load material requests' });
        }
      } catch (error) {
        console.error('Error loading requests:', error);
        setMessage({ type: 'error', text: 'Failed to load material requests' });
      } finally {
        setLoading(false);
      }
    };

    loadRequests();
  }, []);

  const handleApproval = async (requestId: string, action: 'approve' | 'reject', notes?: string, messageToGroup?: string) => {
    setProcessingRequest(requestId);
    setMessage(null);

    try {
      const response = await fetch('/api/materials/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          requestId,
          action,
          notes,
          messageToGroup
        })
      });

      const data = await response.json();

      if (data.ok) {
        // Update the request in the local state
        setRequests(prev => prev.map(req =>
          req.id === requestId ? data.request : req
        ));
        setMessage({
          type: 'success',
          text: `Request ${action === 'approve' ? 'approved' : 'rejected'} successfully`
        });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to process request' });
      }
    } catch (error) {
      console.error('Error processing request:', error);
      setMessage({ type: 'error', text: 'Failed to process request' });
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleMessageToGroup = async (requestId: string, message: string) => {
    try {
      const request = requests.find(r => r.id === requestId);
      if (!request) return;

      // Send notification to the volunteer who created the request
      const notificationData = {
        user_id: request.created_by,
        notification_type: "admin_message",
        title: "Message from Green Silicon Valley",
        message: `Message about your material request: ${message}`,
        action_url: "/dashboard/volunteer/materials",
        priority: "medium"
      };

      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(notificationData)
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Message sent to volunteer group successfully' });
      } else {
        setMessage({ type: 'error', text: 'Failed to send message' });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessage({ type: 'error', text: 'Failed to send message' });
    }
  };

  const filteredRequests = requests.filter(request => {
    switch (filter) {
      case 'pending': return request.status === 'submitted';
      case 'approved': return ['approved', 'purchased', 'shipped', 'delivered'].includes(request.status);
      case 'rejected': return request.status === 'cancelled';
      default: return true;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'purchased': return 'bg-purple-100 text-purple-800';
      case 'shipped': return 'bg-indigo-100 text-indigo-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRequestTypeIcon = (type: string) => {
    switch (type) {
      case 'gsv_provided': return '🏢';
      case 'volunteer_funded': return '💰';
      case 'kit_recommendation': return '📦';
      default: return '📋';
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
    <div className="space-y-6">
      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success'
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-1 p-1 bg-gsv-gray-100 rounded-lg w-fit">
        {[
          { key: 'all', label: 'All Requests', count: requests.length },
          { key: 'pending', label: 'Pending', count: requests.filter(r => r.status === 'submitted').length },
          { key: 'approved', label: 'Approved', count: requests.filter(r => ['approved', 'purchased', 'shipped', 'delivered'].includes(r.status)).length },
          { key: 'rejected', label: 'Rejected', count: requests.filter(r => r.status === 'cancelled').length }
        ].map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setFilter(key as any)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              filter === key
                ? 'bg-white text-gsv-gray-900 shadow-sm'
                : 'text-gsv-gray-600 hover:text-gsv-gray-900'
            }`}
          >
            {label} ({count})
          </button>
        ))}
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12 bg-gsv-gray-50 border border-gsv-gray-200 rounded-xl">
            <Package className="w-12 h-12 text-gsv-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gsv-gray-900 mb-2">
              {filter === 'all' ? 'No Material Requests' : `No ${filter} Requests`}
            </h3>
            <p className="text-gsv-gray-600">
              {filter === 'all'
                ? 'Material requests from volunteer teams will appear here.'
                : `No requests match the ${filter} filter.`
              }
            </p>
          </div>
        ) : (
          filteredRequests.map((request) => (
            <div key={request.id} className="bg-white border border-gsv-gray-200 rounded-xl p-6 hover:shadow-soft transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="text-2xl">{getRequestTypeIcon(request.request_type)}</div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-medium text-gsv-gray-900">
                        {request.group?.team_name || 'Unknown Team'}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                        {request.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gsv-gray-600">
                      {request.presentation?.title || 'Unknown Presentation'}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-lg font-semibold text-gsv-gray-900">
                    ${request.estimated_cost.toFixed(2)}
                  </div>
                  <div className="text-sm text-gsv-gray-600 capitalize">
                    {request.request_type.replace('_', ' ')}
                  </div>
                </div>
              </div>

              {/* Request Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm text-gsv-gray-600">
                  <User className="w-4 h-4" />
                  <span>{request.created_by_user?.name || 'Unknown'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gsv-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Needed by {new Date(request.needed_by_date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gsv-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span className="capitalize">{request.delivery_preference.replace('_', ' ')}</span>
                </div>
              </div>

              {/* Items List */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gsv-gray-900 mb-2">Requested Items:</h4>
                <div className="space-y-1">
                  {request.items?.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between text-sm text-gsv-gray-600 bg-gsv-gray-50 px-3 py-2 rounded">
                      <span>
                        {item.quantity}x {item.name} ({item.category.replace('_', ' ')})
                      </span>
                      <span>${(item.estimated_cost * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Budget Justification */}
              {request.budget_justification && (
                <div className="mb-4 p-3 bg-gsv-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-gsv-gray-600" />
                    <span className="text-sm font-medium text-gsv-gray-900">Budget Justification</span>
                  </div>
                  <p className="text-sm text-gsv-gray-600">{request.budget_justification}</p>
                </div>
              )}

              {/* Status-specific information */}
              {request.status === 'approved' && request.approved_by_user && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-800">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Approved by {request.approved_by_user.name} on {new Date(request.approved_at!).toLocaleDateString()}
                    </span>
                  </div>
                  {request.purchase_notes && (
                    <p className="text-sm text-blue-700 mt-1">{request.purchase_notes}</p>
                  )}
                </div>
              )}

              {request.status === 'cancelled' && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-800">
                    <XCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Request Rejected</span>
                  </div>
                  {request.cancellation_reason && (
                    <p className="text-sm text-red-700 mt-1">{request.cancellation_reason}</p>
                  )}
                </div>
              )}

              {/* Action Buttons - Only show for submitted requests */}
              {request.status === 'submitted' && (
                <div className="pt-4 border-t border-gsv-gray-200 space-y-4">
                  {/* Approval Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApproval(request.id, 'approve')}
                      disabled={processingRequest === request.id}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gsv-green text-white rounded-lg hover:bg-gsv-greenDark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {processingRequest === request.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      Approve Request
                    </button>
                    <button
                      onClick={() => {
                        const reason = prompt('Reason for rejection:');
                        if (reason) {
                          const message = prompt('Message to volunteer group (optional):');
                          handleApproval(request.id, 'reject', reason, message || undefined);
                        }
                      }}
                      disabled={processingRequest === request.id}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject Request
                    </button>
                  </div>

                  {/* Quick Message Option */}
                  <div className="text-center">
                    <button
                      onClick={() => {
                        const message = prompt('Send a message to this volunteer group:');
                        if (message) {
                          // Send message without changing request status
                          handleMessageToGroup(request.id, message);
                        }
                      }}
                      className="text-sm text-gsv-green hover:text-gsv-greenDark underline"
                    >
                      Send Message to Group
                    </button>
                  </div>
                </div>
              )}

              {/* Processing indicator */}
              {processingRequest === request.id && (
                <div className="flex items-center justify-center gap-2 py-4 text-gsv-gray-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gsv-green"></div>
                  Processing request...
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Summary Stats */}
      <div className="bg-gsv-gray-50 border border-gsv-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-medium text-gsv-gray-900 mb-4">Request Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gsv-gray-900">{requests.filter(r => r.status === 'submitted').length}</div>
            <div className="text-sm text-gsv-gray-600">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gsv-gray-900">{requests.filter(r => ['approved', 'purchased', 'shipped', 'delivered'].includes(r.status)).length}</div>
            <div className="text-sm text-gsv-gray-600">Approved</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gsv-gray-900">${requests.filter(r => r.status === 'approved').reduce((sum, r) => sum + r.estimated_cost, 0).toFixed(2)}</div>
            <div className="text-sm text-gsv-gray-600">Approved Budget</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gsv-gray-900">{requests.filter(r => r.status === 'cancelled').length}</div>
            <div className="text-sm text-gsv-gray-600">Rejected</div>
          </div>
        </div>
      </div>
    </div>
  );
}
