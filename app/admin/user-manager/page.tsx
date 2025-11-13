"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { 
  Users, Plus, Edit3, Trash2, Search, Filter, Download, Upload,
  Mail, Phone, MapPin, Calendar, Award, Clock, CheckCircle, XCircle,
  Eye, EyeOff, Shield, Key, UserPlus, UserMinus, RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ProfessionalButton from "@/components/ui/ProfessionalButton";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  status: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  created_at: string;
  last_login?: string;
  notes?: string;
  profile_image?: string;
}

const ROLES = [
  { value: "founder", label: "Founder", color: "bg-gsv-green", description: "Full access to everything" },
  { value: "intern", label: "Intern", color: "bg-accent-blue", description: "Manage content and volunteers" },
  { value: "volunteer", label: "Volunteer", color: "bg-gsv-warm", description: "Submit hours and view own data" },
  { value: "teacher", label: "Teacher", color: "bg-accent-yellow", description: "Request presentations" },
  { value: "partner", label: "Partner", color: "bg-purple-500", description: "View analytics and reports" }
];

const STATUS_OPTIONS = [
  { value: "active", label: "Active", color: "text-accent-success", icon: CheckCircle },
  { value: "inactive", label: "Inactive", color: "text-gsv-slate-400", icon: EyeOff },
  { value: "pending", label: "Pending", color: "text-accent-warning", icon: Clock },
  { value: "suspended", label: "Suspended", color: "text-accent-error", icon: XCircle }
];

