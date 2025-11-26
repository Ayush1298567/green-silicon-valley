"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Clock, Mail, Phone, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function PendingApprovalPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    checkUserStatus();
  }, []);

  async function checkUserStatus() {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user?.id) {
        router.push("/auth/login");
        return;
      }

      const { data: userData, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error) throw error;

      setUser(userData);

      // If user is no longer pending approval, redirect them
      if (userData.status !== "pending_approval") {
        const route = getRedirectRoute(userData.role, userData.status);
        router.push(route);
        return;
      }
    } catch (error) {
      console.error("Error checking user status:", error);
    } finally {
      setLoading(false);
    }
  }

  async function checkApprovalStatus() {
    setCheckingStatus(true);
    await checkUserStatus();
    setCheckingStatus(false);
  }

  function getRedirectRoute(role: string, status: string) {
    if (status === "active") {
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
    return "/dashboard";
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking your account status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center">
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Account Pending Approval
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Your account is being reviewed by our team
          </p>
        </div>

        {/* Status Card */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 bg-yellow-50 border-b border-yellow-200">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
              <h3 className="text-sm font-medium text-yellow-800">
                Review In Progress
              </h3>
            </div>
          </div>

          <div className="px-6 py-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <p className="mt-1 text-sm text-gray-900">{user?.name || "N/A"}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-sm text-gray-900">{user?.email || "N/A"}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <p className="mt-1 text-sm text-gray-900 capitalize">{user?.role || "N/A"}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Submitted</label>
                <p className="mt-1 text-sm text-gray-900">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Information */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              What happens next?
            </h3>

            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-700">
                    Our team reviews all {user?.role} applications to ensure the best fit for our program.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <Clock className="h-5 w-5 text-blue-500 mt-0.5" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-700">
                    Review typically takes 1-3 business days. You'll receive an email notification once a decision is made.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <Mail className="h-5 w-5 text-purple-500 mt-0.5" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-700">
                    If you have questions, feel free to contact us at{" "}
                    <a href="mailto:hello@greensiliconvalley.org" className="text-blue-600 hover:text-blue-800">
                      hello@greensiliconvalley.org
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <button
            onClick={checkApprovalStatus}
            disabled={checkingStatus}
            className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {checkingStatus ? (
              <>
                <RefreshCw className="animate-spin -ml-1 mr-2 h-4 w-4" />
                Checking Status...
              </>
            ) : (
              <>
                <RefreshCw className="-ml-1 mr-2 h-4 w-4" />
                Check Approval Status
              </>
            )}
          </button>

          <div className="text-center">
            <Link
              href="/"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              ← Back to Home
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500">
          <p>
            Green Silicon Valley - Environmental STEM Education
          </p>
        </div>
      </div>
    </div>
  );
}
