"use client";
import { useState, useEffect } from "react";
import { Building, ExternalLink, Award, Users, Target, Globe } from "lucide-react";

interface Partner {
  id: string;
  name: string;
  logoUrl: string;
  website: string;
  partnershipType: string;
  description: string;
  isFeatured: boolean;
  partnershipStart: string;
  impact: string;
}

export default function CurrentPartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('all');

  useEffect(() => {
    loadPartners();
  }, []);

  const loadPartners = async () => {
    try {
      const response = await fetch('/api/partners/current');
      if (response.ok) {
        const data = await response.json();
        setPartners(data.partners || []);
      }
    } catch (error) {
      console.error('Error loading partners:', error);
    } finally {
      setLoading(false);
    }
  };

  // Sample partner data - in production this would come from the API
  const samplePartners: Partner[] = [
    {
      id: '1',
      name: 'TechCorp Industries',
      logoUrl: '/api/placeholder/200/100',
      website: 'https://www.techcorp.com',
      partnershipType: 'Corporate Sponsorship',
      description: 'Leading technology company supporting our environmental STEM education initiatives through employee volunteering and program sponsorship.',
      isFeatured: true,
      partnershipStart: '2022-03-15',
      impact: 'Sponsored 50 presentations and provided volunteer coordination platform development.'
    },
    {
      id: '2',
      name: 'Green Valley School District',
      logoUrl: '/api/placeholder/200/100',
      website: 'https://www.greenvalleyschools.org',
      partnershipType: 'School District Partnership',
      description: 'Comprehensive partnership bringing environmental education to all elementary schools in the district.',
      isFeatured: true,
      partnershipStart: '2021-09-01',
      impact: 'Reached 15,000 students across 25 schools with environmental STEM curriculum.'
    },
    {
      id: '3',
      name: 'EcoFoundation',
      logoUrl: '/api/placeholder/200/100',
      website: 'https://www.ecofoundation.org',
      partnershipType: 'Non-Profit Collaboration',
      description: 'Collaborative environmental organization working together on climate change education and community outreach.',
      isFeatured: true,
      partnershipStart: '2023-01-20',
      impact: 'Joint community events and shared resources for environmental education.'
    },
    {
      id: '4',
      name: 'InnovateEd Foundation',
      logoUrl: '/api/placeholder/200/100',
      website: 'https://www.innovateed.org',
      partnershipType: 'Educational Institution',
      description: 'Educational foundation providing curriculum development support and teacher training resources.',
      isFeatured: false,
      partnershipStart: '2022-08-10',
      impact: 'Developed advanced curriculum modules and provided teacher certification programs.'
    },
    {
      id: '5',
      name: 'Community Action Network',
      logoUrl: '/api/placeholder/200/100',
      website: 'https://www.communityaction.net',
      partnershipType: 'Community Organization',
      description: 'Local community organization facilitating connections between schools and environmental programs.',
      isFeatured: false,
      partnershipStart: '2023-05-01',
      impact: 'Organized community environmental events and school-family engagement programs.'
    },
    {
      id: '6',
      name: 'Sustainable Solutions Inc',
      logoUrl: '/api/placeholder/200/100',
      website: 'https://www.sustainablesolutions.com',
      partnershipType: 'Corporate Sponsorship',
      description: 'Environmental consulting firm providing expertise and supporting our mission through corporate matching programs.',
      isFeatured: false,
      partnershipStart: '2022-11-15',
      impact: 'Provided environmental consulting expertise and matched employee donations.'
    },
    {
      id: '7',
      name: 'Future Leaders Academy',
      logoUrl: '/api/placeholder/200/100',
      website: 'https://www.futureleaders.edu',
      partnershipType: 'Educational Institution',
      description: 'STEM-focused educational institution collaborating on advanced environmental science curriculum.',
      isFeatured: false,
      partnershipStart: '2023-03-01',
      impact: 'Co-developed advanced environmental science modules for high school students.'
    },
    {
      id: '8',
      name: 'Green Communities Alliance',
      logoUrl: '/api/placeholder/200/100',
      website: 'https://www.greencommunities.org',
      partnershipType: 'Community Organization',
      description: 'Regional alliance of community groups working together to promote environmental awareness.',
      isFeatured: false,
      partnershipStart: '2023-07-01',
      impact: 'Expanded community outreach programs and increased local engagement.'
    }
  ];

  useEffect(() => {
    // Simulate loading partner data
    setTimeout(() => {
      setPartners(samplePartners);
      setLoading(false);
    }, 1000);
  }, []);

  const partnershipTypes = [
    'all',
    'Corporate Sponsorship',
    'School District Partnership',
    'Non-Profit Collaboration',
    'Educational Institution',
    'Community Organization',
    'Technology Partner'
  ];

  const filteredPartners = selectedType === 'all'
    ? partners
    : partners.filter(partner => partner.partnershipType === selectedType);

  const featuredPartners = filteredPartners.filter(partner => partner.isFeatured);
  const otherPartners = filteredPartners.filter(partner => !partner.isFeatured);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gsv-green"></div>
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
              Our Partners
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8">
              Organizations making environmental STEM education possible
            </p>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 max-w-2xl mx-auto">
              <p className="text-white/90">
                We&apos;re proud to collaborate with forward-thinking organizations that share our commitment
                to environmental education and sustainable innovation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Partnership Impact Stats */}
      <section className="py-16 bg-white border-b">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-gsv-green mb-2">{partners.length}</div>
                <p className="text-gray-600">Partner Organizations</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gsv-green mb-2">
                  {partners.filter(p => p.partnershipType === 'School District Partnership').length}
                </div>
                <p className="text-gray-600">School Districts</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gsv-green mb-2">
                  {partners.filter(p => p.partnershipType === 'Corporate Sponsorship').length}
                </div>
                <p className="text-gray-600">Corporate Partners</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gsv-green mb-2">
                  {Math.floor(partners.reduce((sum, p) => {
                    const start = new Date(p.partnershipStart);
                    const now = new Date();
                    return sum + (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365);
                  }, 0) / partners.length)}
                </div>
                <p className="text-gray-600">Avg Partnership Years</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filter */}
      <section className="py-12 bg-white">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Filter Partners</h2>
                <p className="text-gray-600">View partners by type</p>
              </div>

              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gsv-green focus:border-transparent"
              >
                {partnershipTypes.map((type) => (
                  <option key={type} value={type}>
                    {type === 'all' ? 'All Partners' : type}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Partners */}
      {featuredPartners.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Partners</h2>
                <p className="text-lg text-gray-600">
                  Organizations leading the way in environmental education partnerships
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredPartners.map((partner) => (
                  <div
                    key={partner.id}
                    className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Building className="w-8 h-8 text-gray-400" />
                      </div>
                      <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                        <Award className="w-3 h-3" />
                        Featured
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-2">{partner.name}</h3>
                    <p className="text-sm text-gsv-green font-medium mb-3">{partner.partnershipType}</p>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{partner.description}</p>

                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <h4 className="font-semibold text-gray-900 text-sm mb-1">Impact</h4>
                      <p className="text-xs text-gray-700">{partner.impact}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        Partner since {new Date(partner.partnershipStart).getFullYear()}
                      </span>
                      <a
                        href={partner.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gsv-green hover:text-gsv-greenDark transition-colors flex items-center gap-1 text-sm font-medium"
                      >
                        Visit Website
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* All Partners */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {selectedType === 'all' ? 'All Partners' : `${selectedType} Partners`}
              </h2>
              <p className="text-lg text-gray-600">
                Organizations supporting our mission
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {otherPartners.map((partner) => (
                <div
                  key={partner.id}
                  className="bg-gray-50 rounded-lg p-6 hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-gray-200"
                >
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-4">
                    <Building className="w-6 h-6 text-gray-400" />
                  </div>

                  <h3 className="font-bold text-gray-900 mb-1 text-sm">{partner.name}</h3>
                  <p className="text-xs text-gsv-green font-medium mb-3">{partner.partnershipType}</p>
                  <p className="text-gray-600 text-xs mb-4 line-clamp-2">{partner.description}</p>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      Since {new Date(partner.partnershipStart).getFullYear()}
                    </span>
                    <a
                      href={partner.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gsv-green hover:text-gsv-greenDark transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Partnership Types */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Partnership Types</h2>
              <p className="text-lg text-gray-600">
                Different ways organizations can support our mission
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Corporate Sponsorship</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Financial support, employee volunteering, and in-kind donations that make our programs possible.
                </p>
                <div className="text-sm text-gray-500">
                  {partners.filter(p => p.partnershipType === 'Corporate Sponsorship').length} partners
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Building className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">School Districts</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Direct partnerships with educational institutions to bring our programs to more students.
                </p>
                <div className="text-sm text-gray-500">
                  {partners.filter(p => p.partnershipType === 'School District Partnership').length} partners
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Non-Profits</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Collaborative partnerships with other organizations working on environmental and educational causes.
                </p>
                <div className="text-sm text-gray-500">
                  {partners.filter(p => p.partnershipType === 'Non-Profit Collaboration').length} partners
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                  <Award className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Educational Institutions</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Universities, research institutions, and educational foundations providing expertise and resources.
                </p>
                <div className="text-sm text-gray-500">
                  {partners.filter(p => p.partnershipType === 'Educational Institution').length} partners
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <Globe className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Community Organizations</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Local community groups and organizations that help connect us with schools and families.
                </p>
                <div className="text-sm text-gray-500">
                  {partners.filter(p => p.partnershipType === 'Community Organization').length} partners
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Technology Partners</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Tech companies providing platforms, tools, and expertise to enhance our digital capabilities.
                </p>
                <div className="text-sm text-gray-500">
                  {partners.filter(p => p.partnershipType === 'Technology Partner').length} partners
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
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Become a Partner</h2>
            <p className="text-lg text-gray-600 mb-8">
              Join our network of organizations making a difference in environmental STEM education
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/partners/inquiry"
                className="bg-gsv-green text-white px-8 py-3 rounded-lg hover:bg-gsv-greenDark transition-colors font-medium"
              >
                Start a Partnership
              </a>
              <a
                href="/support-a-school"
                className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Support a School
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
