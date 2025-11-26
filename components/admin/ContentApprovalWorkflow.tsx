"use client";

import { useState, useEffect } from "react";
import { CheckCircle, Clock, XCircle, AlertTriangle, User, MessageSquare, Eye } from "lucide-react";

interface ApprovalRequest {
  id: string;
  content_key: string;
  content_type: string;
  old_value: string;
  new_value: string;
  requested_by: string;
  requested_at: string;
  status: "pending" | "approved" | "rejected" | "expired";
  approved_by?: string;
  approved_at?: string;
  comments?: string;
  reviewers: string[];
}

interface ContentApprovalWorkflowProps {
  onApprovalAction?: () => void;
}

export default function ContentApprovalWorkflow({ onApprovalAction }: ContentApprovalWorkflowProps) {
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");

  useEffect(() => {
    fetchApprovalRequests();
  }, []);

  const fetchApprovalRequests = async () => {
    try {
      const res = await fetch("/api/admin/content/approvals");
      const data = await res.json();
      if (data.ok) {
        setRequests(data.requests || []);
      }
    } catch (error) {
      console.error("Error fetching approval requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprovalAction = async (requestId: string, action: "approve" | "reject", comments?: string) => {
    try {
      const res = await fetch(`/api/admin/content/approvals/${requestId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, comments }),
      });

      const data = await res.json();
      if (data.ok) {
        fetchApprovalRequests();
        onApprovalAction?.();
        setSelectedRequest(null);
      } else {
        alert("Error processing approval: " + data.error);
      }
    } catch (error: any) {
      alert("Error processing approval: " + error.message);
    }
  };

  const filteredRequests = requests.filter(request =>
    filter === "all" || request.status === filter
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
            <Clock size={12} />
            Pending
          </span>
        );
      case "approved":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
            <CheckCircle size={12} />
            Approved
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
            <XCircle size={12} />
            Rejected
          </span>
        );
      case "expired":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
            <AlertTriangle size={12} />
            Expired
          </span>
        );
      default:
        return null;
    }
  };

  const getDiffPreview = (oldValue: string, newValue: string) => {
    const maxLength = 100;
    const oldPreview = oldValue.length > maxLength ? oldValue.substring(0, maxLength) + "..." : oldValue;
    const newPreview = newValue.length > maxLength ? newValue.substring(0, maxLength) + "..." : newValue;

    return { oldPreview, newPreview };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Content Approval Workflow</h2>
          <p className="text-gray-600">Review and approve content changes</p>
        </div>

        <div className="flex gap-2">
          {["all", "pending", "approved", "rejected"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status as any)}
              className={`px-3 py-1 rounded text-sm font-medium capitalize ${
                filter === status
                  ? "bg-blue-100 text-blue-800"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {status} ({requests.filter(r => status === "all" || r.status === status).length})
            </button>
          ))}
        </div>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <CheckCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium mb-2">No approval requests</h3>
          <p>All content changes have been reviewed</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => {
            const { oldPreview, newPreview } = getDiffPreview(request.old_value, request.new_value);

            return (
              <div key={request.id} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{request.content_key}</h3>
                      {getStatusBadge(request.status)}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <span className="flex items-center gap-1">
                        <User size={14} />
                        {request.requested_by}
                      </span>
                      <span>Requested: {new Date(request.requested_at).toLocaleDateString()}</span>
                      <span className="capitalize">{request.content_type}</span>
                    </div>

                    {request.status === "pending" && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                        <div className="text-sm text-yellow-800">
                          <strong>Change Preview:</strong>
                          <div className="mt-2 grid grid-cols-2 gap-4">
                            <div>
                              <div className="text-xs text-yellow-700 mb-1">BEFORE:</div>
                              <div className="text-sm bg-red-50 p-2 rounded border-l-4 border-red-400">
                                {oldPreview}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-yellow-700 mb-1">AFTER:</div>
                              <div className="text-sm bg-green-50 p-2 rounded border-l-4 border-green-400">
                                {newPreview}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    {request.approved_by && (
                      <span>Approved by: {request.approved_by}</span>
                    )}
                    {request.comments && (
                      <span className="flex items-center gap-1">
                        <MessageSquare size={14} />
                        Has comments
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedRequest(request)}
                      className="px-3 py-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded text-sm"
                    >
                      <Eye size={14} className="inline mr-1" />
                      View Details
                    </button>

                    {request.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleApprovalAction(request.id, "approve")}
                          className="px-3 py-1 bg-green-600 text-white hover:bg-green-700 rounded text-sm"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleApprovalAction(request.id, "reject")}
                          className="px-3 py-1 bg-red-600 text-white hover:bg-red-700 rounded text-sm"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold">Approval Request Details</h2>
              <button
                onClick={() => setSelectedRequest(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Request Information</h3>
                  <dl className="space-y-2 text-sm">
                    <div>
                      <dt className="text-gray-600">Content Key:</dt>
                      <dd className="font-mono bg-gray-100 p-1 rounded">{selectedRequest.content_key}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-600">Type:</dt>
                      <dd className="capitalize">{selectedRequest.content_type}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-600">Requested By:</dt>
                      <dd>{selectedRequest.requested_by}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-600">Requested At:</dt>
                      <dd>{new Date(selectedRequest.requested_at).toLocaleString()}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-600">Status:</dt>
                      <dd>{getStatusBadge(selectedRequest.status)}</dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Reviewers</h3>
                  <div className="space-y-2">
                    {selectedRequest.reviewers.map((reviewer, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <User size={14} className="text-gray-400" />
                        {reviewer}
                      </div>
                    ))}
                  </div>

                  {selectedRequest.comments && (
                    <>
                      <h3 className="font-medium text-gray-900 mb-2 mt-4">Comments</h3>
                      <div className="bg-gray-50 p-3 rounded text-sm">
                        {selectedRequest.comments}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-3">Content Changes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-red-700 mb-2">Current Content</h4>
                    <div className="bg-red-50 border border-red-200 rounded p-3 text-sm whitespace-pre-wrap">
                      {selectedRequest.old_value}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-green-700 mb-2">Proposed Changes</h4>
                    <div className="bg-green-50 border border-green-200 rounded p-3 text-sm whitespace-pre-wrap">
                      {selectedRequest.new_value}
                    </div>
                  </div>
                </div>
              </div>

              {selectedRequest.status === "pending" && (
                <div className="flex gap-3 pt-4 border-t">
                  <button
                    onClick={() => handleApprovalAction(selectedRequest.id, "approve")}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Approve Changes
                  </button>
                  <button
                    onClick={() => handleApprovalAction(selectedRequest.id, "reject")}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Reject Changes
                  </button>
                  <button
                    onClick={() => setSelectedRequest(null)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
