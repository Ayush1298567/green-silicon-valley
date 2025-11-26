"use client";

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, Users, Heart, Lightbulb, Target } from 'lucide-react';
import Link from 'next/link';
import DynamicFormRenderer from '@/components/forms/DynamicFormRenderer';
import { toast } from 'sonner';

export default function VolunteerSignupPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<'info' | 'form'>('info');

  // For now, we'll use a hardcoded form ID. In production, this would be configured
  const volunteerFormId = 'volunteer-signup-form';

  const handleFormSubmit = async (data: any) => {
    setLoading(true);
    try {
      const response = await fetch('/api/forms/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formId: volunteerFormId,
          responses: data
        }),
      });

      if (response.ok) {
        toast.success('Volunteer application submitted successfully!');
        router.push('/get-involved/volunteer/thank-you');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Submission failed');
      }
    } catch (error: any) {
      toast.error('Failed to submit volunteer application');
      console.error('Submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (currentStep === 'info') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <section className="bg-gradient-to-br from-gsv-green via-gsv-greenDark to-gsv-slate-900 text-white py-16">
          <div className="container">
            <div className="max-w-4xl mx-auto text-center">
              <Link
                href="/get-involved"
                className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Get Involved
              </Link>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Join Our Volunteer Team
              </h1>
              <p className="text-xl md:text-2xl text-white/90 mb-8">
                Help us bring environmental STEM education to schools across the Bay Area
              </p>
            </div>
          </div>
        </section>

        {/* What We Do Section */}
        <section className="py-16 bg-white">
          <div className="container">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">What You'll Do</h2>
                <p className="text-lg text-gray-600">
                  As a volunteer, you'll play a crucial role in our mission to make environmental STEM education accessible to all students.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gsv-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-gsv-green" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Present to Classes</h3>
                  <p className="text-gray-600">
                    Deliver engaging presentations about environmental science and sustainability to elementary and middle school students.
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-gsv-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-8 h-8 text-gsv-green" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Support Schools</h3>
                  <p className="text-gray-600">
                    Partner with teachers to develop curriculum materials and provide ongoing support for environmental education initiatives.
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-gsv-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lightbulb className="w-8 h-8 text-gsv-green" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Share Your Passion</h3>
                  <p className="text-gray-600">
                    Use your knowledge and enthusiasm to inspire the next generation of environmental leaders and innovators.
                  </p>
                </div>
              </div>

              <div className="bg-gsv-green/5 rounded-lg p-8">
                <div className="flex items-start gap-4">
                  <Target className="w-6 h-6 text-gsv-green mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Our Impact</h3>
                    <p className="text-gray-600 mb-4">
                      In the past year, our volunteers have:
                    </p>
                    <ul className="text-gray-600 space-y-1">
                      <li>• Presented to over 2,000 students across 25 schools</li>
                      <li>• Developed 15 new curriculum modules</li>
                      <li>• Trained 50+ educators in environmental STEM teaching</li>
                      <li>• Created partnerships with 10 local environmental organizations</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Application Process */}
        <section className="py-16 bg-gray-50">
          <div className="container">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Application Process</h2>
                <p className="text-lg text-gray-600">
                  Joining our team is straightforward and rewarding
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8 mb-12">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gsv-green text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                    1
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Apply Online</h3>
                  <p className="text-gray-600">
                    Fill out our volunteer application form with your background and interests.
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-gsv-green text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                    2
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Review & Approval</h3>
                  <p className="text-gray-600">
                    Our team reviews applications within 1-3 business days and follows up with approved volunteers.
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-gsv-green text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                    3
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Get Started</h3>
                  <p className="text-gray-600">
                    Complete training and begin presenting to schools in your area.
                  </p>
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={() => setCurrentStep('form')}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-gsv-green text-white rounded-lg hover:bg-gsv-greenDark transition-colors font-semibold text-lg"
                >
                  Start Your Application
                  <CheckCircle className="w-5 h-5" />
                </button>
                <p className="text-sm text-gray-500 mt-4">
                  Takes about 5-10 minutes to complete
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Form step
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => setCurrentStep('info')}
              className="flex items-center gap-2 text-gsv-green hover:text-gsv-greenDark mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Information
            </button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Volunteer Application</h1>
            <p className="text-gray-600">Join our team of environmental STEM educators</p>
          </div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-lg shadow-lg overflow-hidden"
          >
            <DynamicFormRenderer
              formId={volunteerFormId}
              onSubmit={handleFormSubmit}
              loading={loading}
              submitButtonText="Submit Volunteer Application"
            />
          </motion.div>

          {/* Help Text */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Need Help?</h3>
            <p className="text-blue-800 mb-4">
              If you have questions about volunteering or need assistance with your application,
              we're here to help!
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="mailto:volunteer@greensiliconvalley.org"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                volunteer@greensiliconvalley.org
              </a>
              <span className="text-blue-600">•</span>
              <a
                href="tel:555-123-4567"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                (555) 123-4567
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
