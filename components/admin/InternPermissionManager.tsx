"use client";

import { useState, useEffect } from "react";
import { Save, User, Shield, Eye, EyeOff, Users, Settings, FileText, Mail, Bell, Database, Globe } from "lucide-react";

interface InternPermissions {
  dashboard_access: boolean;
  analytics_view: boolean;
  reports_export: boolean;
  applications_view: boolean;
  applications_approve: boolean;
  applications_reject: boolean;
  volunteer_profiles_edit: boolean;
  teams_view_all: boolean;
  teams_assign_members: boolean;
  teams_edit_details: boolean;
  teams_progress_tracking: boolean;
  website_content_edit: boolean;
  blog_posts_create: boolean;
  announcements_create: boolean;
  resources_upload: boolean;
  procurement_settings_edit: boolean;
  material_requests_approve: boolean;
  material_requests_view: boolean;
  budget_reports_view: boolean;
  email_templates_edit: boolean;
  bulk_messaging_send: boolean;
  notifications_manage: boolean;
  user_management_create: boolean;
  user_management_edit: boolean;
  system_settings_edit: boolean;
  audit_logs_view: boolean;
  international_settings_edit: boolean;
  multi_language_content_edit: boolean;
}

interface Intern {
  id: string;
  name: string;
  email: string;
  permissions: InternPermissions;
  granted_at?: string;
  granted_by?: string;
}

const permissionCategories = [
  {
    title: "Dashboard Access",
    icon: <Eye className="w-4 h-4" />,
    permissions: [
      { key: "dashboard_access", label: "Access Dashboard", description: "Can log into and view the intern dashboard" },
      { key: "analytics_view", label: "View Analytics", description: "Can view basic analytics and reports" },
      { key: "reports_export", label: "Export Reports", description: "Can export data and generate reports" }
    ]
  },
  {
    title: "Volunteer Management",
    icon: <Users className="w-4 h-4" />,
    permissions: [
      { key: "applications_view", label: "View Applications", description: "Can view volunteer applications" },
      { key: "applications_approve", label: "Approve Applications", description: "Can approve volunteer applications" },
      { key: "applications_reject", label: "Reject Applications", description: "Can reject volunteer applications" },
      { key: "volunteer_profiles_edit", label: "Edit Profiles", description: "Can edit volunteer profile information" }
    ]
  },
  {
    title: "Team Management",
    icon: <User className="w-4 h-4" />,
    permissions: [
      { key: "teams_view_all", label: "View All Teams", description: "Can view all volunteer teams" },
      { key: "teams_assign_members", label: "Assign Members", description: "Can assign volunteers to teams" },
      { key: "teams_edit_details", label: "Edit Team Details", description: "Can modify team information" },
      { key: "teams_progress_tracking", label: "Track Progress", description: "Can update and monitor team progress" }
    ]
  },
  {
    title: "Content Management",
    icon: <FileText className="w-4 h-4" />,
    permissions: [
      { key: "website_content_edit", label: "Edit Website Content", description: "Can edit website pages and content" },
      { key: "blog_posts_create", label: "Create Blog Posts", description: "Can create and publish blog posts" },
      { key: "announcements_create", label: "Create Announcements", description: "Can create system announcements" },
      { key: "resources_upload", label: "Upload Resources", description: "Can upload training materials and resources" }
    ]
  },
  {
    title: "Procurement Management",
    icon: <Database className="w-4 h-4" />,
    permissions: [
      { key: "procurement_settings_edit", label: "Edit Procurement Settings", description: "Can modify material procurement settings" },
      { key: "material_requests_approve", label: "Approve Material Requests", description: "Can approve/reject material requests" },
      { key: "material_requests_view", label: "View Material Requests", description: "Can view all material requests" },
      { key: "budget_reports_view", label: "View Budget Reports", description: "Can view procurement budget reports" }
    ]
  },
  {
    title: "Communication",
    icon: <Mail className="w-4 h-4" />,
    permissions: [
      { key: "email_templates_edit", label: "Edit Email Templates", description: "Can modify email templates" },
      { key: "bulk_messaging_send", label: "Send Bulk Messages", description: "Can send messages to multiple users" },
      { key: "notifications_manage", label: "Manage Notifications", description: "Can create and manage system notifications" }
    ]
  },
  {
    title: "System Administration",
    icon: <Settings className="w-4 h-4" />,
    permissions: [
      { key: "user_management_create", label: "Create Users", description: "Can create new user accounts" },
      { key: "user_management_edit", label: "Edit Users", description: "Can modify user account information" },
      { key: "system_settings_edit", label: "Edit System Settings", description: "Can modify system-wide settings" },
      { key: "audit_logs_view", label: "View Audit Logs", description: "Can view system audit logs" }
    ]
  },
  {
    title: "International Features",
    icon: <Globe className="w-4 h-4" />,
    permissions: [
      { key: "international_settings_edit", label: "Edit International Settings", description: "Can modify international expansion settings" },
      { key: "multi_language_content_edit", label: "Edit Multilingual Content", description: "Can create content in multiple languages" }
    ]
  }
];

