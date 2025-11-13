"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock, FileText, MessageSquare, BookOpen, ExternalLink } from "lucide-react";

interface QuickActionsCardProps {
  hasPresentations: boolean;
  hasPendingHours: boolean;
  presentationStatus?: string;
  presentationDraftUrl?: string | null;
  volunteerId?: number;
}

export default function QuickActionsCard({
  hasPresentations,
  hasPendingHours,
  presentationStatus,
  presentationDraftUrl,
  volunteerId
}: QuickActionsCardProps) {
  const actions = [];

  if (hasPresentations && !hasPendingHours) {
    actions.push({
      href: "/dashboard/volunteer/hours",
      icon: <Clock className="w-5 h-5" />,
      label: "Submit Hours",
      color: "bg-gsv-green hover:bg-gsv-greenDark"
    });
  }

  if (presentationStatus === "submitted_for_review" || presentationStatus === "in_review") {
    actions.push({
      href: "/dashboard/volunteer/onboarding",
      icon: <FileText className="w-5 h-5" />,
      label: "View Presentation",
      color: "bg-blue-500 hover:bg-blue-600"
    });
  } else if (presentationDraftUrl) {
    actions.push({
      href: presentationDraftUrl,
      icon: <ExternalLink className="w-5 h-5" />,
      label: "Open Slides",
      color: "bg-blue-500 hover:bg-blue-600",
      external: true
    });
  } else {
    actions.push({
      href: "/dashboard/volunteer/onboarding",
      icon: <FileText className="w-5 h-5" />,
      label: "Create Presentation",
      color: "bg-gsv-green hover:bg-gsv-greenDark"
    });
  }

  if (volunteerId) {
    actions.push({
      href: `/dashboard/volunteer/onboarding`,
      icon: <MessageSquare className="w-5 h-5" />,
      label: "Post Update",
      color: "bg-purple-500 hover:bg-purple-600"
    });
  }

  actions.push({
    href: "/dashboard/volunteer/onboarding",
    icon: <BookOpen className="w-5 h-5" />,
    label: "View Resources",
    color: "bg-yellow-500 hover:bg-yellow-600"
  });

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-gsv-charcoal mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, idx) => {
          if (action.external) {
            return (
              <a
                key={idx}
                href={action.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`${action.color} text-white rounded-lg p-4 flex flex-col items-center justify-center gap-2 transition shadow-md hover:shadow-lg`}
              >
                {action.icon}
                <span className="text-xs text-center font-medium">{action.label}</span>
              </a>
            );
          }
          return (
            <Link
              key={idx}
              href={action.href}
              className={`${action.color} text-white rounded-lg p-4 flex flex-col items-center justify-center gap-2 transition shadow-md hover:shadow-lg`}
            >
              {action.icon}
              <span className="text-xs text-center font-medium">{action.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

