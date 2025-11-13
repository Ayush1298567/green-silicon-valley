"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Users, Calendar, BookOpen, FileText, CheckCircle, Clock } from "lucide-react";

interface OnboardingProgress {
  id: number;
  volunteer_id: number;
  workflow_id: number;
  current_step: number;
  status: string;
  volunteer?: {
    user?: {
      name: string;
      email: string;
    };
  };
}

export default function VolunteerWorkflowPage() {
  const [progress, setProgress] = useState<OnboardingProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      // This would fetch from /api/volunteer-workflow/progress
      // For now, showing placeholder
      setLoading(false);
    } catch (error) {
      console.error("Error fetching progress:", error);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gsv-charcoal">Volunteer Onboarding</h1>
          <p className="text-gsv-gray mt-1">Manage volunteer onboarding workflows</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Link
          href="/dashboard/founder/volunteer-workflow/applications"
          className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gsv-charcoal">Applications</h3>
          </div>
          <p className="text-sm text-gsv-gray">Review volunteer applications</p>
        </Link>

        <Link
          href="/dashboard/founder/volunteer-workflow/orientations"
          className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-gsv-charcoal">Orientations</h3>
          </div>
          <p className="text-sm text-gsv-gray">Schedule orientation sessions</p>
        </Link>

        <Link
          href="/dashboard/founder/volunteer-workflow/training"
          className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BookOpen className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gsv-charcoal">Training</h3>
          </div>
          <p className="text-sm text-gsv-gray">Manage training modules</p>
        </Link>

        <Link
          href="/dashboard/founder/volunteer-workflow/progress"
          className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gsv-charcoal">Progress</h3>
          </div>
          <p className="text-sm text-gsv-gray">Track onboarding progress</p>
        </Link>
      </div>

      {/* Onboarding Steps Overview */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gsv-charcoal mb-4">Default Onboarding Workflow</h2>
        <div className="space-y-3">
          {[
            { step: 1, name: "Application Submitted", icon: FileText },
            { step: 2, name: "Application Reviewed", icon: CheckCircle },
            { step: 3, name: "Background Check", icon: FileText },
            { step: 4, name: "Waiver Signed", icon: FileText },
            { step: 5, name: "Orientation Scheduled", icon: Calendar },
            { step: 6, name: "Orientation Completed", icon: CheckCircle },
            { step: 7, name: "Training Assigned", icon: BookOpen },
            { step: 8, name: "Training Completed", icon: CheckCircle },
            { step: 9, name: "First Presentation", icon: Users },
            { step: 10, name: "Active Volunteer", icon: CheckCircle }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.step} className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-gsv-green/20 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-gsv-green" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gsv-charcoal">{item.name}</div>
                </div>
                <div className="text-sm text-gsv-gray">Step {item.step}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

