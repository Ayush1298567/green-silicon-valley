"use client";
import { useState, useEffect } from "react";
import { Users, Target, Lightbulb, TrendingUp, Heart, Zap, ChevronDown, ChevronUp } from "lucide-react";

interface Department {
  id: string;
  name: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  icon: string;
  color: string;
}

export default function InternDepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [expandedDepartment, setExpandedDepartment] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      const response = await fetch('/api/interns/departments');
      if (response.ok) {
        const data = await response.json();
        setDepartments(data.departments || []);
      }
    } catch (error) {
      console.error('Error loading departments:', error);
    } finally {
      setLoading(false);
    }
  };

  // Sample department data - in production this would come from the API
  const sampleDepartments: Department[] = [
    {
      id: 'outreach',
      name: 'Outreach',
      description: 'Build partnerships with schools and coordinate presentation logistics',
      responsibilities: [
        'Manage teacher relationships and communications',
        'Schedule presentations and handle logistics',
        'Track presentation impact and feedback',
        'Develop outreach materials and strategies',
        'Coordinate with school districts and administrators'
      ],
      requirements: [
        'Strong communication and organizational skills',
        'Experience with customer relationship management',
        'Interest in education and community engagement',
        'Ability to coordinate complex logistics'
      ],
      icon: 'Users',
      color: 'blue'
    },
    {
      id: 'technology',
      name: 'Technology',
      description: 'Develop and maintain digital platforms and volunteer management systems',
      responsibilities: [
        'Maintain and improve volunteer management platform',
        'Develop new features and user interfaces',
        'Manage databases and ensure data integrity',
        'Implement automation and workflow improvements',
        'Handle technical support and troubleshooting'
      ],
      requirements: [
        'Programming experience (preferred languages: TypeScript, Python)',
        'Understanding of web development and databases',
        'Problem-solving and analytical thinking',
        'Interest in educational technology'
      ],
      icon: 'Zap',
      color: 'purple'
    },
    {
      id: 'media',
      name: 'Media',
      description: 'Create content, manage social media, and tell our story visually',
      responsibilities: [
        'Create engaging social media content',
        'Produce videos and photography for presentations',
        'Design marketing materials and presentations',
        'Manage website content and blog posts',
        'Track engagement metrics and analytics'
      ],
      requirements: [
        'Graphic design or video production experience',
        'Social media management skills',
        'Creative writing and storytelling abilities',
        'Photography or videography skills'
      ],
      icon: 'Lightbulb',
      color: 'yellow'
    },
    {
      id: 'volunteer-development',
      name: 'Volunteer Development',
      description: 'Recruit, train, and support our volunteer teams',
      responsibilities: [
        'Manage volunteer recruitment and applications',
        'Coordinate training sessions and workshops',
        'Support volunteer team formation and dynamics',
        'Track volunteer engagement and retention',
        'Develop volunteer resources and support materials'
      ],
      requirements: [
        'Experience with volunteer management or HR',
        'Strong interpersonal and training skills',
        'Understanding of team dynamics',
        'Passion for mentorship and development'
      ],
      icon: 'Heart',
      color: 'red'
    },
    {
      id: 'communications',
      name: 'Communications',
      description: 'Manage internal communications and stakeholder relationships',
      responsibilities: [
        'Coordinate internal team communications',
        'Manage newsletter and email campaigns',
        'Handle stakeholder relationships and partnerships',
        'Organize events and team meetings',
        'Maintain organizational documentation'
      ],
      requirements: [
        'Excellent written and verbal communication skills',
        'Experience with email marketing tools',
        'Strong organizational and coordination abilities',
        'Understanding of nonprofit communications'
      ],
      icon: 'Target',
      color: 'green'
    },
    {
      id: 'operations',
      name: 'Operations',
      description: 'Handle logistics, process optimization, and behind-the-scenes coordination',
      responsibilities: [
        'Manage operational workflows and processes',
        'Coordinate logistics for events and presentations',
        'Handle administrative tasks and record-keeping',
        'Optimize operational efficiency and scalability',
        'Support cross-departmental coordination'
      ],
      requirements: [
        'Strong organizational and logistical skills',
        'Attention to detail and process orientation',
        'Experience with operational management',
        'Problem-solving and analytical abilities'
      ],
      icon: 'TrendingUp',
      color: 'indigo'
    }
  ];

  useEffect(() => {
    // Simulate loading department data
    setTimeout(() => {
      setDepartments(sampleDepartments);
      setLoading(false);
    }, 1000);
  }, []);

  const toggleDepartment = (departmentId: string) => {
    setExpandedDepartment(expandedDepartment === departmentId ? null : departmentId);
  };

  const getIcon = (iconName: string) => {
    const icons = {
      Users,
      Target,
      Lightbulb,
      TrendingUp,
      Heart,
      Zap
    };
    return icons[iconName as keyof typeof icons] || Users;
  };

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 border-blue-200 text-blue-900',
      purple: 'bg-purple-50 border-purple-200 text-purple-900',
      yellow: 'bg-yellow-50 border-yellow-200 text-yellow-900',
      red: 'bg-red-50 border-red-200 text-red-900',
      green: 'bg-green-50 border-green-200 text-green-900',
      indigo: 'bg-indigo-50 border-indigo-200 text-indigo-900'
    };
    return colors[color as keyof typeof colors] || colors.blue;
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
              Intern Departments
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8">
              Explore our different departments and find your perfect internship role
            </p>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 max-w-2xl mx-auto">
              <p className="text-white/90">
                Green Silicon Valley interns work across six departments, each offering unique opportunities
                to contribute to our mission of environmental STEM education.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Departments Grid */}
      <section className="py-16">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {departments.map((department) => {
                const Icon = getIcon(department.icon);
                const isExpanded = expandedDepartment === department.id;

                return (
                  <div
                    key={department.id}
                    className={`rounded-lg border-2 transition-all duration-300 cursor-pointer ${
                      isExpanded
                        ? 'border-gsv-green shadow-lg'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                    }`}
                    onClick={() => toggleDepartment(department.id)}
                  >
                    <div className={`p-6 ${getColorClasses(department.color)}`}>
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          department.color === 'yellow' ? 'bg-yellow-200' : 'bg-white/20'
                        }`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-6 h-6" />
                        ) : (
                          <ChevronDown className="w-6 h-6" />
                        )}
                      </div>

                      <h3 className="text-xl font-bold mb-2">{department.name}</h3>
                      <p className="text-sm opacity-90 mb-4">{department.description}</p>

                      {!isExpanded && (
                        <div className="text-sm">
                          <span className="font-medium">{department.responsibilities.length} responsibilities</span>
                          <span className="mx-2">•</span>
                          <span className="font-medium">{department.requirements.length} requirements</span>
                        </div>
                      )}
                    </div>

                    {isExpanded && (
                      <div className="bg-white p-6 border-t">
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Key Responsibilities</h4>
                            <ul className="space-y-1">
                              {department.responsibilities.map((responsibility, index) => (
                                <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                                  <span className="text-gsv-green font-bold mt-1">•</span>
                                  <span>{responsibility}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Requirements</h4>
                            <ul className="space-y-1">
                              {department.requirements.map((requirement, index) => (
                                <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                                  <span className="text-blue-600 font-bold mt-1">•</span>
                                  <span>{requirement}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Intern Experience */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Intern Experience</h2>
              <p className="text-lg text-gray-600">
                What you can expect as a Green Silicon Valley intern
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">What You&apos;ll Learn</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-gsv-green rounded-full mt-2 flex-shrink-0"></div>
                    <span>Environmental science and climate education</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-gsv-green rounded-full mt-2 flex-shrink-0"></div>
                    <span>Nonprofit operations and management</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-gsv-green rounded-full mt-2 flex-shrink-0"></div>
                    <span>Project coordination and team leadership</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-gsv-green rounded-full mt-2 flex-shrink-0"></div>
                    <span>Community engagement and education</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-gsv-green rounded-full mt-2 flex-shrink-0"></div>
                    <span>Professional development and networking</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">What You&apos;ll Do</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Work on real projects with measurable impact</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Collaborate with passionate team members</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Present to diverse audiences and stakeholders</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Contribute to organizational strategy and growth</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Build leadership and professional skills</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gsv-green/5">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Join Our Team?</h2>
            <p className="text-lg text-gray-600 mb-8">
              Apply for an internship and contribute to environmental STEM education
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/get-involved/intern"
                className="bg-gsv-green text-white px-8 py-3 rounded-lg hover:bg-gsv-greenDark transition-colors font-medium"
              >
                Apply for Internship
              </a>
              <a
                href="/interns/projects"
                className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                View Past Projects
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
