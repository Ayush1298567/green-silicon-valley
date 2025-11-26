"use client";

import { useState } from "react";
import { ArrowLeft, CheckCircle, MapPin, Users, Globe } from "lucide-react";
import Link from "next/link";
import ChapterApplicationForm from "@/components/chapters/ChapterApplicationForm";

export default function ChapterApplicationPage() {
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);

  const handleApplicationSubmit = () => {
    setApplicationSubmitted(true);
  };

  if (applicationSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Application Submitted!
            </h2>

            <p className="text-gray-600 mb-6">
              Thank you for your interest in starting a Green Silicon Valley chapter.
              Our team will review your application and get back to you within 1-2 weeks.
            </p>

            <div className="space-y-3">
              <p className="text-sm text-gray-500">
                What happens next?
              </p>
              <div className="text-left bg-gray-50 rounded-lg p-4 text-sm">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Application review (1-2 weeks)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                    <span>Initial consultation call</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                    <span>Onboarding and training</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                    <span>Official chapter launch</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <Link
                href="/chapters"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                <MapPin size={20} />
                Explore Existing Chapters
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Link
              href="/chapters"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft size={20} />
              Back to Chapters
            </Link>
          </div>

          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-3 bg-blue-100 rounded-full">
                <Globe className="w-12 h-12 text-blue-600" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Start a New Chapter
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Bring Green Silicon Valley to your community! We're looking for passionate
              individuals ready to make a difference in STEM education worldwide.
            </p>
          </div>
        </div>
      </div>

      {/* Requirements Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Application Form */}
          <div>
            <ChapterApplicationForm onSubmit={handleApplicationSubmit} />
          </div>

          {/* Requirements & Benefits */}
          <div className="space-y-8">
            {/* What We Look For */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">What We Look For</h2>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900">Passion for STEM Education</div>
                    <div className="text-sm text-gray-600">Commitment to inspiring the next generation</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900">Local Network</div>
                    <div className="text-sm text-gray-600">Connections with schools, universities, or tech communities</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900">Leadership Experience</div>
                    <div className="text-sm text-gray-600">Ability to organize and manage a volunteer team</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900">Time Commitment</div>
                    <div className="text-sm text-gray-600">5-10 hours per week to start the chapter</div>
                  </div>
                </div>
              </div>
            </div>

            {/* What We Provide */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Globe className="w-6 h-6 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">What We Provide</h2>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900">Complete Curriculum</div>
                    <div className="text-sm text-gray-600">Ready-to-use presentation materials and activities</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900">Training & Support</div>
                    <div className="text-sm text-gray-600">Comprehensive onboarding and ongoing mentorship</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900">Marketing Materials</div>
                    <div className="text-sm text-gray-600">Branding, social media templates, and promotional resources</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900">Community Access</div>
                    <div className="text-sm text-gray-600">Connect with leaders from other chapters worldwide</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Success Stories */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Success Stories</h2>

              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <div className="font-medium text-gray-900">"From 3 volunteers to 50 in 6 months"</div>
                  <div className="text-sm text-gray-600">Sarah K., Toronto Chapter Founder</div>
                </div>

                <div className="border-l-4 border-green-500 pl-4">
                  <div className="font-medium text-gray-900">"Transformed how we approach STEM education"</div>
                  <div className="text-sm text-gray-600">Dr. Miguel R., Mexico City Chapter</div>
                </div>

                <div className="border-l-4 border-purple-500 pl-4">
                  <div className="font-medium text-gray-900">"Created lasting partnerships with local schools"</div>
                  <div className="text-sm text-gray-600">Emma L., London Chapter Director</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
