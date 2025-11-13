"use client";
import { useState } from "react";
import { X, Save } from "lucide-react";
import { type UserRow } from "@/types/db";

interface UserDetailsModalProps {
  user: UserRow;
  onClose: () => void;
  onUpdate: (user: UserRow) => void;
}

export default function UserDetailsModal({ user, onClose, onUpdate }: UserDetailsModalProps) {
  const [formData, setFormData] = useState<UserRow>(user);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onUpdate(formData);
    setSaving(false);
  };

  const handleChange = (field: keyof UserRow, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gsv-charcoal">Edit User</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Basic Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gsv-charcoal mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name || ""}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gsv-charcoal mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email || ""}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green"
                  disabled
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gsv-charcoal mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone || ""}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green"
                />
              </div>
              <div>
                <label htmlFor="school_affiliation" className="block text-sm font-medium text-gsv-charcoal mb-1">
                  School Affiliation
                </label>
                <input
                  type="text"
                  id="school_affiliation"
                  value={formData.school_affiliation || ""}
                  onChange={(e) => handleChange("school_affiliation", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green"
                />
              </div>
            </div>
          </div>

          {/* Role & Status */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Role & Status</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gsv-charcoal mb-1">
                  Role
                </label>
                <select
                  id="role"
                  value={formData.role || "volunteer"}
                  onChange={(e) => handleChange("role", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green"
                >
                  <option value="founder">Founder</option>
                  <option value="intern">Intern</option>
                  <option value="volunteer">Volunteer</option>
                  <option value="teacher">Teacher</option>
                  <option value="partner">Partner</option>
                </select>
              </div>
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gsv-charcoal mb-1">
                  Status
                </label>
                <select
                  id="status"
                  value={formData.status || "active"}
                  onChange={(e) => handleChange("status", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>
          </div>

          {/* Profile Image */}
          <div>
            <label htmlFor="profile_image_url" className="block text-sm font-medium text-gsv-charcoal mb-1">
              Profile Image URL
            </label>
            <input
              type="url"
              id="profile_image_url"
              value={formData.profile_image_url || ""}
              onChange={(e) => handleChange("profile_image_url", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          {/* Metadata */}
          <div className="border-t pt-4">
            <h3 className="font-semibold text-lg mb-4">Account Information</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-gsv-gray">
              <div>
                <span className="font-medium">User ID:</span> {user.id}
              </div>
              <div>
                <span className="font-medium">Created:</span>{" "}
                {user.created_at ? new Date(user.created_at).toLocaleString() : "N/A"}
              </div>
              <div>
                <span className="font-medium">Last Updated:</span>{" "}
                {user.updated_at ? new Date(user.updated_at).toLocaleString() : "N/A"}
              </div>
              <div>
                <span className="font-medium">Last Login:</span>{" "}
                {user.last_login_at ? new Date(user.last_login_at).toLocaleString() : "Never"}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 border-t pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gsv-charcoal rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2 bg-gsv-green text-white rounded-lg hover:bg-gsv-green/90 transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

