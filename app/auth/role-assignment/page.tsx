"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  User,
  Briefcase,
  GraduationCap,
  Users,
  Crown,
  Building,
  ChevronRight,
  CheckCircle,
  Loader2,
  AlertCircle
} from "lucide-react";

interface RoleOption {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  requirements?: string[];
  benefits?: string[];
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    id: "intern",
    title: "Intern",
    description: "Join our team as a paid intern working on environmental technology projects",
    icon: GraduationCap,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    requirements: [
      "Currently enrolled in high school or college",
      "Interest in environmental science or technology",
      "Available for 10-20 hours per week",
      "Commitment for at least one semester"
    ],
    benefits: [
      "Paid internship opportunity",
      "Hands-on experience in environmental technology",
      "Mentorship from industry professionals",
      "Networking opportunities",
      "Potential for academic credit"
    ]
  },
  {
    id: "volunteer",
    title: "Volunteer",
    description: "Contribute your skills and time to support our environmental education mission",
    icon: Users,
    color: "text-green-600",
    bgColor: "bg-green-50",
    requirements: [
      "Interest in environmental education",
      "Available for regular volunteering",
      "Good communication skills",
      "Reliable and committed"
    ],
    benefits: [
      "Make a direct impact on environmental education",
      "Develop leadership and organizational skills",
      "Work with a dedicated team",
      "Flexible scheduling options",
      "Professional references available"
    ]
  },
  {
    id: "teacher",
    title: "Teacher",
    description: "Partner with us to bring environmental STEM education to your classroom",
    icon: User,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    requirements: [
      "Current teacher or educator",
      "Interest in STEM and environmental education",
      "Access to classrooms for presentations"
    ],
    benefits: [
      "Free environmental STEM presentations",
      "Curriculum resources and materials",
      "Professional development opportunities",
      "Networking with other educators",
      "Support for classroom implementation"
    ]
  },
  {
    id: "partner",
    title: "Partner Organization",
    description: "Collaborate with us on environmental education initiatives and programs",
    icon: Building,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    requirements: [
      "Non-profit or educational organization",
      "Shared mission in environmental education",
      "Capacity for collaboration"
    ],
    benefits: [
      "Joint program development",
      "Shared resources and expertise",
      "Increased community impact",
      "Networking opportunities",
      "Media and publicity support"
    ]
  }
];