export default function UserManagerPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const supabase = createClientComponentClient();

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setUsers(
        (data || []).map((u) => ({
          id: u.id,
          name: u.name || "Unknown",
          email: u.email || "",
          role: u.role || "volunteer",
          permissions: u.permissions || [],
          status: u.status || "active",
          phone: u.phone,
          address: u.address,
          city: u.city,
          state: u.state,
          zip: u.zip,
          created_at: u.created_at,
          last_login: u.last_login,
          notes: u.notes,
          profile_image: u.profile_image
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

  const computedFilteredUsers = useMemo(() => {
    let filtered = users;

    if (searchQuery) {
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.phone?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (roleFilter !== "all") {
      filtered = filtered.filter((u) => u.role === roleFilter);
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((u) => u.status === statusFilter);
    }

    return filtered;
  }, [users, searchQuery, roleFilter, statusFilter]);

  useEffect(() => {
    setFilteredUsers(computedFilteredUsers);
  }, [computedFilteredUsers]);

  async function createUser(userData: Partial<User>) {
    try {
      setSaving(true);

      // Create auth user first
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email!,
        email_confirm: true,
        user_metadata: {
          name: userData.name
        }
      });

      if (authError) throw authError;

      // Create user record
      const { error: dbError } = await supabase.from("users").insert({
        id: authData.user.id,
        name: userData.name,
        email: userData.email,
        role: userData.role || "volunteer",
        status: userData.status || "active",
        phone: userData.phone,
        address: userData.address,
        city: userData.city,
        state: userData.state,
        zip: userData.zip,
        notes: userData.notes
      });

      if (dbError) throw dbError;

      showMessage("success", "User created successfully!");
      loadUsers();
      setShowCreateModal(false);
    } catch (error: any) {
      showMessage("error", error.message);
    } finally {
      setSaving(false);
    }
  }

  async function updateUser(userId: string, updates: Partial<User>) {
    try {
      setSaving(true);
      const { error } = await supabase
        .from("users")
        .update(updates)
        .eq("id", userId);

      if (error) throw error;

      showMessage("success", "User updated successfully!");
      loadUsers();
      setShowEditModal(false);
      setSelectedUser(null);
    } catch (error: any) {
      showMessage("error", error.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteUser(userId: string) {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;

    try {
      setSaving(true);

      // Delete from database
      const { error: dbError } = await supabase
        .from("users")
        .delete()
        .eq("id", userId);

      if (dbError) throw dbError;

      // Delete from auth
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);
      if (authError) console.error("Auth delete error:", authError);

      showMessage("success", "User deleted successfully!");
      loadUsers();
      setSelectedUser(null);
    } catch (error: any) {
      showMessage("error", error.message);
    } finally {
      setSaving(false);
    }
  }

  async function changeUserStatus(userId: string, status: string) {
    await updateUser(userId, { status });
  }

  async function changeUserRole(userId: string, role: string) {
    await updateUser(userId, { role });
  }

  async function exportUsers() {
    const csv = [
      ["Name", "Email", "Role", "Status", "Phone", "City", "State", "Created At"],
      ...computedFilteredUsers.map((u) => [
        u.name,
        u.email,
        u.role,
        u.status,
        u.phone || "",
        u.city || "",
        u.state || "",
        new Date(u.created_at).toLocaleDateString()
      ])
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  }

  function showMessage(type: "success" | "error", text: string) {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  }

  const stats = {
    total: users.length,
    active: users.filter((u) => u.status === "active").length,
    founders: users.filter((u) => u.role === "founder").length,
    interns: users.filter((u) => u.role === "intern").length,
    volunteers: users.filter((u) => u.role === "volunteer").length
  };

  return (
    <div className="min-h-screen bg-gsv-slate-100 py-12">
      <div className="container max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gsv-charcoal mb-2">User Management</h1>
          <p className="text-gsv-slate-600">Manage all users, roles, and permissions</p>
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

        {/* Stats Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <StatCard label="Total Users" value={stats.total} icon={Users} color="bg-gsv-green" />
          <StatCard label="Active" value={stats.active} icon={CheckCircle} color="bg-accent-success" />
          <StatCard label="Founders" value={stats.founders} icon={Shield} color="bg-gsv-green" />
          <StatCard label="Interns" value={stats.interns} icon={Award} color="bg-accent-blue" />
          <StatCard label="Volunteers" value={stats.volunteers} icon={Users} color="bg-gsv-warm" />
        </div>

        {/* Controls */}
        <div className="bg-white rounded-2xl shadow-soft p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gsv-slate-400" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gsv-slate-300 rounded-xl focus:ring-2 focus:ring-gsv-green focus:border-transparent transition-all"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-2 border border-gsv-slate-300 rounded-lg focus:ring-2 focus:ring-gsv-green focus:border-transparent"
              >
                <option value="all">All Roles</option>
                {ROLES.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gsv-slate-300 rounded-lg focus:ring-2 focus:ring-gsv-green focus:border-transparent"
              >
                <option value="all">All Status</option>
                {STATUS_OPTIONS.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={loadUsers}
                className="p-2 text-gsv-slate-600 hover:text-gsv-green hover:bg-gsv-slate-100 rounded-lg transition-colors"
                title="Refresh"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <button
                onClick={exportUsers}
                className="p-2 text-gsv-slate-600 hover:text-gsv-green hover:bg-gsv-slate-100 rounded-lg transition-colors"
                title="Export CSV"
              >
                <Download className="w-5 h-5" />
              </button>
              <ProfessionalButton
                variant="primary"
                size="md"
                icon={<Plus className="w-4 h-4" />}
                onClick={() => setShowCreateModal(true)}
              >
                Add User
              </ProfessionalButton>
            </div>
          </div>
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-soft p-12 text-center">
            <div className="animate-spin w-12 h-12 border-4 border-gsv-green border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gsv-slate-600">Loading users...</p>
          </div>
        ) : computedFilteredUsers.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-soft p-12 text-center">
            <Users className="w-16 h-16 text-gsv-slate-300 mx-auto mb-4" />
            <p className="text-lg font-medium text-gsv-slate-700 mb-2">No users found</p>
            <p className="text-sm text-gsv-slate-500 mb-6">Try adjusting your filters or search</p>
            <ProfessionalButton
              variant="primary"
              size="md"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setShowCreateModal(true)}
            >
              Add First User
            </ProfessionalButton>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gsv-slate-50 border-b border-gsv-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gsv-charcoal">User</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gsv-charcoal">Role</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gsv-charcoal">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gsv-charcoal">Contact</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gsv-charcoal">Joined</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gsv-charcoal">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gsv-slate-200">
                  {computedFilteredUsers.map((user, index) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gsv-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gsv-green/10 rounded-full flex items-center justify-center text-gsv-green font-semibold">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-gsv-charcoal">{user.name}</div>
                            <div className="text-sm text-gsv-slate-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={user.role}
                          onChange={(e) => changeUserRole(user.id, e.target.value)}
                          className="px-3 py-1 border border-gsv-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-gsv-green focus:border-transparent"
                        >
                          {ROLES.map((role) => (
                            <option key={role.value} value={role.value}>
                              {role.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={user.status}
                          onChange={(e) => changeUserStatus(user.id, e.target.value)}
                          className={`px-3 py-1 border border-gsv-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-gsv-green focus:border-transparent ${
                            STATUS_OPTIONS.find((s) => s.value === user.status)?.color
                          }`}
                        >
                          {STATUS_OPTIONS.map((status) => (
                            <option key={status.value} value={status.value}>
                              {status.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gsv-slate-600">
                          {user.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {user.phone}
                            </div>
                          )}
                          {user.city && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {user.city}, {user.state}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gsv-slate-600">
                          {new Date(user.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowEditModal(true);
                            }}
                            className="p-2 text-gsv-slate-600 hover:text-gsv-green hover:bg-gsv-slate-100 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteUser(user.id)}
                            className="p-2 text-gsv-slate-600 hover:text-accent-error hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Create/Edit User Modals */}
        <UserModal
          show={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSave={createUser}
          saving={saving}
          title="Create New User"
        />

        <UserModal
          show={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedUser(null);
          }}
          onSave={(data) => updateUser(selectedUser!.id, data)}
          saving={saving}
          title="Edit User"
          initialData={selectedUser}
        />
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({
  label,
  value,
  icon: Icon,
  color
}: {
  label: string;
  value: number;
  icon: any;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-soft p-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gsv-slate-600">{label}</span>
        <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center text-white`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="text-3xl font-bold text-gsv-charcoal">{value}</div>
    </div>
  );
}

// User Modal Component
function UserModal({
  show,
  onClose,
  onSave,
  saving,
  title,
  initialData
}: {
  show: boolean;
  onClose: () => void;
  onSave: (data: Partial<User>) => void;
  saving: boolean;
  title: string;
  initialData?: User | null;
}) {
  const [formData, setFormData] = useState<Partial<User>>({
    name: "",
    email: "",
    role: "volunteer",
    status: "active",
    phone: "",
    address: "",
    city: "",
    state: "CA",
    zip: "",
    notes: ""
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(formData);
  }

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-modal flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <form onSubmit={handleSubmit}>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gsv-slate-200">
              <h2 className="text-2xl font-bold text-gsv-charcoal">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                className="p-2 hover:bg-gsv-slate-100 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gsv-slate-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gsv-slate-300 rounded-lg focus:ring-2 focus:ring-gsv-green focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gsv-slate-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gsv-slate-300 rounded-lg focus:ring-2 focus:ring-gsv-green focus:border-transparent"
                    disabled={!!initialData}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gsv-slate-700 mb-2">
                    Role *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-2 border border-gsv-slate-300 rounded-lg focus:ring-2 focus:ring-gsv-green focus:border-transparent"
                  >
                    {ROLES.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gsv-slate-700 mb-2">
                    Status *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 border border-gsv-slate-300 rounded-lg focus:ring-2 focus:ring-gsv-green focus:border-transparent"
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gsv-slate-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gsv-slate-300 rounded-lg focus:ring-2 focus:ring-gsv-green focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gsv-slate-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-2 border border-gsv-slate-300 rounded-lg focus:ring-2 focus:ring-gsv-green focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gsv-slate-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gsv-slate-300 rounded-lg focus:ring-2 focus:ring-gsv-green focus:border-transparent"
                  placeholder="Internal notes about this user..."
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gsv-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-gsv-slate-700 hover:bg-gsv-slate-100 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <ProfessionalButton
                type="submit"
                variant="primary"
                size="md"
                loading={saving}
              >
                {initialData ? "Update User" : "Create User"}
              </ProfessionalButton>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

