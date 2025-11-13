"use client";
import { useState, useEffect } from "react";
import { Search, Filter, UserPlus, Edit, Trash2, Shield, Mail, Phone, Calendar } from "lucide-react";
import { type UserRow } from "@/types/db";
import UserDetailsModal from "./UserDetailsModal";
import CreateUserModal from "./CreateUserModal";
import { useRouter } from "next/navigation";

interface UsersManagementInterfaceProps {
  initialUsers: UserRow[];
}

export default function UsersManagementInterface({ initialUsers }: UsersManagementInterfaceProps) {
  const [users, setUsers] = useState<UserRow[]>(initialUsers);
  const [filteredUsers, setFilteredUsers] = useState<UserRow[]>(initialUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setUsers(initialUsers);
    setFilteredUsers(initialUsers);
  }, [initialUsers]);

  useEffect(() => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((user) => user.status === statusFilter);
    }

    setFilteredUsers(filtered);
  }, [searchTerm, roleFilter, statusFilter, users]);

  const handleUserClick = (user: UserRow) => {
    setSelectedUser(user);
    setShowDetailsModal(true);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;

    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setUsers(users.filter((u) => u.id !== userId));
        alert("User deleted successfully");
      } else {
        alert("Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Error deleting user");
    }
  };

  const handleUpdateUser = async (updatedUser: UserRow) => {
    try {
      const res = await fetch(`/api/users/${updatedUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedUser),
      });

      if (res.ok) {
        setUsers(users.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
        setShowDetailsModal(false);
        router.refresh();
        alert("User updated successfully");
      } else {
        alert("Failed to update user");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Error updating user");
    }
  };

  const getRoleBadgeColor = (role?: string) => {
    if (role === "founder") return "bg-purple-100 text-purple-800";
    if (role === "intern") return "bg-blue-100 text-blue-800";
    if (role === "volunteer") return "bg-green-100 text-green-800";
    if (role === "teacher") return "bg-yellow-100 text-yellow-800";
    if (role === "partner") return "bg-pink-100 text-pink-800";
    return "bg-gray-100 text-gray-800";
  };

  const getStatusBadgeColor = (status?: string) => {
    if (status === "active") return "bg-green-100 text-green-800";
    if (status === "inactive") return "bg-gray-100 text-gray-800";
    if (status === "suspended") return "bg-red-100 text-red-800";
    return "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      {/* Filters & Search */}
      <div className="card p-6">
        <div className="grid md:grid-cols-4 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gsv-gray w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green"
          >
            <option value="all">All Roles</option>
            <option value="founder">Founders</option>
            <option value="intern">Interns</option>
            <option value="volunteer">Volunteers</option>
            <option value="teacher">Teachers</option>
            <option value="partner">Partners</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gsv-gray">
            Showing {filteredUsers.length} of {users.length} users
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gsv-green text-white rounded-lg font-medium hover:bg-gsv-green/90 transition"
          >
            <UserPlus className="w-4 h-4" />
            Add New User
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gsv-charcoal">User</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gsv-charcoal">Role</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gsv-charcoal">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gsv-charcoal">Contact</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gsv-charcoal">Joined</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gsv-charcoal">Last Login</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gsv-charcoal">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gsv-charcoal">{user.name || "No Name"}</div>
                      <div className="text-sm text-gsv-gray">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(
                        user.role
                      )}`}
                    >
                      {user.role || "unknown"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                        user.status
                      )}`}
                    >
                      {user.status || "active"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gsv-gray space-y-1">
                      {user.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {user.phone}
                        </div>
                      )}
                      {user.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gsv-gray">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gsv-gray">
                      {user.last_login_at ? new Date(user.last_login_at).toLocaleDateString() : "Never"}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleUserClick(user)}
                        className="p-2 text-gsv-green hover:bg-green-50 rounded-lg transition"
                        title="View/Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12 text-gsv-gray">No users found matching your filters</div>
        )}
      </div>

      {/* Stats Summary */}
      <div className="grid md:grid-cols-5 gap-4">
        <StatCard label="Total Users" value={users.length} color="blue" />
        <StatCard label="Founders" value={users.filter((u) => u.role === "founder").length} color="purple" />
        <StatCard label="Interns" value={users.filter((u) => u.role === "intern").length} color="indigo" />
        <StatCard label="Volunteers" value={users.filter((u) => u.role === "volunteer").length} color="green" />
        <StatCard label="Active" value={users.filter((u) => u.status === "active").length} color="emerald" />
      </div>

      {/* Modals */}
      {showDetailsModal && selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={() => setShowDetailsModal(false)}
          onUpdate={handleUpdateUser}
        />
      )}

      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

const StatCard = ({ label, value, color }: { label: string; value: number; color: string }) => {
  const colorClasses: { [key: string]: string } = {
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    indigo: "bg-indigo-50 text-indigo-600",
    green: "bg-green-50 text-green-600",
    emerald: "bg-emerald-50 text-emerald-600",
  };

  return (
    <div className="card p-4">
      <div className="text-2xl font-bold text-gsv-charcoal mb-1">{value}</div>
      <div className="text-sm text-gsv-gray">{label}</div>
    </div>
  );
};

