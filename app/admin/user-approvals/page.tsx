"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { approvalNotificationService } from "@/lib/notifications/approvalNotifications";
import {
  CheckCircle,
  XCircle,
  Clock,
  User,
  Mail,
  Calendar,
  Search,
  Filter,
  MoreVertical,
  Eye,
  AlertTriangle,
  Loader2
} from "lucide-react";

interface PendingUser {
  id: string;
  name: string;
  email: string;
  role: string;
  subrole?: string;
  created_at: string;
  user_category: string;
  department?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  school_affiliation?: string;
  notes?: string;
}

export default function UserApprovalsPage() {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingUser, setProcessingUser] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "intern" | "volunteer">("all");
  const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null);

  const supabase = createClientComponentClient();

  useEffect(() => {
    loadPendingUsers();
  }, []);

  async function loadPendingUsers() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("status", "pending_approval")
        .eq("needs_approval", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPendingUsers(data || []);
    } catch (error) {
      console.error("Error loading pending users:", error);
    } finally {
      setLoading(false);
    }
  }

  async function approveUser(userId: string, userRole: string) {
    try {
      setProcessingUser(userId);
      const now = new Date().toISOString();

      // Get current user for audit trail
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("users")
        .update({
          status: "active",
          needs_approval: false,
          approved_by: session.user.id,
          approved_at: now
        })
        .eq("id", userId);

      if (error) throw error;

      // Send approval notification
      await approvalNotificationService.sendApprovalNotification({
        userId,
        userName: user.name,
        userEmail: user.email,
        userRole: userRole,
        status: "approved",
        approvedBy: session.user.id
      });

      // Update local state
      setPendingUsers(prev => prev.filter(user => user.id !== userId));

      alert("User approved successfully!");
    } catch (error: any) {
      console.error("Error approving user:", error);
      alert("Failed to approve user: " + error.message);
    } finally {
      setProcessingUser(null);
    }
  }

  async function rejectUser(userId: string, rejectionReason: string) {
    try {
      setProcessingUser(userId);
      const now = new Date().toISOString();

      // Get current user for audit trail
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("users")
        .update({
          status: "inactive",
          needs_approval: false,
          approved_by: session.user.id,
          approved_at: now,
          rejection_reason: rejectionReason
        })
        .eq("id", userId);

      if (error) throw error;

      // Send rejection notification
      await approvalNotificationService.sendApprovalNotification({
        userId,
        userName: user.name,
        userEmail: user.email,
        userRole: userRole,
        status: "rejected",
        rejectionReason,
        approvedBy: session.user.id
      });

      // Update local state
      setPendingUsers(prev => prev.filter(user => user.id !== userId));

      alert("User rejected. They will be notified via email.");
    } catch (error: any) {
      console.error("Error rejecting user:", error);
      alert("Failed to reject user: " + error.message);
    } finally {
      setProcessingUser(null);
    }
  }


  const filteredUsers = pendingUsers.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Approvals</h1>
            <p className="text-gray-600 mt-2">Review and approve pending user applications</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
              <Clock className="w-4 h-4 mr-1" />
              {pendingUsers.length} Pending
            </span>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Roles</option>
              <option value="intern">Interns</option>
              <option value="volunteer">Volunteers</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users List */}
      {filteredUsers.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No pending approvals</h3>
          <p className="text-gray-600">
            {pendingUsers.length === 0
              ? "All user applications have been processed."
              : "No users match your current filters."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredUsers.map((user) => (
            <UserApprovalCard
              key={user.id}
              user={user}
              onApprove={() => approveUser(user.id, user.role)}
              onReject={(reason) => rejectUser(user.id, reason)}
              onViewDetails={() => setSelectedUser(user)}
              isProcessing={processingUser === user.id}
            />
          ))}
        </div>
      )}

      {/* User Details Modal */}
      {selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
}

function UserApprovalCard({
  user,
  onApprove,
  onReject,
  onViewDetails,
  isProcessing
}: {
  user: PendingUser;
  onApprove: () => void;
  onReject: (reason: string) => void;
  onViewDetails: () => void;
  isProcessing: boolean;
}) {
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      alert("Please provide a reason for rejection.");
      return;
    }
    onReject(rejectionReason);
    setShowRejectForm(false);
    setRejectionReason("");
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
              <p className="text-gray-600">{user.email}</p>
              <div className="flex items-center gap-4 mt-1">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                  {user.role}
                </span>
                <span className="text-xs text-gray-500">
                  Applied {new Date(user.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onViewDetails}
              className="px-3 py-2 text-gray-700 hover:text-gray-900 text-sm font-medium"
            >
              <Eye className="w-4 h-4 inline mr-1" />
              View Details
            </button>

            {!showRejectForm ? (
              <>
                <button
                  onClick={() => setShowRejectForm(true)}
                  disabled={isProcessing}
                  className="px-3 py-2 text-red-600 hover:text-red-900 text-sm font-medium border border-red-200 rounded hover:bg-red-50 disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4 inline mr-1" />
                  Reject
                </button>

                <button
                  onClick={onApprove}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 disabled:opacity-50 flex items-center"
                >
                  {isProcessing ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-1" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-1" />
                  )}
                  Approve
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Reason for rejection..."
                  className="px-3 py-2 border border-gray-300 rounded text-sm w-64"
                  rows={2}
                />
                <button
                  onClick={() => setShowRejectForm(false)}
                  className="px-3 py-2 text-gray-600 hover:text-gray-800 text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={isProcessing}
                  className="px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
                >
                  Confirm Reject
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {user.department && (
              <div>
                <span className="text-gray-500">Department:</span>
                <p className="font-medium">{user.department}</p>
              </div>
            )}
            {user.school_affiliation && (
              <div>
                <span className="text-gray-500">School:</span>
                <p className="font-medium">{user.school_affiliation}</p>
              </div>
            )}
            {user.city && (
              <div>
                <span className="text-gray-500">Location:</span>
                <p className="font-medium">{user.city}, {user.state}</p>
              </div>
            )}
            {user.phone && (
              <div>
                <span className="text-gray-500">Phone:</span>
                <p className="font-medium">{user.phone}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function UserDetailsModal({ user, onClose }: { user: PendingUser; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">User Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <p className="text-gray-900">{user.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <p className="text-gray-900">{user.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <p className="text-gray-900 capitalize">{user.role}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Applied Date</label>
                <p className="text-gray-900">{new Date(user.created_at).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Contact Info */}
            {(user.phone || user.address) && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {user.phone && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <p className="text-gray-900">{user.phone}</p>
                    </div>
                  )}
                  {user.address && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <p className="text-gray-900">
                        {user.address}
                        {user.city && `, ${user.city}`}
                        {user.state && `, ${user.state}`}
                        {user.zip && ` ${user.zip}`}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Additional Info */}
            {(user.school_affiliation || user.department || user.notes) && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Additional Information</h3>
                <div className="space-y-4">
                  {user.school_affiliation && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">School Affiliation</label>
                      <p className="text-gray-900">{user.school_affiliation}</p>
                    </div>
                  )}
                  {user.department && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                      <p className="text-gray-900">{user.department}</p>
                    </div>
                  )}
                  {user.notes && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                      <p className="text-gray-900 whitespace-pre-wrap">{user.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
