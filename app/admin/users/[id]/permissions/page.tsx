"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  ArrowLeft,
  User,
  Shield,
  Key,
  Plus,
  Trash2,
  Save,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Calendar,
  FileText,
  Users,
  Eye,
  Edit3,
  Trash,
  Settings
} from "lucide-react";
import Link from "next/link";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  subrole?: string;
  department?: string;
  created_at: string;
}

interface CustomPermission {
  id: string;
  user_id: string;
  permission_type: string;
  resource_id?: string;
  permissions: Record<string, boolean>;
  granted_by: string;
  granted_at: string;
  expires_at?: string;
}

interface PermissionTemplate {
  type: string;
  name: string;
  icon: React.ComponentType<any>;
  permissions: Array<{
    key: string;
    name: string;
    description: string;
  }>;
  resources: Array<{
    type: string;
    name: string;
    getResources: () => Promise<Array<{id: string, name: string}>>;
  }>;
}

const PERMISSION_TEMPLATES: PermissionTemplate[] = [
  {
    type: "content_block",
    name: "Content Block",
    icon: FileText,
    permissions: [
      { key: "can_view", name: "View", description: "Can view this content block" },
      { key: "can_edit", name: "Edit", description: "Can edit this content block" },
      { key: "can_delete", name: "Delete", description: "Can delete this content block" },
      { key: "can_publish", name: "Publish", description: "Can publish/unpublish this content block" }
    ],
    resources: [
      {
        type: "content_blocks",
        name: "Content Blocks",
        getResources: async () => {
          const supabase = createClientComponentClient();
          const { data } = await supabase
            .from("content_blocks")
            .select("id, block_key, title")
            .order("block_key");
          return data?.map(block => ({ id: block.id, name: `${block.block_key}: ${block.title || 'Untitled'}` })) || [];
        }
      }
    ]
  },
  {
    type: "form",
    name: "Form",
    icon: FileText,
    permissions: [
      { key: "can_view", name: "View", description: "Can view form responses" },
      { key: "can_edit", name: "Edit", description: "Can edit form structure" },
      { key: "can_delete", name: "Delete", description: "Can delete the form" },
      { key: "can_publish", name: "Publish", description: "Can publish/unpublish the form" }
    ],
    resources: [
      {
        type: "forms",
        name: "Forms",
        getResources: async () => {
          const supabase = createClientComponentClient();
          const { data } = await supabase
            .from("forms")
            .select("id, title")
            .order("title");
          return data?.map(form => ({ id: form.id, name: form.title })) || [];
        }
      }
    ]
  },
  {
    type: "blog_post",
    name: "Blog Post",
    icon: FileText,
    permissions: [
      { key: "can_view", name: "View", description: "Can view this blog post" },
      { key: "can_edit", name: "Edit", description: "Can edit this blog post" },
      { key: "can_delete", name: "Delete", description: "Can delete this blog post" },
      { key: "can_publish", name: "Publish", description: "Can publish this blog post" }
    ],
    resources: [
      {
        type: "intern_blog_posts",
        name: "Blog Posts",
        getResources: async () => {
          const supabase = createClientComponentClient();
          const { data } = await supabase
            .from("intern_blog_posts")
            .select("id, title")
            .order("title");
          return data?.map(post => ({ id: post.id, name: post.title })) || [];
        }
      }
    ]
  },
  {
    type: "volunteer",
    name: "Volunteer",
    icon: Users,
    permissions: [
      { key: "can_view", name: "View", description: "Can view volunteer applications" },
      { key: "can_edit", name: "Edit", description: "Can edit volunteer information" },
      { key: "can_approve", name: "Approve", description: "Can approve volunteer applications" },
      { key: "can_assign", name: "Assign", description: "Can assign volunteers to teams" }
    ],
    resources: [
      {
        type: "volunteers",
        name: "Volunteer Applications",
        getResources: async () => {
          const supabase = createClientComponentClient();
          const { data } = await supabase
            .from("volunteers")
            .select("id, name")
            .order("name");
          return data?.map(volunteer => ({ id: volunteer.id, name: volunteer.name })) || [];
        }
      }
    ]
  }
];

