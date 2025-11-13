"use client";
import { useState, useEffect, useCallback } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Shield, Users, Check, X, Search, Plus, Edit3, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ProfessionalButton from "@/components/ui/ProfessionalButton";

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface UserPermissions {
  userId: string;
  userName: string;
  userEmail: string;
  role: string;
  permissions: string[];
}

const PERMISSION_CATEGORIES = {
  website: {
    label: "Website Management",
    permissions: [
      { id: "website.edit", name: "Edit Website", description: "Use visual website builder" },
      { id: "website.publish", name: "Publish Changes", description: "Make changes live" },
      { id: "website.settings", name: "Website Settings", description: "Change colors, fonts, logo" },
      { id: "website.social", name: "Social Media Links", description: "Update social media URLs" }
    ]
  },
  content: {
    label: "Content Management",
    permissions: [
      { id: "content.edit", name: "Edit Content", description: "Edit text and images" },
      { id: "content.create", name: "Create Content", description: "Add new content blocks" },
      { id: "content.delete", name: "Delete Content", description: "Remove content blocks" },
      { id: "content.preview", name: "Preview Content", description: "View unpublished content" }
    ]
  },
  blog: {
    label: "Blog Management",
    permissions: [
      { id: "blog.create", name: "Create Posts", description: "Write new blog posts" },
      { id: "blog.edit", name: "Edit Posts", description: "Edit existing posts" },
      { id: "blog.publish", name: "Publish Posts", description: "Make posts public" },
      { id: "blog.delete", name: "Delete Posts", description: "Remove blog posts" }
    ]
  },
  media: {
    label: "Media Management",
    permissions: [
      { id: "media.upload", name: "Upload Media", description: "Upload images and files" },
      { id: "media.delete", name: "Delete Media", description: "Remove files" },
      { id: "media.public", name: "Make Public", description: "Change file visibility" }
    ]
  },
  users: {
    label: "User Management",
    permissions: [
      { id: "users.view", name: "View Users", description: "See user list" },
      { id: "users.create", name: "Create Users", description: "Add new users" },
      { id: "users.edit", name: "Edit Users", description: "Modify user details" },
      { id: "users.delete", name: "Delete Users", description: "Remove users" },
      { id: "users.roles", name: "Change Roles", description: "Modify user roles" },
      { id: "users.permissions", name: "Manage Permissions", description: "Grant/revoke permissions" }
    ]
  },
  volunteers: {
    label: "Volunteer Management",
    permissions: [
      { id: "volunteers.view", name: "View Volunteers", description: "See volunteer list" },
      { id: "volunteers.approve", name: "Approve Hours", description: "Approve volunteer hours" },
      { id: "volunteers.forms", name: "View Forms", description: "See volunteer applications" }
    ]
  },
  presentations: {
    label: "Presentation Management",
    permissions: [
      { id: "presentations.view", name: "View Presentations", description: "See all presentations" },
      { id: "presentations.create", name: "Create Presentations", description: "Schedule new presentations" },
      { id: "presentations.edit", name: "Edit Presentations", description: "Modify presentation details" },
      { id: "presentations.delete", name: "Delete Presentations", description: "Remove presentations" }
    ]
  },
  analytics: {
    label: "Analytics & Reports",
    permissions: [
      { id: "analytics.view", name: "View Analytics", description: "See dashboard analytics" },
      { id: "analytics.export", name: "Export Data", description: "Download reports" }
    ]
  }
};

