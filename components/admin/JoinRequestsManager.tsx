"use client";
import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Clock, User, Mail, Phone, MapPin, Calendar } from "lucide-react";
import { toast } from "sonner";

interface JoinRequest {
  id: string;
  status: string;
  submittedAt: string;
  adminReviewedAt?: string;
  teamRespondedAt?: string;
  teamResponse?: string;
  volunteer: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    school?: string;
  };
  team: {
    id: string;
    name: string;
    location?: string;
    meetingSchedule?: string;
  };
}

export default function JoinRequestsManager() {
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<JoinRequest | null>(null);

  useEffect(() => {
    loadRequests();
  }, [selectedStatus]);

  const loadRequests = async () => {
    try {
      const url = selectedStatus === 'all'
        ? '/api/admin/join-requests'
        : `/api/admin/join-requests?status=${selectedStatus}`;

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setRequests(data.requests || []);
      }
    } catch (error) {
      console.error('Error loading join requests:', error);
      toast.error('Failed to load join requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (requestId: string, action: 'approve' | 'reject' | 'accept' | 'decline', teamResponse?: string) => {
    try {
      const response = await fetch(`/api/admin/join-requests/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, teamResponse }),
      });

      if (response.ok) {
        toast.success(`Request ${action}d successfully`);
        loadRequests();
        setSelectedRequest(null);
      } else {
        toast.error(`Failed to ${action} request`);
      }
    } catch (error) {
      console.error(`Error ${action}ing request:`, error);
      toast.error(`Failed to ${action} request`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'admin_approved':
        return 'bg-blue-100 text-blue-800';
      case 'admin_rejected':
        return 'bg-red-100 text-red-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'declined':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending Review';
      case 'admin_approved':
        return 'Approved - Team Review';
      case 'admin_rejected':
        return 'Rejected';
      case 'accepted':
        return 'Accepted';
      case 'declined':
        return 'Declined';
      default:
        return status;
    }
  };

  const statusOptions = [
    { value: 'all', label: 'All Requests' },
    { value: 'pending', label: 'Pending Review' },
    { value: 'admin_approved', label: 'Approved - Team Review' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'declined', label: 'Declined' },
    { value: 'admin_rejected', label: 'Rejected' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gsv-green"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Team Join Requests</h2>
          <p className="text-gray-600">Review and manage volunteer team join requests</p>
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex flex-wrap gap-3">
        {statusOptions.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setSelectedStatus(value)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedStatus === value
                ? 'bg-gsv-green text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {requests.length === 0 ? (
          <div className="text-center py-12">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No requests found</h3>
            <p className="text-gray-600">Try selecting a different status filter</p>
          </div>
        ) : (
          requests.map((request) => (
            <div
              key={request.id}
              className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">
                      {request.volunteer.name}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                      {getStatusText(request.status)}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <span>{request.volunteer.email}</span>
                      </div>
                      {request.volunteer.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          <span>{request.volunteer.phone}</span>
                        </div>
                      )}
                      {request.volunteer.school && (
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>{request.volunteer.school}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div>
                        <span className="font-medium text-gray-900">Team:</span> {request.team.name}
                      </div>
                      {request.team.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{request.team.location}</span>
                        </div>
                      )}
                      {request.team.meetingSchedule && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{request.team.meetingSchedule}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-sm text-gray-500">
                    Submitted {new Date(request.submittedAt).toLocaleDateString()}
                    {request.adminReviewedAt && (
                      <span className="ml-4">
                        Reviewed {new Date(request.adminReviewedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 ml-4">
                  {request.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleAction(request.id, 'approve')}
                        className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleAction(request.id, 'reject')}
                        className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-1"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </>
                  )}

                  {request.status === 'admin_approved' && (
                    <>
                      <button
                        onClick={() => setSelectedRequest(request)}
                        className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Team Response
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Team Response Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Team Response for {selectedRequest.volunteer.name}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Response Message (Optional)
                  </label>
                  <textarea
                    id="teamResponse"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gsv-green focus:border-transparent"
                    placeholder="Add a message from the team..."
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      const message = (document.getElementById('teamResponse') as HTMLTextAreaElement)?.value;
                      handleAction(selectedRequest.id, 'accept', message);
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex-1"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => {
                      const message = (document.getElementById('teamResponse') as HTMLTextAreaElement)?.value;
                      handleAction(selectedRequest.id, 'decline', message);
                    }}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex-1"
                  >
                    Decline
                  </button>
                </div>

                <button
                  onClick={() => setSelectedRequest(null)}
                  className="w-full border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
