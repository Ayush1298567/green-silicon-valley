import { getServerComponentClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getDashboardPathForRole, type UserRole } from "@/lib/auth/roles";
import DashboardKPIs from "@/components/dashboard/founder/DashboardKPIs";
import ActivityFeed from "@/components/dashboard/founder/ActivityFeed";
import UpcomingCalendar from "@/components/dashboard/founder/UpcomingCalendar";
import TaskPrioritization from "@/components/dashboard/founder/TaskPrioritization";
import QuickActions from "@/components/dashboard/founder/QuickActions";
import TeamOverview from "@/components/dashboard/founder/TeamOverview";
import AlertsNotifications from "@/components/dashboard/founder/AlertsNotifications";
import RecentApplications from "@/components/dashboard/founder/RecentApplications";
import AISuggestionsWidget from "@/components/dashboard/founder/AISuggestionsWidget";
import SchedulingAssistant from "@/components/dashboard/founder/SchedulingAssistant";
import PerformanceInsights from "@/components/dashboard/founder/PerformanceInsights";
import AIChatInterface from "@/components/dashboard/founder/AIChatInterface";
import Link from "next/link";
import FounderDashboardClient from "./FounderDashboardClient";

export const dynamic = "force-dynamic";

export default async function FounderDashboard() {
  const supabase = getServerComponentClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const { data: userRow } = await supabase.from("users").select("*").eq("id", session.user.id).single();
  const role = (userRow?.role as UserRole) ?? "volunteer";

  if (role !== "founder") redirect(getDashboardPathForRole(role));

  // Fetch comprehensive dashboard data
  const [
    { data: presentations },
    { data: volunteers },
    { data: schools },
    { data: tasks },
    { data: users },
    { data: volunteerHours },
    { data: systemLogs },
    { data: bulletinPosts },
    { data: chapters },
  ] = await Promise.all([
    supabase.from("presentations").select("*").order("scheduled_date", { ascending: true }),
    supabase.from("volunteers").select("*").eq("status", "active"),
    supabase.from("schools").select("*"),
    supabase.from("intern_projects").select("*").order("due_date", { ascending: true }),
    supabase.from("users").select("*"),
    supabase.from("volunteer_hours").select("*"),
    supabase.from("system_logs").select("*").order("timestamp", { ascending: false }).limit(50),
    supabase.from("bulletin_posts").select("*").order("created_at", { ascending: false }).limit(5),
    supabase.from("chapters").select("*").eq("status", "active"),
  ]);

  // Calculate KPIs
  const totalPresentations = presentations?.length || 0;
  const upcomingPresentations = presentations?.filter(p => 
    p.status === "scheduled" && new Date(p.scheduled_date || "") > new Date()
  ).length || 0;
  const completedPresentations = presentations?.filter(p => p.status === "completed").length || 0;
  const pendingPresentations = presentations?.filter(p => p.status === "pending").length || 0;
  
  // Get pending reviews (volunteers with submitted_for_review or in_review status)
  const { data: pendingReviewsData } = await supabase
    .from("volunteers")
    .select("id")
    .in("presentation_status", ["submitted_for_review", "in_review"]);
  const pendingReviews = pendingReviewsData?.length || 0;
  
  // Get pending hours
  const { count: pendingHoursCount } = await supabase
    .from("volunteer_hours")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");
  const pendingHours = pendingHoursCount || 0;
  
  // Get pending documents
  const { count: pendingDocumentsCount } = await supabase
    .from("volunteer_documents")
    .select("*", { count: "exact", head: true })
    .in("status", ["pending", "under_review"]);
  const pendingDocuments = pendingDocumentsCount || 0;
  
  const totalVolunteers = volunteers?.length || 0;
  const activeVolunteers = volunteers?.filter(v => {
    // Active in last 30 days - use team ID (v.id), not user_id
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return volunteerHours?.some(h => 
      h.volunteer_id === v.id && new Date(h.date || "") >= thirtyDaysAgo
    );
  }).length || 0;

  const totalSchools = schools?.length || 0;
  const activeSchools = schools?.filter(s => s.status === "active").length || 0;

  const totalTasks = tasks?.length || 0;
  const overdueTasks = tasks?.filter(t => 
    t.due_date && new Date(t.due_date) < new Date() && t.status !== "completed"
  ).length || 0;
  const urgentTasks = tasks?.filter(t => t.priority === "urgent" && t.status !== "completed").length || 0;

  const totalHours = volunteerHours?.reduce((sum, h) => sum + (h.hours_logged || 0), 0) || 0;
  
  const totalStudentsReached = presentations?.reduce((sum, p) => sum + (p.student_count || 0), 0) || 0;

  const totalUsers = users?.length || 0;
  const totalInterns = users?.filter(u => u.role === "intern").length || 0;

  const totalChapters = chapters?.length || 0;

  // Calculate growth metrics (last 30 days vs previous 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

  const recentPresentations = presentations?.filter(p => 
    new Date(p.scheduled_date || "") >= thirtyDaysAgo
  ).length || 0;
  
  const previousPresentations = presentations?.filter(p => {
    const date = new Date(p.scheduled_date || "");
    return date >= sixtyDaysAgo && date < thirtyDaysAgo;
  }).length || 0;

  const presentationsGrowth = previousPresentations > 0 
    ? Math.round(((recentPresentations - previousPresentations) / previousPresentations) * 100)
    : 100;

  const recentHours = volunteerHours?.filter(h => 
    new Date(h.date || "") >= thirtyDaysAgo
  ).reduce((sum, h) => sum + (h.hours_logged || 0), 0) || 0;

  const previousHours = volunteerHours?.filter(h => {
    const date = new Date(h.date || "");
    return date >= sixtyDaysAgo && date < thirtyDaysAgo;
  }).reduce((sum, h) => sum + (h.hours_logged || 0), 0) || 0;

  const hoursGrowth = previousHours > 0 
    ? Math.round(((recentHours - previousHours) / previousHours) * 100)
    : 100;

  // Prepare data for components
  const upcomingEvents = presentations
    ?.filter(p => p.status === "scheduled" && new Date(p.scheduled_date || "") > new Date())
    .slice(0, 10)
    .map(p => ({
      id: p.id,
      title: `Presentation at ${schools?.find(s => s.id === p.school_id)?.name || "Unknown School"}`,
      date: p.scheduled_date || "",
      type: "presentation" as const,
      location: schools?.find(s => s.id === p.school_id)?.city || "",
    })) || [];

  const priorityTasks = tasks
    ?.filter(t => t.status !== "completed" && t.status !== "cancelled")
    .sort((a, b) => {
      // Sort by priority, then by due date
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 4;
      const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 4;
      if (aPriority !== bPriority) return aPriority - bPriority;
      return (a.due_date || "9999-12-31").localeCompare(b.due_date || "9999-12-31");
    })
    .slice(0, 10) || [];

  const recentActivities = systemLogs
    ?.map(log => ({
      id: log.id,
      action: log.action,
      actor: users?.find(u => u.id === log.actor_id)?.name || "Unknown User",
      timestamp: log.timestamp || new Date().toISOString(),
      details: log.details || "",
    }))
    .slice(0, 15) || [];

  return (
    <FounderDashboardClient
      totalPresentations={totalPresentations}
      activeSchools={activeSchools}
      totalHours={totalHours}
      totalStudentsReached={totalStudentsReached}
      totalInterns={totalInterns}
      totalChapters={totalChapters}
      presentationsGrowth={presentationsGrowth}
      hoursGrowth={hoursGrowth}
      upcomingEvents={upcomingEvents}
      priorityTasks={priorityTasks}
      recentActivities={recentActivities}
      totalVolunteers={totalVolunteers}
      totalUsers={totalUsers}
      userName={userRow?.name || "Founder"}
      overdueTasks={overdueTasks}
      urgentTasks={urgentTasks}
      pendingPresentations={pendingPresentations}
      pendingReviews={pendingReviews}
      pendingHours={pendingHours}
      pendingDocuments={pendingDocuments}
      upcomingPresentations={upcomingPresentations}
      completedPresentations={completedPresentations}
      activeVolunteers={activeVolunteers}
      totalSchools={totalSchools}
    />
  );
}
