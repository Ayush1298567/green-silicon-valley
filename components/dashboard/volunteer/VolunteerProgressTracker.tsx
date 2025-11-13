"use client";
import { Award, Star } from "lucide-react";

interface Milestone {
  hours: number;
  label: string;
  achieved: boolean;
}

interface VolunteerProgressTrackerProps {
  totalHours: number;
  presentationsCompleted: number;
  milestones: Milestone[];
  nextMilestone?: Milestone;
}

export default function VolunteerProgressTracker({
  totalHours,
  presentationsCompleted,
  milestones,
  nextMilestone,
}: VolunteerProgressTrackerProps) {
  const progressToNext = nextMilestone
    ? Math.min((totalHours / nextMilestone.hours) * 100, 100)
    : 100;

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Award className="w-6 h-6 text-gsv-green" />
          <h2 className="text-xl font-semibold">Your Progress</h2>
        </div>
        {nextMilestone && (
          <span className="text-sm text-gsv-gray">
            {nextMilestone.hours - totalHours} hours until next milestone
          </span>
        )}
      </div>

      {/* Progress Bar */}
      {nextMilestone && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2 text-sm">
            <span className="font-medium">Next: {nextMilestone.label}</span>
            <span className="text-gsv-gray">{Math.round(totalHours)} / {nextMilestone.hours} hours</span>
          </div>
          <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-gsv-green to-green-400 transition-all duration-500"
              style={{ width: `${progressToNext}%` }}
            />
          </div>
        </div>
      )}

      {/* Milestones */}
      <div className="grid md:grid-cols-4 gap-3">
        {milestones.map((milestone, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-lg border-2 transition ${
              milestone.achieved
                ? "border-gsv-green bg-green-50"
                : "border-gray-200 bg-gray-50 opacity-50"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              {milestone.achieved ? (
                <Star className="w-5 h-5 text-gsv-green fill-gsv-green" />
              ) : (
                <Star className="w-5 h-5 text-gray-400" />
              )}
              <span className={`text-xs font-medium ${milestone.achieved ? "text-gsv-green" : "text-gray-500"}`}>
                {milestone.hours}h
              </span>
            </div>
            <div className="text-xs font-semibold">{milestone.label}</div>
          </div>
        ))}
      </div>

      {/* Achievements Summary */}
      <div className="mt-6 pt-6 border-t">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gsv-charcoal">{milestones.filter(m => m.achieved).length}</div>
            <div className="text-xs text-gsv-gray">Milestones Achieved</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gsv-charcoal">{presentationsCompleted}</div>
            <div className="text-xs text-gsv-gray">Presentations</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gsv-charcoal">{Math.round(totalHours)}</div>
            <div className="text-xs text-gsv-gray">Total Hours</div>
          </div>
        </div>
      </div>
    </div>
  );
}

