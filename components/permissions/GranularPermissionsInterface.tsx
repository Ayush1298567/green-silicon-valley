"use client";
import { useState } from "react";
import { Shield, Search, User, Settings } from "lucide-react";
import { type UserRow } from "@/types/db";
import UserPermissionsModal from "./UserPermissionsModal";

interface GranularPermissionsInterfaceProps {
  users: UserRow[];
}

// Define all available permissions/features
const AVAILABLE_PERMISSIONS = {
  "dashboard": {
    label: "Dashboards",
    permissions: [
      { key: "view_founder_dashboard", label: "View Founder Dashboard" },
      { key: "view_analytics", label: "View Analytics & Reports" },
    ]
  },
  "users": {
    label: "User Management",
    permissions: [
      { key: "manage_users", label: "Create/Edit/Delete Users" },
      { key: "view_users", label: "View User List" },
      { key: "assign_roles", label: "Assign User Roles" },
    ]
  },
  "presentations": {
    label: "Presentations",
    permissions: [
      { key: "manage_presentations", label: "Create/Edit/Delete Presentations" },
      { key: "view_presentations", label: "View Presentations" },
      { key: "assign_volunteers", label: "Assign Volunteers to Presentations" },
    ]
  },
  "volunteers": {
    label: "Volunteer Management",
    permissions: [
      { key: "manage_volunteers", label: "Manage Volunteer Profiles" },
      { key: "view_volunteer_hours", label: "View Volunteer Hours" },
      { key: "approve_hours", label: "Approve Logged Hours" },
    ]
  },
  "schools": {
    label: "School Management",
    permissions: [
      { key: "manage_schools", label: "Create/Edit/Delete Schools" },
      { key: "view_schools", label: "View School List" },
    ]
  },
  "content": {
    label: "Content Management",
    permissions: [
      { key: "edit_website", label: "Edit Website Content (Page Builder)" },
      { key: "manage_blog", label: "Create/Edit Blog Posts" },
      { key: "manage_bulletin", label: "Create/Edit Bulletin Posts" },
      { key: "manage_resources", label: "Upload/Manage Resources" },
    ]
  },
  "communications": {
    label: "Communications",
    permissions: [
      { key: "send_emails", label: "Send Emails to Users" },
      { key: "manage_email_templates", label: "Create/Edit Email Templates" },
      { key: "view_messages", label: "View Internal Messages" },
    ]
  },
  "workflows": {
    label: "Workflows & Automation",
    permissions: [
      { key: "manage_workflows", label: "Create/Edit/Delete Workflows" },
      { key: "view_workflows", label: "View Workflows" },
    ]
  },
  "documents": {
    label: "Documents & Resources",
    permissions: [
      { key: "manage_documents", label: "Upload/Delete Documents" },
      { key: "view_documents", label: "View All Documents" },
      { key: "assign_document_access", label: "Grant Document Access to Others" },
    ]
  },
  "tasks": {
    label: "Task Management",
    permissions: [
      { key: "create_tasks", label: "Create Tasks for Others" },
      { key: "view_all_tasks", label: "View All Tasks" },
    ]
  },
};

export default function GranularPermissionsInterface({ users }: GranularPermissionsInterfaceProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleManagePermissions = (user: UserRow) => {
    setSelectedUser(user);
    setShowPermissionsModal(true);
  };

  const getPermissionCount = (user: UserRow) => {
    if (!user.permissions || typeof user.permissions !== 'object') return 0;
    return Object.keys(user.permissions).length;
  };

  return (
    <div className="space-y-6">
      {/* Info Card */}
      <div className="card p-6 bg-blue-50 border-2 border-blue-200">
        <div className="flex items-start gap-4">
          <Shield className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">How Permissions Work</h3>
            <p className="text-sm text-blue-800 mb-2">
              Grant specific access to interns and volunteers so they can help manage different parts of the platform.
              Only give access to features they need for their role.
            </p>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Interns</strong> typically need broader access to their department’s tools</li>
              <li>• <strong>Volunteers</strong> usually only need access to view presentations and log hours</li>
              <li>• You can revoke access at any time</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="card p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gsv-gray w-5 h-5" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green"
          />
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => {
          const permissionCount = getPermissionCount(user);
          return (
            <div key={user.id} className="card p-6 hover:shadow-lg transition">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gsv-green text-white rounded-full flex items-center justify-center font-bold">
                    {user.name?.charAt(0) || "?"}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gsv-charcoal">{user.name}</h3>
                    <p className="text-sm text-gsv-gray">{user.role}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  user.role === "intern" ? "bg-purple-100 text-purple-800" : "bg-green-100 text-green-800"
                }`}>
                  {user.role}
                </span>
              </div>

              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gsv-gray mb-1">Current Access</div>
                <div className="text-2xl font-bold text-gsv-charcoal">
                  {permissionCount} {permissionCount === 1 ? "Permission" : "Permissions"}
                </div>
              </div>

              <button
                onClick={() => handleManagePermissions(user)}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-gsv-green text-white rounded-lg hover:bg-gsv-green/90 transition"
              >
                <Settings className="w-4 h-4" />
                Manage Permissions
              </button>
            </div>
          );
        })}
      </div>

      {filteredUsers.length === 0 && (
        <div className="card p-12 text-center">
          <User className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gsv-gray">No users found</p>
        </div>
      )}

      {/* Permissions Modal */}
      {showPermissionsModal && selectedUser && (
        <UserPermissionsModal
          user={selectedUser}
          availablePermissions={AVAILABLE_PERMISSIONS}
          onClose={() => setShowPermissionsModal(false)}
          onSave={() => {
            setShowPermissionsModal(false);
            // Refresh would happen here
          }}
        />
      )}
    </div>
  );
}