export default function PermissionsPage() {
  const [users, setUsers] = useState<UserPermissions[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const supabase = createClientComponentClient();

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("users")
        .select("id, name, email, role, permissions")
        .order("name");

      if (error) throw error;

      setUsers(
        (data || []).map((u) => ({
          userId: u.id,
          userName: u.name || "Unknown",
          userEmail: u.email || "",
          role: u.role || "volunteer",
          permissions: u.permissions || []
        }))
      );
    } catch (error: any) {
      showMessage("error", error.message);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  async function updateUserPermissions(userId: string, permissions: string[]) {
    try {
      setSaving(true);
      const { error } = await supabase
        .from("users")
        .update({ permissions })
        .eq("id", userId);

      if (error) throw error;

      setUsers(users.map(u =>
        u.userId === userId ? { ...u, permissions } : u
      ));

      showMessage("success", "Permissions updated successfully!");
    } catch (error: any) {
      showMessage("error", error.message);
    } finally {
      setSaving(false);
    }
  }

  function togglePermission(userId: string, permissionId: string) {
    const user = users.find(u => u.userId === userId);
    if (!user) return;

    const hasPermission = user.permissions.includes(permissionId);
    const newPermissions = hasPermission
      ? user.permissions.filter(p => p !== permissionId)
      : [...user.permissions, permissionId];

    updateUserPermissions(userId, newPermissions);
  }

  function grantAllPermissions(userId: string, category: string) {
    const user = users.find(u => u.userId === userId);
    if (!user) return;

    const categoryPerms = PERMISSION_CATEGORIES[category as keyof typeof PERMISSION_CATEGORIES].permissions.map(p => p.id);
    const otherPerms = user.permissions.filter(p => !categoryPerms.includes(p));
    const newPermissions = [...otherPerms, ...categoryPerms];

    updateUserPermissions(userId, newPermissions);
  }

  function revokeAllPermissions(userId: string, category: string) {
    const user = users.find(u => u.userId === userId);
    if (!user) return;

    const categoryPerms = PERMISSION_CATEGORIES[category as keyof typeof PERMISSION_CATEGORIES].permissions.map(p => p.id);
    const newPermissions = user.permissions.filter(p => !categoryPerms.includes(p));

    updateUserPermissions(userId, newPermissions);
  }

  function showMessage(type: "success" | "error", text: string) {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  }

  const filteredUsers = users.filter(
    u =>
      u.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gsv-slate-100 py-12">
      <div className="container max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gsv-charcoal mb-2">Permissions Management</h1>
          <p className="text-gsv-slate-600">Control who can access what features</p>
        </div>

        {/* Message Toast */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`mb-6 p-4 rounded-xl ${
                message.type === "success"
                  ? "bg-accent-success/10 text-accent-success border border-accent-success/20"
                  : "bg-accent-error/10 text-accent-error border border-accent-error/20"
              }`}
            >
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search */}
        <div className="bg-white rounded-2xl shadow-soft p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gsv-slate-400" />
            <input
              type="text"
              placeholder="Search users by name, email, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gsv-slate-300 rounded-xl focus:ring-2 focus:ring-gsv-green focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Users List */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-soft p-12 text-center">
            <div className="animate-spin w-12 h-12 border-4 border-gsv-green border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gsv-slate-600">Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-soft p-12 text-center">
            <Users className="w-16 h-16 text-gsv-slate-300 mx-auto mb-4" />
            <p className="text-lg font-medium text-gsv-slate-700 mb-2">No users found</p>
            <p className="text-sm text-gsv-slate-500">Try adjusting your search</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredUsers.map((user, index) => (
              <motion.div
                key={user.userId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-white rounded-2xl shadow-soft overflow-hidden"
              >
                {/* User Header */}
                <div
                  className="bg-gsv-slate-50 px-6 py-4 border-b border-gsv-slate-200 flex items-center justify-between cursor-pointer hover:bg-gsv-slate-100 transition-colors"
                  onClick={() => setSelectedUser(selectedUser === user.userId ? null : user.userId)}
                >
                  <div>
                    <h3 className="font-bold text-gsv-charcoal">{user.userName}</h3>
                    <p className="text-sm text-gsv-slate-500">{user.userEmail}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      user.role === "founder"
                        ? "bg-gsv-green/10 text-gsv-green"
                        : user.role === "intern"
                        ? "bg-accent-blue/10 text-accent-blue"
                        : "bg-gsv-slate-200 text-gsv-slate-700"
                    }`}>
                      {user.role}
                    </span>
                    <span className="text-sm text-gsv-slate-500">
                      {user.permissions.length} permissions
                    </span>
                    <Shield className={`w-5 h-5 transition-transform ${
                      selectedUser === user.userId ? "rotate-180" : ""
                    }`} />
                  </div>
                </div>

                {/* Permissions Grid */}
                <AnimatePresence>
                  {selectedUser === user.userId && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-6 space-y-6">
                        {Object.entries(PERMISSION_CATEGORIES).map(([key, category]) => (
                          <div key={key} className="border border-gsv-slate-200 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="font-bold text-gsv-charcoal">{category.label}</h4>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => grantAllPermissions(user.userId, key)}
                                  className="text-xs px-3 py-1 bg-gsv-green text-white rounded-lg hover:bg-gsv-greenDark transition-colors"
                                >
                                  Grant All
                                </button>
                                <button
                                  onClick={() => revokeAllPermissions(user.userId, key)}
                                  className="text-xs px-3 py-1 bg-gsv-slate-200 text-gsv-slate-700 rounded-lg hover:bg-gsv-slate-300 transition-colors"
                                >
                                  Revoke All
                                </button>
                              </div>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-3">
                              {category.permissions.map((permission) => {
                                const hasPermission = user.permissions.includes(permission.id);
                                return (
                                  <button
                                    key={permission.id}
                                    onClick={() => togglePermission(user.userId, permission.id)}
                                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                                      hasPermission
                                        ? "border-gsv-green bg-gsv-greenSoft"
                                        : "border-gsv-slate-200 hover:border-gsv-green/50"
                                    }`}
                                  >
                                    <div className="flex items-start justify-between mb-2">
                                      <span className="font-semibold text-gsv-charcoal text-sm">
                                        {permission.name}
                                      </span>
                                      <div className={`w-5 h-5 rounded flex items-center justify-center ${
                                        hasPermission
                                          ? "bg-gsv-green text-white"
                                          : "bg-gsv-slate-200"
                                      }`}>
                                        {hasPermission ? (
                                          <Check className="w-3 h-3" />
                                        ) : (
                                          <X className="w-3 h-3 text-gsv-slate-400" />
                                        )}
                                      </div>
                                    </div>
                                    <p className="text-xs text-gsv-slate-600">
                                      {permission.description}
                                    </p>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}

        {/* Help Section */}
        <div className="mt-8 bg-gradient-to-br from-gsv-greenSoft to-gsv-warmSoft rounded-2xl p-8 border border-gsv-green/20">
          <h3 className="text-xl font-bold text-gsv-charcoal mb-4">💡 Permission Management Tips</h3>
          <div className="grid md:grid-cols-2 gap-6 text-sm text-gsv-slate-700">
            <div>
              <h4 className="font-semibold mb-2">Roles vs Permissions</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li><strong>Founders:</strong> Full access to everything</li>
                <li><strong>Interns:</strong> Can manage content and volunteers</li>
                <li><strong>Volunteers:</strong> Limited to their own data</li>
                <li><strong>Custom:</strong> Grant specific permissions as needed</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Best Practices</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>Grant minimum necessary permissions</li>
                <li>Review permissions regularly</li>
                <li>Use categories to grant related permissions</li>
                <li>Test permissions before granting widely</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