export default function InternPermissionManager() {
  const [interns, setInterns] = useState<Intern[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load interns and their permissions
  useEffect(() => {
    const loadInterns = async () => {
      try {
        const response = await fetch('/api/admin/intern-permissions');
        const data = await response.json();
        if (data.ok) {
          setInterns(data.permissions || []);
        }
      } catch (error) {
        console.error('Error loading interns:', error);
        setMessage({ type: 'error', text: 'Failed to load interns' });
      } finally {
        setLoading(false);
      }
    };

    loadInterns();
  }, []);

  const handlePermissionChange = async (internId: string, permissionKey: string, newValue: boolean) => {
    setSaving(internId);

    try {
      // Get current permissions for this intern
      const currentIntern = interns.find(i => i.id === internId);
      if (!currentIntern) return;

      const updatedPermissions = {
        ...currentIntern.permissions,
        [permissionKey]: newValue
      };

      const response = await fetch('/api/admin/intern-permissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          internId,
          permissions: updatedPermissions
        })
      });

      const data = await response.json();

      if (data.ok) {
        // Update local state
        setInterns(prev => prev.map(intern =>
          intern.id === internId
            ? { ...intern, permissions: updatedPermissions, granted_at: new Date().toISOString() }
            : intern
        ));
        setMessage({ type: 'success', text: `Permissions updated for ${currentIntern.name}` });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update permissions' });
      }
    } catch (error) {
      console.error('Error updating permissions:', error);
      setMessage({ type: 'error', text: 'Failed to update permissions' });
    } finally {
      setSaving(null);
    }
  };

  const revokeAllPermissions = async (internId: string) => {
    const intern = interns.find(i => i.id === internId);
    if (!intern) return;

    if (!confirm(`Are you sure you want to revoke all permissions for ${intern.name}?`)) {
      return;
    }

    setSaving(internId);

    try {
      const response = await fetch(`/api/admin/intern-permissions?internId=${internId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.ok) {
        // Remove from local state or reset to no permissions
        setInterns(prev => prev.map(intern =>
          intern.id === internId
            ? { ...intern, permissions: Object.fromEntries(
                Object.keys(intern.permissions).map(key => [key, false])
              ) as any }
            : intern
        ));
        setMessage({ type: 'success', text: `All permissions revoked for ${intern.name}` });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to revoke permissions' });
      }
    } catch (error) {
      console.error('Error revoking permissions:', error);
      setMessage({ type: 'error', text: 'Failed to revoke permissions' });
    } finally {
      setSaving(null);
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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gsv-gray-900">Intern Permissions</h2>
          <p className="text-sm text-gsv-gray-600 mt-1">
            Control what each intern can access and modify in the system
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gsv-gray-600">
          <Shield className="w-4 h-4" />
          Founder Access Only
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success'
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {interns.length === 0 ? (
        <div className="text-center py-12">
          <User className="w-12 h-12 text-gsv-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gsv-gray-900 mb-2">No Interns Found</h3>
          <p className="text-gsv-gray-600">
            Intern accounts will appear here once they are created in the system.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {interns.map((intern) => (
            <div key={intern.id} className="bg-white border border-gsv-gray-200 rounded-xl overflow-hidden">
              {/* Intern Header */}
              <div className="px-6 py-4 bg-gsv-gray-50 border-b border-gsv-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gsv-green rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gsv-gray-900">{intern.name}</h3>
                      <p className="text-sm text-gsv-gray-600">{intern.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {intern.granted_at && (
                      <div className="text-xs text-gsv-gray-500">
                        Last updated: {new Date(intern.granted_at).toLocaleDateString()}
                      </div>
                    )}
                    <button
                      onClick={() => revokeAllPermissions(intern.id)}
                      disabled={saving === intern.id}
                      className="px-3 py-1 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                    >
                      Revoke All
                    </button>
                  </div>
                </div>
              </div>

              {/* Permissions Grid */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {permissionCategories.map((category) => (
                    <div key={category.title} className="space-y-3">
                      <div className="flex items-center gap-2 pb-2 border-b border-gsv-gray-200">
                        <div className="text-gsv-green">{category.icon}</div>
                        <h4 className="font-medium text-gsv-gray-900 text-sm">{category.title}</h4>
                      </div>

                      <div className="space-y-2">
                        {category.permissions.map((permission) => {
                          const isEnabled = intern.permissions[permission.key as keyof InternPermissions];
                          const isSaving = saving === intern.id;

                          return (
                            <div key={permission.key} className="flex items-start gap-3">
                              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-0.5">
                                <input
                                  type="checkbox"
                                  checked={isEnabled}
                                  disabled={isSaving}
                                  onChange={(e) => handlePermissionChange(
                                    intern.id,
                                    permission.key,
                                    e.target.checked
                                  )}
                                  className="sr-only peer"
                                />
                                <div className="w-4 h-4 bg-gsv-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-gsv-green/25 rounded peer peer-checked:bg-gsv-green peer-checked:after:content-['✓'] peer-checked:after:text-white peer-checked:after:text-xs peer-checked:after:flex peer-checked:after:items-center peer-checked:after:justify-center peer-checked:after:font-bold after:absolute after:top-0 after:left-0 after:w-4 after:h-4 after:transition-all"></div>
                              </label>
                              <div className="flex-1 min-w-0">
                                <div className={`text-sm font-medium ${isEnabled ? 'text-gsv-gray-900' : 'text-gsv-gray-500'}`}>
                                  {permission.label}
                                </div>
                                <div className="text-xs text-gsv-gray-600 leading-tight">
                                  {permission.description}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Loading Overlay */}
              {saving === intern.id && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-xl">
                  <div className="flex items-center gap-2 text-gsv-gray-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gsv-green"></div>
                    Saving permissions...
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Permission Templates */}
      <div className="bg-gsv-gray-50 border border-gsv-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-medium text-gsv-gray-900 mb-4">Permission Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-white rounded-lg border border-gsv-gray-200">
            <h4 className="font-medium text-gsv-gray-900 mb-2">Operations Intern</h4>
            <p className="text-sm text-gsv-gray-600 mb-3">
              Handles day-to-day operations, volunteer management, and team coordination.
            </p>
            <div className="text-xs text-gsv-gray-500">
              Includes: Dashboard, Volunteer Management, Team Tracking, Procurement
            </div>
          </div>

          <div className="p-4 bg-white rounded-lg border border-gsv-gray-200">
            <h4 className="font-medium text-gsv-gray-900 mb-2">Communications Intern</h4>
            <p className="text-sm text-gsv-gray-600 mb-3">
              Manages content, communications, and community engagement.
            </p>
            <div className="text-xs text-gsv-gray-500">
              Includes: Content Editing, Blog Creation, Email Templates, Announcements
            </div>
          </div>

          <div className="p-4 bg-white rounded-lg border border-gsv-gray-200">
            <h4 className="font-medium text-gsv-gray-900 mb-2">Technology Intern</h4>
            <p className="text-sm text-gsv-gray-600 mb-3">
              Handles technical tasks, system monitoring, and user support.
            </p>
            <div className="text-xs text-gsv-gray-500">
              Includes: Analytics, System Settings, User Management, Audit Logs
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
