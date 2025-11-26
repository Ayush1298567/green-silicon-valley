"use client";
import { useState, useEffect } from "react";
import { CheckCircle, Circle, Clock, ArrowRight, Download, Calendar, Users, Target, BookOpen, Award } from "lucide-react";

interface OnboardingItem {
  id: string;
  title: string;
  description: string;
  category: 'administrative' | 'training' | 'department' | 'orientation';
  estimatedTime: string;
  required: boolean;
  completed: boolean;
  order: number;
}

interface OnboardingMilestone {
  week: number;
  title: string;
  description: string;
  keyActivities: string[];
  deliverables: string[];
}

export default function InternOnboardingPage() {
  const [checklistItems, setChecklistItems] = useState<OnboardingItem[]>([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOnboardingData();
  }, []);

  useEffect(() => {
    setCompletedCount(checklistItems.filter(item => item.completed).length);
  }, [checklistItems]);

  const loadOnboardingData = async () => {
    try {
      // In production, this would load from the API
      // For now, we'll use sample data
      const response = await fetch('/api/interns/onboarding');
      if (response.ok) {
        const data = await response.json();
        setChecklistItems(data.checklist || sampleChecklist);
      } else {
        setChecklistItems(sampleChecklist);
      }
    } catch (error) {
      console.error('Error loading onboarding data:', error);
      setChecklistItems(sampleChecklist);
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = async (itemId: string) => {
    const updatedItems = checklistItems.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    setChecklistItems(updatedItems);

    // In production, this would update the database
    try {
      await fetch(`/api/interns/onboarding/checklist/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !checklistItems.find(i => i.id === itemId)?.completed })
      });
    } catch (error) {
      console.error('Error updating checklist item:', error);
    }
  };

  const sampleChecklist: OnboardingItem[] = [
    // Week 1: Administrative & Orientation
    {
      id: '1',
      title: 'Complete HR paperwork and background check',
      description: 'Fill out necessary forms, tax documents, and undergo background verification',
      category: 'administrative',
      estimatedTime: '2-3 hours',
      required: true,
      completed: false,
      order: 1
    },
    {
      id: '2',
      title: 'Set up email and access accounts',
      description: 'Get organizational email, Slack, and access to internal tools',
      category: 'administrative',
      estimatedTime: '30 minutes',
      required: true,
      completed: false,
      order: 2
    },
    {
      id: '3',
      title: 'Attend welcome orientation',
      description: 'Join the full team for introductions and overview of our mission and values',
      category: 'orientation',
      estimatedTime: '2 hours',
      required: true,
      completed: false,
      order: 3
    },
    {
      id: '4',
      title: 'Review organizational policies and handbook',
      description: 'Read through code of conduct, remote work policies, and organizational guidelines',
      category: 'orientation',
      estimatedTime: '1 hour',
      required: true,
      completed: false,
      order: 4
    },

    // Week 2: Department Training
    {
      id: '5',
      title: 'Meet with department supervisor',
      description: 'One-on-one meeting to discuss role expectations and initial projects',
      category: 'department',
      estimatedTime: '1 hour',
      required: true,
      completed: false,
      order: 5
    },
    {
      id: '6',
      title: 'Complete department-specific training',
      description: 'Learn tools, processes, and workflows specific to your department',
      category: 'training',
      estimatedTime: '4-6 hours',
      required: true,
      completed: false,
      order: 6
    },
    {
      id: '7',
      title: 'Set up development environment',
      description: 'Install necessary software, get access to code repositories, and configure workstations',
      category: 'training',
      estimatedTime: '2-4 hours',
      required: true,
      completed: false,
      order: 7
    },
    {
      id: '8',
      title: 'Shadow team meetings and presentations',
      description: 'Observe team meetings, client calls, and presentation preparations',
      category: 'training',
      estimatedTime: 'Ongoing',
      required: false,
      completed: false,
      order: 8
    },

    // Week 3-4: Hands-on Experience
    {
      id: '9',
      title: 'Complete first small project or task',
      description: 'Work on an initial assignment to apply your training and demonstrate skills',
      category: 'department',
      estimatedTime: '8-12 hours',
      required: true,
      completed: false,
      order: 9
    },
    {
      id: '10',
      title: 'Participate in team brainstorming sessions',
      description: 'Join collaborative sessions to contribute ideas and learn from peers',
      category: 'department',
      estimatedTime: 'Ongoing',
      required: false,
      completed: false,
      order: 10
    },
    {
      id: '11',
      title: 'Receive and give feedback',
      description: 'Complete performance check-in and provide feedback on onboarding process',
      category: 'orientation',
      estimatedTime: '1 hour',
      required: true,
      completed: false,
      order: 11
    },
    {
      id: '12',
      title: 'Create personal development plan',
      description: 'Set goals and identify areas for growth during your internship',
      category: 'orientation',
      estimatedTime: '2 hours',
      required: false,
      completed: false,
      order: 12
    }
  ];

  const milestones: OnboardingMilestone[] = [
    {
      week: 1,
      title: 'Foundation & Orientation',
      description: 'Get settled in and understand our mission, values, and organizational structure.',
      keyActivities: [
        'Complete administrative paperwork',
        'Attend welcome orientation',
        'Set up accounts and tools',
        'Review policies and handbook'
      ],
      deliverables: [
        'Signed paperwork',
        'Account access confirmed',
        'Orientation attendance'
      ]
    },
    {
      week: 2,
      title: 'Department Integration',
      description: 'Dive into your specific department and begin learning the tools and processes.',
      keyActivities: [
        'Meet supervisor and team',
        'Complete department training',
        'Set up development environment',
        'Shadow team activities'
      ],
      deliverables: [
        'Department training completion',
        'Environment setup confirmation',
        'Meeting notes and learnings'
      ]
    },
    {
      week: 3,
      title: 'Hands-on Experience',
      description: 'Apply your knowledge through real projects and collaborative work.',
      keyActivities: [
        'Complete first project',
        'Participate in team activities',
        'Receive initial feedback',
        'Create development plan'
      ],
      deliverables: [
        'Completed project',
        'Feedback documentation',
        'Personal development plan'
      ]
    },
    {
      week: 4,
      title: 'Full Integration',
      description: 'Take ownership of responsibilities and contribute fully to team goals.',
      keyActivities: [
        'Lead small initiatives',
        'Mentor newer team members',
        'Contribute to department strategy',
        'Plan for internship conclusion'
      ],
      deliverables: [
        'Leadership experience',
        'Mentorship activities',
        'Final project completion',
        'Exit interview and reflection'
      ]
    }
  ];

  const getCategoryIcon = (category: string) => {
    const icons = {
      administrative: BookOpen,
      training: Target,
      department: Users,
      orientation: Award
    };
    return icons[category as keyof typeof icons] || Circle;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      administrative: 'text-blue-600 bg-blue-50',
      training: 'text-green-600 bg-green-50',
      department: 'text-purple-600 bg-purple-50',
      orientation: 'text-orange-600 bg-orange-50'
    };
    return colors[category as keyof typeof colors] || 'text-gray-600 bg-gray-50';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gsv-green"></div>
      </div>
    );
  }

  const progressPercentage = Math.round((completedCount / checklistItems.length) * 100);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gsv-green via-gsv-greenDark to-gsv-slate-900 text-white py-20">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Intern Onboarding
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8">
              Your journey to becoming a Green Silicon Valley contributor
            </p>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 max-w-2xl mx-auto">
              <p className="text-white/90">
                Welcome! This onboarding guide will help you get started and make the most of your internship experience.
                Track your progress and stay on schedule with our comprehensive checklist.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Progress Overview */}
      <section className="py-12 bg-white border-b">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Your Progress</h2>
                <span className="text-sm text-gray-600">
                  {completedCount} of {checklistItems.length} completed
                </span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div
                  className="bg-gsv-green h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>

              <div className="text-center">
                <span className="text-2xl font-bold text-gsv-green">{progressPercentage}%</span>
                <span className="text-gray-600 ml-2">Complete</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Milestones */}
      <section className="py-16">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">4-Week Timeline</h2>
              <p className="text-lg text-gray-600">
                Your journey from orientation to full contribution
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {milestones.map((milestone, index) => (
                <div key={milestone.week} className="relative">
                  <div className="bg-white rounded-lg shadow-sm border p-6 h-full">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-gsv-green text-white rounded-full flex items-center justify-center font-bold">
                        {milestone.week}
                      </div>
                      <span className="text-sm font-medium text-gray-600">Week {milestone.week}</span>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-2">{milestone.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{milestone.description}</p>

                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm mb-1">Key Activities</h4>
                        <ul className="space-y-1">
                          {milestone.keyActivities.map((activity, idx) => (
                            <li key={idx} className="text-xs text-gray-700 flex items-start gap-2">
                              <span className="text-gsv-green font-bold mt-1">•</span>
                              <span>{activity}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm mb-1">Deliverables</h4>
                        <ul className="space-y-1">
                          {milestone.deliverables.map((deliverable, idx) => (
                            <li key={idx} className="text-xs text-gray-700 flex items-start gap-2">
                              <ArrowRight className="w-3 h-3 text-gsv-green mt-1" />
                              <span>{deliverable}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {index < milestones.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                      <ArrowRight className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Checklist */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Onboarding Checklist</h2>
              <p className="text-lg text-gray-600">
                Track your progress and ensure you complete all necessary steps
              </p>
            </div>

            <div className="space-y-4">
              {checklistItems.map((item) => {
                const Icon = getCategoryIcon(item.category);
                const categoryColor = getCategoryColor(item.category);

                return (
                  <div
                    key={item.id}
                    className={`border rounded-lg p-6 transition-all duration-200 ${
                      item.completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <button
                        onClick={() => toggleItem(item.id)}
                        className={`flex-shrink-0 w-6 h-6 rounded-full border-2 transition-colors ${
                          item.completed
                            ? 'bg-gsv-green border-gsv-green text-white'
                            : 'border-gray-300 hover:border-gsv-green'
                        }`}
                      >
                        {item.completed && <CheckCircle className="w-6 h-6" />}
                      </button>

                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Icon className={`w-5 h-5 ${categoryColor.split(' ')[0]}`} />
                          <h3 className={`font-semibold ${item.completed ? 'text-green-800' : 'text-gray-900'}`}>
                            {item.title}
                          </h3>
                          {item.required && (
                            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                              Required
                            </span>
                          )}
                        </div>

                        <p className={`text-sm mb-3 ${item.completed ? 'text-green-700' : 'text-gray-600'}`}>
                          {item.description}
                        </p>

                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className={`px-2 py-1 rounded ${categoryColor}`}>
                            {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                          </span>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{item.estimatedTime}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Resources */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Helpful Resources</h2>
              <p className="text-lg text-gray-600">
                Everything you need to succeed during your internship
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Key Documents</h3>
                <div className="space-y-3">
                  <a href="#" className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <Download className="w-5 h-5 text-gsv-green" />
                    <div>
                      <div className="font-medium text-gray-900">Employee Handbook</div>
                      <div className="text-sm text-gray-600">Policies and procedures</div>
                    </div>
                  </a>
                  <a href="#" className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <Download className="w-5 h-5 text-gsv-green" />
                    <div>
                      <div className="font-medium text-gray-900">Department Guide</div>
                      <div className="text-sm text-gray-600">Your department overview</div>
                    </div>
                  </a>
                  <a href="#" className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <Download className="w-5 h-5 text-gsv-green" />
                    <div>
                      <div className="font-medium text-gray-900">Tools & Resources</div>
                      <div className="text-sm text-gray-600">Software and training materials</div>
                    </div>
                  </a>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Support & Contact</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3">
                    <Users className="w-5 h-5 text-gsv-green" />
                    <div>
                      <div className="font-medium text-gray-900">Your Supervisor</div>
                      <div className="text-sm text-gray-600">Schedule regular check-ins</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3">
                    <Calendar className="w-5 h-5 text-gsv-green" />
                    <div>
                      <div className="font-medium text-gray-900">Team Meetings</div>
                      <div className="text-sm text-gray-600">Weekly sync and planning</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3">
                    <Target className="w-5 h-5 text-gsv-green" />
                    <div>
                      <div className="font-medium text-gray-900">HR Support</div>
                      <div className="text-sm text-gray-600">Questions about policies or benefits</div>
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
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
            <p className="text-lg text-gray-600 mb-8">
              Begin your internship journey and make a difference in environmental education
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/get-involved/intern"
                className="bg-gsv-green text-white px-8 py-3 rounded-lg hover:bg-gsv-greenDark transition-colors font-medium"
              >
                Apply for Internship
              </a>
              <a
                href="/contact"
                className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Contact HR
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
