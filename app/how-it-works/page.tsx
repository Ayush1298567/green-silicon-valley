"use client";
import Link from "next/link";
import { ArrowRight, Users, Calendar, Presentation, CheckCircle, Star, Clock, MapPin } from "lucide-react";

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gsv-green via-gsv-greenDark to-gsv-slate-900 text-white py-20">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              How Green Silicon Valley Works
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8">
              Empowering the next generation of environmental leaders through hands-on STEM education
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/get-involved"
                className="bg-white text-gsv-green px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Get Involved Today
              </Link>
              <Link
                href="#volunteer-process"
                className="border-2 border-white/30 text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Overview */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">The Process</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Our program connects high school student volunteers with local classrooms to deliver
                engaging environmental STEM presentations. Here&apos;s how it works:
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-8 mb-16">
              <div className="text-center">
                <div className="w-16 h-16 bg-gsv-green rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Apply</h3>
                <p className="text-gray-600">High school students apply to become volunteers</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gsv-green rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Train</h3>
                <p className="text-gray-600">Volunteers receive training in environmental science and presentation skills</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gsv-green rounded-full flex items-center justify-center mx-auto mb-4">
                  <Presentation className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Present</h3>
                <p className="text-gray-600">Teams deliver interactive presentations in local classrooms</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gsv-green rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Impact</h3>
                <p className="text-gray-600">Students learn about climate science and environmental solutions</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Teachers */}
      <section id="teacher-process" className="py-16 bg-gray-50">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">For Teachers</h2>
              <p className="text-lg text-gray-600">
                Bring environmental STEM education to your classroom with minimal effort
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">What You Do:</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-gsv-green rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-sm font-semibold">1</span>
                      </div>
                      <span className="text-gray-700">Request a presentation through our website</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-gsv-green rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-sm font-semibold">2</span>
                      </div>
                      <span className="text-gray-700">We&apos;ll contact you within 5 business days to schedule</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-gsv-green rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-sm font-semibold">3</span>
                      </div>
                      <span className="text-gray-700">Provide classroom space and prepare students for engagement</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">What We Do:</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-gsv-green flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Provide trained student volunteers</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-gsv-green flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Deliver 45-90 minute interactive presentations</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-gsv-green flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Cover topics like climate change, renewable energy, and sustainability</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-gsv-green flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Include hands-on activities and Q&A sessions</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="text-center">
              <Link
                href="/teachers/request"
                className="inline-flex items-center gap-2 bg-gsv-green text-white px-8 py-3 rounded-lg font-semibold hover:bg-gsv-greenDark transition-colors"
              >
                Request a Presentation
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* For Volunteers */}
      <section id="volunteer-process" className="py-16 bg-white">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">For Volunteers</h2>
              <p className="text-lg text-gray-600">
                Join a team of high school students making a real impact in environmental education
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-gsv-green rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Apply & Interview</h3>
                <p className="text-sm text-gray-600">Submit application, complete interview process</p>
              </div>
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-gsv-green rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Join a Team</h3>
                <p className="text-sm text-gray-600">Get assigned to a 3-4 person team</p>
              </div>
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-gsv-green rounded-full flex items-center justify-center mx-auto mb-4">
                  <Presentation className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Present & Lead</h3>
                <p className="text-sm text-gray-600">Deliver presentations and track impact</p>
              </div>
            </div>

            <div className="bg-gsv-green/5 border border-gsv-green/20 rounded-lg p-8 mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Timeline & Commitment</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Initial Commitment:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Application & interview process</li>
                    <li>• Team formation and training</li>
                    <li>• Content preparation and practice</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Ongoing Commitment:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Weekly team meetings</li>
                    <li>• Presentation delivery (1-2 per month)</li>
                    <li>• Content updates and skill development</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="text-center">
              <Link
                href="/get-involved"
                className="inline-flex items-center gap-2 bg-gsv-green text-white px-8 py-3 rounded-lg font-semibold hover:bg-gsv-greenDark transition-colors"
              >
                Apply to Volunteer
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Logistics & Support */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Logistics & Support</h2>
              <p className="text-lg text-gray-600">
                We handle the details so you can focus on impact
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <Clock className="w-8 h-8 text-gsv-green flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Presentation Length</h3>
                    <p className="text-gray-600 mb-3">45-90 minutes depending on grade level and topic depth</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Grades 3-5: 45-60 minutes</li>
                      <li>• Grades 6-8: 60-75 minutes</li>
                      <li>• Grades 9-12: 75-90 minutes</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <MapPin className="w-8 h-8 text-gsv-green flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Location & Setup</h3>
                    <p className="text-gray-600 mb-3">Presentations can be held in classrooms, auditoriums, or outdoor spaces</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Projector or smartboard preferred</li>
                      <li>• Space for interactive activities</li>
                      <li>• Internet access for multimedia content</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12 text-center">
              <div className="bg-white rounded-lg shadow-sm p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Need More Information?</h3>
                <p className="text-gray-600 mb-6">
                  Have questions about the process, logistics, or how to get involved?
                  We&apos;re here to help!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/contact"
                    className="bg-gsv-green text-white px-6 py-3 rounded-lg font-semibold hover:bg-gsv-greenDark transition-colors"
                  >
                    Contact Us
                  </Link>
                  <Link
                    href="/faq"
                    className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                  >
                    View FAQ
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
