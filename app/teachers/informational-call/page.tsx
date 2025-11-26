"use client";
import { useState } from "react";
import { Phone, Clock, CheckCircle, AlertCircle, Calendar, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface FormData {
  teacherName: string;
  email: string;
  phone: string;
  schoolName: string;
  preferredTime: string;
  notes: string;
}

export default function InformationalCallPage() {
  const [formData, setFormData] = useState<FormData>({
    teacherName: '',
    email: '',
    phone: '',
    schoolName: '',
    preferredTime: 'morning',
    notes: '',
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const timeOptions = [
    { value: 'morning', label: 'Morning (9 AM - 12 PM)', description: 'Best for detailed discussions' },
    { value: 'afternoon', label: 'Afternoon (1 PM - 5 PM)', description: 'Good for curriculum planning' },
    { value: 'flexible', label: 'Flexible', description: 'We\'ll work around your schedule' },
  ];

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.teacherName.trim()) {
      newErrors.teacherName = 'Teacher name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!formData.schoolName.trim()) {
      newErrors.schoolName = 'School name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/teachers/informational-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsSubmitted(true);
        toast.success('Informational call request submitted successfully!');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to submit request');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Request Submitted!</h2>
            <p className="text-gray-600 mb-6">
              Thank you for your interest in Green Silicon Valley. We'll contact you within 3-5 business days
              to schedule your informational call.
            </p>
            <div className="space-y-3">
              <Link
                href="/teachers/request"
                className="block w-full bg-gsv-green text-white py-3 px-4 rounded-lg hover:bg-gsv-greenDark transition-colors font-medium"
              >
                Request a Presentation Instead
              </Link>
              <Link
                href="/"
                className="block w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Return Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gsv-green via-gsv-greenDark to-gsv-slate-900 text-white py-20">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Schedule an Informational Call
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8">
              Learn more about bringing environmental STEM education to your classroom
            </p>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 max-w-2xl mx-auto">
              <p className="text-white/90">
                Have questions about our program? Want to learn how environmental education
                fits into your curriculum? Schedule a free informational call with our team.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-16">
        <div className="container">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Contact Information</h2>
                <p className="text-gray-600">
                  We'll use this information to schedule your call and follow up
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Teacher Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    value={formData.teacherName}
                    onChange={(e) => handleChange('teacherName', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-gsv-green focus:border-transparent ${
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

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-gsv-green focus:border-transparent ${
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

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-gsv-green focus:border-transparent ${
                      errors.phone ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="(555) 123-4567"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.phone}
                    </p>
                  )}
                </div>

                {/* School Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    School Name *
                  </label>
                  <input
                    type="text"
                    value={formData.schoolName}
                    onChange={(e) => handleChange('schoolName', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-gsv-green focus:border-transparent ${
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

                {/* Preferred Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Preferred Time for Call
                  </label>
                  <div className="space-y-3">
                    {timeOptions.map((option) => (
                      <label
                        key={option.value}
                        className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="preferredTime"
                          value={option.value}
                          checked={formData.preferredTime === option.value}
                          onChange={(e) => handleChange('preferredTime', e.target.value)}
                          className="mt-1 text-gsv-green focus:ring-gsv-green"
                        />
                        <div>
                          <div className="font-medium text-gray-900">{option.label}</div>
                          <div className="text-sm text-gray-600">{option.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes or Questions
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gsv-green focus:border-transparent"
                    placeholder="Tell us about your specific interests, curriculum needs, or any questions you have..."
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gsv-green text-white py-4 px-6 rounded-lg hover:bg-gsv-greenDark transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Phone className="w-5 h-5" />
                        Schedule My Call
                      </>
                    )}
                  </button>
                  <p className="text-xs text-gray-500 text-center mt-3">
                    We'll contact you within 3-5 business days to confirm a time that works for your schedule.
                  </p>
                </div>
              </form>
            </div>

            {/* Additional Info */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <MessageSquare className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">What to Expect</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• 30-minute conversation about our program</li>
                    <li>• Discussion of how environmental STEM fits your curriculum</li>
                    <li>• Answers to any questions about logistics or implementation</li>
                    <li>• Opportunity to request a presentation for your classroom</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gsv-green/5">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Prefer to Request a Presentation Directly?</h2>
            <p className="text-lg text-gray-600 mb-8">
              Skip the call and go straight to requesting environmental STEM education for your students
            </p>
            <Link
              href="/teachers/request"
              className="bg-gsv-green text-white px-8 py-3 rounded-lg hover:bg-gsv-greenDark transition-colors font-medium"
            >
              Request a Presentation
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
