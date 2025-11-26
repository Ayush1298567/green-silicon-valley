"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Shield, Users, GraduationCap, Building, LogIn, Mail, Eye, EyeOff } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function PortalPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
      await loadUserRole(session.user.id);
    }
  };

  const loadUserRole = async (userId: string) => {
    try {
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

      if (profile) {
        setUserRole(profile.role);
      }
    } catch (error) {
      console.error('Error loading user role:', error);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          setUser(data.user);
          await loadUserRole(data.user.id);
          setSuccess('Login successful! Redirecting...');
          setTimeout(() => redirectBasedOnRole(data.user), 1500);
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        setSuccess('Account created! Please check your email to verify your account before signing in.');
        setIsLogin(true);
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const redirectBasedOnRole = (user: any) => {
    // This would normally be determined by the user's role from the database
    // For now, we'll use a simple routing based on common patterns

    if (user?.email?.includes('admin') || user?.email?.includes('founder')) {
      router.push('/dashboard/founder');
    } else if (user?.email?.includes('intern')) {
      router.push('/dashboard/intern');
    } else if (user?.email?.includes('volunteer')) {
      router.push('/dashboard/volunteer');
    } else if (user?.email?.includes('teacher')) {
      router.push('/dashboard/teacher');
    } else {
      // Default to volunteer dashboard
      router.push('/dashboard/volunteer');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserRole(null);
    setSuccess('Logged out successfully');
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
      case 'founder':
        return <Shield className="w-6 h-6" />;
      case 'intern':
        return <GraduationCap className="w-6 h-6" />;
      case 'volunteer':
        return <Users className="w-6 h-6" />;
      case 'teacher':
        return <Building className="w-6 h-6" />;
      default:
        return <User className="w-6 h-6" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
      case 'founder':
        return 'bg-purple-100 text-purple-800';
      case 'intern':
        return 'bg-blue-100 text-blue-800';
      case 'volunteer':
        return 'bg-green-100 text-green-800';
      case 'teacher':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getQuickLinks = (role: string) => {
    switch (role) {
      case 'admin':
      case 'founder':
        return [
          { label: 'Dashboard', href: '/dashboard/founder', description: 'Overview and analytics' },
          { label: 'Applications', href: '/dashboard/founder/applications', description: 'Review new applications' },
          { label: 'Volunteers', href: '/dashboard/founder/volunteers', description: 'Manage volunteer teams' },
          { label: 'AI Assistant', href: '/dashboard/founder/ai', description: 'AI-powered tools' }
        ];
      case 'intern':
        return [
          { label: 'Dashboard', href: '/dashboard/intern', description: 'Your intern overview' },
          { label: 'Tasks', href: '/dashboard/intern/tasks', description: 'Current assignments' },
          { label: 'Projects', href: '/interns/projects', description: 'View project showcase' },
          { label: 'Blog', href: '/interns/blog', description: 'Read and write posts' }
        ];
      case 'volunteer':
        return [
          { label: 'Dashboard', href: '/dashboard/volunteer', description: 'Your volunteer hub' },
          { label: 'My Team', href: '/dashboard/volunteer/team', description: 'Team information' },
          { label: 'Presentations', href: '/dashboard/volunteer/presentations', description: 'Upcoming presentations' },
          { label: 'File Hub', href: '/dashboard/volunteer/file-hub', description: 'Upload and access materials' }
        ];
      case 'teacher':
        return [
          { label: 'Dashboard', href: '/dashboard/teacher', description: 'Teacher resources' },
          { label: 'Schedule Presentation', href: '/get-involved/presentation', description: 'Book a presentation' },
          { label: 'Resources', href: '/teachers', description: 'Teaching materials' },
          { label: 'Support', href: '/contact', description: 'Get help' }
        ];
      default:
        return [];
    }
  };

  if (user) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="container">
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getRoleColor(userRole || 'user')}`}>
                  {getRoleIcon(userRole || 'user')}
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Welcome back!</h1>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>

        <div className="container py-8">
          {/* Role Badge */}
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(userRole || 'user')}`}>
                {userRole ? userRole.charAt(0).toUpperCase() + userRole.slice(1) : 'User'}
              </span>
              <span className="text-gray-600">Access Level</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Access</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {getQuickLinks(userRole || 'volunteer').map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow block"
                >
                  <h3 className="font-semibold text-gray-900 mb-2">{link.label}</h3>
                  <p className="text-sm text-gray-600">{link.description}</p>
                  <div className="mt-4 text-gsv-green font-medium text-sm">Access →</div>
                </a>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Account accessed</p>
                  <p className="text-xs text-gray-600">Just now</p>
                </div>
              </div>
              <div className="text-center py-4">
                <p className="text-gray-500 text-sm">More activity tracking coming soon</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gsv-green via-gsv-greenDark to-gsv-slate-900 text-white py-20">
        <div className="container">
          <div className="max-w-md mx-auto text-center">
            <h1 className="text-3xl font-bold mb-4">
              Green Silicon Valley Portal
            </h1>
            <p className="text-white/90 mb-8">
              Access your personalized dashboard and resources
            </p>
          </div>
        </div>
      </section>

      {/* Login Form */}
      <section className="py-16">
        <div className="container">
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {isLogin ? 'Sign In' : 'Create Account'}
                </h2>
                <p className="text-gray-600 mt-2">
                  {isLogin
                    ? 'Access your personalized dashboard'
                    : 'Join our community of environmental educators'
                  }
                </p>
              </div>

              <form onSubmit={handleAuth} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gsv-green focus:border-transparent"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gsv-green focus:border-transparent"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800 text-sm">{error}</p>
                  </div>
                )}

                {success && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800 text-sm">{success}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gsv-green text-white py-3 px-6 rounded-lg hover:bg-gsv-greenDark transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      {isLogin ? 'Signing In...' : 'Creating Account...'}
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      {isLogin ? 'Sign In' : 'Create Account'}
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-gsv-green hover:text-gsv-greenDark font-medium text-sm"
                >
                  {isLogin
                    ? "Don't have an account? Sign up"
                    : 'Already have an account? Sign in'
                  }
                </button>
              </div>

              {!isLogin && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Mail className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-blue-800 text-sm">
                      After creating your account, check your email for a verification link before signing in.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Role Preview */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Role in Our Mission</h2>
              <p className="text-lg text-gray-600">
                Different access levels for different contributions
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-6 border border-gray-200 rounded-lg">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Volunteers</h3>
                <p className="text-sm text-gray-600">Deliver environmental STEM presentations and engage with students</p>
              </div>

              <div className="text-center p-6 border border-gray-200 rounded-lg">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Teachers</h3>
                <p className="text-sm text-gray-600">Schedule presentations and access educational resources</p>
              </div>

              <div className="text-center p-6 border border-gray-200 rounded-lg">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <GraduationCap className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Interns</h3>
                <p className="text-sm text-gray-600">Contribute to projects and gain experience in environmental education</p>
              </div>

              <div className="text-center p-6 border border-gray-200 rounded-lg">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Administrators</h3>
                <p className="text-sm text-gray-600">Manage operations, review applications, and oversee program growth</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
