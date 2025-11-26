"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Calendar,
  Users,
  FileText,
  Settings,
  BarChart3,
  MessageSquare,
  Globe,
  Shield,
  BookOpen,
  Target,
  FolderOpen,
  Bell,
  User,
  LogOut,
  Menu,
  X
} from "lucide-react";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: "admin" | "founder" | "intern" | "volunteer" | "teacher" | "parent";
  avatar?: string;
}

interface DynamicNavProps {
  user?: UserProfile | null;
}

export default function DynamicNav({ user }: DynamicNavProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    // Fetch notification count
    if (user) {
      fetchNotificationCount();
    }
  }, [user]);

  const fetchNotificationCount = async () => {
    try {
      const res = await fetch("/api/notifications/count");
      const data = await res.json();
      if (data.ok) {
        setNotifications(data.count || 0);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const navigationItems = getNavigationItems(user?.role);

  function getNavigationItems(role?: string) {
    const baseItems = [
      { name: "Home", href: "/", icon: Home, public: true },
      { name: "About", href: "/about", icon: BookOpen, public: true },
      { name: "Impact", href: "/impact/public", icon: BarChart3, public: true },
      { name: "Chapters", href: "/chapters", icon: Globe, public: true },
      { name: "Get Involved", href: "/get-involved", icon: Users, public: true },
    ];

    const authenticatedItems = {
      admin: [
        { name: "Dashboard", href: "/dashboard/admin", icon: Settings },
        { name: "Users", href: "/admin/users", icon: Users },
        { name: "Content", href: "/admin/content", icon: FileText },
        { name: "Recruitment", href: "/admin/recruitment", icon: Users },
        { name: "Localization", href: "/admin/localization", icon: Globe },
        { name: "Compliance", href: "/admin/compliance", icon: Shield },
      ],
      founder: [
        { name: "Dashboard", href: "/dashboard/founder", icon: Settings },
        { name: "Calendar", href: "/dashboard/founder/calendar", icon: Calendar },
        { name: "Applications", href: "/dashboard/founder/applications", icon: FileText },
        { name: "Action Items", href: "/dashboard/action-items", icon: Target },
        { name: "CRM", href: "/admin/crm/teachers", icon: Users },
        { name: "Impact", href: "/dashboard/founder/impact", icon: BarChart3 },
      ],
      intern: [
        { name: "Dashboard", href: "/dashboard/intern", icon: Settings },
        { name: "My Department", href: `/dashboard/intern/department/${getUserDepartment(user)}`, icon: Users },
        { name: "Presentations", href: "/dashboard/intern/presentations", icon: FileText },
        { name: "Hours", href: "/dashboard/volunteer/hours", icon: Calendar },
        { name: "Resources", href: "/dashboard/intern/resources", icon: FolderOpen },
      ],
      volunteer: [
        { name: "Dashboard", href: "/dashboard/volunteer", icon: Settings },
        { name: "Presentations", href: "/dashboard/volunteer/presentations", icon: FileText },
        { name: "Hours", href: "/dashboard/volunteer/hours", icon: Calendar },
        { name: "Team", href: "/dashboard/volunteer/team", icon: Users },
        { name: "Resources", href: "/dashboard/volunteer/resources", icon: FolderOpen },
      ],
      teacher: [
        { name: "Dashboard", href: "/dashboard/teacher", icon: Settings },
        { name: "Presentations", href: "/dashboard/teacher/presentations", icon: FileText },
        { name: "Schedule", href: "/dashboard/teacher/schedule", icon: Calendar },
        { name: "Resources", href: "/dashboard/teacher/resources", icon: FolderOpen },
      ],
      parent: [
        { name: "Portal", href: "/parent-portal", icon: Shield },
        { name: "Schedule", href: "/parent-portal/schedule", icon: Calendar },
        { name: "Contact", href: "/contact", icon: MessageSquare },
      ]
    };

    return {
      public: baseItems,
      authenticated: role ? authenticatedItems[role as keyof typeof authenticatedItems] || [] : []
    };
  }

  function getUserDepartment(user?: UserProfile | null) {
    // This would typically come from user metadata or department assignment
    // For now, return a default department
    return "operations";
  }

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname?.startsWith(href);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:block bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">GSV</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Green Silicon Valley</span>
            </Link>

            {/* Public Navigation */}
            <div className="flex items-center space-x-8">
              {navigationItems.public.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  {/* Notifications */}
                  <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                    <Bell size={20} />
                    {notifications > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {notifications > 9 ? "9+" : notifications}
                      </span>
                    )}
                  </button>

                  {/* User Profile */}
                  <div className="relative group">
                    <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <User size={16} className="text-blue-600" />
                        </div>
                      )}
                      <span className="text-sm font-medium text-gray-700">{user.name}</span>
                    </button>

                    {/* Dropdown Menu */}
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      <div className="py-2">
                        <Link
                          href="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Profile Settings
                        </Link>
                        <Link
                          href="/help"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Help & Support
                        </Link>
                        <hr className="my-1" />
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <QuickActionsButton user={user} />
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    href="/auth/login"
                    className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/register"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Authenticated User Sub-navigation */}
          {user && navigationItems.authenticated.length > 0 && (
            <div className="border-t border-gray-200">
              <div className="flex items-center space-x-6 py-3">
                {navigationItems.authenticated.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? "text-blue-600 bg-blue-50"
                        : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                    }`}
                  >
                    <item.icon size={16} className="inline mr-2" />
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="lg:hidden bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">GSV</span>
              </div>
              <span className="text-lg font-bold text-gray-900">GSV</span>
            </Link>

            <div className="flex items-center gap-3">
              {user && (
                <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                  <Bell size={20} />
                  {notifications > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {notifications > 9 ? "9+" : notifications}
                    </span>
                  )}
                </button>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="border-t border-gray-200 bg-white">
            <div className="px-4 py-4 space-y-4">
              {/* Public Navigation */}
              <div className="space-y-2">
                {navigationItems.public.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      isActive(item.href)
                        ? "text-blue-600 bg-blue-50"
                        : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <item.icon size={16} className="inline mr-3" />
                    {item.name}
                  </Link>
                ))}
              </div>

              {/* Authenticated Navigation */}
              {user && navigationItems.authenticated.length > 0 && (
                <>
                  <hr className="border-gray-200" />
                  <div className="space-y-2">
                    {navigationItems.authenticated.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`block px-3 py-2 rounded-md text-base font-medium ${
                          isActive(item.href)
                            ? "text-blue-600 bg-blue-50"
                            : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <item.icon size={16} className="inline mr-3" />
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </>
              )}

              {/* User Actions */}
              <hr className="border-gray-200" />
              <div className="space-y-2">
                {user ? (
                  <>
                    <div className="px-3 py-2 text-sm text-gray-600">
                      Signed in as {user.name}
                    </div>
                    <Link
                      href="/profile"
                      className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Profile Settings
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/auth/login"
                      className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/auth/register"
                      className="block px-3 py-2 bg-blue-600 text-white rounded-lg text-center"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}

// Quick Actions Button Component
function QuickActionsButton({ user }: { user: UserProfile }) {
  const [isOpen, setIsOpen] = useState(false);

  const quickActions = {
    admin: [
      { name: "Add User", href: "/admin/users/new", icon: Users },
      { name: "Create Event", href: "/dashboard/founder/calendar", icon: Calendar },
      { name: "System Status", href: "/admin/system", icon: Settings },
    ],
    founder: [
      { name: "New Presentation", href: "/dashboard/intern/presentations/new", icon: FileText },
      { name: "Schedule Meeting", href: "/dashboard/founder/calendar", icon: Calendar },
      { name: "View Reports", href: "/dashboard/founder/impact", icon: BarChart3 },
    ],
    intern: [
      { name: "Log Hours", href: "/dashboard/volunteer/hours", icon: Calendar },
      { name: "Upload Resource", href: "/dashboard/intern/department/operations", icon: FolderOpen },
      { name: "Contact Team", href: "/dashboard/intern/department/operations", icon: MessageSquare },
    ],
    volunteer: [
      { name: "Log Hours", href: "/dashboard/volunteer/hours", icon: Calendar },
      { name: "Find Presentations", href: "/dashboard/volunteer/presentations", icon: FileText },
      { name: "Team Chat", href: "/dashboard/volunteer/team", icon: MessageSquare },
    ],
    teacher: [
      { name: "Request Presentation", href: "/dashboard/teacher/presentations", icon: FileText },
      { name: "View Schedule", href: "/dashboard/teacher/schedule", icon: Calendar },
      { name: "Contact Support", href: "/contact", icon: MessageSquare },
    ],
    parent: [
      { name: "View Records", href: "/parent-portal", icon: Shield },
      { name: "Contact School", href: "/contact", icon: MessageSquare },
    ]
  };

  const actions = quickActions[user.role as keyof typeof quickActions] || [];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
        title="Quick Actions"
      >
        <Target size={20} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="p-3">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Quick Actions</h3>
              <div className="space-y-1">
                {actions.map((action) => (
                  <Link
                    key={action.name}
                    href={action.href}
                    className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                    onClick={() => setIsOpen(false)}
                  >
                    <action.icon size={16} />
                    {action.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
