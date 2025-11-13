"use client";

import { Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import Link from "next/link";

interface HoursStatusCardProps {
  totalApproved: number;
  pending: number;
  rejected: number;
}

export default function HoursStatusCard({
  totalApproved,
  pending,
  rejected
}: HoursStatusCardProps) {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gsv-charcoal flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Volunteer Hours
        </h3>
        <Link
          href="/dashboard/volunteer/hours"
          className="text-sm text-gsv-green hover:underline"
        >
          View All →
        </Link>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-gsv-charcoal">Approved</span>
          </div>
          <span className="text-lg font-bold text-green-600">{totalApproved}</span>
        </div>

        {pending > 0 && (
          <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <span className="text-sm font-medium text-gsv-charcoal">Pending</span>
            </div>
            <span className="text-lg font-bold text-yellow-600">{pending}</span>
          </div>
        )}

        {rejected > 0 && (
          <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" />
              <span className="text-sm font-medium text-gsv-charcoal">Rejected</span>
            </div>
            <span className="text-lg font-bold text-red-600">{rejected}</span>
          </div>
        )}

        {pending === 0 && rejected === 0 && totalApproved === 0 && (
          <div className="text-center py-4 text-gsv-gray text-sm">
            No hours submitted yet
          </div>
        )}
      </div>
    </div>
  );
}

