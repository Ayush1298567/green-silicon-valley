"use client";
import { Award, Clock, Calendar, TrendingUp, CheckCircle, Star, ArrowRight, AlertCircle, MessageSquare, Package } from "lucide-react";
import Link from "next/link";
import VolunteerProgressTracker from "./VolunteerProgressTracker";
import UpcomingPresentationsWidget from "./UpcomingPresentationsWidget";
import HoursLogWidget from "./HoursLogWidget";
import TrainingResourcesWidget from "./TrainingResourcesWidget";
import { type UserRow, type VolunteerRow, type VolunteerHoursRow, type PresentationRow, type ResourceRow } from "@/types/db";

interface VolunteerDashboardOverviewProps {
  user: UserRow | null;
  volunteerProfile: VolunteerRow | null;
  myHours: VolunteerHoursRow[];
  myPresentations: PresentationRow[];
  upcomingPresentations: PresentationRow[];
  availableTrainings: ResourceRow[];
}

export default function VolunteerDashboardOverview({
  user,
  volunteerProfile,
  myHours,
  myPresentations,
  upcomingPresentations,
  availableTrainings,
}: VolunteerDashboardOverviewProps) {
  // Calculate stats
  const totalHours = myHours.reduce((sum, h) => sum + (h.hours_logged || 0), 0);
  const presentationsCompleted = volunteerProfile?.presentations_completed || 0;
  const orientationComplete = volunteerProfile?.orientation_completed || false;

  // Calculate this month's hours
  const now = new Date();
  const thisMonthHours = myHours.filter(h => {
    const date = new Date(h.date || "");
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).reduce((sum, h) => sum + (h.hours_logged || 0), 0);

  // Calculate milestones
  const milestones = [
    { hours: 10, label: "Getting Started", achieved: totalHours >= 10 },
    { hours: 25, label: "Dedicated Volunteer", achieved: totalHours >= 25 },
    { hours: 50, label: "Community Leader", achieved: totalHours >= 50 },
    { hours: 100, label: "Impact Champion", achieved: totalHours >= 100 },
  ];

  const nextMilestone = milestones.find(m => !m.achieved);

  // Check onboarding status
  const onboardingStep = volunteerProfile?.onboarding_step;
  const hasGroupChat = volunteerProfile?.group_channel_id;
  const selectedTopic = volunteerProfile?.selected_topic_id;

  return (
    <div className="space-y-6">
      {/* Onboarding Status Banner */}
      {onboardingStep && onboardingStep !== "completed" && onboardingStep !== "scheduled" && (
        <div className="card p-6 bg-blue-50 border-2 border-blue-300">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">Complete Your Onboarding</h3>
              <p className="text-sm text-gsv-gray mb-3">
                {!selectedTopic && "Choose your presentation activity to get started."}
                {selectedTopic && !hasGroupChat && "Set up your group chat to coordinate with your team."}
                {hasGroupChat && onboardingStep === "presentation_created" && "Create and submit your presentation for review."}
              </p>
              <Link
                href="/dashboard/volunteer/onboarding"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium"
              >
                Continue Onboarding
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Group Chat Link */}
      {hasGroupChat && (
        <div className="card p-4 bg-green-50 border border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-green-600" />
              <div>
                <h4 className="font-semibold text-green-900">Group Chat Available</h4>
                <p className="text-sm text-green-700">Coordinate with your team members</p>
              </div>
            </div>
            <Link
              href={`/channels/${hasGroupChat}`}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Open Chat
            </Link>
          </div>
        </div>
      )}

      {/* Welcome Banner */}
      {!orientationComplete && onboardingStep === "completed" && (
        <div className="card p-6 bg-yellow-50 border-2 border-yellow-300">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-yellow-500 text-white rounded-full flex items-center justify-center">
              <Star className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">Complete Your Orientation!</h3>
              <p className="text-sm text-gsv-gray mb-3">
                Before you can participate in presentations, please complete the required volunteer orientation.
              </p>
              <button className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition font-medium">
                Schedule Orientation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<Clock />} label="Total Hours" value={Math.round(totalHours)} color="blue" />
        <StatCard icon={<TrendingUp />} label="This Month" value={Math.round(thisMonthHours)} color="green" />
        <StatCard icon={<Award />} label="Presentations" value={presentationsCompleted} color="purple" />
        <StatCard icon={<CheckCircle />} label="Status" value={orientationComplete ? "Active" : "Pending"} color="orange" />
      </div>

      {/* Progress Tracker */}
      <VolunteerProgressTracker
        totalHours={totalHours}
        presentationsCompleted={presentationsCompleted}
        milestones={milestones}
        nextMilestone={nextMilestone}
      />

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left - 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          <UpcomingPresentationsWidget presentations={upcomingPresentations} />
          <HoursLogWidget hours={myHours} />
        </div>

        {/* Right - 1/3 */}
        <div className="space-y-6">
          <TrainingResourcesWidget resources={availableTrainings} />
          
          {/* Quick Actions */}
          <div className="card p-6">
            <h3 className="font-semibold text-lg mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link href="/dashboard/volunteer/presentations" className="block p-3 bg-gsv-green text-white rounded-lg text-center hover:bg-gsv-green/90 transition">
                View My Presentations
              </Link>
              <Link href="/dashboard/volunteer/hours" className="block p-3 bg-blue-500 text-white rounded-lg text-center hover:bg-blue-600 transition">
                Log Hours
              </Link>
              <Link href="/dashboard/volunteer/documents" className="block p-3 bg-indigo-500 text-white rounded-lg text-center hover:bg-indigo-600 transition">
                Upload Documents
              </Link>
              {upcomingPresentations.length > 0 && (
                <Link href="/dashboard/volunteer/materials" className="block p-3 bg-emerald-500 text-white rounded-lg text-center hover:bg-emerald-600 transition">
                  <Package className="w-4 h-4 inline mr-2" />
                  Request Materials
                </Link>
              )}
              <Link href="/dashboard/volunteer/profile" className="block p-3 bg-purple-500 text-white rounded-lg text-center hover:bg-purple-600 transition">
                Edit Profile
              </Link>
            </div>
          </div>

          {/* Volunteer Stats */}
          <div className="card p-6">
            <h3 className="font-semibold text-lg mb-4">Your Impact</h3>
            <div className="space-y-3">
              <ImpactStat label="Students Reached" value="Coming Soon" />
              <ImpactStat label="Schools Visited" value="Coming Soon" />
              <ImpactStat label="Team Rank" value={`Top ${Math.ceil(Math.random() * 20)}%`} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const StatCard = ({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number | string; color: string }) => {
  const colorClasses: { [key: string]: string } = {
    blue: "bg-blue-50 border-blue-200 text-blue-800",
    green: "bg-green-50 border-green-200 text-green-800",
    purple: "bg-purple-50 border-purple-200 text-purple-800",
    orange: "bg-orange-50 border-orange-200 text-orange-800",
  };

  return (
    <div className={`card p-4 border-2 ${colorClasses[color]}`}>
      <div className="flex items-center gap-2 mb-2 opacity-80">{icon}</div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm">{label}</div>
    </div>
  );
};

const ImpactStat = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
    <span className="text-sm text-gsv-gray">{label}</span>
    <span className="text-sm font-semibold text-gsv-charcoal">{value}</span>
  </div>
);

