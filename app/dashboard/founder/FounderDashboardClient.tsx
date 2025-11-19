"use client";
import { useState, useEffect } from "react";
import DashboardKPIs from "@/components/dashboard/founder/DashboardKPIs";
import ActivityFeed from "@/components/dashboard/founder/ActivityFeed";
import UpcomingCalendar from "@/components/dashboard/founder/UpcomingCalendar";
import TaskPrioritization from "@/components/dashboard/founder/TaskPrioritization";
import QuickActions from "@/components/dashboard/founder/QuickActions";
import TeamOverview from "@/components/dashboard/founder/TeamOverview";
import AISuggestionsWidget from "@/components/dashboard/founder/AISuggestionsWidget";
import SchedulingAssistant from "@/components/dashboard/founder/SchedulingAssistant";
import PerformanceInsights from "@/components/dashboard/founder/PerformanceInsights";
import AIChatInterface from "@/components/dashboard/founder/AIChatInterface";
import AlertsNotifications from "@/components/dashboard/founder/AlertsNotifications";
import RecentApplications from "@/components/dashboard/founder/RecentApplications";

interface FounderDashboardClientProps {
  // Props from server component
  totalPresentations: number;
  activeSchools: number;
  totalHours: number;
  totalStudentsReached: number;
  totalInterns: number;
  totalChapters: number;
  presentationsGrowth: number;
  hoursGrowth: number;
  upcomingEvents: any[];
  priorityTasks: any[];
  recentActivities: any[];
  totalVolunteers: number;
  totalUsers: number;
  userName: string;
  overdueTasks: number;
  urgentTasks: number;
  pendingPresentations: number;
  pendingReviews: number;
  pendingHours: number;
  pendingDocuments: number;
  upcomingPresentations: number;
  completedPresentations: number;
  activeVolunteers: number;
  totalSchools: number;
}

export default function FounderDashboardClient({
  totalPresentations,
  activeSchools,
  totalHours,
  totalStudentsReached,
  totalInterns,
  totalChapters,
  presentationsGrowth,
  hoursGrowth,
  upcomingEvents,
  priorityTasks,
  recentActivities,
  totalVolunteers,
  totalUsers,
  userName,
  overdueTasks,
  urgentTasks,
  pendingPresentations,
  pendingReviews,
  pendingHours,
  pendingDocuments,
  upcomingPresentations,
  completedPresentations,
  activeVolunteers,
  totalSchools
}: FounderDashboardClientProps) {
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);

  useEffect(() => {
    const handleOpenAIChat = () => setIsAIChatOpen(true);
    window.addEventListener('openAIChat', handleOpenAIChat);
    return () => window.removeEventListener('openAIChat', handleOpenAIChat);
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gsv-charcoal">Founder Dashboard</h1>
          <p className="text-gsv-gray mt-2">
            Welcome back, {userName}! Here&apos;s your organizational overview with AI assistance.
          </p>
        </div>
        <button
          onClick={() => setIsAIChatOpen(true)}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
        >
          🤖 AI Assistant
        </button>
      </div>

      {/* Alerts & Notifications */}
      <AlertsNotifications
        overdueTasks={overdueTasks}
        urgentTasks={urgentTasks}
        pendingPresentations={pendingPresentations}
        pendingReviews={pendingReviews}
        pendingHours={pendingHours}
        pendingDocuments={pendingDocuments}
      />

      {/* KPIs Grid */}
      <DashboardKPIs
        totalPresentations={totalPresentations}
        upcomingPresentations={upcomingPresentations}
        completedPresentations={completedPresentations}
        totalVolunteers={totalVolunteers}
        activeVolunteers={activeVolunteers}
        totalSchools={totalSchools}
        activeSchools={activeSchools}
        totalHours={totalHours}
        totalStudentsReached={totalStudentsReached}
        totalInterns={totalInterns}
        totalChapters={totalChapters}
        presentationsGrowth={presentationsGrowth}
        hoursGrowth={hoursGrowth}
      />

      {/* Quick Actions */}
      <QuickActions />

      {/* AI-Powered Insights Section */}
      <div id="ai-insights-section" className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AISuggestionsWidget />
        <div id="scheduling-assistant">
          <SchedulingAssistant />
        </div>
        <PerformanceInsights />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          <UpcomingCalendar events={upcomingEvents} />
          <ActivityFeed activities={recentActivities} />
          <RecentApplications />
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-6">
          <TaskPrioritization tasks={priorityTasks} />
          <TeamOverview
            totalUsers={totalUsers}
            volunteers={totalVolunteers}
            interns={totalInterns}
            founders={1} // Assuming current user is founder
          />
        </div>
      </div>

      {/* AI Chat Interface */}
      <AIChatInterface
        isOpen={isAIChatOpen}
        onClose={() => setIsAIChatOpen(false)}
      />
    </div>
  );
}
