"use client";

import Link from "next/link";
import {
  Crown,
  GraduationCap,
  Users,
  User,
  Building,
  CheckCircle,
  Clock,
  Shield,
  Key,
  Eye,
  Edit3,
  MessageSquare,
  ChevronRight,
  ArrowLeft
} from "lucide-react";

interface AccountType {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  description: string;
  approvalRequired: boolean;
  approvalTime: string;
  permissions: string[];
  benefits: string[];
  requirements: string[];
  gettingStarted: string[];
}

const ACCOUNT_TYPES: AccountType[] = [
  {
    id: "founder",
    title: "Founder/Admin",
    icon: Crown,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    description: "Full access administrators with complete control over the platform.",
    approvalRequired: false,
    approvalTime: "Immediate",
    permissions: [
      "Full platform access",
      "User management",
      "Content management",
      "System administration",
      "Financial oversight",
      "Strategic decision making"
    ],
    benefits: [
      "Complete platform control",
      "Strategic leadership opportunities",
      "Executive decision making",
      "Platform development input",
      "Community leadership"
    ],
    requirements: [
      "Invited by existing founders",
      "Commitment to organizational mission",
      "Leadership experience",
      "Understanding of nonprofit operations"
    ],
    gettingStarted: [
      "Receive founder invitation",
      "Complete founder onboarding",
      "Access admin dashboard",
      "Begin platform management"
    ]
  },
  {
    id: "intern",
    title: "Intern",
    icon: GraduationCap,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    description: "Paid interns working on specific projects and gaining professional experience.",
    approvalRequired: true,
    approvalTime: "1-3 business days",
    permissions: [
      "Project-specific content editing",
      "Blog post creation and editing",
      "Team collaboration tools",
      "Resource access",
      "Mentorship program access"
    ],
    benefits: [
      "Paid internship opportunity",
      "Professional development",
      "Portfolio building",
      "Mentorship opportunities",
      "Networking with professionals",
      "Academic credit potential"
    ],
    requirements: [
      "Currently enrolled student",
      "Interest in environmental technology",
      "10-20 hours per week availability",
      "Minimum semester commitment"
    ],
    gettingStarted: [
      "Apply through intern application",
      "Await approval decision",
      "Complete onboarding process",
      "Begin assigned projects"
    ]
  },
  {
    id: "volunteer",
    title: "Volunteer",
    icon: Users,
    color: "text-green-600",
    bgColor: "bg-green-50",
    description: "Community volunteers contributing skills and time to support our mission.",
    approvalRequired: true,
    approvalTime: "1-3 business days",
    permissions: [
      "Basic platform access",
      "Volunteer hour tracking",
      "Event participation",
      "Community forum access",
      "Resource library access"
    ],
    benefits: [
      "Direct community impact",
      "Skill development opportunities",
      "Professional networking",
      "Leadership development",
      "Community recognition",
      "Flexible participation"
    ],
    requirements: [
      "Interest in environmental education",
      "Reliable communication",
      "Commitment to assigned tasks",
      "Positive community contribution"
    ],
    gettingStarted: [
      "Submit volunteer application",
      "Await approval and team assignment",
      "Complete volunteer onboarding",
      "Begin contributing to projects"
    ]
  },
  {
    id: "teacher",
    title: "Teacher/Educator",
    icon: User,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    description: "Educators bringing environmental STEM education to their classrooms.",
    approvalRequired: false,
    approvalTime: "Immediate",
    permissions: [
      "Presentation request system",
      "Curriculum resource access",
      "Teacher community forums",
      "Professional development resources",
      "Classroom support tools"
    ],
    benefits: [
      "Free STEM presentations",
      "Curriculum support materials",
      "Professional development",
      "Educator community access",
      "Student engagement resources",
      "Classroom implementation support"
    ],
    requirements: [
      "Current teaching position",
      "Interest in STEM education",
      "Classroom access for presentations",
      "Commitment to educational mission"
    ],
    gettingStarted: [
      "Create teacher account",
      "Complete school information",
      "Request presentations",
      "Access curriculum resources"
    ]
  },
  {
    id: "partner",
    title: "Partner Organization",
    icon: Building,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    description: "Nonprofit and educational organizations collaborating on environmental education.",
    approvalRequired: false,
    approvalTime: "Immediate",
    permissions: [
      "Organization profile management",
      "Joint project collaboration",
      "Analytics and reporting access",
      "Partnership resource sharing",
      "Community outreach coordination"
    ],
    benefits: [
      "Joint program development",
      "Shared resources and expertise",
      "Increased community impact",
      "Professional collaboration opportunities",
      "Media and publicity support",
      "Expanded network reach"
    ],
    requirements: [
      "Nonprofit or educational organization",
      "Shared mission alignment",
      "Capacity for collaboration",
      "Commitment to environmental education"
    ],
    gettingStarted: [
      "Submit partnership inquiry",
      "Discuss collaboration opportunities",
      "Establish partnership agreement",
      "Begin joint initiatives"
    ]
  }
];