export default function UserPermissionsPage() {
  const params = useParams();
  const userId = params.id as string;
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<CustomPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [availableResources, setAvailableResources] = useState<Record<string, Array<{id: string, name: string}>>>({});

  // New permission form state
  const [newPermission, setNewPermission] = useState({
    permission_type: "",
    resource_id: "",
    permissions: {} as Record<string, boolean>,
    expires_at: ""
  });

  const supabase = createClientComponentClient();

  useEffect(() => {
    loadUserAndPermissions();
  }, [userId]);

  async function loadUserAndPermissions() {
    try {
      setLoading(true);

      // Load user details
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (userError) throw userError;
      setUser(userData);

      // Load custom permissions
      const { data: permissionsData, error: permissionsError } = await supabase
        .from("user_custom_permissions")
        .select("*")
        .eq("user_id", userId)
        .order("granted_at", { ascending: false });

      if (permissionsError) throw permissionsError;
      setPermissions(permissionsData || []);

      // Load available resources for each type
      await loadAvailableResources();

    } catch (error) {
      console.error("Error loading data:", error);
      alert("Failed to load user permissions");
    } finally {
      setLoading(false);
    }
  }

  async function loadAvailableResources() {
    const resources: Record<string, Array<{id: string, name: string}>> = {};

    for (const template of PERMISSION_TEMPLATES) {
      for (const resourceType of template.resources) {
        try {
          resources[resourceType.type] = await resourceType.getResources();
        } catch (error) {
          console.error(`Error loading ${resourceType.type} resources:`, error);
        }
      }
    }

    setAvailableResources(resources);
  }

  async function addPermission() {
    if (!newPermission.permission_type || Object.keys(newPermission.permissions).length === 0) {
      alert("Please select a permission type and at least one permission.");
      return;
    }

    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) throw new Error("Not authenticated");

      const permissionData = {
        user_id: userId,
        permission_type: newPermission.permission_type,
        resource_id: newPermission.resource_id || null,
        permissions: newPermission.permissions,
        granted_by: session.user.id,
        expires_at: newPermission.expires_at || null
      };

      const { data, error } = await supabase
        .from("user_custom_permissions")
        .insert(permissionData)
        .select()
        .single();

      if (error) throw error;

      setPermissions([data, ...permissions]);
      setNewPermission({
        permission_type: "",
        resource_id: "",
        permissions: {},
        expires_at: ""
      });
      setShowAddForm(false);

    } catch (error: any) {
      console.error("Error adding permission:", error);
      alert("Failed to add permission: " + error.message);
    } finally {
      setSaving(false);
    }
  }

  async function removePermission(permissionId: string) {
    if (!confirm("Are you sure you want to remove this permission?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("user_custom_permissions")
        .delete()
        .eq("id", permissionId);

      if (error) throw error;

      setPermissions(permissions.filter(p => p.id !== permissionId));
    } catch (error: any) {
      console.error("Error removing permission:", error);
      alert("Failed to remove permission: " + error.message);
    }
  }

  function getPermissionTemplate(type: string): PermissionTemplate | undefined {
    return PERMISSION_TEMPLATES.find(t => t.type === type);
  }

  function getResourceName(resourceType: string, resourceId: string): string {
    const resources = availableResources[resourceType];
    const resource = resources?.find(r => r.id === resourceId);
    return resource?.name || resourceId;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">User Not Found</h2>
        <p className="text-gray-600">The requested user could not be found.</p>
      </div>
    );
  }

  return (
    <div className="container py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link
            href="/admin/user-manager"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to User Management
          </Link>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Permissions</h1>
            <p className="text-gray-600 mt-2">Manage custom permissions for {user.name}</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Permission
          </button>
        </div>
      </div>

      {/* User Info Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
            <p className="text-gray-600">{user.email}</p>
            <div className="flex items-center gap-4 mt-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                {user.role}
              </span>
              {user.subrole && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  {user.subrole}
                </span>
              )}
              {user.department && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {user.department}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Permission Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Custom Permission</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Permission Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Permission Type
              </label>
              <select
                value={newPermission.permission_type}
                onChange={(e) => {
                  const type = e.target.value;
                  setNewPermission(prev => ({
                    ...prev,
                    permission_type: type,
                    resource_id: "",
                    permissions: {}
                  }));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select permission type</option>
                {PERMISSION_TEMPLATES.map(template => (
                  <option key={template.type} value={template.type}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Resource Selection */}
            {newPermission.permission_type && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specific Resource (Optional)
                </label>
                <select
                  value={newPermission.resource_id}
                  onChange={(e) => setNewPermission(prev => ({ ...prev, resource_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All resources of this type</option>
                  {(() => {
                    const template = getPermissionTemplate(newPermission.permission_type);
                    const resourceType = template?.resources[0];
                    const resources = resourceType ? availableResources[resourceType.type] : [];
                    return resources?.map(resource => (
                      <option key={resource.id} value={resource.id}>
                        {resource.name}
                      </option>
                    ));
                  })()}
                </select>
              </div>
            )}

            {/* Expiration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expires At (Optional)
              </label>
              <input
                type="datetime-local"
                value={newPermission.expires_at}
                onChange={(e) => setNewPermission(prev => ({ ...prev, expires_at: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Permissions Selection */}
          {newPermission.permission_type && (
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Permissions to Grant
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {getPermissionTemplate(newPermission.permission_type)?.permissions.map(perm => (
                  <label key={perm.key} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newPermission.permissions[perm.key] || false}
                      onChange={(e) => setNewPermission(prev => ({
                        ...prev,
                        permissions: {
                          ...prev.permissions,
                          [perm.key]: e.target.checked
                        }
                      }))}
                      className="mt-1 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{perm.name}</div>
                      <div className="text-xs text-gray-600">{perm.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3 mt-6 pt-4 border-t">
            <button
              onClick={addPermission}
              disabled={saving}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <div className="animate-spin rounded-full h-4 w-4 border border-white border-t-transparent" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Add Permission
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Current Permissions */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-900">Current Custom Permissions</h3>

        {permissions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <Shield className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No Custom Permissions</h4>
            <p className="text-gray-600">
              This user has no custom permissions assigned. They rely on their role-based permissions.
            </p>
          </div>
        ) : (
          permissions.map((permission) => {
            const template = getPermissionTemplate(permission.permission_type);
            const Icon = template?.icon || Key;

            return (
              <div key={permission.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900">
                        {template?.name || permission.permission_type}
                        {permission.resource_id && (
                          <span className="text-sm text-gray-600 ml-2">
                            - {getResourceName(
                              template?.resources[0]?.type || permission.permission_type,
                              permission.resource_id
                            )}
                          </span>
                        )}
                      </h4>

                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Granted {new Date(permission.granted_at).toLocaleDateString()}
                        </div>
                        {permission.expires_at && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Expires {new Date(permission.expires_at).toLocaleDateString()}
                          </div>
                        )}
                      </div>

                      {/* Granted Permissions */}
                      <div className="mt-3">
                        <div className="text-sm text-gray-700 mb-2">Granted permissions:</div>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(permission.permissions).map(([key, granted]) => {
                            if (!granted) return null;
                            const perm = template?.permissions.find(p => p.key === key);
                            return (
                              <span
                                key={key}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                              >
                                <CheckCircle className="w-3 h-3" />
                                {perm?.name || key}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => removePermission(permission.id)}
                    className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded"
                    title="Remove permission"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
