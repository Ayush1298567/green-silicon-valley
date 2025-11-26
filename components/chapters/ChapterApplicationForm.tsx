"use client";

import { useState } from "react";
import { MapPin, Users, Mail, Phone, Globe, Send } from "lucide-react";

interface ChapterApplicationFormProps {
  onSubmit: () => void;
}

export default function ChapterApplicationForm({ onSubmit }: ChapterApplicationFormProps) {
  const [formData, setFormData] = useState({
    applicant_name: "",
    applicant_email: "",
    applicant_phone: "",
    proposed_location: "",
    proposed_country: "",
    motivation: "",
    experience: "",
    leadership_team: [] as string[],
    timeline: "",
    school_partners: "",
    community_partners: "",
    funding_sources: "",
    challenges: "",
    goals: ""
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const countries = [
    "USA", "Canada", "UK", "Germany", "France", "Spain", "Italy", "Japan",
    "Australia", "Brazil", "Mexico", "India", "China", "South Korea",
    "Netherlands", "Sweden", "Norway", "Denmark", "Finland", "Singapore",
    "New Zealand", "Ireland", "Belgium", "Austria", "Switzerland"
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const addLeadershipTeamMember = () => {
    setFormData(prev => ({
      ...prev,
      leadership_team: [...prev.leadership_team, ""]
    }));
  };

  const updateLeadershipTeamMember = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      leadership_team: prev.leadership_team.map((member, i) => i === index ? value : member)
    }));
  };

  const removeLeadershipTeamMember = (index: number) => {
    setFormData(prev => ({
      ...prev,
      leadership_team: prev.leadership_team.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.applicant_name.trim()) {
      newErrors.applicant_name = "Full name is required";
    }

    if (!formData.applicant_email.trim()) {
      newErrors.applicant_email = "Email address is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.applicant_email)) {
      newErrors.applicant_email = "Please enter a valid email address";
    }

    if (!formData.proposed_location.trim()) {
      newErrors.proposed_location = "Proposed location is required";
    }

    if (!formData.proposed_country) {
      newErrors.proposed_country = "Country selection is required";
    }

    if (!formData.motivation.trim()) {
      newErrors.motivation = "Please share your motivation for starting a chapter";
    }

    if (!formData.experience.trim()) {
      newErrors.experience = "Please describe your relevant experience";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const submissionData = {
        ...formData,
        leadership_team: formData.leadership_team.filter(member => member.trim() !== "")
      };

      const res = await fetch("/api/chapters/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      });

      const data = await res.json();

      if (data.ok) {
        onSubmit();
      } else {
        alert("Error submitting application: " + (data.error || "Unknown error"));
      }
    } catch (error: any) {
      alert("Error submitting application: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Chapter Application</h2>
        <p className="text-gray-600">
          Tell us about yourself and your vision for bringing Green Silicon Valley to your community.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Personal Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.applicant_name}
                onChange={(e) => handleInputChange("applicant_name", e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.applicant_name ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="Your full name"
              />
              {errors.applicant_name && (
                <p className="text-red-600 text-sm mt-1">{errors.applicant_name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={formData.applicant_email}
                  onChange={(e) => handleInputChange("applicant_email", e.target.value)}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.applicant_email ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="your.email@example.com"
                />
              </div>
              {errors.applicant_email && (
                <p className="text-red-600 text-sm mt-1">{errors.applicant_email}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="tel"
                value={formData.applicant_phone}
                onChange={(e) => handleInputChange("applicant_phone", e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>
        </div>

        {/* Chapter Location */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Chapter Location</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Proposed Location *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={formData.proposed_location}
                  onChange={(e) => handleInputChange("proposed_location", e.target.value)}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.proposed_location ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="City, State/Province"
                />
              </div>
              {errors.proposed_location && (
                <p className="text-red-600 text-sm mt-1">{errors.proposed_location}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country *
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <select
                  value={formData.proposed_country}
                  onChange={(e) => handleInputChange("proposed_country", e.target.value)}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.proposed_country ? "border-red-300" : "border-gray-300"
                  }`}
                >
                  <option value="">Select a country</option>
                  {countries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>
              {errors.proposed_country && (
                <p className="text-red-600 text-sm mt-1">{errors.proposed_country}</p>
              )}
            </div>
          </div>
        </div>

        {/* Leadership Team */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Leadership Team</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Team Members
            </label>
            <p className="text-sm text-gray-600 mb-3">
              Who else will be helping you start and run this chapter?
            </p>

            {formData.leadership_team.map((member, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <div className="relative flex-1">
                  <Users className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={member}
                    onChange={(e) => updateLeadershipTeamMember(index, e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Team member name and role"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeLeadershipTeamMember(index)}
                  className="px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg"
                >
                  Remove
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addLeadershipTeamMember}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              + Add Team Member
            </button>
          </div>
        </div>

        {/* Motivation & Experience */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Your Vision & Experience</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Why do you want to start a Green Silicon Valley chapter? *
            </label>
            <textarea
              value={formData.motivation}
              onChange={(e) => handleInputChange("motivation", e.target.value)}
              rows={4}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.motivation ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="What motivates you to bring STEM education to your community?"
            />
            {errors.motivation && (
              <p className="text-red-600 text-sm mt-1">{errors.motivation}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Relevant Experience *
            </label>
            <textarea
              value={formData.experience}
              onChange={(e) => handleInputChange("experience", e.target.value)}
              rows={4}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.experience ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="Describe your experience with STEM education, community organizing, or leadership"
            />
            {errors.experience && (
              <p className="text-red-600 text-sm mt-1">{errors.experience}</p>
            )}
          </div>
        </div>

        {/* Additional Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Additional Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expected Timeline
              </label>
              <select
                value={formData.timeline}
                onChange={(e) => handleInputChange("timeline", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select timeline</option>
                <option value="immediate">Ready to start immediately</option>
                <option value="1-3_months">Within 1-3 months</option>
                <option value="3-6_months">Within 3-6 months</option>
                <option value="6+_months">6+ months from now</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Potential Challenges
              </label>
              <input
                type="text"
                value={formData.challenges}
                onChange={(e) => handleInputChange("challenges", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Any anticipated challenges?"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Partnership Goals
            </label>
            <textarea
              value={formData.goals}
              onChange={(e) => handleInputChange("goals", e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="What are your goals for partnerships with schools and community organizations?"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-6 border-t">
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Submitting Application...
              </>
            ) : (
              <>
                <Send size={20} />
                Submit Chapter Application
              </>
            )}
          </button>

          <p className="text-sm text-gray-600 text-center mt-3">
            By submitting this application, you agree to our terms and conditions.
            We'll review your application within 1-2 weeks.
          </p>
        </div>
      </form>
    </div>
  );
}
