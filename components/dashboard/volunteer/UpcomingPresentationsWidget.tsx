"use client";
import { Calendar, MapPin, Users, Clock } from "lucide-react";
import Link from "next/link";
import { type PresentationRow } from "@/types/db";

interface UpcomingPresentationsWidgetProps {
  presentations: PresentationRow[];
}

export default function UpcomingPresentationsWidget({ presentations }: UpcomingPresentationsWidgetProps) {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gsv-green" />
          <h2 className="text-xl font-semibold">Upcoming Presentations</h2>
        </div>
        <Link href="/dashboard/volunteer/presentations" className="text-sm text-gsv-green hover:underline">
          View All
        </Link>
      </div>

      <div className="space-y-3">
        {presentations.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gsv-gray">No upcoming presentations scheduled</p>
            <p className="text-sm text-gsv-gray mt-1">Check back soon for new opportunities!</p>
          </div>
        ) : (
          presentations.map((pres) => {
            const date = new Date(pres.scheduled_date || "");
            const daysUntil = Math.ceil((date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            
            return (
              <div key={pres.id} className="border rounded-lg p-4 hover:shadow-md transition">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gsv-charcoal">{pres.topic || "Environmental Education"}</h3>
                  {daysUntil <= 7 && (
                    <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full font-medium">
                      In {daysUntil} days
                    </span>
                  )}
                </div>
                
                <div className="space-y-2 text-sm text-gsv-gray">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{date.toLocaleDateString()} at {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  {pres.grade_level && (
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>Grade {pres.grade_level}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-3">
                  <button className="flex-1 px-4 py-2 bg-gsv-green text-white rounded-lg text-sm hover:bg-gsv-green/90 transition">
                    Sign Up
                  </button>
                  <button className="px-4 py-2 border border-gray-300 text-gsv-charcoal rounded-lg text-sm hover:bg-gray-50 transition">
                    Details
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

