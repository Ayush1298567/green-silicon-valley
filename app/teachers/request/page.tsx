"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle, AlertCircle, Loader2, Calendar, Users, Clock } from "lucide-react";
import { toast } from "sonner";

interface FormData {
  teacherName: string;
  email: string;
  phone: string;
  schoolName: string;
  schoolDistrict: string;
  gradeLevels: string[];
  preferredTopics: string[];
  preferredDates: string;
  studentCount: string;
  specialRequirements: string;
  presentationHistory: string;
}

const gradeLevelOptions = [
  "Elementary (K-5)",
  "Middle School (6-8)",
  "High School (9-12)"
];

const topicOptions = [
  "Climate Change & Global Warming",
  "Renewable Energy Solutions",
  "Biodiversity & Conservation",
  "Sustainable Living Practices",
  "Environmental STEM Careers",
  "Local Environmental Issues",
  "Ocean & Marine Conservation",
  "Waste Management & Recycling"
];

export default function TeacherRequestPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    teacherName: "",
    email: "",
    phone: "",
    schoolName: "",
    schoolDistrict: "",
    gradeLevels: [],
    preferredTopics: [],
    preferredDates: "",
    studentCount: "",
    specialRequirements: "",
    presentationHistory: ""
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.teacherName.trim()) newErrors.teacherName = "Teacher name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.schoolName.trim()) newErrors.schoolName = "School name is required";
    if (formData.gradeLevels.length === 0) newErrors.gradeLevels = "Please select at least one grade level";
    if (formData.preferredTopics.length === 0) newErrors.preferredTopics = "Please select at least one topic";
    if (!formData.preferredDates.trim()) newErrors.preferredDates = "Preferred dates are required";

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGradeLevelChange = (gradeLevel: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      gradeLevels: checked
        ? [...prev.gradeLevels, gradeLevel]
        : prev.gradeLevels.filter(g => g !== gradeLevel)
    }));
  };

  const handleTopicChange = (topic: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      preferredTopics: checked
        ? [...prev.preferredTopics, topic]
        : prev.preferredTopics.filter(t => t !== topic)
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
      const response = await fetch('/api/forms/teacher', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Request submitted successfully!");
        router.push('/teachers?submitted=true');
      } else {
        toast.error(data.error || "Failed to submit request");
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
            href="/teachers"
            className="inline-flex items-center gap-2 text-gsv-green hover:text-gsv-greenDark mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Teachers
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Request a Presentation</h1>
          <p className="text-gray-600">
            Bring environmental STEM education to your classroom. Our student volunteers
            deliver engaging presentations on climate science, renewable energy, and sustainability.
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 text-center shadow-sm">
            <Calendar className="w-8 h-8 text-gsv-green mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Flexible Scheduling</h3>
            <p className="text-sm text-gray-600">Presentations available weekdays and weekends</p>
          </div>
          <div className="bg-white rounded-lg p-6 text-center shadow-sm">
            <Users className="w-8 h-8 text-gsv-green mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Expert Presenters</h3>
            <p className="text-sm text-gray-600">High school and college students trained in environmental science</p>
          </div>
          <div className="bg-white rounded-lg p-6 text-center shadow-sm">
            <Clock className="w-8 h-8 text-gsv-green mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">45-90 Minutes</h3>
            <p className="text-sm text-gray-600">Interactive presentations with Q&A sessions</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8 space-y-6">
          {/* Teacher Information */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Teacher Information</h2>

            <div>
              <label htmlFor="teacherName" className="block text-sm font-medium text-gray-700 mb-1">
                Teacher Name *
              </label>
              <input
                type="text"
                id="teacherName"
                value={formData.teacherName}
                onChange={(e) => handleChange('teacherName', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gsv-green focus:border-transparent ${
                  errors.teacherName ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter your full name"
              />
              {errors.teacherName && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.teacherName}
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
                placeholder="your.email@school.edu"
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
          </div>

          {/* School Information */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">School Information</h2>

            <div>
              <label htmlFor="schoolName" className="block text-sm font-medium text-gray-700 mb-1">
                School Name *
              </label>
              <input
                type="text"
                id="schoolName"
                value={formData.schoolName}
                onChange={(e) => handleChange('schoolName', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gsv-green focus:border-transparent ${
                  errors.schoolName ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter your school name"
              />
              {errors.schoolName && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.schoolName}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="schoolDistrict" className="block text-sm font-medium text-gray-700 mb-1">
                School District
              </label>
              <input
                type="text"
                id="schoolDistrict"
                value={formData.schoolDistrict}
                onChange={(e) => handleChange('schoolDistrict', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gsv-green focus:border-transparent"
                placeholder="Enter your school district"
              />
            </div>

            <div>
              <label htmlFor="studentCount" className="block text-sm font-medium text-gray-700 mb-1">
                Approximate Number of Students
              </label>
              <select
                id="studentCount"
                value={formData.studentCount}
                onChange={(e) => handleChange('studentCount', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gsv-green focus:border-transparent"
              >
                <option value="">Select class size</option>
                <option value="1-20">1-20 students</option>
                <option value="21-40">21-40 students</option>
                <option value="41-60">41-60 students</option>
                <option value="61-100">61-100 students</option>
                <option value="100+">100+ students</option>
              </select>
            </div>
          </div>

          {/* Presentation Details */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Presentation Details</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grade Levels *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {gradeLevelOptions.map(gradeLevel => (
                  <label key={gradeLevel} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.gradeLevels.includes(gradeLevel)}
                      onChange={(e) => handleGradeLevelChange(gradeLevel, e.target.checked)}
                      className="w-4 h-4 text-gsv-green border-gray-300 rounded focus:ring-gsv-green"
                    />
                    <span className="text-sm text-gray-700">{gradeLevel}</span>
                  </label>
                ))}
              </div>
              {errors.gradeLevels && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.gradeLevels}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Topics *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {topicOptions.map(topic => (
                  <label key={topic} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.preferredTopics.includes(topic)}
                      onChange={(e) => handleTopicChange(topic, e.target.checked)}
                      className="w-4 h-4 text-gsv-green border-gray-300 rounded focus:ring-gsv-green"
                    />
                    <span className="text-sm text-gray-700">{topic}</span>
                  </label>
                ))}
              </div>
              {errors.preferredTopics && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.preferredTopics}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="preferredDates" className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Dates *
              </label>
              <textarea
                id="preferredDates"
                value={formData.preferredDates}
                onChange={(e) => handleChange('preferredDates', e.target.value)}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gsv-green focus:border-transparent ${
                  errors.preferredDates ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Please list your preferred dates and times (e.g., Monday afternoons in March, or specific dates like March 15, April 2, etc.)"
              />
              {errors.preferredDates && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.preferredDates}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="specialRequirements" className="block text-sm font-medium text-gray-700 mb-1">
                Special Requirements or Accommodations
              </label>
              <textarea
                id="specialRequirements"
                value={formData.specialRequirements}
                onChange={(e) => handleChange('specialRequirements', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gsv-green focus:border-transparent"
                placeholder="Any special accommodations needed, room setup requirements, or other notes..."
              />
            </div>

            <div>
              <label htmlFor="presentationHistory" className="block text-sm font-medium text-gray-700 mb-1">
                Previous Environmental Education Experience
              </label>
              <textarea
                id="presentationHistory"
                value={formData.presentationHistory}
                onChange={(e) => handleChange('presentationHistory', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gsv-green focus:border-transparent"
                placeholder="Have you hosted environmental presentations before? Any specific topics or speakers you'd like to avoid or repeat?"
              />
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
                  Submitting Request...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Submit Presentation Request
                </>
              )}
            </button>
            <p className="text-sm text-gray-500 text-center mt-3">
              We'll review your request and contact you within 5-7 business days to schedule your presentation.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}