"use client";
import { useState, useEffect } from "react";
import { Calendar, Users, Award, ExternalLink, Filter, Star } from "lucide-react";

interface Project {
  id: string;
  title: string;
  department: string;
  description: string;
  outcomes: string[];
  images: string[];
  completedDate: string;
  featured: boolean;
  internNames: string[];
  impact: string;
}

export default function InternProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [projects, selectedDepartment, showFeaturedOnly]);

  const loadProjects = async () => {
    try {
      const response = await fetch('/api/interns/projects');
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects || []);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProjects = () => {
    let filtered = projects;

    if (showFeaturedOnly) {
      filtered = filtered.filter(project => project.featured);
    }

    if (selectedDepartment !== 'all') {
      filtered = filtered.filter(project => project.department === selectedDepartment);
    }

    // Sort by completion date (newest first)
    filtered.sort((a, b) => new Date(b.completedDate).getTime() - new Date(a.completedDate).getTime());

    setFilteredProjects(filtered);
  };

  // Sample project data - in production this would come from the API
  const sampleProjects: Project[] = [
    {
      id: '1',
      title: 'Volunteer Management Platform Redesign',
      department: 'Technology',
      description: 'Complete overhaul of the volunteer signup and management system, improving user experience and administrative efficiency.',
      outcomes: [
        'Reduced signup time by 40%',
        'Improved volunteer retention tracking',
        'Enhanced admin dashboard with real-time analytics',
        'Mobile-responsive design for on-the-go access'
      ],
      images: ['/api/placeholder/400/300', '/api/placeholder/400/300'],
      completedDate: '2024-01-15',
      featured: true,
      internNames: ['Alex Chen', 'Maria Rodriguez'],
      impact: 'Streamlined volunteer onboarding process, increasing volunteer satisfaction and administrative efficiency.'
    },
    {
      id: '2',
      title: 'School Partnership Expansion Campaign',
      department: 'Outreach',
      description: 'Developed and executed a comprehensive outreach strategy to expand partnerships with local schools and districts.',
      outcomes: [
        'Secured partnerships with 15 new schools',
        'Created school outreach toolkit',
        'Established monthly communication newsletter',
        'Organized teacher information sessions'
      ],
      images: ['/api/placeholder/400/300'],
      completedDate: '2024-02-01',
      featured: true,
      internNames: ['Jordan Kim'],
      impact: 'Expanded program reach to serve 3,000 additional students across 5 new school districts.'
    },
    {
      id: '3',
      title: 'Environmental Education Video Series',
      department: 'Media',
      description: 'Produced a 6-part video series explaining complex environmental concepts through engaging animations and real-world examples.',
      outcomes: [
        'Created 6 educational videos (2-3 minutes each)',
        'Developed accompanying lesson plans',
        'Reached 50,000+ views on social media',
        'Translated content into Spanish and Mandarin'
      ],
      images: ['/api/placeholder/400/300', '/api/placeholder/400/300', '/api/placeholder/400/300'],
      completedDate: '2023-12-20',
      featured: true,
      internNames: ['Sarah Patel', 'Marcus Johnson'],
      impact: 'Made complex environmental topics accessible to broader audience, supporting classroom learning objectives.'
    },
    {
      id: '4',
      title: 'Volunteer Training Curriculum Enhancement',
      department: 'Volunteer Development',
      description: 'Redesigned the volunteer training program with interactive modules, assessments, and ongoing professional development resources.',
      outcomes: [
        'Created modular training curriculum',
        'Developed assessment tools for skill tracking',
        'Established mentor program for new volunteers',
        'Created resource library for ongoing learning'
      ],
      images: ['/api/placeholder/400/300'],
      completedDate: '2024-01-30',
      featured: false,
      internNames: ['Emma Davis'],
      impact: 'Improved volunteer preparedness and presentation quality, leading to higher teacher satisfaction scores.'
    },
    {
      id: '5',
      title: 'Internal Communications System',
      department: 'Communications',
      description: 'Implemented a centralized communication platform to streamline internal team coordination and information sharing.',
      outcomes: [
        'Set up project management and documentation tools',
        'Created standardized reporting templates',
        'Established weekly team update process',
        'Developed knowledge base for organizational processes'
      ],
      images: ['/api/placeholder/400/300', '/api/placeholder/400/300'],
      completedDate: '2023-11-15',
      featured: false,
      internNames: ['Ryan Foster', 'Priya Singh'],
      impact: 'Improved team coordination and information flow, reducing miscommunication and increasing productivity.'
    },
    {
      id: '6',
      title: 'Presentation Logistics Optimization',
      department: 'Operations',
      description: 'Streamlined the presentation scheduling and logistics process through automation and improved coordination tools.',
      outcomes: [
        'Automated scheduling conflict detection',
        'Created centralized equipment tracking system',
        'Developed presentation preparation checklists',
        'Implemented feedback collection automation'
      ],
      images: ['/api/placeholder/400/300'],
      completedDate: '2024-02-15',
      featured: false,
      internNames: ['David Wong'],
      impact: 'Reduced presentation setup time by 30% and improved overall presentation quality and consistency.'
    }
  ];

  useEffect(() => {
    // Simulate loading project data
    setTimeout(() => {
      setProjects(sampleProjects);
      setLoading(false);
    }, 1000);
  }, []);

  const departments = ['Technology', 'Outreach', 'Media', 'Volunteer Development', 'Communications', 'Operations'];

  const getDepartmentColor = (department: string) => {
    const colors: { [key: string]: string } = {
      'Technology': 'bg-purple-100 text-purple-800',
      'Outreach': 'bg-blue-100 text-blue-800',
      'Media': 'bg-yellow-100 text-yellow-800',
      'Volunteer Development': 'bg-red-100 text-red-800',
      'Communications': 'bg-green-100 text-green-800',
      'Operations': 'bg-indigo-100 text-indigo-800'
    };
    return colors[department] || 'bg-gray-100 text-gray-800';
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
              Intern Project Showcase
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8">
              Real projects, real impact, real learning experiences
            </p>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 max-w-2xl mx-auto">
              <p className="text-white/90">
                See the innovative work our interns have accomplished across all departments.
                These projects demonstrate the meaningful contributions interns make to our mission.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-12 bg-white border-b">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Filter Projects</h2>
                <p className="text-gray-600">Find projects by department or view featured work</p>
              </div>

              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showFeaturedOnly}
                      onChange={(e) => setShowFeaturedOnly(e.target.checked)}
                      className="rounded border-gray-300 text-gsv-green focus:ring-gsv-green"
                    />
                    <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      <Star className="w-4 h-4" />
                      Featured Only
                    </span>
                  </label>
                </div>

                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gsv-green focus:border-transparent"
                >
                  <option value="all">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-16">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            {filteredProjects.length === 0 ? (
              <div className="text-center py-12">
                <Filter className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No projects found</h3>
                <p className="text-gray-600">Try adjusting your filters to see more projects</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProjects.map((project) => (
                  <div
                    key={project.id}
                    className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow overflow-hidden"
                  >
                    {/* Featured Badge */}
                    {project.featured && (
                      <div className="bg-yellow-400 text-yellow-900 px-3 py-1 text-xs font-medium flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        Featured Project
                      </div>
                    )}

                    {/* Images */}
                    <div className="aspect-video bg-gray-100 relative">
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center">
                          <Award className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-600 text-sm">Project Images</p>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDepartmentColor(project.department)}`}>
                          {project.department}
                        </span>
                        {project.featured && (
                          <Star className="w-4 h-4 text-yellow-500" />
                        )}
                      </div>

                      <h3 className="text-lg font-bold text-gray-900 mb-2">{project.title}</h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{project.description}</p>

                      {/* Intern Names */}
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                        <Users className="w-4 h-4" />
                        <span>{project.internNames.join(', ')}</span>
                      </div>

                      {/* Completion Date */}
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                        <Calendar className="w-4 h-4" />
                        <span>Completed {new Date(project.completedDate).toLocaleDateString()}</span>
                      </div>

                      {/* Key Outcomes */}
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-900 text-sm mb-2">Key Outcomes</h4>
                        <ul className="space-y-1">
                          {project.outcomes.slice(0, 2).map((outcome, index) => (
                            <li key={index} className="text-xs text-gray-700 flex items-start gap-2">
                              <span className="text-gsv-green font-bold mt-1">•</span>
                              <span>{outcome}</span>
                            </li>
                          ))}
                          {project.outcomes.length > 2 && (
                            <li className="text-xs text-gray-700 flex items-start gap-2">
                              <span className="text-gsv-green font-bold mt-1">•</span>
                              <span>+{project.outcomes.length - 2} more outcomes</span>
                            </li>
                          )}
                        </ul>
                      </div>

                      {/* Impact */}
                      <div className="bg-gray-50 rounded-lg p-3">
                        <h4 className="font-semibold text-gray-900 text-sm mb-1">Impact</h4>
                        <p className="text-xs text-gray-700">{project.impact}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Intern Impact</h2>
              <p className="text-lg text-gray-600">
                The measurable difference our interns make
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-gsv-green mb-2">{projects.length}</div>
                <p className="text-gray-600">Projects Completed</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gsv-green mb-2">
                  {projects.reduce((sum, p) => sum + p.internNames.length, 0)}
                </div>
                <p className="text-gray-600">Intern Contributors</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gsv-green mb-2">
                  {projects.filter(p => p.featured).length}
                </div>
                <p className="text-gray-600">Featured Projects</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gsv-green mb-2">
                  {departments.length}
                </div>
                <p className="text-gray-600">Departments</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gsv-green/5">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Create Impact?</h2>
            <p className="text-lg text-gray-600 mb-8">
              Join our intern program and work on projects that matter
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/interns/departments"
                className="bg-gsv-green text-white px-8 py-3 rounded-lg hover:bg-gsv-greenDark transition-colors font-medium"
              >
                Explore Departments
              </a>
              <a
                href="/get-involved/intern"
                className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Apply Now
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
