"use client";
import { useState, useEffect } from "react";
import { Award, DollarSign, Calendar, FileText, ExternalLink, TrendingUp, Target, Users } from "lucide-react";

interface Grant {
  id: string;
  name: string;
  funder: string;
  amount: number;
  receivedDate: string;
  status: 'completed' | 'active' | 'pending';
  category: string;
  description: string;
  objectives: string[];
  outcomes: string[];
  useOfFunds: {
    category: string;
    amount: number;
    percentage: number;
    description: string;
  }[];
  impact: string;
  reportUrl?: string;
}

export default function GrantTransparencyPage() {
  const [grants, setGrants] = useState<Grant[]>([]);
  const [selectedGrant, setSelectedGrant] = useState<Grant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGrants();
  }, []);

  const loadGrants = async () => {
    try {
      const response = await fetch('/api/grants/transparency');
      if (response.ok) {
        const data = await response.json();
        setGrants(data.grants || []);
      }
    } catch (error) {
      console.error('Error loading grants:', error);
    } finally {
      setLoading(false);
    }
  };

  // Sample grant data - in production this would come from the API
  const sampleGrants: Grant[] = [
    {
      id: '1',
      name: 'California Environmental Education Initiative',
      funder: 'California Department of Education',
      amount: 25000,
      receivedDate: '2023-09-01',
      status: 'active',
      category: 'State Education Grant',
      description: 'Supporting environmental STEM education expansion across California schools',
      objectives: [
        'Deliver 100 environmental STEM presentations',
        'Train 50 volunteer presenters',
        'Develop curriculum alignment resources'
      ],
      outcomes: [
        '85 presentations completed (85% of goal)',
        '45 volunteers trained',
        'Curriculum resources developed and distributed'
      ],
      useOfFunds: [
        {
          category: 'Program Delivery',
          amount: 15000,
          percentage: 60,
          description: 'Volunteer training, materials, and presentation delivery'
        },
        {
          category: 'Curriculum Development',
          amount: 6000,
          percentage: 24,
          description: 'Teacher resources and curriculum alignment materials'
        },
        {
          category: 'Evaluation & Reporting',
          amount: 2500,
          percentage: 10,
          description: 'Program assessment and funder reporting'
        },
        {
          category: 'Administration',
          amount: 1500,
          percentage: 6,
          description: 'Grant management and compliance'
        }
      ],
      impact: 'Expanded reach to 12 new schools, trained 45 volunteers, delivered 85 presentations reaching 2,500+ students'
    },
    {
      id: '2',
      name: 'Silicon Valley STEM Education Partnership',
      funder: 'Silicon Valley Community Foundation',
      amount: 15000,
      receivedDate: '2022-06-15',
      status: 'completed',
      category: 'Community Foundation Grant',
      description: 'Building partnerships between tech industry and local schools for STEM education',
      objectives: [
        'Establish corporate volunteer partnerships',
        'Develop industry-school mentorship programs',
        'Create STEM career awareness materials'
      ],
      outcomes: [
        '8 corporate partnerships established',
        '3 mentorship programs launched',
        'STEM career materials distributed to 25 schools'
      ],
      useOfFunds: [
        {
          category: 'Partnership Development',
          amount: 7500,
          percentage: 50,
          description: 'Corporate outreach and relationship building'
        },
        {
          category: 'Program Materials',
          amount: 4500,
          percentage: 30,
          description: 'STEM career resources and mentorship materials'
        },
        {
          category: 'Events & Activities',
          amount: 2250,
          percentage: 15,
          description: 'Industry-school connection events'
        },
        {
          category: 'Evaluation',
          amount: 750,
          percentage: 5,
          description: 'Program impact assessment'
        }
      ],
      impact: 'Created lasting partnerships between 8 tech companies and local schools, established 3 ongoing mentorship programs'
    },
    {
      id: '3',
      name: 'Climate Science Education Initiative',
      funder: 'National Science Foundation',
      amount: 50000,
      receivedDate: '2021-11-01',
      status: 'completed',
      category: 'Federal Research Grant',
      description: 'Developing research-based climate science curriculum for K-12 education',
      objectives: [
        'Research effective climate education methods',
        'Develop evidence-based curriculum',
        'Train educators in climate science instruction',
        'Evaluate program effectiveness'
      ],
      outcomes: [
        'Published 3 research papers on climate education',
        'Developed comprehensive K-12 climate curriculum',
        'Trained 200 educators',
        'Achieved 89% student knowledge retention'
      ],
      useOfFunds: [
        {
          category: 'Research & Development',
          amount: 25000,
          percentage: 50,
          description: 'Curriculum research and development'
        },
        {
          category: 'Educator Training',
          amount: 15000,
          percentage: 30,
          description: 'Professional development workshops'
        },
        {
          category: 'Evaluation & Assessment',
          amount: 7500,
          percentage: 15,
          description: 'Program evaluation and research'
        },
        {
          category: 'Dissemination',
          amount: 2500,
          percentage: 5,
          description: 'Sharing findings and resources'
        }
      ],
      impact: 'Created nationally recognized climate education curriculum, trained 200 educators, published research establishing best practices'
    },
    {
      id: '4',
      name: 'Youth Environmental Leadership Program',
      funder: 'Environmental Protection Agency',
      amount: 30000,
      receivedDate: '2024-01-15',
      status: 'active',
      category: 'Federal Environmental Grant',
      description: 'Empowering youth to become environmental leaders through hands-on STEM experiences',
      objectives: [
        'Develop youth leadership curriculum',
        'Create environmental action projects',
        'Build community partnerships',
        'Measure youth leadership outcomes'
      ],
      outcomes: [
        'Leadership curriculum developed (75% complete)',
        '5 environmental action projects launched',
        '12 community partnerships established',
        'Baseline assessment completed'
      ],
      useOfFunds: [
        {
          category: 'Curriculum & Materials',
          amount: 12000,
          percentage: 40,
          description: 'Youth leadership curriculum and project materials'
        },
        {
          category: 'Program Implementation',
          amount: 9000,
          percentage: 30,
          description: 'Project coordination and youth activities'
        },
        {
          category: 'Partnership Development',
          amount: 6000,
          percentage: 20,
          description: 'Community and organizational partnerships'
        },
        {
          category: 'Evaluation & Reporting',
          amount: 3000,
          percentage: 10,
          description: 'Program assessment and EPA reporting'
        }
      ],
      impact: 'Launched 5 youth-led environmental projects, engaged 200+ youth participants, established 12 community partnerships'
    }
  ];

  useEffect(() => {
    // Simulate loading grant data
    setTimeout(() => {
      setGrants(sampleGrants);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'State Education Grant': 'bg-blue-100 text-blue-800',
      'Community Foundation Grant': 'bg-green-100 text-green-800',
      'Federal Research Grant': 'bg-purple-100 text-purple-800',
      'Federal Environmental Grant': 'bg-orange-100 text-orange-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const totalGrants = grants.reduce((sum, grant) => sum + grant.amount, 0);
  const completedGrants = grants.filter(g => g.status === 'completed').reduce((sum, grant) => sum + grant.amount, 0);

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
              Grant Transparency
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8">
              How we steward public and private funding for maximum impact
            </p>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 max-w-2xl mx-auto">
              <p className="text-white/90">
                We are committed to transparency in how we use grant funding.
                Every dollar is carefully allocated to maximize our environmental STEM education impact.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Grant Summary */}
      <section className="py-16 bg-white border-b">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-gsv-green mb-2">
                  ${totalGrants.toLocaleString()}
                </div>
                <p className="text-gray-600">Total Grant Funding</p>
                <p className="text-sm text-gray-500 mt-1">Since 2021</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">{grants.length}</div>
                <p className="text-gray-600">Grants Awarded</p>
                <p className="text-sm text-gray-500 mt-1">From diverse funders</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {Math.round((completedGrants / totalGrants) * 100)}%
                </div>
                <p className="text-gray-600">Funds Accounted For</p>
                <p className="text-sm text-gray-500 mt-1">Completed grants</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Grants List */}
      <section className="py-16">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Grants</h2>
              <p className="text-lg text-gray-600">
                Detailed breakdown of funding sources and allocation
              </p>
            </div>

            <div className="space-y-6">
              {grants.map((grant) => (
                <div
                  key={grant.id}
                  className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">{grant.name}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(grant.status)}`}>
                            {grant.status}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-2">{grant.funder}</p>
                        <p className="text-sm text-gray-700">{grant.description}</p>
                      </div>
                      <div className="text-right ml-6">
                        <div className="text-2xl font-bold text-gsv-green">
                          ${grant.amount.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">
                          {new Date(grant.receivedDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mb-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(grant.category)}`}>
                        {grant.category}
                      </span>
                      {grant.reportUrl && (
                        <a
                          href={grant.reportUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gsv-green hover:text-gsv-greenDark flex items-center gap-1 text-sm font-medium"
                        >
                          <FileText className="w-4 h-4" />
                          View Report
                        </a>
                      )}
                    </div>

                    {/* Objectives and Outcomes */}
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Objectives</h4>
                        <ul className="space-y-2">
                          {grant.objectives.map((objective, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                              <Target className="w-4 h-4 text-gsv-green mt-0.5 flex-shrink-0" />
                              <span>{objective}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Outcomes</h4>
                        <ul className="space-y-2">
                          {grant.outcomes.map((outcome, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                              <Award className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                              <span>{outcome}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Use of Funds */}
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Use of Funds</h4>
                      <div className="space-y-3">
                        {grant.useOfFunds.map((fund, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">{fund.category}</div>
                              <div className="text-sm text-gray-600">{fund.description}</div>
                            </div>
                            <div className="text-right ml-4">
                              <div className="font-semibold text-gray-900">
                                ${fund.amount.toLocaleString()}
                              </div>
                              <div className="text-sm text-gray-600">{fund.percentage}%</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Impact */}
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Impact
                      </h4>
                      <p className="text-green-700 text-sm">{grant.impact}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Funding Philosophy */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Funding Philosophy</h2>
              <p className="text-lg text-gray-600">
                How we ensure every grant dollar maximizes environmental education impact
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Impact-First Allocation</h3>
                <p className="text-gray-600 mb-4">
                  We allocate the majority of grant funds directly to program delivery and impact creation,
                  with minimal overhead to ensure maximum benefit for students and schools.
                </p>
                <div className="bg-green-50 rounded-lg p-3">
                  <div className="text-sm text-green-800">
                    <strong>94% of grant funds</strong> go directly to program impact
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Rigorous Evaluation</h3>
                <p className="text-gray-600 mb-4">
                  Every grant includes comprehensive evaluation to measure outcomes and ensure
                  we&apos;re meeting our commitments to funders and the communities we serve.
                </p>
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="text-sm text-blue-800">
                    <strong>Independent evaluation</strong> validates all program outcomes
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Sustainable Growth</h3>
                <p className="text-gray-600 mb-4">
                  We build long-term partnerships and sustainable programs rather than one-time events,
                  creating lasting environmental education infrastructure.
                </p>
                <div className="bg-purple-50 rounded-lg p-3">
                  <div className="text-sm text-purple-800">
                    <strong>Multi-year partnerships</strong> with 85% retention rate
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Full Accountability</h3>
                <p className="text-gray-600 mb-4">
                  We provide detailed reporting to all funders and maintain complete financial transparency,
                  ensuring trust and continued support for our mission.
                </p>
                <div className="bg-orange-50 rounded-lg p-3">
                  <div className="text-sm text-orange-800">
                    <strong>Quarterly reports</strong> to all grant funders
                  </div>
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
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Support Our Mission</h2>
            <p className="text-lg text-gray-600 mb-8">
              Join our grant funders in making environmental STEM education accessible to all students
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/donate"
                className="bg-gsv-green text-white px-8 py-3 rounded-lg hover:bg-gsv-greenDark transition-colors font-medium"
              >
                Donate Now
              </a>
              <a
                href="/why-support-us"
                className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Learn About Our Impact
              </a>
              <a
                href="/fundraising/one-pager"
                className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Download Grant Summary
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
