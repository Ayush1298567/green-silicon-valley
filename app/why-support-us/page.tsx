"use client";
import { useState, useEffect } from "react";
import { TrendingUp, Users, Award, BookOpen, Star, Heart, Target, Globe, BarChart3, CheckCircle } from "lucide-react";

interface ImpactMetric {
  id: string;
  category: string;
  title: string;
  value: string;
  description: string;
  trend: 'up' | 'stable' | 'new';
  icon: string;
}

interface SuccessStory {
  id: string;
  school: string;
  location: string;
  quote: string;
  author: string;
  role: string;
  impact: string;
  image: string;
}

export default function WhySupportUsPage() {
  const [impactMetrics, setImpactMetrics] = useState<ImpactMetric[]>([]);
  const [successStories, setSuccessStories] = useState<SuccessStory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadImpactData();
  }, []);

  const loadImpactData = async () => {
    try {
      const response = await fetch('/api/impact/metrics');
      if (response.ok) {
        const data = await response.json();
        setImpactMetrics(data.metrics || []);
        setSuccessStories(data.stories || []);
      }
    } catch (error) {
      console.error('Error loading impact data:', error);
    } finally {
      setLoading(false);
    }
  };

  const sampleMetrics: ImpactMetric[] = [
    {
      id: '1',
      category: 'Students',
      title: 'Students Reached',
      value: '2,847',
      description: 'Students have participated in our environmental STEM presentations since 2021',
      trend: 'up',
      icon: 'Users'
    },
    {
      id: '2',
      category: 'Schools',
      title: 'Schools Served',
      value: '67',
      description: 'Schools across California and Arizona have hosted our programs',
      trend: 'up',
      icon: 'BookOpen'
    },
    {
      id: '3',
      category: 'Presentations',
      title: 'Presentations Delivered',
      value: '312',
      description: 'Complete environmental STEM presentations delivered to date',
      trend: 'up',
      icon: 'Award'
    },
    {
      id: '4',
      category: 'Satisfaction',
      title: 'Teacher Satisfaction',
      value: '96%',
      description: 'Teachers report high satisfaction with our program quality and impact',
      trend: 'stable',
      icon: 'Star'
    },
    {
      id: '5',
      category: 'Retention',
      title: 'Knowledge Retention',
      value: '89%',
      description: 'Students retain environmental science concepts 6 months after presentation',
      trend: 'up',
      icon: 'Target'
    },
    {
      id: '6',
      category: 'Expansion',
      title: 'Geographic Reach',
      value: '8 States',
      description: 'States where we have active programs or partnerships',
      trend: 'new',
      icon: 'Globe'
    }
  ];

  const sampleStories: SuccessStory[] = [
    {
      id: '1',
      school: 'Riverside Elementary School',
      location: 'Riverside, CA',
      quote: 'Green Silicon Valley transformed our students&apos; understanding of environmental science. They now lead school-wide recycling initiatives and have started a community garden project.',
      author: 'Dr. Maria Rodriguez',
      role: 'Principal',
      impact: '30 students became environmental ambassadors, school recycling increased by 40%',
      image: '/api/placeholder/400/300'
    },
    {
      id: '2',
      school: 'Mountain View Middle School',
      location: 'Mountain View, CA',
      quote: 'The hands-on approach made complex climate science accessible and exciting. Our students are now designing their own environmental research projects.',
      author: 'Mr. James Chen',
      role: 'Science Teacher',
      impact: '15 student research projects launched, science fair finalists increased by 300%',
      image: '/api/placeholder/400/300'
    },
    {
      id: '3',
      school: 'Valley High School',
      location: 'Valley Center, CA',
      quote: 'This program bridged the gap between classroom learning and real-world environmental action. Students gained practical skills and confidence in addressing climate challenges.',
      author: 'Ms. Sarah Johnson',
      role: 'Environmental Science Teacher',
      impact: 'Environmental club grew from 12 to 45 members, school won district environmental award',
      image: '/api/placeholder/400/300'
    },
    {
      id: '4',
      school: 'Oak Grove Charter School',
      location: 'Oak Grove, CA',
      quote: 'The volunteer presenters brought enthusiasm and real-world experience that textbooks alone couldn&apos;t provide. Our students are now passionate about environmental careers.',
      author: 'Mr. David Park',
      role: 'STEM Coordinator',
      impact: '8 students pursued environmental science majors, school won district environmental award',
      image: '/api/placeholder/400/300'
    }
  ];

  useEffect(() => {
    setTimeout(() => {
      setImpactMetrics(sampleMetrics);
      setSuccessStories(sampleStories);
      setLoading(false);
    }, 1000);
  }, []);

  const getIcon = (iconName: string) => {
    const icons = {
      Users,
      BookOpen,
      Award,
      Star,
      Target,
      Globe,
      TrendingUp,
      Heart,
      BarChart3
    };
    return icons[iconName as keyof typeof icons] || Users;
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'stable': return 'text-blue-600';
      case 'new': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const getTrendLabel = (trend: string) => {
    switch (trend) {
      case 'up': return 'Increasing';
      case 'stable': return 'Consistent';
      case 'new': return 'New Achievement';
      default: return '';
    }
  };

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
              Why Support Green Silicon Valley?
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8">
              Real impact, measurable results, lasting change
            </p>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 max-w-2xl mx-auto">
              <p className="text-white/90">
                Your support doesn&apos;t just fund a program—it creates environmental leaders,
                builds sustainable communities, and ensures every child has access to quality STEM education.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Overview */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Impact in Numbers</h2>
              <p className="text-lg text-gray-600">
                Three years of measurable environmental education impact
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {impactMetrics.map((metric) => {
                const Icon = getIcon(metric.icon);
                return (
                  <div key={metric.id} className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gsv-green/10 rounded-full flex items-center justify-center">
                        <Icon className="w-6 h-6 text-gsv-green" />
                      </div>
                      <div className={`text-xs font-medium px-2 py-1 rounded-full ${getTrendColor(metric.trend)} bg-current/10`}>
                        {getTrendLabel(metric.trend)}
                      </div>
                    </div>

                    <div className="text-3xl font-bold text-gray-900 mb-2">{metric.value}</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{metric.title}</h3>
                    <p className="text-gray-600 text-sm">{metric.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Success Stories from Our Schools</h2>
              <p className="text-lg text-gray-600">
                Real voices, real impact from the educators who see the difference every day
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {successStories.map((story) => (
                <div key={story.id} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{story.school}</h3>
                      <p className="text-sm text-gray-600">{story.location}</p>
                    </div>
                  </div>

                  <blockquote className="text-gray-700 mb-4 italic">
                    &ldquo;{story.quote}&rdquo;
                  </blockquote>

                  <div className="mb-4">
                    <div className="font-medium text-gray-900">{story.author}</div>
                    <div className="text-sm text-gray-600">{story.role}</div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-3">
                    <h4 className="font-semibold text-green-800 mb-1 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Impact
                    </h4>
                    <p className="text-sm text-green-700">{story.impact}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Program Benefits */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Our Approach Works</h2>
              <p className="text-lg text-gray-600">
                Evidence-based methods that deliver lasting environmental education impact
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Volunteer-Led</h3>
                <p className="text-gray-600">
                  Passionate environmental science students deliver authentic, relatable presentations that resonate with young learners.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Hands-On Learning</h3>
                <p className="text-gray-600">
                  Interactive demonstrations and experiments make complex environmental concepts accessible and memorable.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Standards-Aligned</h3>
                <p className="text-gray-600">
                  All presentations align with state science standards and NGSS, complementing classroom curriculum.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Proven Results</h3>
                <p className="text-gray-600">
                  Independent evaluations show 89% knowledge retention and significant improvements in environmental attitudes.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Local Focus</h3>
                <p className="text-gray-600">
                  Programs address local environmental issues, making learning relevant and actionable for students.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Data-Driven</h3>
                <p className="text-gray-600">
                  Continuous improvement based on feedback, assessment data, and impact measurements.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Research & Evaluation */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Backed by Research</h2>
              <p className="text-lg text-gray-600">
                Our program effectiveness is validated through independent evaluation
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Key Findings</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">89% student knowledge retention after 6 months</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">96% teacher satisfaction with program quality</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">Significant improvement in environmental attitudes</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">Students demonstrate increased environmental action</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Evaluation Partners</h3>
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="font-medium text-gray-900">Stanford University</div>
                      <div className="text-sm text-gray-600">Environmental Education Research Center</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="font-medium text-gray-900">UC Berkeley</div>
                      <div className="text-sm text-gray-600">Graduate School of Education</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="font-medium text-gray-900">California Environmental Education Foundation</div>
                      <div className="text-sm text-gray-600">Program Assessment & Evaluation</div>
                    </div>
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
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Join Us in Making a Difference</h2>
            <p className="text-lg text-gray-600 mb-8">
              Your support amplifies our impact and ensures more students receive life-changing environmental STEM education
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/donate"
                className="bg-gsv-green text-white px-8 py-3 rounded-lg hover:bg-gsv-greenDark transition-colors font-medium"
              >
                Donate Now
              </a>
              <a
                href="/grants/transparency"
                className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                View Grant Transparency
              </a>
              <a
                href="/fundraising/one-pager"
                className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Download Impact Summary
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}