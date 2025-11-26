"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { ArrowLeft, UserPlus, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function CreateUserPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "teacher",
    subrole: "",
    department: "",
    phone: "",
    address: "",
    city: "",
    state: "CA",
    zip: "",
    school_affiliation: "",
    notes: "",
    send_invite: true
  });

  const supabase = createClientComponentClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.name || !formData.email) {
        throw new Error("Name and email are required");
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error("Please enter a valid email address");
      }

      // Get current user for audit trail
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        throw new Error("You must be logged in to create users");
      }

      // Check if user already exists
      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("email", formData.email)
        .single();

      if (existingUser) {
        throw new Error("A user with this email already exists");
      }

      // Generate a temporary password for manual creation
      const tempPassword = Math.random().toString(36).slice(-12) + "Temp!123";

      // Create auth user (this will send an email invite)
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: formData.email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          full_name: formData.name,
          role: formData.role
        }
      });

      if (authError) throw authError;

      // Create user record in our database
      const { error: dbError } = await supabase
        .from("users")
        .insert({
          id: authData.user.id,
          name: formData.name,
          email: formData.email,
          role: formData.role,
          subrole: formData.subrole || null,
          department: formData.department || null,
          phone: formData.phone || null,
          address: formData.address || null,
          city: formData.city || null,
          state: formData.state || null,
          zip: formData.zip || null,
          school_affiliation: formData.school_affiliation || null,
          notes: formData.notes || null,
          status: "active", // Manually created users are active immediately
          needs_approval: false, // No approval needed for manual creation
          approved_by: session.user.id,
          approved_at: new Date().toISOString(),
          user_category: formData.role === "teacher" ? "manual" : formData.role
        });

      if (dbError) throw dbError;

      // Send welcome email if requested
      if (formData.send_invite) {
        try {
          // This would integrate with your email service
          await supabase.from("notifications").insert({
            user_id: authData.user.id,
            notification_type: "account_created",
            title: "Welcome to Green Silicon Valley!",
            message: `Your account has been created successfully. You can now log in with your email address.`,
            action_url: "/dashboard",
            metadata: {
              created_by: session.user.id,
              role: formData.role
            }
          });
        } catch (emailError) {
          console.warn("Could not send welcome notification:", emailError);
        }
      }

      setSuccess(true);

      // Redirect after a delay
      setTimeout(() => {
        router.push("/admin/user-manager");
      }, 2000);

    } catch (error: any) {
      setError(error.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">User Created Successfully!</h2>
          <p className="text-gray-600 mb-6">
            The user account has been created and they will receive login instructions via email.
          </p>
          <p className="text-sm text-gray-500">
            Redirecting to user management...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
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
          <h1 className="text-3xl font-bold text-gray-900">Create New User</h1>
          <p className="text-gray-600 mt-2">Manually create a user account with immediate access</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Form */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="user@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role *</label>
                <select
                  value={formData.role}
                  onChange={(e) => handleInputChange("role", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="teacher">Teacher</option>
                  <option value="volunteer">Volunteer</option>
                  <option value="intern">Intern</option>
                  <option value="founder">Founder</option>
                </select>
              </div>

              {(formData.role === "intern" || formData.role === "volunteer") && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subrole</label>
                  <select
                    value={formData.subrole}
                    onChange={(e) => handleInputChange("subrole", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select subrole (optional)</option>
                    {formData.role === "intern" && (
                      <>
                        <option value="operations_intern">Operations Intern</option>
                        <option value="media_intern">Media Intern</option>
                        <option value="outreach_intern">Outreach Intern</option>
                      </>
                    )}
                    {formData.role === "volunteer" && (
                      <>
                        <option value="team_lead">Team Lead</option>
                        <option value="content_creator">Content Creator</option>
                        <option value="event_coordinator">Event Coordinator</option>
                      </>
                    )}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                <select
                  value={formData.department}
                  onChange={(e) => handleInputChange("department", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select department (optional)</option>
                  <option value="Technology">Technology</option>
                  <option value="Operations">Operations</option>
                  <option value="Outreach">Outreach</option>
                  <option value="Media">Media</option>
                  <option value="Executive">Executive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="(555) 123-4567"
                />
              </div>

              {/* Address Information */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Address Information</h3>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="123 Main Street"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="City"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                <select
                  value={formData.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="CA">California</option>
                  <option value="NV">Nevada</option>
                  <option value="AZ">Arizona</option>
                  <option value="OR">Oregon</option>
                  <option value="WA">Washington</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                <input
                  type="text"
                  value={formData.zip}
                  onChange={(e) => handleInputChange("zip", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="12345"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">School Affiliation</label>
                <input
                  type="text"
                  value={formData.school_affiliation}
                  onChange={(e) => handleInputChange("school_affiliation", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="School name"
                />
              </div>

              {/* Additional Information */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h3>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Any additional notes about this user..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.send_invite}
                    onChange={(e) => handleInputChange("send_invite", e.target.checked.toString())}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Send welcome notification to user
                  </span>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  * Required fields
                </p>
                <div className="flex gap-3">
                  <Link
                    href="/admin/user-manager"
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                        Creating User...
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Create User
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
