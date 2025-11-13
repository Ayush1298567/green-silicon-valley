"use client";

import { useState, useEffect } from "react";
import { Clock, Check, X, MessageSquare, User, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface PendingHours {
  id: number;
  volunteer_id: number;
  presentation_id: number | null;
  hours_logged: number;
  feedback: string | null;
  date: string | null;
  created_at: string;
  volunteer: {
    team_name: string | null;
    id: number;
  };
  presentation: {
    topic: string | null;
    scheduled_date: string | null;
    school_id: number | null;
  } | null;
}

export default function PendingHoursPage() {
  const [hours, setHours] = useState<PendingHours[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [approving, setApproving] = useState<number | null>(null);

  useEffect(() => {
    loadPendingHours();
  }, []);

  const loadPendingHours = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/volunteer-hours/pending");
      const data = await res.json();
      
      if (data.ok) {
        setHours(data.hours || []);
      }
    } catch (error) {
      console.error("Error loading pending hours:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number, adjustedHours?: number) => {
    try {
      setApproving(id);
      const res = await fetch("/api/volunteer-hours/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hours_id: id,
          approved: true,
          adjusted_hours: adjustedHours
        })
      });

      const data = await res.json();
      if (data.ok) {
        loadPendingHours();
        setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
      } else {
        alert(data.error || "Failed to approve hours");
      }
    } catch (error) {
      console.error("Error approving hours:", error);
      alert("Failed to approve hours");
    } finally {
      setApproving(null);
    }
  };

  const handleReject = async (id: number, reason: string) => {
    if (!reason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }

    try {
      setApproving(id);
      const res = await fetch("/api/volunteer-hours/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hours_id: id,
          approved: false,
          rejection_reason: reason
        })
      });

      const data = await res.json();
      if (data.ok) {
        loadPendingHours();
        setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
      } else {
        alert(data.error || "Failed to reject hours");
      }
    } catch (error) {
      console.error("Error rejecting hours:", error);
      alert("Failed to reject hours");
    } finally {
      setApproving(null);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) return;
    
    if (!confirm(`Approve ${selectedIds.length} hour submission${selectedIds.length !== 1 ? "s" : ""}?`)) {
      return;
    }

    try {
      for (const id of selectedIds) {
        await handleApprove(id);
      }
      setSelectedIds([]);
    } catch (error) {
      console.error("Error bulk approving:", error);
      alert("Failed to approve some hours");
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === hours.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(hours.map(h => h.id));
    }
  };

  if (loading) {
    return (
      <div className="container py-14">
        <div className="text-center py-12 text-gsv-gray">Loading pending hours...</div>
      </div>
    );
  }

  return (
    <div className="container py-14">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gsv-charcoal mb-2">Pending Hours Approval</h1>
        <p className="text-gsv-gray">
          Review and approve volunteer hours submissions
        </p>
      </div>

      {selectedIds.length > 0 && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
          <span className="text-blue-800 font-medium">
            {selectedIds.length} selected
          </span>
          <button
            onClick={handleBulkApprove}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Approve Selected
          </button>
        </div>
      )}

      {hours.length === 0 ? (
        <div className="card p-12 text-center">
          <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gsv-gray text-lg">No pending hours</p>
          <p className="text-gsv-gray text-sm mt-2">All hours have been reviewed.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {hours.map((hour) => (
            <div
              key={hour.id}
              className="card p-6 border-l-4 border-yellow-400"
            >
              <div className="flex items-start gap-4">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(hour.id)}
                  onChange={() => toggleSelect(hour.id)}
                  className="mt-1 w-4 h-4"
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-gsv-gray" />
                        <span className="font-semibold text-gsv-charcoal">
                          {hour.volunteer?.team_name || `Team #${hour.volunteer_id}`}
                        </span>
                      </div>
                      {hour.presentation && (
                        <div className="flex items-center gap-2 text-sm text-gsv-gray mb-1">
                          <Calendar className="w-4 h-4" />
                          <span>{hour.presentation.topic || "Presentation"}</span>
                          {hour.presentation.scheduled_date && (
                            <span>• {new Date(hour.presentation.scheduled_date).toLocaleDateString()}</span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gsv-green">
                        {hour.hours_logged}
                      </div>
                      <div className="text-xs text-gsv-gray">hours</div>
                    </div>
                  </div>

                  {hour.feedback && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="w-4 h-4 text-gsv-gray" />
                        <span className="text-sm font-medium text-gsv-charcoal">Feedback</span>
                      </div>
                      <p className="text-sm text-gsv-gray whitespace-pre-wrap">{hour.feedback}</p>
                    </div>
                  )}

                  <div className="text-xs text-gsv-gray mb-4">
                    Submitted {formatDistanceToNow(new Date(hour.created_at), { addSuffix: true })}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(hour.id)}
                      disabled={approving === hour.id}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" />
                      {approving === hour.id ? "Approving..." : "Approve"}
                    </button>
                    <button
                      onClick={() => {
                        const reason = prompt("Rejection reason:");
                        if (reason) {
                          handleReject(hour.id, reason);
                        }
                      }}
                      disabled={approving === hour.id}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2 disabled:opacity-50"
                    >
                      <X className="w-4 h-4" />
                      Reject
                    </button>
                    <button
                      onClick={() => {
                        const adjusted = prompt("Adjusted hours (leave empty to keep original):");
                        if (adjusted !== null) {
                          const adjustedHours = adjusted.trim() ? parseFloat(adjusted) : undefined;
                          handleApprove(hour.id, adjustedHours);
                        }
                      }}
                      disabled={approving === hour.id}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                    >
                      Approve with Changes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {hours.length > 0 && (
        <div className="mt-6 flex items-center gap-2">
          <input
            type="checkbox"
            checked={selectedIds.length === hours.length && hours.length > 0}
            onChange={toggleSelectAll}
            className="w-4 h-4"
          />
          <span className="text-sm text-gsv-gray">Select all</span>
        </div>
      )}
    </div>
  );
}

