"use client";

import { useState, useEffect } from "react";
import { User, Mail, Phone, MapPin, Globe, Camera, Save } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface ProfileTabProps {
  userData: {
    role: string;
    name: string;
    email: string;
  };
  onSuccess: (message?: string) => void;
  onError: (error: string) => void;
}

interface ProfileData {
  name: string;
  email: string;
  bio: string;
  phone: string;
  phone_secondary: string;
  avatar_url: string;
  social_links: Record<string, string>;
  last_login_at: string;
}

export default function ProfileTab({ userData, onSuccess, onError }: ProfileTabProps) {
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    name: "",
    email: "",
    bio: "",
    phone: "",
    phone_secondary: "",
    avatar_url: "",
    social_links: {},
    last_login_at: ""
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: profileData } = await supabase
        .from("users")
        .select("name, email, bio, phone, phone_secondary, avatar_url, social_links, last_login_at")
        .eq("id", session.user.id)
        .single();

      if (profileData) {
        setProfile({
          name: profileData.name || "",
          email: profileData.email || "",
          bio: profileData.bio || "",
          phone: profileData.phone || "",
          phone_secondary: profileData.phone_secondary || "",
          avatar_url: profileData.avatar_url || "",
          social_links: profileData.social_links || {},
          last_login_at: profileData.last_login_at || ""
        });
      }
    } catch (err) {
      console.error("Error loading profile:", err);
      onError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        onError("Not authenticated");
        return;
      }

      const { error } = await supabase
        .from("users")
        .update({
          name: profile.name,
          bio: profile.bio || null,
          phone: profile.phone || null,
          phone_secondary: profile.phone_secondary || null,
          social_links: profile.social_links,
          updated_at: new Date().toISOString()
        })
        .eq("id", session.user.id);

      if (error) throw error;

      onSuccess("Profile updated successfully");
    } catch (err: any) {
      console.error("Error saving profile:", err);
      onError(err.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const updateSocialLink = (platform: string, value: string) => {
    setProfile({
      ...profile,
      social_links: {
        ...profile.social_links,
        [platform]: value
      }
    });
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="text-gsv-gray">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gsv-charcoal mb-2">Profile Settings</h2>
        <p className="text-gsv-gray">Manage your personal information and contact details</p>
      </div>

      {/* Profile Picture Section */}
      <div className="flex items-center gap-6 p-6 bg-gray-50 rounded-lg">
        <div className="relative">
          <div className="w-20 h-20 bg-gsv-green rounded-full flex items-center justify-center">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <User className="w-10 h-10 text-white" />
            )}
          </div>
          <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-gsv-green rounded-full flex items-center justify-center hover:bg-gsv-greenDark transition">
            <Camera className="w-4 h-4 text-white" />
          </button>
        </div>
        <div>
          <h3 className="font-medium text-gsv-charcoal">{profile.name || "Your Name"}</h3>
          <p className="text-sm text-gsv-gray">{profile.email}</p>
          <p className="text-xs text-gsv-gray mt-1">
            Last login: {profile.last_login_at ? new Date(profile.last_login_at).toLocaleDateString() : "Never"}
          </p>
        </div>
      </div>

      {/* Basic Information */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gsv-charcoal">Basic Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gsv-charcoal mb-2">
              Full Name *
            </label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gsv-green"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gsv-charcoal mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gsv-gray" />
              <input
                type="email"
                value={profile.email}
                disabled
                className="w-full pl-10 border rounded-lg px-3 py-2 bg-gray-50 text-gray-500"
              />
            </div>
            <p className="text-xs text-gsv-gray mt-1">Email cannot be changed</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gsv-charcoal mb-2">
            Bio
          </label>
          <textarea
            value={profile.bio}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            rows={3}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gsv-green"
            placeholder="Tell us about yourself..."
            maxLength={500}
          />
          <p className="text-xs text-gsv-gray mt-1">{profile.bio.length}/500 characters</p>
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gsv-charcoal">Contact Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gsv-charcoal mb-2">
              Primary Phone
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gsv-gray" />
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full pl-10 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gsv-green"
                placeholder="(555) 123-4567"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gsv-charcoal mb-2">
              Secondary Phone
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gsv-gray" />
              <input
                type="tel"
                value={profile.phone_secondary}
                onChange={(e) => setProfile({ ...profile, phone_secondary: e.target.value })}
                className="w-full pl-10 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gsv-green"
                placeholder="(555) 123-4567"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Social Links */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gsv-charcoal">Social Links</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gsv-charcoal mb-2">
              LinkedIn
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gsv-gray" />
              <input
                type="url"
                value={profile.social_links.linkedin || ""}
                onChange={(e) => updateSocialLink("linkedin", e.target.value)}
                className="w-full pl-10 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gsv-green"
                placeholder="https://linkedin.com/in/yourprofile"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gsv-charcoal mb-2">
              Twitter
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gsv-gray" />
              <input
                type="url"
                value={profile.social_links.twitter || ""}
                onChange={(e) => updateSocialLink("twitter", e.target.value)}
                className="w-full pl-10 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gsv-green"
                placeholder="https://twitter.com/yourhandle"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gsv-charcoal mb-2">
              Website
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gsv-gray" />
              <input
                type="url"
                value={profile.social_links.website || ""}
                onChange={(e) => updateSocialLink("website", e.target.value)}
                className="w-full pl-10 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gsv-green"
                placeholder="https://yourwebsite.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gsv-charcoal mb-2">
              GitHub
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gsv-gray" />
              <input
                type="url"
                value={profile.social_links.github || ""}
                onChange={(e) => updateSocialLink("github", e.target.value)}
                className="w-full pl-10 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gsv-green"
                placeholder="https://github.com/yourusername"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-6 border-t">
        <button
          onClick={handleSaveProfile}
          disabled={saving}
          className="px-6 py-3 bg-gsv-green text-white rounded-lg hover:bg-gsv-greenDark transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </div>
    </div>
  );
}
