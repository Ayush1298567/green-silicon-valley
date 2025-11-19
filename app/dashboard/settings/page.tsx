"use client";

import { useState, useEffect } from "react";
import { User, Bell, Palette, Shield, Eye, Settings as SettingsIcon, CheckCircle2 } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

// Import tab components
import ProfileTab from "@/components/settings/ProfileTab";
import NotificationsTab from "@/components/settings/NotificationsTab";
import AppearanceTab from "@/components/settings/AppearanceTab";
import AccountSecurityTab from "@/components/settings/AccountSecurityTab";
import PrivacyTab from "@/components/settings/PrivacyTab";
import RoleSpecificTab from "@/components/settings/RoleSpecificTab";

type UserRole = "founder" | "intern" | "volunteer" | "teacher";

interface UserData {
  role: UserRole;
  name: string;
  email: string;
}

const tabs = [
  { id: "profile", label: "Profile", icon: User, component: ProfileTab },
  { id: "notifications", label: "Notifications", icon: Bell, component: NotificationsTab },
  { id: "appearance", label: "Appearance", icon: Palette, component: AppearanceTab },
  { id: "security", label: "Security", icon: Shield, component: AccountSecurityTab },
  { id: "privacy", label: "Privacy", icon: Eye, component: PrivacyTab },
  { id: "role-specific", label: "Role Settings", icon: SettingsIcon, component: RoleSpecificTab },
];

export default function SettingsPage() {
  const supabase = createClientComponentClient();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: userRow } = await supabase
        .from("users")
        .select("name, email, role")
        .eq("id", session.user.id)
        .single();

      if (userRow) {
        setUserData({
          role: (userRow.role as UserRole) || "volunteer",
          name: userRow.name || "",
          email: userRow.email || ""
        });
      }
    } catch (err) {
      console.error("Error loading user data:", err);
      setError("Failed to load user data");
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = (message?: string) => {
    setSuccess(true);
    setError("");
    if (message) {
      // Could show toast notification here
      console.log("Success:", message);
    }
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setSuccess(false);
  };

  if (loading) {
    return (
      <div className="container py-14">
        <div className="text-center py-12 text-gsv-gray">Loading settings...</div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="container py-14">
        <div className="text-center py-12 text-red-600">Unable to load user data</div>
      </div>
    );
  }

  const ActiveTabComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="container py-14">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gsv-charcoal mb-2">Settings</h1>
          <p className="text-gsv-gray">
            Manage your account, preferences, and {userData.role} settings
          </p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-800">
            <CheckCircle2 className="w-5 h-5" />
            <span>Settings saved successfully!</span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            {error}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="card p-4">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? "bg-gsv-green text-white"
                          : "text-gsv-charcoal hover:bg-gray-100"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* User Info Card */}
            <div className="card p-4 mt-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-gsv-green rounded-full flex items-center justify-center mx-auto mb-3">
                  <User className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-medium text-gsv-charcoal">{userData.name}</h3>
                <p className="text-sm text-gsv-gray capitalize">{userData.role}</p>
                <p className="text-xs text-gsv-gray mt-1">{userData.email}</p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="card p-6">
              {ActiveTabComponent && (
                <ActiveTabComponent
                  userData={userData}
                  onSuccess={handleSuccess}
                  onError={handleError}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

