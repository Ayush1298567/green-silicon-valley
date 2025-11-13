"use client";
import { useState } from "react";
import { X, UserPlus } from "lucide-react";

interface CreateUserModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateUserModal({ onClose, onSuccess }: CreateUserModalProps) {
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    role: "volunteer" as "founder" | "intern" | "volunteer" | "teacher" | "partner",
    phone: "",
    school_affiliation: "",
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setCreating(true);

    try {
      const res = await fetch("/api/users/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        onSuccess();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to create user");
      }
    } catch (err) {
      setError("An error occurred while creating the user");
    } finally {
      setCreating(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
        {/* Header */}
        <div className="border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gsv-charcoal">Create New User</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="create-name" className="block text-sm font-medium text-gsv-charcoal mb-1">
              Full Name *
            </label>
            <input
              type="text"
              id="create-name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green"
              required
            />
          </div>

          <div>
            <label htmlFor="create-email" className="block text-sm font-medium text-gsv-charcoal mb-1">
              Email Address *
            </label>
            <input
              type="email"
              id="create-email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green"
              required
            />
          </div>

          <div>
            <label htmlFor="create-role" className="block text-sm font-medium text-gsv-charcoal mb-1">
              Role *
            </label>
            <select
              id="create-role"
              value={formData.role}
              onChange={(e) => handleChange("role", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green"
            >
              <option value="volunteer">Volunteer</option>
              <option value="intern">Intern</option>
              <option value="teacher">Teacher</option>
              <option value="partner">Partner</option>
              <option value="founder">Founder</option>
            </select>
          </div>

          <div>
            <label htmlFor="create-phone" className="block text-sm font-medium text-gsv-charcoal mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              id="create-phone"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green"
            />
          </div>

          <div>
            <label htmlFor="create-school" className="block text-sm font-medium text-gsv-charcoal mb-1">
              School Affiliation
            </label>
            <input
              type="text"
              id="create-school"
              value={formData.school_affiliation}
              onChange={(e) => handleChange("school_affiliation", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gsv-charcoal rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="inline-flex items-center gap-2 px-6 py-2 bg-gsv-green text-white rounded-lg hover:bg-gsv-green/90 transition disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              {creating ? "Creating..." : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

