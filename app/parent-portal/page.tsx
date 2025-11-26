"use client";

import { useState } from "react";
import { Shield, Eye, EyeOff, FileText, CheckCircle, AlertTriangle, Lock } from "lucide-react";
import ParentPortal from "@/components/safety/ParentPortal";
import ConsentFormManager from "@/components/safety/ConsentFormManager";
import PrivacyControls from "@/components/safety/PrivacyControls";

export default function ParentPortalPage() {
  const [activeTab, setActiveTab] = useState<"portal" | "consent" | "privacy">("portal");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessCode, setAccessCode] = useState("");

  const handleAuthentication = (code: string) => {
    // In a real implementation, this would validate against the database
    if (code.length === 8) {
      setIsAuthenticated(true);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Parent/Guardian Portal
            </h1>

            <p className="text-gray-600 mb-6">
              Access your child's STEM education records and manage privacy settings.
              Please enter the access code provided by your child's school.
            </p>

            <form onSubmit={(e) => { e.preventDefault(); handleAuthentication(accessCode); }}>
              <div className="mb-4">
                <input
                  type="text"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                  placeholder="Enter 8-digit access code"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-lg font-mono tracking-wider focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  maxLength={8}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={accessCode.length !== 8}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Access Portal
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <Lock className="w-4 h-4" />
                <span>Secure & Private</span>
              </div>
              <p className="text-xs text-gray-500">
                All information is encrypted and protected by privacy laws including COPPA and FERPA.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Parent/Guardian Portal</h1>
                <p className="text-sm text-gray-600">Manage your child's STEM education privacy and access</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">Sarah Johnson</div>
                <div className="text-xs text-gray-600">Parent of Emma Johnson</div>
              </div>
              <button
                onClick={() => setIsAuthenticated(false)}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Security Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-yellow-800">Privacy & Security Notice</h3>
              <p className="text-sm text-yellow-700 mt-1">
                This portal contains sensitive student information. All access is logged and monitored
                to ensure compliance with privacy laws including COPPA and FERPA.
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab("portal")}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === "portal"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Eye className="w-4 h-4 inline mr-2" />
                View Records
              </button>
              <button
                onClick={() => setActiveTab("consent")}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === "consent"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <FileText className="w-4 h-4 inline mr-2" />
                Consent Forms
              </button>
              <button
                onClick={() => setActiveTab("privacy")}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === "privacy"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Shield className="w-4 h-4 inline mr-2" />
                Privacy Settings
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          {activeTab === "portal" && <ParentPortal />}
          {activeTab === "consent" && <ConsentFormManager />}
          {activeTab === "privacy" && <PrivacyControls />}
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200 text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-2">
            <Shield className="w-4 h-4" />
            <span>Protected by Enterprise-Grade Security</span>
          </div>
          <p className="text-xs text-gray-500">
            For support, contact your child's school administration or call our privacy hotline at 1-800-PRIVACY.
          </p>
        </div>
      </div>
    </div>
  );
}
