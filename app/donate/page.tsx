"use client";
import { useState, useEffect } from "react";
import { Heart, DollarSign, Users, BookOpen, Award, TrendingUp, CheckCircle, CreditCard, Star } from "lucide-react";

interface DonationLevel {
  id: string;
  name: string;
  amount: number;
  description: string;
  impact: string;
  popular?: boolean;
}

interface UseOfFunds {
  category: string;
  percentage: number;
  description: string;
  icon: string;
  color: string;
}

export default function DonatePage() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [donationType, setDonationType] = useState<'general' | 'school'>('general');
  const [selectedSchool, setSelectedSchool] = useState<string>('');
  const [donorInfo, setDonorInfo] = useState({
    name: '',
    email: '',
    anonymous: false,
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const donationLevels: DonationLevel[] = [
    {
      id: 'presentation',
      name: 'Presentation Fund',
      amount: 500,
      description: 'Fund one complete environmental STEM presentation',
      impact: 'Reach 30 students with hands-on learning'
    },
    {
      id: 'monthly',
      name: 'Monthly Champion',
      amount: 1000,
      description: 'Support multiple presentations throughout the year',
      impact: 'Fund 8 presentations annually',
      popular: true
    },
    {
      id: 'expansion',
      name: 'Program Expansion',
      amount: 2500,
      description: 'Help us expand to new schools and communities',
      impact: 'Support 20 presentations and program growth'
    },
    {
      id: 'transformational',
      name: 'Transformational Impact',
      amount: 5000,
      description: 'Create lasting change in environmental education',
      impact: 'Fund 40 presentations and curriculum development'
    }
  ];

  const useOfFunds: UseOfFunds[] = [
    {
      category: 'Presentations & Programs',
      percentage: 60,
      description: 'Direct funding for environmental STEM presentations and educational materials',
      icon: 'BookOpen',
      color: 'bg-green-100 text-green-800'
    },
    {
      category: 'Volunteer Development',
      percentage: 20,
      description: 'Training, materials, and support for our volunteer educators',
      icon: 'Users',
      color: 'bg-blue-100 text-blue-800'
    },
    {
      category: 'Program Expansion',
      percentage: 15,
      description: 'Growing our reach to new schools and communities',
      icon: 'TrendingUp',
      color: 'bg-purple-100 text-purple-800'
    },
    {
      category: 'Operations & Administration',
      percentage: 5,
      description: 'Essential administrative costs to keep our programs running',
      icon: 'Award',
      color: 'bg-orange-100 text-orange-800'
    }
  ];

  const impactStats = [
    {
      number: '2,500+',
      label: 'Students Reached',
      description: 'Since our founding in 2021'
    },
    {
      number: '150+',
      label: 'Presentations Delivered',
      description: 'Across California and beyond'
    },
    {
      number: '45',
      label: 'Schools Served',
      description: 'Public, charter, and private schools'
    },
    {
      number: '95%',
      label: 'Program Satisfaction',
      description: 'From participating teachers'
    }
  ];

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    setSelectedAmount(null);
  };

  const getFinalAmount = () => {
    if (customAmount) return parseFloat(customAmount) || 0;
    return selectedAmount || 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // In production, this would integrate with a payment processor
      const donationData = {
        amount: getFinalAmount(),
        type: donationType,
        schoolId: selectedSchool,
        donorInfo,
        timestamp: new Date().toISOString()
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log('Donation submitted:', donationData);

      // Redirect to success page or show success message
      alert('Thank you for your donation! We\'ll send you a confirmation email shortly.');

      // Reset form
      setSelectedAmount(null);
      setCustomAmount('');
      setDonorInfo({ name: '', email: '', anonymous: false, message: '' });

    } catch (error) {
      console.error('Donation submission error:', error);
      alert('There was an error processing your donation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getIcon = (iconName: string) => {
    const icons = {
      BookOpen,
      Users,
      TrendingUp,
      Award
    };
    return icons[iconName as keyof typeof icons] || BookOpen;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gsv-green via-gsv-greenDark to-gsv-slate-900 text-white py-20">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Make a Difference Today
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8">
              Your donation funds environmental STEM education and creates future environmental leaders
            </p>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 max-w-2xl mx-auto">
              <p className="text-white/90">
                Every dollar directly supports hands-on environmental science education for students,
                empowering the next generation to protect our planet.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-16 bg-white border-b">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Impact</h2>
              <p className="text-lg text-gray-600">
                Real results from your support
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {impactStats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold text-gsv-green mb-2">{stat.number}</div>
                  <div className="text-lg font-semibold text-gray-900 mb-1">{stat.label}</div>
                  <div className="text-sm text-gray-600">{stat.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Donation Form */}
      <section className="py-16">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Impact Level</h2>
                <p className="text-lg text-gray-600">
                  Select a donation amount or enter a custom amount
                </p>
              </div>

              {/* Donation Levels */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {donationLevels.map((level) => (
                  <div
                    key={level.id}
                    className={`relative border-2 rounded-lg p-6 cursor-pointer transition-all ${
                      selectedAmount === level.amount
                        ? 'border-gsv-green bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleAmountSelect(level.amount)}
                  >
                    {level.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <div className="bg-gsv-green text-white px-3 py-1 rounded-full text-xs font-medium">
                          Most Popular
                        </div>
                      </div>
                    )}

                    <div className="text-center mb-4">
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        ${level.amount.toLocaleString()}
                      </div>
                      <h3 className="font-semibold text-gray-900">{level.name}</h3>
                    </div>

                    <p className="text-sm text-gray-600 mb-3 text-center">{level.description}</p>
                    <p className="text-xs text-gsv-green font-medium text-center">{level.impact}</p>

                    {selectedAmount === level.amount && (
                      <div className="flex justify-center mt-4">
                        <CheckCircle className="w-6 h-6 text-gsv-green" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Custom Amount */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Or enter a custom amount
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={customAmount}
                    onChange={(e) => handleCustomAmountChange(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gsv-green focus:border-transparent"
                  />
                </div>
              </div>

              {/* Donor Information */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={donorInfo.name}
                      onChange={(e) => setDonorInfo(prev => ({ ...prev, name: e.target.value }))}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gsv-green focus:border-transparent"
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
                      value={donorInfo.email}
                      onChange={(e) => setDonorInfo(prev => ({ ...prev, email: e.target.value }))}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gsv-green focus:border-transparent"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message (Optional)
                  </label>
                  <textarea
                    id="message"
                    value={donorInfo.message}
                    onChange={(e) => setDonorInfo(prev => ({ ...prev, message: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gsv-green focus:border-transparent"
                    placeholder="Share why you're supporting our mission..."
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="anonymous"
                    checked={donorInfo.anonymous}
                    onChange={(e) => setDonorInfo(prev => ({ ...prev, anonymous: e.target.checked }))}
                    className="rounded border-gray-300 text-gsv-green focus:ring-gsv-green"
                  />
                  <label htmlFor="anonymous" className="ml-2 text-sm text-gray-700">
                    Make this donation anonymous
                  </label>
                </div>

                {getFinalAmount() > 0 && (
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-lg font-semibold text-gray-900">Donation Summary</span>
                      <span className="text-2xl font-bold text-gsv-green">
                        ${getFinalAmount().toLocaleString()}
                      </span>
                    </div>

                    <div className="text-sm text-gray-600 mb-4">
                      Your donation will be tax-deductible. You will receive a confirmation email with your receipt.
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting || getFinalAmount() === 0}
                      className="w-full bg-gsv-green text-white py-3 px-6 rounded-lg hover:bg-gsv-greenDark transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <Heart className="w-4 h-4" />
                          Complete Donation
                        </>
                      )}
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Use of Funds */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">How Your Donation Is Used</h2>
              <p className="text-lg text-gray-600">
                100% of donations go directly to environmental STEM education programs
              </p>
            </div>

            <div className="space-y-6">
              {useOfFunds.map((fund, index) => {
                const Icon = getIcon(fund.icon);
                return (
                  <div key={index} className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${fund.color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-gray-900">{fund.category}</h3>
                          <span className="text-2xl font-bold text-gsv-green">{fund.percentage}%</span>
                        </div>
                        <p className="text-gray-600 mt-1">{fund.description}</p>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gsv-green h-3 rounded-full transition-all duration-1000"
                        style={{ width: `${fund.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 text-center">
              <p className="text-gray-600 mb-4">
                We operate with extremely low overhead costs, ensuring maximum impact for every dollar donated.
              </p>
              <div className="flex justify-center gap-4">
                <a
                  href="/why-support-us"
                  className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Why Support Us
                </a>
                <a
                  href="/grants/transparency"
                  className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Grant Transparency
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gsv-green/5">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Make an Impact?</h2>
            <p className="text-lg text-gray-600 mb-8">
              Join our community of supporters making environmental STEM education accessible to all students
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#donation-form"
                className="bg-gsv-green text-white px-8 py-3 rounded-lg hover:bg-gsv-greenDark transition-colors font-medium"
              >
                Donate Now
              </a>
              <a
                href="/fundraising/one-pager"
                className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Download One-Pager
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}