export default function RoleAssignmentPage() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedSubrole, setSelectedSubrole] = useState<string>("");
  const [department, setDepartment] = useState<string>("");
  const [additionalInfo, setAdditionalInfo] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"selection" | "details" | "confirmation">("selection");

  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    checkCurrentUser();
  }, []);

  async function checkCurrentUser() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        router.push("/auth/login");
        return;
      }

      // Check if user already has a role assigned
      const { data: user } = await supabase
        .from("users")
        .select("role, status")
        .eq("id", session.user.id)
        .single();

      if (user?.role && user.role !== "guest" && user.status !== "pending_approval") {
        // User already has a role, redirect to dashboard
        router.push(getDashboardPath(user.role));
      }
    } catch (error) {
      console.error("Error checking user:", error);
    }
  }

  function getDashboardPath(role: string): string {
    switch (role) {
      case "founder":
        return "/dashboard/founder";
      case "intern":
        return "/dashboard/intern";
      case "volunteer":
        return "/dashboard/volunteer";
      case "teacher":
        return "/dashboard/teacher";
      default:
        return "/dashboard";
    }
  }

  async function submitRoleAssignment() {
    if (!selectedRole) return;

    setLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) throw new Error("Not authenticated");

      const updateData: any = {
        role: selectedRole,
        subrole: selectedSubrole || null,
        department: department || null,
        notes: additionalInfo || null,
        updated_at: new Date().toISOString()
      };

      // Check if role requires approval
      if (["intern", "volunteer"].includes(selectedRole)) {
        updateData.needs_approval = true;
        updateData.status = "pending_approval";
      } else {
        updateData.needs_approval = false;
        updateData.status = "active";
        updateData.approved_by = session.user.id; // Auto-approve teachers/partners
        updateData.approved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("users")
        .update(updateData)
        .eq("id", session.user.id);

      if (error) throw error;

      if (updateData.needs_approval) {
        router.push("/auth/pending-approval");
      } else {
        router.push(getDashboardPath(selectedRole));
      }

    } catch (error: any) {
      setError(error.message || "Failed to update your role");
    } finally {
      setLoading(false);
    }
  }

  function getSubroleOptions(roleId: string) {
    switch (roleId) {
      case "intern":
        return [
          { value: "", label: "Select your focus area" },
          { value: "operations_intern", label: "Operations & Administration" },
          { value: "media_intern", label: "Media & Communications" },
          { value: "outreach_intern", label: "Community Outreach" }
        ];
      case "volunteer":
        return [
          { value: "", label: "Select your interest area" },
          { value: "content_creator", label: "Content Creation" },
          { value: "event_coordinator", label: "Event Coordination" },
          { value: "mentor", label: "Mentorship & Support" }
        ];
      default:
        return [];
    }
  }

  if (step === "selection") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-4xl w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome to Green Silicon Valley!
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              To get started, please tell us how you'd like to get involved with our mission.
            </p>
          </div>

          {/* Role Selection Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {ROLE_OPTIONS.map((role) => {
              const Icon = role.icon;
              const isSelected = selectedRole === role.id;

              return (
                <div
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`relative p-6 rounded-lg border-2 cursor-pointer transition-all ${
                    isSelected
                      ? "border-blue-500 bg-blue-50 shadow-lg"
                      : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${role.bgColor}`}>
                      <Icon className={`w-6 h-6 ${role.color}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {role.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4">
                        {role.description}
                      </p>

                      {isSelected && (
                        <div className="space-y-3">
                          <div className="border-t pt-3">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Requirements:</h4>
                            <ul className="text-xs text-gray-600 space-y-1">
                              {role.requirements?.map((req, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                                  {req}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Benefits:</h4>
                            <ul className="text-xs text-gray-600 space-y-1">
                              {role.benefits?.map((benefit, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                                  {benefit}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <div className="absolute top-4 right-4">
                      <CheckCircle className="w-6 h-6 text-blue-500" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Continue Button */}
          {selectedRole && (
            <div className="flex justify-center">
              <button
                onClick={() => setStep("details")}
                className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Continue with {ROLE_OPTIONS.find(r => r.id === selectedRole)?.title}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (step === "details") {
    const selectedRoleData = ROLE_OPTIONS.find(r => r.id === selectedRole);
    const subroleOptions = getSubroleOptions(selectedRole!);

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-2xl w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Tell us more about yourself
            </h1>
            <p className="text-lg text-gray-600">
              Help us customize your experience as a {selectedRoleData?.title}
            </p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="space-y-6">
              {/* Subrole Selection */}
              {subroleOptions.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {selectedRole === "intern" ? "Focus Area" : "Interest Area"}
                  </label>
                  <select
                    value={selectedSubrole}
                    onChange={(e) => setSelectedSubrole(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {subroleOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Department */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department (Optional)
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select department</option>
                  <option value="Technology">Technology</option>
                  <option value="Operations">Operations</option>
                  <option value="Outreach">Community Outreach</option>
                  <option value="Media">Media & Communications</option>
                  <option value="Executive">Executive</option>
                </select>
              </div>

              {/* Additional Information */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tell us about your background and interests
                </label>
                <textarea
                  value={additionalInfo}
                  onChange={(e) => setAdditionalInfo(e.target.value)}
                  rows={4}
                  placeholder="Share any relevant experience, skills, or why you're interested in this role..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Approval Notice */}
              {["intern", "volunteer"].includes(selectedRole!) && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-yellow-800 mb-1">
                        Approval Required
                      </h4>
                      <p className="text-sm text-yellow-700">
                        Your application will be reviewed by our team. You'll receive an email notification
                        once a decision is made, typically within 1-3 business days.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <p className="text-red-800">{error}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-6 border-t">
                <button
                  onClick={() => setStep("selection")}
                  className="px-6 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  ← Back to Role Selection
                </button>

                <button
                  onClick={submitRoleAssignment}
                  disabled={loading}
                  className="px-8 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Complete Setup"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
