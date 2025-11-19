"use client";

import { useState, useEffect } from "react";
import { Shield, Key, Smartphone, Monitor, AlertTriangle, Eye, EyeOff, Save, Trash2 } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface AccountSecurityTabProps {
  userData: {
    role: string;
    name: string;
    email: string;
  };
  onSuccess: (message?: string) => void;
  onError: (error: string) => void;
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface Session {
  id: string;
  device: string;
  location: string;
  ipAddress: string;
  lastActivity: string;
  createdAt: string;
}

export default function AccountSecurityTab({ userData, onSuccess, onError }: AccountSecurityTabProps) {
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [sessions, setSessions] = useState<Session[]>([]);
  const [passwordStrength, setPasswordStrength] = useState(0);

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    // Calculate password strength
    const password = passwordForm.newPassword;
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[@$!%*?&]/.test(password)) strength += 25;
    setPasswordStrength(strength);
  }, [passwordForm.newPassword]);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/settings/sessions");
      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions || []);
      }
    } catch (err) {
      console.error("Error loading sessions:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      onError("New passwords do not match");
      return;
    }

    if (passwordStrength < 75) {
      onError("Password is too weak. Please use a stronger password.");
      return;
    }

    try {
      setSaving(true);
      const response = await fetch("/api/settings/password/change", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });

      if (response.ok) {
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
        onSuccess("Password changed successfully");
      } else {
        const error = await response.json();
        onError(error.error || "Failed to change password");
      }
    } catch (err) {
      onError("Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/settings/sessions?sessionId=${sessionId}`, {
        method: "DELETE"
      });

      if (response.ok) {
        setSessions(sessions.filter(s => s.id !== sessionId));
        onSuccess("Session revoked successfully");
      } else {
        onError("Failed to revoke session");
      }
    } catch (err) {
      onError("Failed to revoke session");
    }
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 25) return "Very Weak";
    if (passwordStrength < 50) return "Weak";
    if (passwordStrength < 75) return "Fair";
    if (passwordStrength < 100) return "Good";
    return "Strong";
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 25) return "bg-red-500";
    if (passwordStrength < 50) return "bg-orange-500";
    if (passwordStrength < 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="text-gsv-gray">Loading security settings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gsv-charcoal mb-2">Account Security</h2>
        <p className="text-gsv-gray">Manage your password and account security settings</p>
      </div>

      {/* Password Change */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gsv-charcoal flex items-center gap-2">
          <Key className="w-5 h-5 text-gsv-green" />
          Change Password
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gsv-charcoal mb-2">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showPasswords ? "text" : "password"}
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                className="w-full pr-10 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gsv-green"
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => setShowPasswords(!showPasswords)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gsv-gray hover:text-gsv-charcoal"
              >
                {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gsv-charcoal mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPasswords ? "text" : "password"}
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="w-full pr-10 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gsv-green"
                placeholder="Enter new password"
              />
            </div>

            {passwordForm.newPassword && (
              <div className="mt-2">
                <div className="flex items-center gap-2 mb-1">
                  <div className="text-xs text-gsv-gray">Password Strength:</div>
                  <div className="text-xs font-medium">{getPasswordStrengthText()}</div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${getPasswordStrengthColor()}`}
                    style={{ width: `${passwordStrength}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gsv-gray mt-1">
                  Must include: 8+ chars, uppercase, lowercase, number, special character
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gsv-charcoal mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showPasswords ? "text" : "password"}
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                className="w-full pr-10 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gsv-green"
                placeholder="Confirm new password"
              />
            </div>
            {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
              <div className="text-xs text-red-600 mt-1">Passwords do not match</div>
            )}
          </div>

          <button
            onClick={handlePasswordChange}
            disabled={saving || !passwordForm.currentPassword || !passwordForm.newPassword || passwordForm.newPassword !== passwordForm.confirmPassword || passwordStrength < 75}
            className="px-4 py-2 bg-gsv-green text-white rounded-lg hover:bg-gsv-greenDark transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? "Changing..." : "Change Password"}
          </button>
        </div>
      </div>

      {/* Two-Factor Authentication */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gsv-charcoal flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-gsv-green" />
          Two-Factor Authentication
        </h3>

        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <div className="font-medium text-yellow-800">Coming Soon</div>
              <div className="text-sm text-yellow-700 mt-1">
                Two-factor authentication will be available in a future update to provide additional security for your account.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Sessions */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gsv-charcoal flex items-center gap-2">
          <Monitor className="w-5 h-5 text-gsv-green" />
          Active Sessions
        </h3>

        <div className="space-y-3">
          {sessions.length === 0 ? (
            <div className="text-center py-8 text-gsv-gray">
              No active sessions found
            </div>
          ) : (
            sessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Monitor className="w-5 h-5 text-gsv-gray" />
                  <div>
                    <div className="font-medium text-gsv-charcoal">{session.device}</div>
                    <div className="text-sm text-gsv-gray">
                      {session.location} • {session.ipAddress}
                    </div>
                    <div className="text-xs text-gsv-gray">
                      Last active: {new Date(session.lastActivity).toLocaleString()}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleRevokeSession(session.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition flex items-center gap-2"
                  title="Revoke session"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="text-sm">Revoke</span>
                </button>
              </div>
            ))
          )}
        </div>

        <div className="text-sm text-gsv-gray">
          These are sessions from other devices or browsers. Your current session is not shown here.
        </div>
      </div>

      {/* Security Recommendations */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-800 mb-2">Security Recommendations</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Use a strong, unique password</li>
          <li>• Enable two-factor authentication when available</li>
          <li>• Regularly review your active sessions</li>
          <li>• Avoid sharing your account credentials</li>
        </ul>
      </div>
    </div>
  );
}
