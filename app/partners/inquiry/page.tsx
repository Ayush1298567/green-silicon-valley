"use client";
import { useState } from "react";
import { Handshake, Building, Users, Target, Mail, Phone, Globe, MessageSquare, Send } from "lucide-react";

export default function PartnerInquiryPage() {
  const [formData, setFormData] = useState({
    organizationName: '',
    contactName: '',
    email: '',
    phone: '',
    partnershipType: '',
    website: '',
    message: '',
    hearAboutUs: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const partnershipTypes = [
    'Corporate Sponsorship',
    'School District Partnership',
    'Community Organization',
    'Non-Profit Collaboration',
    'Educational Institution',
    'Technology Partner',
    'Environmental Organization',
    'Other'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const response = await fetch('/api/partners/inquiry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitMessage('Thank you for your interest! We&apos;ll review your inquiry and get back to you within 2-3 business days.');
        setFormData({
          organizationName: '',
          contactName: '',
          email: '',
          phone: '',
          partnershipType: '',
          website: '',
          message: '',
          hearAboutUs: ''
        });
      } else {
        setSubmitMessage('There was an error submitting your inquiry. Please try again or contact us directly.');
      }
    } catch (error) {
      console.error('Error submitting partnership inquiry:', error);
      setSubmitMessage('There was an error submitting your inquiry. Please try again or contact us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gsv-green via-gsv-greenDark to-gsv-slate-900 text-white py-20">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Partner With Us
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8">
              Join forces to expand environmental STEM education
            </p>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 max-w-2xl mx-auto">
              <p className="text-white/90">
                We&apos;re always looking for partners who share our vision of creating a sustainable future
                through environmental STEM education. Let&apos;s explore how we can work together.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Partnership Types */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Partnership Opportunities</h2>
              <p className="text-lg text-gray-600">
                We collaborate with various organizations to maximize our impact
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Corporate Partners</h3>
                <p className="text-gray-600 text-sm">Support our mission through sponsorships and employee volunteering</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">School Districts</h3>
                <p className="text-gray-600 text-sm">Expand our reach to more schools and students in your district</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Non-Profits</h3>
                <p className="text-gray-600 text-sm">Collaborate on environmental and educational initiatives</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Communities</h3>
                <p className="text-gray-600 text-sm">Local organizations and community groups partnerships</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partnership Benefits */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Partner With Us?</h2>
              <p className="text-lg text-gray-600">
                The impact of our partnerships extends far beyond the classroom
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">For Your Organization</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-gsv-green rounded-full mt-2 flex-shrink-0"></div>
                    <span>Increase your community impact and visibility</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-gsv-green rounded-full mt-2 flex-shrink-0"></div>
                    <span>Engage employees/volunteers in meaningful work</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-gsv-green rounded-full mt-2 flex-shrink-0"></div>
                    <span>Access to our network of schools and educators</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-gsv-green rounded-full mt-2 flex-shrink-0"></div>
                    <span>Customized partnership opportunities</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">For Our Mission</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Expand our reach to more students and schools</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Enhance program quality through collaboration</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Develop innovative environmental education solutions</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Build sustainable environmental education ecosystem</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Inquiry Form */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Start a Partnership</h2>
              <p className="text-lg text-gray-600">
                Tell us about your organization and how you&apos;d like to collaborate
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="organizationName" className="block text-sm font-medium text-gray-700 mb-2">
                      Organization Name *
                    </label>
                    <input
                      type="text"
                      id="organizationName"
                      name="organizationName"
                      value={formData.organizationName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gsv-green focus:border-transparent"
                      placeholder="Your organization name"
                    />
                  </div>

                  <div>
                    <label htmlFor="contactName" className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Person *
                    </label>
                    <input
                      type="text"
                      id="contactName"
                      name="contactName"
                      value={formData.contactName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gsv-green focus:border-transparent"
                      placeholder="Your full name"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gsv-green focus:border-transparent"
                      placeholder="your.email@organization.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gsv-green focus:border-transparent"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="partnershipType" className="block text-sm font-medium text-gray-700 mb-2">
                      Partnership Type *
                    </label>
                    <select
                      id="partnershipType"
                      name="partnershipType"
                      value={formData.partnershipType}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gsv-green focus:border-transparent"
                    >
                      <option value="">Select partnership type</option>
                      {partnershipTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                      Website
                    </label>
                    <input
                      type="url"
                      id="website"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gsv-green focus:border-transparent"
                      placeholder="https://www.yourorganization.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="hearAboutUs" className="block text-sm font-medium text-gray-700 mb-2">
                    How did you hear about us?
                  </label>
                  <input
                    type="text"
                    id="hearAboutUs"
                    name="hearAboutUs"
                    value={formData.hearAboutUs}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gsv-green focus:border-transparent"
                    placeholder="School referral, website, social media, etc."
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Partnership Proposal *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gsv-green focus:border-transparent"
                    placeholder="Tell us about your organization and how you envision partnering with Green Silicon Valley. What are your goals, and how can we support each other?"
                  ></textarea>
                </div>

                {submitMessage && (
                  <div className={`p-4 rounded-lg ${submitMessage.includes('Thank you') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                    {submitMessage}
                  </div>
                )}

                <div className="flex justify-center">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-gsv-green text-white px-8 py-3 rounded-lg hover:bg-gsv-greenDark transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit Partnership Inquiry
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Prefer to discuss directly? Contact our partnerships team at{' '}
                <a href="mailto:partnerships@greensiliconvalley.org" className="text-gsv-green hover:underline">
                  partnerships@greensiliconvalley.org
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