export default function AccountTypesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-br from-gsv-green via-gsv-greenDark to-gsv-slate-900 text-white py-16">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Account Types & Permissions
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8">
              Understanding roles and how to get involved with Green Silicon Valley
            </p>
          </div>
        </div>
      </section>

      {/* Overview Section */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                How Our Community Works
              </h2>
              <p className="text-lg text-gray-600">
                We have different account types designed to match various levels of involvement
                and responsibility within our environmental education mission.
              </p>
            </div>

            {/* Quick Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <Shield className="w-12 h-12 text-gsv-green mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Role-Based Access</h3>
                <p className="text-gray-600 text-sm">
                  Each account type has specific permissions tailored to their responsibilities
                  and contributions to our mission.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <Clock className="w-12 h-12 text-gsv-green mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Approval Process</h3>
                <p className="text-gray-600 text-sm">
                  Some roles require approval to ensure the best fit. Teachers and partners
                  get immediate access, while interns and volunteers are reviewed.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <Key className="w-12 h-12 text-gsv-green mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Growing Permissions</h3>
                <p className="text-gray-600 text-sm">
                  Start with basic access and earn expanded permissions through demonstrated
                  commitment and contributions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Account Types Detail Section */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Account Types & Details
              </h2>
              <p className="text-lg text-gray-600">
                Choose the path that best fits your interests and availability
              </p>
            </div>

            <div className="space-y-8">
              {ACCOUNT_TYPES.map((accountType) => {
                const Icon = accountType.icon;

                return (
                  <div key={accountType.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b border-gray-200">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg ${accountType.bgColor}`}>
                          <Icon className={`w-8 h-8 ${accountType.color}`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-gray-900">{accountType.title}</h3>
                          <p className="text-gray-600 mt-1">{accountType.description}</p>
                        </div>
                        <div className="text-right">
                          {accountType.approvalRequired ? (
                            <div className="flex items-center gap-2 text-orange-600">
                              <Clock className="w-4 h-4" />
                              <span className="text-sm font-medium">
                                Approval Required<br/>({accountType.approvalTime})
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-green-600">
                              <CheckCircle className="w-4 h-4" />
                              <span className="text-sm font-medium">
                                Instant Access
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Permissions & Benefits */}
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Key className="w-5 h-5 text-gray-600" />
                            Permissions & Access
                          </h4>
                          <ul className="space-y-2 mb-6">
                            {accountType.permissions.map((permission, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                {permission}
                              </li>
                            ))}
                          </ul>

                          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Eye className="w-5 h-5 text-gray-600" />
                            Key Benefits
                          </h4>
                          <ul className="space-y-2">
                            {accountType.benefits.map((benefit, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                {benefit}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Requirements & Getting Started */}
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-gray-600" />
                            Requirements
                          </h4>
                          <ul className="space-y-2 mb-6">
                            {accountType.requirements.map((requirement, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                                <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                {requirement}
                              </li>
                            ))}
                          </ul>

                          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <ChevronRight className="w-5 h-5 text-gray-600" />
                            Getting Started
                          </h4>
                          <ol className="space-y-2">
                            {accountType.gettingStarted.map((step, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                                <span className="bg-gray-200 text-gray-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium mt-0.5 flex-shrink-0">
                                  {index + 1}
                                </span>
                                {step}
                              </li>
                            ))}
                          </ol>
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

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Can I change my account type later?
                </h3>
                <p className="text-gray-600">
                  Yes, you can request to change your role by contacting our admin team.
                  We'll review your contributions and determine the best fit for your new responsibilities.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  What if my application is rejected?
                </h3>
                <p className="text-gray-600">
                  If your application doesn't move forward, you'll receive feedback on how to strengthen
                  your application for future opportunities. We encourage reapplying and exploring other ways to contribute.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Can interns request expanded permissions?
                </h3>
                <p className="text-gray-600">
                  Yes! Interns can request additional permissions for specific projects or content areas
                  by demonstrating their skills and reliability. Founders review these requests regularly.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  How does the approval process work?
                </h3>
                <p className="text-gray-600">
                  Applications are reviewed by our founder team within 1-3 business days. We look for
                  genuine interest in our mission, relevant skills or experience, and availability to contribute meaningfully.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gsv-green text-white">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Involved?</h2>
            <p className="text-xl text-white/90 mb-8">
              Join our community of educators, innovators, and environmental champions
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/get-involved"
                className="bg-white text-gsv-green px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
              >
                Explore Opportunities
              </Link>
              <Link
                href="/contact"
                className="border-2 border-white text-white px-8 py-3 rounded-lg hover:bg-white hover:text-gsv-green transition-colors font-semibold"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
