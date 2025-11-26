"use client";
import { useState } from "react";
import { Phone, Mail, MessageSquare, Clock, Send, CheckCircle } from "lucide-react";

export default function UrgentContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    schoolName: '',
    urgency: 'medium',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Call API route to handle urgent contact
      const response = await fetch('/api/contact/urgent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to submit urgent contact request');
      }

      setIsSubmitted(true);

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        schoolName: '',
        urgency: 'medium',
        subject: '',
        message: ''
      });

    } catch (error: any) {
      setError(error.message || 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Message Sent Successfully
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Thank you for reaching out. We've received your urgent request and will get back to you within 2 hours during business hours.
            </p>
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">What happens next?</h3>
              <div className="space-y-3 text-left">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-gsv-green mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Immediate Response</p>
                    <p className="text-sm text-gray-600">We'll acknowledge your message within 1 hour</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-gsv-green mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Phone Follow-up</p>
                    <p className="text-sm text-gray-600">For urgent matters, we'll call you directly</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MessageSquare className="w-5 h-5 text-gsv-green mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Personalized Support</p>
                    <p className="text-sm text-gray-600">Dedicated team member will assist with your specific needs</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-8">
              <button
                onClick={() => setIsSubmitted(false)}
                className="text-gsv-green hover:text-gsv-greenDark font-medium"
              >
                Send Another Message
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-red-600 to-red-700 text-white py-16">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">
              Urgent Teacher Support
            </h1>
            <p className="text-xl text-red-100 mb-8">
              Need immediate help? We're here for you. Get in touch and we'll respond within 2 hours.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-red-100">
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                <span>(555) 123-HELP</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                <span>urgent@greensiliconvalley.org</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16">
        <div className="container">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Contact Us Urgently
                </h2>
                <p className="text-gray-600">
                  For time-sensitive matters, presentation emergencies, or immediate questions.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Contact Info */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="your.email@school.edu"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div>
                    <label htmlFor="schoolName" className="block text-sm font-medium text-gray-700 mb-2">
                      School Name *
                    </label>
                    <input
                      type="text"
                      id="schoolName"
                      name="schoolName"
                      value={formData.schoolName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Your school name"
                    />
                  </div>
                </div>

                {/* Urgency Level */}
                <div>
                  <label htmlFor="urgency" className="block text-sm font-medium text-gray-700 mb-2">
                    Urgency Level *
                  </label>
                  <select
                    id="urgency"
                    name="urgency"
                    value={formData.urgency}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="low">Low - General question, not time-sensitive</option>
                    <option value="medium">Medium - Need help soon, within a few days</option>
                    <option value="high">High - Urgent issue, need immediate assistance</option>
                  </select>
                </div>

                {/* Subject */}
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Brief description of your urgent need"
                  />
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Please provide details about your urgent situation. The more information you provide, the better we can assist you."
                  />
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-red-600 text-white py-4 px-6 rounded-lg hover:bg-red-700 transition-colors font-semibold text-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Sending Urgent Request...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send Urgent Request
                    </>
                  )}
                </button>
              </form>

              {/* Response Time Guarantee */}
              <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-red-900 mb-1">Response Time Guarantee</h4>
                    <ul className="text-sm text-red-800 space-y-1">
                      <li>• High priority: Response within 2 hours</li>
                      <li>• Medium priority: Response within 4 hours</li>
                      <li>• Low priority: Response within 24 hours</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Alternative Contact Methods */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Other Ways to Reach Us
              </h2>
              <p className="text-lg text-gray-600">
                If you need immediate assistance, try these alternative contact methods
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Call Us</h3>
                <p className="text-gray-600 mb-4">
                  For urgent situations that require immediate phone support
                </p>
                <a
                  href="tel:+1555123HELP"
                  className="inline-block bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  (555) 123-HELP
                </a>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Email</h3>
                <p className="text-gray-600 mb-4">
                  Send us an email for non-urgent but important matters
                </p>
                <a
                  href="mailto:urgent@greensiliconvalley.org"
                  className="inline-block bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  urgent@greensiliconvalley.org
                </a>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Regular Support</h3>
                <p className="text-gray-600 mb-4">
                  For general questions and scheduling requests
                </p>
                <a
                  href="/contact"
                  className="inline-block bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium"
                >
                  General Contact
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
