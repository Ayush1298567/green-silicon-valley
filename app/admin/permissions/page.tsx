"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  Users,
  Shield,
  Key,
  Check,
  X,
  Clock,
  UserPlus,
  Search,
  Filter,
  MoreVertical,
  Edit3,
  Trash2,
  Plus,
  Calendar,
  AlertTriangle
} from "lucide-react";
import { permissionEvaluator } from "@/lib/permissions/permissionEvaluator";

interface RolePermissions {
  [role: string]: Array<{
    permissionKey: string;
    granted: boolean;
    resourceScope?: Record<string, any>;
  }>;
}

interface CustomPermission {
  id: string;
  user_id: string;
  permission_type: string;
  resource_id: string | null;
  permissions: Record<string, boolean>;
  granted_by: string;
  granted_at: string;
  expires_at?: string;
  notes?: string;
  user?: {
    name: string;
    email: string;
  };
  granter?: {
    name: string;
    email: string;
  };
}

const ROLES = ['founder', 'intern', 'volunteer', 'teacher', 'partner'];
const PERMISSION_CATEGORIES = {
  content: ['view', 'edit', 'create', 'delete', 'publish'],
  forms: ['view', 'edit', 'create', 'delete', 'publish'],
  users: ['view', 'edit', 'create', 'delete'],
  blog: ['view', 'edit', 'create', 'delete', 'publish'],
  analytics: ['view'],
  permissions: ['view', 'edit'],
  admin: ['access']
};

