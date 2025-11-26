"use client";
import Link from "next/link";
import { ArrowRight, Users, School, Presentation, CheckCircle, Sparkles, Clock, Target } from "lucide-react";

export default function StartHerePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gsv-green/5 via-white to-gsv-green/5">
      {/* Hero Section */}
      <section className="pt-20 pb-16">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-gsv-green/10 text-gsv-green px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Welcome to Green Silicon Valley
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Ready to Make an Impact?
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Student-led nonprofit empowering environmental STEM education through peer-to-peer presentations.
              In under a minute, here&apos;s everything you need to know.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Overview */}
      <section className="pb-16">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-gsv-green rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Who We Are</h3>
                <p className="text-gray-600">High school students delivering environmental education to local classrooms</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gsv-green rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Our Mission</h3>
                <p className="text-gray-600">Empower the next generation of environmental leaders through hands-on STEM learning</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gsv-green rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Our Impact</h3>
                <p className="text-gray-600">Reached 500+ students with climate science education in the past year</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">What We Do</h2>
              <p className="text-lg text-gray-600">
                We connect trained high school volunteers with local classrooms
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-8 mb-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">For Students:</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-gsv-green flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Learn about climate change, renewable energy, and environmental solutions</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-gsv-green flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Participate in hands-on activities and experiments</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-gsv-green flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Engage with real-world environmental challenges</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-gsv-green flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Develop critical thinking about sustainability</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">For Schools:</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-gsv-green flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Free, expert-led environmental education</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-gsv-green flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">NGSS-aligned curriculum and standards</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-gsv-green flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Interactive presentations with Q&A</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-gsv-green flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Follow-up resources and materials</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Get Involved Section */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Get Involved</h2>
              <p className="text-lg text-gray-600">
                Choose how you&apos;d like to participate
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="bg-white rounded-xl shadow-sm p-8 text-center hover:shadow-md transition-shadow">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Become a Volunteer</h3>
                <p className="text-gray-600 mb-4">
                  Join a team of high school students delivering environmental education presentations
                </p>
                <Link
                  href="/get-involved/volunteer"
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Apply Now
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-8 text-center hover:shadow-md transition-shadow">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <School className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Request for Your School</h3>
                <p className="text-gray-600 mb-4">
                  Bring environmental STEM education to your classroom with a free presentation
                </p>
                <Link
                  href="/teachers/request"
                  className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  Request Presentation
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-8 text-center hover:shadow-md transition-shadow">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Presentation className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Support Our Mission</h3>
                <p className="text-gray-600 mb-4">
                  Help us expand environmental education through donations and partnerships
                </p>
                <Link
                  href="/donate"
                  className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
                >
                  Donate Today
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="bg-gsv-green/5 border border-gsv-green/20 rounded-xl p-8 text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Not Sure Where to Start?</h3>
              <p className="text-gray-600 mb-6">
                Check out our detailed guides to understand the process better
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/how-it-works"
                  className="bg-gsv-green text-white px-6 py-3 rounded-lg font-medium hover:bg-gsv-greenDark transition-colors"
                >
                  How It Works
                </Link>
                <Link
                  href="/faq"
                  className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  View FAQ
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">What to Expect</h2>
              <p className="text-lg text-gray-600">
                A typical engagement timeline
              </p>
            </div>

            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gsv-green rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-semibold">1</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Initial Contact</h3>
                  <p className="text-gray-600">Submit your request or application through our website</p>
                  <p className="text-sm text-gray-500 mt-1">Takes 5 minutes</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gsv-green rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-semibold">2</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Review & Setup</h3>
                  <p className="text-gray-600">Our team reviews and coordinates logistics</p>
                  <p className="text-sm text-gray-500 mt-1">Within 5 business days</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gsv-green rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-semibold">3</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Engagement</h3>
                  <p className="text-gray-600">Presentation delivery or volunteer onboarding</p>
                  <p className="text-sm text-gray-500 mt-1">45-90 minutes for presentations</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gsv-green rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-semibold">4</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Follow-up</h3>
                  <p className="text-gray-600">Impact measurement and continued engagement</p>
                  <p className="text-sm text-gray-500 mt-1">Ongoing relationship</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-gsv-green to-gsv-greenDark">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-xl mb-8 opacity-90">
              Join us in empowering the next generation of environmental leaders
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/get-involved"
                className="bg-white text-gsv-green px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Get Involved Today
              </Link>
              <Link
                href="/contact"
                className="border-2 border-white/30 text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
