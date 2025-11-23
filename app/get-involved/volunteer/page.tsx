"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface FormData {
  name: string;
  email: string;
  phone: string;
  school: string;
  grade: string;
  interests: string[];
  availability: string[];
  experience: string;
  referral: string;
}

const interestOptions = [
  "Environmental Science",
  "STEM Education",
  "Community Outreach",
  "Event Planning",
  "Social Media",
  "Fundraising"
];

const availabilityOptions = [
  "Weekdays after school",
  "Weekends",
  "Summer break",
  "School holidays"
];

const gradeOptions = ["9th", "10th", "11th", "12th", "College", "Other"];

export default function VolunteerSignupPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    school: "",
    grade: "",
    interests: [],
    availability: [],
    experience: "",
    referral: ""
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.school.trim()) newErrors.school = "School is required";
    if (formData.interests.length === 0) newErrors.interests = "Please select at least one interest";
    if (formData.availability.length === 0) newErrors.availability = "Please select your availability";

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInterestChange = (interest: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      interests: checked
        ? [...prev.interests, interest]
        : prev.interests.filter(i => i !== interest)
    }));
  };

  const handleAvailabilityChange = (availability: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      availability: checked
        ? [...prev.availability, availability]
        : prev.availability.filter(a => a !== availability)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/forms/volunteer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Application submitted successfully!");
        router.push('/get-involved?submitted=true');
      } else {
        toast.error(data.error || "Failed to submit application");
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/get-involved"
            className="inline-flex items-center gap-2 text-gsv-green hover:text-gsv-greenDark mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Get Involved
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Become a Volunteer</h1>
          <p className="text-gray-600">
            Join our team of student leaders making a difference in environmental education.
            Fill out this form to start your journey with Green Silicon Valley.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8 space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gsv-green focus:border-transparent ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter your full name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gsv-green focus:border-transparent ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="your.email@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gsv-green focus:border-transparent"
                placeholder="(555) 123-4567"
              />
            </div>

            <div>
              <label htmlFor="school" className="block text-sm font-medium text-gray-700 mb-1">
                School/Organization *
              </label>
              <input
                type="text"
                id="school"
                value={formData.school}
                onChange={(e) => handleChange('school', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gsv-green focus:border-transparent ${
                  errors.school ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Your school or organization name"
              />
              {errors.school && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.school}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-1">
                Grade Level
              </label>
              <select
                id="grade"
                value={formData.grade}
                onChange={(e) => handleChange('grade', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gsv-green focus:border-transparent"
              >
                <option value="">Select your grade level</option>
                {gradeOptions.map(grade => (
                  <option key={grade} value={grade}>{grade} Grade</option>
                ))}
              </select>
            </div>
          </div>

          {/* Interests */}
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Areas of Interest *</h2>
              <p className="text-sm text-gray-600 mb-4">Select all areas you're interested in working on</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {interestOptions.map(interest => (
                  <label key={interest} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.interests.includes(interest)}
                      onChange={(e) => handleInterestChange(interest, e.target.checked)}
                      className="w-4 h-4 text-gsv-green border-gray-300 rounded focus:ring-gsv-green"
                    />
                    <span className="text-sm text-gray-700">{interest}</span>
                  </label>
                ))}
              </div>
              {errors.interests && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.interests}
                </p>
              )}
            </div>
          </div>

          {/* Availability */}
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Availability *</h2>
              <p className="text-sm text-gray-600 mb-4">When are you available to volunteer?</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {availabilityOptions.map(availability => (
                  <label key={availability} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.availability.includes(availability)}
                      onChange={(e) => handleAvailabilityChange(availability, e.target.checked)}
                      className="w-4 h-4 text-gsv-green border-gray-300 rounded focus:ring-gsv-green"
                    />
                    <span className="text-sm text-gray-700">{availability}</span>
                  </label>
                ))}
              </div>
              {errors.availability && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.availability}
                </p>
              )}
            </div>
          </div>

          {/* Experience */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Experience & Background</h2>

            <div>
              <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">
                Previous Volunteering Experience
              </label>
              <textarea
                id="experience"
                value={formData.experience}
                onChange={(e) => handleChange('experience', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gsv-green focus:border-transparent"
                placeholder="Tell us about any previous volunteering experience, especially related to education or environmental causes..."
              />
            </div>

            <div>
              <label htmlFor="referral" className="block text-sm font-medium text-gray-700 mb-1">
                How did you hear about us?
              </label>
              <select
                id="referral"
                value={formData.referral}
                onChange={(e) => handleChange('referral', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gsv-green focus:border-transparent"
              >
                <option value="">How did you find us?</option>
                <option value="school">School announcement</option>
                <option value="social_media">Social media</option>
                <option value="friend">Friend or family member</option>
                <option value="website">Our website</option>
                <option value="event">School event</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gsv-green text-white py-3 px-6 rounded-lg font-medium hover:bg-gsv-greenDark focus:ring-2 focus:ring-gsv-green focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting Application...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Submit Volunteer Application
                </>
              )}
            </button>
            <p className="text-sm text-gray-500 text-center mt-3">
              We'll review your application and get back to you within 3-5 business days.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
