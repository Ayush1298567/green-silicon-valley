"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Users, Target, FolderOpen, Calendar, MessageSquare, Settings, TrendingUp, CheckCircle, Clock, AlertCircle } from "lucide-react";
import DepartmentConfig from "@/components/departments/DepartmentConfig";
import DepartmentGoals from "@/components/departments/DepartmentGoals";
import ResourceFolder from "@/components/departments/ResourceFolder";
import WeeklyPlan from "@/components/departments/WeeklyPlan";
import ContactLists from "@/components/departments/ContactLists";

interface DepartmentStats {
  totalMembers: number;
  activeGoals: number;
  completedTasks: number;
  upcomingDeadlines: number;
  resourcesCount: number;
  weeklyProgress: number;
}

interface DepartmentInfo {
  id: string;
  name: string;
  description: string;
  director: string;
  memberCount: number;
  created_at: string;
}

export default function DepartmentDashboard() {
  const params = useParams();
  const departmentId = params.dept as string;

  const [activeTab, setActiveTab] = useState<"overview" | "goals" | "resources" | "schedule" | "contacts" | "config">("overview");
  const [department, setDepartment] = useState<DepartmentInfo | null>(null);
  const [stats, setStats] = useState<DepartmentStats>({
    totalMembers: 0,
    activeGoals: 0,
    completedTasks: 0,
    upcomingDeadlines: 0,
    resourcesCount: 0,
    weeklyProgress: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDepartmentData();
  }, [departmentId]);

  const fetchDepartmentData = async () => {
    try {
      // Fetch department info
      const deptRes = await fetch(`/api/departments/${departmentId}`);
      const deptData = await deptRes.json();
      if (deptData.ok) {
        setDepartment(deptData.department);
      }

      // Fetch department stats
      const statsRes = await fetch(`/api/departments/${departmentId}/stats`);
      const statsData = await statsRes.json();
      if (statsData.ok) {
        setStats(statsData.stats);
      }
    } catch (error) {
      console.error("Error fetching department data:", error);
    } finally {
      setLoading(false);
    }
  };

  const departmentNames: Record<string, string> = {
    "operations": "Operations",
    "outreach": "Outreach",
    "media": "Media & Communications",
    "finance": "Finance",
    "volunteer-coordination": "Volunteer Coordination",
    "education": "Education & Curriculum",
    "technology": "Technology",
    "fundraising": "Fundraising"
  };

  const departmentColors: Record<string, string> = {
    "operations": "bg-blue-500",
    "outreach": "bg-green-500",
    "media": "bg-purple-500",
    "finance": "bg-yellow-500",
    "volunteer-coordination": "bg-pink-500",
    "education": "bg-indigo-500",
    "technology": "bg-red-500",
    "fundraising": "bg-orange-500"
  };

  const departmentIcons: Record<string, any> = {
    "operations": Settings,
    "outreach": Users,
    "media": MessageSquare,
    "finance": TrendingUp,
    "volunteer-coordination": Users,
    "education": Target,
    "technology": Settings,
    "fundraising": TrendingUp
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading department dashboard...</p>
        </div>
      </div>
    );
  }

  if (!department) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Department Not Found</h2>
          <p className="text-gray-600">The department you're looking for doesn't exist or you don't have access.</p>
        </div>
      </div>
    );
  }

  const DepartmentIcon = departmentIcons[departmentId] || Settings;
  const departmentColor = departmentColors[departmentId] || "bg-gray-500";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg ${departmentColor} text-white`}>
              <DepartmentIcon size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{department.name}</h1>
              <p className="text-gray-600 mt-1">{department.description}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Users size={14} />
                  {stats.totalMembers} members
                </span>
                <span className="flex items-center gap-1">
                  <Target size={14} />
                  {stats.activeGoals} active goals
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle size={14} />
                  {stats.completedTasks} tasks completed
                </span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-sm text-gray-600">Department Director</div>
            <div className="font-medium text-gray-900">{department.director}</div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">{stats.totalMembers}</div>
              <div className="text-sm text-gray-600">Team Members</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Target className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">{stats.activeGoals}</div>
              <div className="text-sm text-gray-600">Active Goals</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FolderOpen className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">{stats.resourcesCount}</div>
              <div className="text-sm text-gray-600">Resources</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">{stats.weeklyProgress}%</div>
              <div className="text-sm text-gray-600">Weekly Progress</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-6 py-4 text-sm font-medium border-b-2 ${
                activeTab === "overview"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("goals")}
              className={`px-6 py-4 text-sm font-medium border-b-2 ${
                activeTab === "goals"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Goals & Metrics
            </button>
            <button
              onClick={() => setActiveTab("resources")}
              className={`px-6 py-4 text-sm font-medium border-b-2 ${
                activeTab === "resources"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Resources
            </button>
            <button
              onClick={() => setActiveTab("schedule")}
              className={`px-6 py-4 text-sm font-medium border-b-2 ${
                activeTab === "schedule"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Weekly Plan
            </button>
            <button
              onClick={() => setActiveTab("contacts")}
              className={`px-6 py-4 text-sm font-medium border-b-2 ${
                activeTab === "contacts"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Contacts
            </button>
            <button
              onClick={() => setActiveTab("config")}
              className={`px-6 py-4 text-sm font-medium border-b-2 ${
                activeTab === "config"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Settings
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {activeTab === "overview" && <DepartmentOverview departmentId={departmentId} stats={stats} />}
        {activeTab === "goals" && <DepartmentGoals departmentId={departmentId} />}
        {activeTab === "resources" && <ResourceFolder departmentId={departmentId} />}
        {activeTab === "schedule" && <WeeklyPlan departmentId={departmentId} />}
        {activeTab === "contacts" && <ContactLists departmentId={departmentId} />}
        {activeTab === "config" && <DepartmentConfig departmentId={departmentId} />}
      </div>
    </div>
  );
}

// Department Overview Component
function DepartmentOverview({ departmentId, stats }: { departmentId: string; stats: DepartmentStats }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Department Overview</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Progress Overview */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Progress Overview</h3>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Weekly Goals</span>
                  <span>{stats.weeklyProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${stats.weeklyProgress}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Task Completion</span>
                  <span>{Math.round((stats.completedTasks / (stats.completedTasks + stats.upcomingDeadlines)) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.round((stats.completedTasks / (stats.completedTasks + stats.upcomingDeadlines)) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>

            <div className="grid grid-cols-2 gap-3">
              <button className="p-3 bg-blue-50 hover:bg-blue-100 rounded-lg text-left transition-colors">
                <div className="font-medium text-blue-900">Add Goal</div>
                <div className="text-sm text-blue-700">Set new objectives</div>
              </button>

              <button className="p-3 bg-green-50 hover:bg-green-100 rounded-lg text-left transition-colors">
                <div className="font-medium text-green-900">Upload Resource</div>
                <div className="text-sm text-green-700">Share department files</div>
              </button>

              <button className="p-3 bg-purple-50 hover:bg-purple-100 rounded-lg text-left transition-colors">
                <div className="font-medium text-purple-900">Schedule Meeting</div>
                <div className="text-sm text-purple-700">Plan team sync</div>
              </button>

              <button className="p-3 bg-orange-50 hover:bg-orange-100 rounded-lg text-left transition-colors">
                <div className="font-medium text-orange-900">View Reports</div>
                <div className="text-sm text-orange-700">Department analytics</div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>

        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div className="flex-1">
              <div className="font-medium text-gray-900">Goal "Increase Outreach" completed</div>
              <div className="text-sm text-gray-600">2 hours ago by Sarah Johnson</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Users className="w-5 h-5 text-blue-600" />
            <div className="flex-1">
              <div className="font-medium text-gray-900">New team member added</div>
              <div className="text-sm text-gray-600">5 hours ago by Mike Chen</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <FolderOpen className="w-5 h-5 text-purple-600" />
            <div className="flex-1">
              <div className="font-medium text-gray-900">Resource "Presentation Template" uploaded</div>
              <div className="text-sm text-gray-600">1 day ago by Lisa Rodriguez</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
