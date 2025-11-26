"use client";
import { Clock, Users, Presentation, CheckCircle, AlertTriangle, Coffee, MapPin, Phone, Wifi, Zap } from "lucide-react";
import Link from "next/link";

export default function PresentationDayGuidePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gsv-green via-gsv-greenDark to-gsv-slate-900 text-white py-20">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              What to Expect on Presentation Day
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8">
              Everything you need to know for a smooth and successful environmental STEM presentation
            </p>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 max-w-2xl mx-auto">
              <p className="text-white/90">
                Our volunteer teams are trained professionals who will deliver an engaging,
                educational experience for your students. Here's how to prepare and what to expect.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Overview */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Presentation Day Timeline</h2>
              <p className="text-lg text-gray-600">
                A typical 60-minute presentation follows this structure
              </p>
            </div>

            <div className="space-y-6">
              {/* Pre-Presentation */}
              <div className="flex items-start gap-6 p-6 bg-blue-50 rounded-lg border border-blue-200">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-blue-900">Pre-Presentation (0-10 minutes)</h3>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">10 min</span>
                  </div>
                  <ul className="text-blue-800 space-y-1">
                    <li>• Volunteers arrive 15-20 minutes early for setup</li>
                    <li>• Brief introduction and classroom overview</li>
                    <li>• Equipment testing and material preparation</li>
                    <li>• Student welcome and icebreaker activity</li>
                  </ul>
                </div>
              </div>

              {/* Main Presentation */}
              <div className="flex items-start gap-6 p-6 bg-green-50 rounded-lg border border-green-200">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Presentation className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-green-900">Main Presentation (10-50 minutes)</h3>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">40 min</span>
                  </div>
                  <ul className="text-green-800 space-y-1">
                    <li>• Climate science fundamentals and current challenges</li>
                    <li>• Interactive demonstrations and hands-on activities</li>
                    <li>• Renewable energy solutions and real-world examples</li>
                    <li>• Student participation and Q&A throughout</li>
                    <li>• Age-appropriate content (grades 3-5: simpler concepts, 6-8: more depth, 9-12: complex topics)</li>
                  </ul>
                </div>
              </div>

              {/* Wrap-up */}
              <div className="flex items-start gap-6 p-6 bg-purple-50 rounded-lg border border-purple-200">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-purple-900">Wrap-up & Follow-up (50-60 minutes)</h3>
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">10 min</span>
                  </div>
                  <ul className="text-purple-800 space-y-1">
                    <li>• Key takeaways and action items for students</li>
                    <li>• Final Q&A and discussion</li>
                    <li>• Resource materials and next steps</li>
                    <li>• Thank you and feedback collection</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Preparation Guide */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Teacher Preparation Guide</h2>
              <p className="text-lg text-gray-600">
                Make the most of your presentation day
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Before the Presentation */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  Before the Presentation
                </h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Prepare students with basic environmental vocabulary</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Ensure classroom technology is ready (projector, speakers)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Clear space for interactive activities if needed</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Review classroom management procedures with students</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Prepare questions for post-presentation discussion</span>
                  </li>
                </ul>
              </div>

              {/* During the Presentation */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  During the Presentation
                </h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Introduce the volunteers to your class</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Encourage student participation and questions</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Take notes on key concepts for follow-up</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Be available for classroom management support</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Photograph key moments (with permission)</span>
                  </li>
                </ul>
              </div>

              {/* After the Presentation */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Coffee className="w-5 h-5 text-brown-600" />
                  After the Presentation
                </h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Lead a debrief discussion with students</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Connect presentation topics to your curriculum</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Assign follow-up activities or projects</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Provide feedback to Green Silicon Valley</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Share resources with other teachers</span>
                  </li>
                </ul>
              </div>

              {/* Technical Requirements */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-600" />
                  Technical Requirements
                </h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Projector or large screen for visual presentations</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Speakers for audio (preferred but not required)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>WiFi access for interactive elements</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Space for student movement and activities</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Access to electrical outlets</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Cover */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Presentation Topics</h2>
              <p className="text-lg text-gray-600">
                Age-appropriate environmental STEM content tailored to your grade level
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Elementary */}
              <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                <h3 className="text-xl font-semibold text-blue-900 mb-4">Grades 3-5</h3>
                <ul className="space-y-2 text-blue-800">
                  <li>• What is climate change?</li>
                  <li>• Recycling and waste reduction</li>
                  <li>• Local wildlife and habitats</li>
                  <li>• Simple renewable energy concepts</li>
                  <li>• Environmental heroes</li>
                </ul>
                <div className="mt-4 text-sm text-blue-700">
                  <strong>Length:</strong> 45-60 minutes
                </div>
              </div>

              {/* Middle School */}
              <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                <h3 className="text-xl font-semibold text-green-900 mb-4">Grades 6-8</h3>
                <ul className="space-y-2 text-green-800">
                  <li>• Climate science and evidence</li>
                  <li>• Greenhouse gases and carbon footprint</li>
                  <li>• Solar, wind, and hydroelectric power</li>
                  <li>• Biodiversity and ecosystems</li>
                  <li>• Ocean conservation</li>
                </ul>
                <div className="mt-4 text-sm text-green-700">
                  <strong>Length:</strong> 60-75 minutes
                </div>
              </div>

              {/* High School */}
              <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
                <h3 className="text-xl font-semibold text-purple-900 mb-4">Grades 9-12</h3>
                <ul className="space-y-2 text-purple-800">
                  <li>• Advanced climate modeling</li>
                  <li>• Energy policy and economics</li>
                  <li>• Carbon capture technologies</li>
                  <li>• Environmental justice</li>
                  <li>• Sustainable business practices</li>
                </ul>
                <div className="mt-4 text-sm text-purple-700">
                  <strong>Length:</strong> 75-90 minutes
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">What if my classroom doesn't have a projector?</h3>
                <p className="text-gray-600">
                  Our volunteers are trained to adapt presentations for different classroom setups.
                  They can use interactive demonstrations, handouts, or focus on discussion-based learning.
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">Can I request a specific topic?</h3>
                <p className="text-gray-600">
                  While our presentations follow a structured curriculum, we can emphasize certain topics
                  based on your classroom needs. Mention your preferences when requesting a presentation.
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">What if students have questions about controversial topics?</h3>
                <p className="text-gray-600">
                  Our volunteers present scientific consensus and focus on solutions rather than politics.
                  They encourage critical thinking while maintaining age-appropriate discussions.
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">Will there be homework or follow-up activities?</h3>
                <p className="text-gray-600">
                  We provide optional extension activities and resources, but don't assign homework.
                  You'll receive materials to continue the learning in future lessons.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gsv-green/5">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Bring Environmental STEM to Your Classroom?</h2>
            <p className="text-lg text-gray-600 mb-8">
              Join hundreds of teachers who have brought climate education to their students
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/teachers/request"
                className="bg-gsv-green text-white px-8 py-3 rounded-lg hover:bg-gsv-greenDark transition-colors font-medium"
              >
                Request a Presentation
              </Link>
              <Link
                href="/teachers/informational-call"
                className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Schedule an Info Call
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
