"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  Users,
  Building,
  GraduationCap,
  Shield,
  FileText,
  Calendar,
  MessageSquare,
  Target,
  BarChart3,
  Settings,
  Upload,
  Download,
  BookOpen,
  Mail,
  Award
} from "lucide-react";

interface QuickLink {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<any>;
  priority: 'high' | 'medium' | 'low';
  category: string;
}

interface QuickLinksProps {
  role?: string;
  compact?: boolean;
}

export default function QuickLinks({ role, compact = false }: QuickLinksProps) {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    loadUserRole();
  }, []);

  const loadUserRole = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);

        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single();

        setUserRole(profile?.role || role || 'volunteer');
      }
    } catch (error) {
      console.error('Error loading user role:', error);
      setUserRole(role || 'volunteer');
    } finally {
      setLoading(false);
    }
  };

  const getQuickLinks = (role: string): QuickLink[] => {
    const baseLinks: QuickLink[] = [
      {
        id: 'profile',
        title: 'Profile Settings',
        description: 'Update your account information',
        href: '/dashboard/settings',
        icon: Settings,
        priority: 'low',
        category: 'account'
      }
    ];

    switch (role) {
      case 'admin':
      case 'founder':
        return [
          {
            id: 'dashboard',
            title: 'Founder Dashboard',
            description: 'Overview and key metrics',
            href: '/dashboard/founder',
            icon: BarChart3,
            priority: 'high',
            category: 'overview'
          },
          {
            id: 'applications',
            title: 'Review Applications',
            description: 'New volunteer and teacher requests',
            href: '/dashboard/founder/applications',
            icon: FileText,
            priority: 'high',
            category: 'management'
          },
          {
            id: 'volunteers',
            title: 'Manage Volunteers',
            description: 'Team assignments and oversight',
            href: '/dashboard/founder/volunteers',
            icon: Users,
            priority: 'high',
            category: 'management'
          },
          {
            id: 'calendar',
            title: 'Schedule Overview',
            description: 'All presentations and events',
            href: '/dashboard/founder/calendar',
            icon: Calendar,
            priority: 'medium',
            category: 'scheduling'
          },
          {
            id: 'ai-assistant',
            title: 'AI Assistant',
            description: 'Automated tools and insights',
            href: '/dashboard/founder/ai',
            icon: Target,
            priority: 'medium',
            category: 'tools'
          },
          {
            id: 'content',
            title: 'Content Management',
            description: 'Website and content updates',
            href: '/admin/content',
            icon: FileText,
            priority: 'medium',
            category: 'admin'
          },
          ...baseLinks
        ];

      case 'intern':
        return [
          {
            id: 'dashboard',
            title: 'Intern Dashboard',
            description: 'Your projects and tasks',
            href: '/dashboard/intern',
            icon: GraduationCap,
            priority: 'high',
            category: 'overview'
          },
          {
            id: 'tasks',
            title: 'Current Tasks',
            description: 'Assignments and deadlines',
            href: '/dashboard/intern/tasks',
            icon: Target,
            priority: 'high',
            category: 'work'
          },
          {
            id: 'projects',
            title: 'Project Showcase',
            description: 'Completed intern projects',
            href: '/interns/projects',
            icon: Award,
            priority: 'medium',
            category: 'resources'
          },
          {
            id: 'blog',
            title: 'Intern Blog',
            description: 'Read and write posts',
            href: '/interns/blog',
            icon: BookOpen,
            priority: 'medium',
            category: 'community'
          },
          {
            id: 'onboarding',
            title: 'Onboarding Guide',
            description: 'Your getting started checklist',
            href: '/interns/onboarding',
            icon: FileText,
            priority: 'high',
            category: 'getting-started'
          },
          ...baseLinks
        ];

      case 'volunteer':
        return [
          {
            id: 'dashboard',
            title: 'Volunteer Dashboard',
            description: 'Your team and presentations',
            href: '/dashboard/volunteer',
            icon: Users,
            priority: 'high',
            category: 'overview'
          },
          {
            id: 'team',
            title: 'My Team',
            description: 'Team members and information',
            href: '/dashboard/volunteer/team',
            icon: Users,
            priority: 'high',
            category: 'team'
          },
          {
            id: 'presentations',
            title: 'Presentations',
            description: 'Upcoming and past presentations',
            href: '/dashboard/volunteer/presentations',
            icon: BookOpen,
            priority: 'high',
            category: 'work'
          },
          {
            id: 'file-hub',
            title: 'File Hub',
            description: 'Upload and download materials',
            href: '/dashboard/volunteer/file-hub',
            icon: Upload,
            priority: 'medium',
            category: 'resources'
          },
          {
            id: 'readiness',
            title: 'Presentation Readiness',
            description: 'Pre-presentation checklist',
            href: '/dashboard/volunteer/readiness-checklist',
            icon: Target,
            priority: 'medium',
            category: 'preparation'
          },
          {
            id: 'examples',
            title: 'Example Slides',
            description: 'Sample presentations and activities',
            href: '/volunteers/examples',
            icon: Download,
            priority: 'low',
            category: 'resources'
          },
          ...baseLinks
        ];

      case 'teacher':
        return [
          {
            id: 'dashboard',
            title: 'Teacher Dashboard',
            description: 'Your presentations and resources',
            href: '/dashboard/teacher',
            icon: Building,
            priority: 'high',
            category: 'overview'
          },
          {
            id: 'schedule',
            title: 'Schedule Presentation',
            description: 'Book a presentation for your class',
            href: '/get-involved/presentation',
            icon: Calendar,
            priority: 'high',
            category: 'scheduling'
          },
          {
            id: 'resources',
            title: 'Teaching Resources',
            description: 'Curriculum materials and guides',
            href: '/teachers',
            icon: BookOpen,
            priority: 'medium',
            category: 'resources'
          },
          {
            id: 'presentation-day',
            title: 'Presentation Day Guide',
            description: 'What to expect on presentation day',
            href: '/teachers/presentation-day',
            icon: FileText,
            priority: 'medium',
            category: 'preparation'
          },
          {
            id: 'sample-curriculum',
            title: 'Sample Curriculum',
            description: 'Preview presentation content',
            href: '/teachers/sample-curriculum',
            icon: Download,
            priority: 'low',
            category: 'resources'
          },
          {
            id: 'schools-map',
            title: 'Schools Map',
            description: 'See where presentations have been delivered',
            href: '/teachers/schools-map',
            icon: Target,
            priority: 'low',
            category: 'information'
          },
          ...baseLinks
        ];

      default:
        return [
          {
            id: 'volunteer-signup',
            title: 'Become a Volunteer',
            description: 'Join our team of educators',
            href: '/get-involved/volunteer',
            icon: Users,
            priority: 'high',
            category: 'getting-started'
          },
          {
            id: 'teacher-request',
            title: 'Request Presentation',
            description: 'Schedule for your school',
            href: '/get-involved/presentation',
            icon: Building,
            priority: 'high',
            category: 'services'
          },
          {
            id: 'intern-program',
            title: 'Intern Opportunities',
            description: 'Gain experience in environmental education',
            href: '/get-involved/intern',
            icon: GraduationCap,
            priority: 'medium',
            category: 'careers'
          },
          {
            id: 'support-school',
            title: 'Support a School',
            description: 'Direct sponsorship opportunities',
            href: '/support-a-school',
            icon: Award,
            priority: 'medium',
            category: 'giving'
          },
          ...baseLinks
        ];
    }
  };

  const handleLinkClick = (href: string) => {
    router.push(href);
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-lg h-24"></div>
          ))}
        </div>
      </div>
    );
  }

  const links = getQuickLinks(userRole || 'volunteer');
  const sortedLinks = links.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });

  if (compact) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {sortedLinks.slice(0, 6).map((link) => {
          const Icon = link.icon;
          return (
            <button
              key={link.id}
              onClick={() => handleLinkClick(link.href)}
              className="p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gsv-green transition-colors text-left"
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4 text-gsv-green" />
                <span className="font-medium text-gray-900 text-sm">{link.title}</span>
              </div>
              <p className="text-xs text-gray-600 line-clamp-2">{link.description}</p>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Access</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedLinks.map((link) => {
            const Icon = link.icon;
            return (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.href)}
                className="p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gsv-green transition-all text-left group"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    link.priority === 'high' ? 'bg-gsv-green text-white' :
                    link.priority === 'medium' ? 'bg-blue-100 text-blue-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 group-hover:text-gsv-green transition-colors">
                      {link.title}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{link.description}</p>
                    <div className="mt-2 text-xs text-gray-500 uppercase tracking-wide">
                      {link.category}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Activity Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">Recent Activity</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Portal accessed</span>
            <span className="text-gray-400">•</span>
            <span>Just now</span>
          </div>
        </div>
        <div className="mt-3 text-center">
          <span className="text-xs text-gray-500">More activity tracking coming soon</span>
        </div>
      </div>
    </div>
  );
}