export default function PermissionsManagementPage() {
  const [activeTab, setActiveTab] = useState<'roles' | 'custom'>('roles');
  const [rolePermissions, setRolePermissions] = useState<RolePermissions>({});
  const [customPermissions, setCustomPermissions] = useState<CustomPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCustomPermissionModal, setShowCustomPermissionModal] = useState(false);

  const supabase = createClientComponentClient();

  useEffect(() => {
    loadPermissions();
  }, []);

  async function loadPermissions() {
    try {
      setLoading(true);

      // Load role permissions
      const rolePerms = await permissionEvaluator.getAllRolePermissions();
      setRolePermissions(rolePerms);

      // Load custom permissions
      const { data: customPerms, error } = await supabase
        .from('user_custom_permissions')
        .select(`
          *,
          user:user_id(name, email),
          granter:granted_by(name, email)
        `)
        .order('granted_at', { ascending: false });

      if (error) throw error;
      setCustomPermissions(customPerms || []);

    } catch (error) {
      console.error('Error loading permissions:', error);
    } finally {
      setLoading(false);
    }
  }

  async function updateRolePermission(role: string, permissionKey: string, granted: boolean) {
    try {
      setSaving(true);

      // Get current permissions for the role
      const currentPerms = rolePermissions[role] || [];
      const updatedPerms = currentPerms.map(perm =>
        perm.permissionKey === permissionKey
          ? { ...perm, granted }
          : perm
      );

      // If permission doesn't exist, add it
      if (!updatedPerms.find(perm => perm.permissionKey === permissionKey)) {
        updatedPerms.push({
          permissionKey,
          granted,
          resourceScope: null
        });
      }

      await permissionEvaluator.updateRolePermissions('current-user-id', role, updatedPerms);

      // Update local state
      setRolePermissions(prev => ({
        ...prev,
        [role]: updatedPerms
      }));

    } catch (error) {
      console.error('Error updating role permission:', error);
      alert('Failed to update permission');
    } finally {
      setSaving(false);
    }
  }

  async function revokeCustomPermission(permissionId: string) {
    if (!confirm('Are you sure you want to revoke this custom permission?')) return;

    try {
      await permissionEvaluator.revokeCustomPermission('current-user-id', permissionId);
      setCustomPermissions(prev => prev.filter(perm => perm.id !== permissionId));
    } catch (error) {
      console.error('Error revoking custom permission:', error);
      alert('Failed to revoke permission');
    }
  }

  const filteredCustomPermissions = customPermissions.filter(perm => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      perm.user?.name?.toLowerCase().includes(searchLower) ||
      perm.user?.email?.toLowerCase().includes(searchLower) ||
      perm.permission_type.toLowerCase().includes(searchLower)
    );
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
            <h1 className="text-3xl font-bold text-gray-900">Permissions Management</h1>
            <p className="text-gray-600 mt-2">Manage role-based and custom user permissions</p>
          </div>
          <button
            onClick={() => setShowCustomPermissionModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Grant Custom Permission
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'roles', label: 'Role Permissions', icon: Shield },
            { id: 'custom', label: 'Custom Permissions', icon: Key }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Role Permissions Tab */}
      {activeTab === 'roles' && (
        <div className="space-y-8">
          {ROLES.map(role => (
            <div key={role} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 capitalize flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  {role.replace('_', ' ')} Permissions
                </h3>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.entries(PERMISSION_CATEGORIES).map(([category, permissions]) => (
                    <div key={category} className="space-y-3">
                      <h4 className="font-medium text-gray-900 capitalize">{category}</h4>
                      <div className="space-y-2">
                        {permissions.map(permission => {
                          const permissionKey = `${category}.${permission}`;
                          const isGranted = rolePermissions[role]?.find(
                            p => p.permissionKey === permissionKey
                          )?.granted || false;

                          return (
                            <label key={permission} className="flex items-center justify-between text-sm">
                              <span className="text-gray-700 capitalize">{permission}</span>
                              <button
                                onClick={() => updateRolePermission(role, permissionKey, !isGranted)}
                                disabled={saving}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                  isGranted ? 'bg-blue-600' : 'bg-gray-200'
                                } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                              >
                                <span
                                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    isGranted ? 'translate-x-6' : 'translate-x-1'
                                  }`}
                                />
                              </button>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Custom Permissions Tab */}
      {activeTab === 'custom' && (
        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search users or permissions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Custom Permissions List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {filteredCustomPermissions.length === 0 ? (
              <div className="p-12 text-center">
                <Key className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No custom permissions</h3>
                <p className="text-gray-600">
                  {customPermissions.length === 0
                    ? "No custom permissions have been granted yet."
                    : "No permissions match your search criteria."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Permission Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Permissions
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Granted By
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Expires
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCustomPermissions.map((perm) => (
                      <tr key={perm.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <Users className="w-5 h-5 text-gray-500" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {perm.user?.name || 'Unknown User'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {perm.user?.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                            {perm.permission_type.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(perm.permissions).map(([key, value]) => (
                              value && (
                                <span
                                  key={key}
                                  className="inline-flex items-center px-2 py-1 rounded text-xs bg-green-100 text-green-800"
                                >
                                  {key}
                                </span>
                              )
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>
                            <div className="font-medium">
                              {perm.granter?.name || 'System'}
                            </div>
                            <div className="text-gray-500">
                              {new Date(perm.granted_at).toLocaleDateString()}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {perm.expires_at ? (
                            <div className="flex items-center text-sm text-gray-900">
                              <Clock className="w-4 h-4 mr-1 text-gray-400" />
                              {new Date(perm.expires_at) > new Date() ? (
                                new Date(perm.expires_at).toLocaleDateString()
                              ) : (
                                <span className="text-red-600">Expired</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">Never</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => revokeCustomPermission(perm.id)}
                            className="text-red-600 hover:text-red-900 text-sm font-medium"
                          >
                            <Trash2 className="w-4 h-4 inline mr-1" />
                            Revoke
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Custom Permission Modal */}
      {showCustomPermissionModal && (
        <CustomPermissionModal
          onClose={() => setShowCustomPermissionModal(false)}
          onSuccess={() => {
            setShowCustomPermissionModal(false);
            loadPermissions();
          }}
        />
      )}
    </div>
  );
}

function CustomPermissionModal({
  onClose,
  onSuccess
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    userEmail: '',
    permissionType: 'content_block',
    resourceId: '',
    permissions: {} as Record<string, boolean>,
    expiresAt: '',
    notes: ''
  });
  const [saving, setSaving] = useState(false);

  const permissionOptions = {
    content_block: ['view', 'edit', 'delete', 'publish'],
    form: ['view', 'edit', 'delete', 'publish'],
    blog_post: ['view', 'edit', 'delete', 'publish'],
    global: ['admin']
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);

      // Find user by email
      const supabase = createClientComponentClient();
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', formData.userEmail)
        .single();

      if (userError || !user) {
        alert('User not found');
        return;
      }

      await permissionEvaluator.grantCustomPermission('current-user-id', user.id, {
        permissionType: formData.permissionType,
        resourceId: formData.resourceId || undefined,
        permissions: formData.permissions,
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt) : undefined,
        notes: formData.notes
      });

      onSuccess();
    } catch (error) {
      console.error('Error granting permission:', error);
      alert('Failed to grant permission');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Grant Custom Permission</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">User Email</label>
            <input
              type="email"
              required
              value={formData.userEmail}
              onChange={(e) => setFormData(prev => ({ ...prev, userEmail: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="user@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Permission Type</label>
            <select
              value={formData.permissionType}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                permissionType: e.target.value,
                permissions: {} // Reset permissions when type changes
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="content_block">Content Block</option>
              <option value="form">Form</option>
              <option value="blog_post">Blog Post</option>
              <option value="global">Global</option>
            </select>
          </div>

          {formData.permissionType !== 'global' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Resource ID <span className="text-gray-500">(optional)</span>
              </label>
              <input
                type="text"
                value={formData.resourceId}
                onChange={(e) => setFormData(prev => ({ ...prev, resourceId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Leave empty for category-wide access"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
            <div className="space-y-2">
              {permissionOptions[formData.permissionType as keyof typeof permissionOptions]?.map(perm => (
                <label key={perm} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.permissions[perm] || false}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      permissions: {
                        ...prev.permissions,
                        [perm]: e.target.checked
                      }
                    }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 capitalize">{perm}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expiration Date <span className="text-gray-500">(optional)</span>
            </label>
            <input
              type="datetime-local"
              value={formData.expiresAt}
              onChange={(e) => setFormData(prev => ({ ...prev, expiresAt: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Optional notes about this permission"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Granting...' : 'Grant Permission'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}