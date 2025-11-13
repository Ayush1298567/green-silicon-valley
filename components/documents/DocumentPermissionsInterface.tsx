"use client";

import { useState } from "react";
import { Plus, Search, FileText, User, Shield, Trash2, Eye, Edit, Settings } from "lucide-react";

interface Resource {
  id: number;
  filename: string | null;
  category: string | null;
  file_type: string | null;
}

interface User {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
}

interface Permission {
  id: string;
  user_id: string;
  resource_id: number;
  permission_level: string;
  granted_at: string;
  expires_at: string | null;
  user?: { name: string | null; email: string | null; role: string };
  resource?: { filename: string | null; category: string | null };
  granted_by_user?: { name: string | null };
}

interface Props {
  resources: Resource[];
  users: User[];
  permissions: Permission[];
  currentUserId: string;
}

export default function DocumentPermissionsInterface({ resources, users, permissions: initialPermissions, currentUserId }: Props) {
  const [permissions, setPermissions] = useState<Permission[]>(initialPermissions);
  const [isGranting, setIsGranting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterUser, setFilterUser] = useState<string>("all");
  const [filterResource, setFilterResource] = useState<string>("all");

  // Form state
  const [formData, setFormData] = useState({
    user_id: "",
    resource_id: "",
    permission_level: "view",
    expires_at: "",
  });

  const handleGrantPermission = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch("/api/documents/permissions/grant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          granted_by: currentUserId,
        }),
      });

      if (response.ok) {
        const { permission } = await response.json();
        setPermissions([permission, ...permissions]);
        setIsGranting(false);
        setFormData({
          user_id: "",
          resource_id: "",
          permission_level: "view",
          expires_at: "",
        });
      }
    } catch (error) {
      console.error("Failed to grant permission:", error);
    }
  };

  const handleRevokePermission = async (permissionId: string) => {
    if (!confirm("Are you sure you want to revoke this permission?")) return;

    try {
      const response = await fetch(`/api/documents/permissions/${permissionId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setPermissions(permissions.filter(p => p.id !== permissionId));
      }
    } catch (error) {
      console.error("Failed to revoke permission:", error);
    }
  };

  const filteredPermissions = permissions.filter((permission) => {
    const matchesSearch = 
      permission.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permission.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permission.resource?.filename?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesUser = filterUser === "all" || permission.user_id === filterUser;
    const matchesResource = filterResource === "all" || permission.resource_id.toString() === filterResource;

    return matchesSearch && matchesUser && matchesResource;
  });

  const getPermissionIcon = (level: string) => {
    switch (level) {
      case "view":
        return <Eye className="w-4 h-4" />;
      case "edit":
        return <Edit className="w-4 h-4" />;
      case "assign":
      case "manage":
        return <Settings className="w-4 h-4" />;
      default:
        return <Shield className="w-4 h-4" />;
    }
  };

  const getPermissionColor = (level: string) => {
    switch (level) {
      case "view":
        return "bg-blue-100 text-blue-800";
      case "edit":
        return "bg-green-100 text-green-800";
      case "assign":
        return "bg-yellow-100 text-yellow-800";
      case "manage":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <button
          onClick={() => setIsGranting(!isGranting)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gsv-green text-white rounded-lg hover:bg-gsv-green/90 transition"
        >
          <Plus className="w-4 h-4" />
          Grant Permission
        </button>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-gsv-green focus:border-transparent"
            />
          </div>

          {/* User Filter */}
          <select
            value={filterUser}
            onChange={(e) => setFilterUser(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gsv-green"
          >
            <option value="all">All Users</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name || user.email}
              </option>
            ))}
          </select>

          {/* Resource Filter */}
          <select
            value={filterResource}
            onChange={(e) => setFilterResource(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gsv-green"
          >
            <option value="all">All Resources</option>
            {resources.slice(0, 50).map((resource) => (
              <option key={resource.id} value={resource.id}>
                {resource.filename}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grant Permission Form */}
      {isGranting && (
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">Grant Document Permission</h2>
          <form onSubmit={handleGrantPermission} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">User *</label>
                <select
                  required
                  value={formData.user_id}
                  onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gsv-green"
                >
                  <option value="">Select user...</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name || user.email} ({user.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Document/Resource *</label>
                <select
                  required
                  value={formData.resource_id}
                  onChange={(e) => setFormData({ ...formData, resource_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gsv-green"
                >
                  <option value="">Select resource...</option>
                  {resources.map((resource) => (
                    <option key={resource.id} value={resource.id}>
                      {resource.filename} ({resource.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Permission Level</label>
                <select
                  value={formData.permission_level}
                  onChange={(e) => setFormData({ ...formData, permission_level: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gsv-green"
                >
                  <option value="view">View Only</option>
                  <option value="edit">View & Edit</option>
                  <option value="assign">View, Edit & Assign to Others</option>
                  <option value="manage">Full Management</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {formData.permission_level === "view" && "User can only view the document"}
                  {formData.permission_level === "edit" && "User can view and edit the document"}
                  {formData.permission_level === "assign" && "User can view, edit, and assign to other volunteers"}
                  {formData.permission_level === "manage" && "User has full control including deletion"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Expires On (Optional)</label>
                <input
                  type="date"
                  value={formData.expires_at}
                  onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gsv-green"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty for permanent access
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="px-4 py-2 bg-gsv-green text-white rounded-lg hover:bg-gsv-green/90"
              >
                Grant Permission
              </button>
              <button
                type="button"
                onClick={() => setIsGranting(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Permissions List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {filteredPermissions.length} Active {filteredPermissions.length === 1 ? "Permission" : "Permissions"}
          </h2>
        </div>

        {filteredPermissions.length === 0 ? (
          <div className="card p-12 text-center">
            <Shield className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No permissions found</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredPermissions.map((permission) => {
              const isExpired = permission.expires_at && new Date(permission.expires_at) < new Date();
              
              return (
                <div 
                  key={permission.id} 
                  className={`card p-5 hover:shadow-lg transition-shadow ${isExpired ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-2 bg-gray-100 rounded">
                        <FileText className="w-5 h-5 text-gray-600" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{permission.resource?.filename}</h3>
                          <span className="text-xs text-gray-500">→</span>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <User className="w-3 h-3" />
                            {permission.user?.name || permission.user?.email}
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-3 mt-2">
                          <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded ${getPermissionColor(permission.permission_level)}`}>
                            {getPermissionIcon(permission.permission_level)}
                            {permission.permission_level}
                          </span>
                          
                          <span className="text-xs text-gray-500">
                            Granted {new Date(permission.granted_at).toLocaleDateString()}
                          </span>
                          
                          {permission.expires_at && (
                            <span className={`text-xs ${isExpired ? 'text-red-600' : 'text-gray-500'}`}>
                              {isExpired ? 'Expired' : 'Expires'} {new Date(permission.expires_at).toLocaleDateString()}
                            </span>
                          )}
                          
                          {permission.granted_by_user?.name && (
                            <span className="text-xs text-gray-500">
                              by {permission.granted_by_user.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleRevokePermission(permission.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                      title="Revoke permission"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

