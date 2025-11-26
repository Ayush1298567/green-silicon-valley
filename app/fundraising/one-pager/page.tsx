"use client";
import { useState } from "react";
import { Download, FileText, Eye, Share2, Mail, Award, Users, TrendingUp, Target } from "lucide-react";

export default function OnePagerPage() {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    setIsGenerating(true);

    try {
      // In production, this would generate a PDF from the content
      // For now, we'll simulate the process
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create a simple download link (in production, this would be a real PDF)
      const element = document.createElement('a');
      element.href = '/api/fundraising/generate-pdf';
      element.download = 'Green-Silicon-Valley-One-Pager.pdf';
      element.click();

    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const impactStats = [
    { number: '2,847+', label: 'Students Reached', description: 'Since 2021' },
    { number: '67', label: 'Schools Served', description: 'Across California & Arizona' },
    { number: '312', label: 'Presentations Delivered', description: 'Environmental STEM education' },
    { number: '96%', label: 'Teacher Satisfaction', description: 'Program quality rating' },
    { number: '89%', label: 'Knowledge Retention', description: '6 months after presentation' },
    { number: '8', label: 'States Reached', description: 'National expansion underway' }
  ];

  const programHighlights = [
    'Volunteer-led presentations by passionate environmental science students',
    'Hands-on, interactive learning experiences with real environmental data',
    'Standards-aligned curriculum following NGSS and state requirements',
    'Evidence-based approach validated by independent research',
    'Local environmental focus making learning relevant and actionable',
    'Comprehensive teacher training and curriculum support'
  ];

  const successStories = [
    {
      school: 'Riverside Elementary',
      impact: '30 students became environmental ambassadors, school recycling increased by 40%'
    },
    {
      school: 'Mountain View Middle School',
      impact: '15 student research projects launched, science fair finalists increased by 300%'
    },
    {
      school: 'Valley High School',
      impact: 'Environmental club grew from 12 to 45 members, won district environmental award'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gsv-green via-gsv-greenDark to-gsv-slate-900 text-white py-20">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Fundraising One-Pager
            </h1>
            <p className className="text-xl md:text-2xl text-white/90 mb-8">
              Professional summary of our mission and impact for fundraising pitches
            </p>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 max-w-2xl mx-auto">
              <p className="text-white/90">
                Download our comprehensive one-page summary highlighting our environmental STEM education
                mission, proven impact, and partnership opportunities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Preview Section */}
      <section className="py-16">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">One-Pager Preview</h2>
              <p className="text-lg text-gray-600">
                What&apos;s included in our professional fundraising summary
              </p>
            </div>

            {/* One-Pager Preview Layout */}
            <div className="bg-white rounded-lg shadow-lg p-8 border-4 border-gray-200">
              {/* Header */}
              <div className="text-center mb-8 pb-6 border-b-2 border-gsv-green">
                <h3 className="text-3xl font-bold text-gsv-green mb-2">Green Silicon Valley</h3>
                <p className="text-lg text-gray-700 mb-4">Environmental STEM Education for Every Student</p>
                <div className="flex justify-center items-center gap-6 text-sm text-gray-600">
                  <span>Founded 2021</span>
                  <span>•</span>
                  <span>Nonprofit 501(c)(3)</span>
                  <span>•</span>
                  <span>Silicon Valley, CA</span>
                </div>
              </div>

              {/* Mission Statement */}
              <div className="mb-8">
                <h4 className="text-lg font-bold text-gray-900 mb-3">Our Mission</h4>
                <p className="text-gray-700 text-sm leading-relaxed">
                  To empower every student with the knowledge and passion to protect our planet through
                  hands-on environmental STEM education. We bridge the gap between classroom learning and
                  real-world environmental action.
                </p>
              </div>

              {/* Impact Stats Grid */}
              <div className="mb-8">
                <h4 className="text-lg font-bold text-gray-900 mb-4">Impact in Numbers</h4>
                <div className="grid grid-cols-3 gap-4">
                  {impactStats.slice(0, 6).map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className="text-xl font-bold text-gsv-green">{stat.number}</div>
                      <div className="text-xs font-medium text-gray-900">{stat.label}</div>
                      <div className="text-xs text-gray-600">{stat.description}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Program Highlights */}
              <div className="mb-8">
                <h4 className="text-lg font-bold text-gray-900 mb-3">What Makes Us Different</h4>
                <ul className="space-y-1">
                  {programHighlights.map((highlight, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-gsv-green font-bold mt-1">•</span>
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Success Stories */}
              <div className="mb-8">
                <h4 className="text-lg font-bold text-gray-900 mb-3">Success Stories</h4>
                <div className="space-y-3">
                  {successStories.map((story, index) => (
                    <div key={index} className="bg-gray-50 rounded p-3">
                      <div className="font-medium text-gray-900 text-sm">{story.school}</div>
                      <div className="text-xs text-gray-700 mt-1">{story.impact}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Partnership Opportunities */}
              <div className="mb-8">
                <h4 className="text-lg font-bold text-gray-900 mb-3">Partnership Opportunities</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-medium text-gray-900">$500</div>
                    <div className="text-gray-700">Presentation Sponsor</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">$1,000</div>
                    <div className="text-gray-700">Monthly Champion</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">$2,500</div>
                    <div className="text-gray-700">Program Expansion</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">$5,000+</div>
                    <div className="text-gray-700">Transformational Impact</div>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="text-center pt-6 border-t border-gray-200">
                <h4 className="text-lg font-bold text-gray-900 mb-2">Get Involved</h4>
                <div className="text-sm text-gray-700 space-y-1">
                  <div>Website: greensiliconvalley.org</div>
                  <div>Email: info@greensiliconvalley.org</div>
                  <div>Phone: (408) 555-0123</div>
                </div>
              </div>
            </div>

            {/* Download Actions */}
            <div className="mt-8 text-center">
              <div className="bg-gray-50 rounded-lg p-6 max-w-2xl mx-auto">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Download Your Copy</h3>
                <p className="text-gray-600 mb-6">
                  Get our professionally designed one-pager for your fundraising efforts,
                  grant applications, and partnership discussions.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={handleDownload}
                    disabled={isGenerating}
                    className="bg-gsv-green text-white px-8 py-3 rounded-lg hover:bg-gsv-greenDark transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Generating PDF...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        Download PDF
                      </>
                    )}
                  </button>

                  <button className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Preview Online
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Resources */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Additional Fundraising Resources</h2>
              <p className="text-lg text-gray-600">
                Everything you need to tell our story effectively
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg p-6 shadow-sm text-center">
                <FileText className="w-12 h-12 text-gsv-green mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Grant Proposal Template</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Pre-written template highlighting our impact and needs for grant applications.
                </p>
                <button className="text-gsv-green hover:text-gsv-greenDark font-medium text-sm">
                  Download Template →
                </button>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm text-center">
                <Award className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Impact Presentation</h3>
                <p className="text-gray-600 text-sm mb-4">
                  PowerPoint presentation with our story, data, and partnership opportunities.
                </p>
                <button className="text-gsv-green hover:text-gsv-greenDark font-medium text-sm">
                  Download Slides →
                </button>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm text-center">
                <Users className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Testimonials Package</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Collection of teacher and school testimonials for your fundraising materials.
                </p>
                <button className="text-gsv-green hover:text-gsv-greenDark font-medium text-sm">
                  Download Testimonials →
                </button>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm text-center">
                <TrendingUp className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Annual Report</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Comprehensive annual report with detailed impact metrics and financials.
                </p>
                <button className="text-gsv-green hover:text-gsv-greenDark font-medium text-sm">
                  Download Report →
                </button>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm text-center">
                <Target className="w-12 h-12 text-orange-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Partnership Guide</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Detailed guide explaining different partnership levels and benefits.
                </p>
                <button className="text-gsv-green hover:text-gsv-greenDark font-medium text-sm">
                  Download Guide →
                </button>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm text-center">
                <Mail className="w-12 h-12 text-red-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Templates</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Ready-to-use email templates for reaching out to potential donors and partners.
                </p>
                <button className="text-gsv-green hover:text-gsv-greenDark font-medium text-sm">
                  Download Templates →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gsv-green/5">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Support Our Mission?</h2>
            <p className="text-lg text-gray-600 mb-8">
              Join the growing community of supporters making environmental STEM education accessible to all
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/donate"
                className="bg-gsv-green text-white px-8 py-3 rounded-lg hover:bg-gsv-greenDark transition-colors font-medium"
              >
                Make a Donation
              </a>
              <a
                href="/partners/inquiry"
                className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Become a Partner
              </a>
              <a
                href="/why-support-us"
                className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Learn More About Impact
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
