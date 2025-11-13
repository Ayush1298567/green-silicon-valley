"use client";
import { Award, Clock, Star } from "lucide-react";

interface TopVolunteer {
  volunteer: {
    id: string;
    user_id: string;
    name?: string;
    presentations_completed?: number;
  };
  hours: number;
}

interface VolunteerHighlightsProps {
  topVolunteers: TopVolunteer[];
}

export default function VolunteerHighlights({ topVolunteers }: VolunteerHighlightsProps) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {topVolunteers.map((item, idx) => (
        <VolunteerCard
          key={item.volunteer.id}
          rank={idx + 1}
          name={item.volunteer.name || "Anonymous Volunteer"}
          hours={item.hours}
          presentations={item.volunteer.presentations_completed || 0}
        />
      ))}
    </div>
  );
}

const VolunteerCard = ({ 
  rank, 
  name, 
  hours, 
  presentations 
}: { 
  rank: number; 
  name: string; 
  hours: number; 
  presentations: number;
}) => {
  const getRankBadge = () => {
    if (rank === 1) return { icon: "🥇", color: "bg-yellow-100 text-yellow-800" };
    if (rank === 2) return { icon: "🥈", color: "bg-gray-100 text-gray-800" };
    if (rank === 3) return { icon: "🥉", color: "bg-orange-100 text-orange-800" };
    return { icon: `#${rank}`, color: "bg-blue-100 text-blue-800" };
  };

  const badge = getRankBadge();

  return (
    <div className="card p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`px-3 py-1 rounded-full text-sm font-semibold ${badge.color}`}>
          {badge.icon}
        </div>
        <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
      </div>
      <h3 className="font-semibold text-lg mb-4 truncate">{name}</h3>
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-gsv-gray">
          <Clock className="w-4 h-4" />
          <span>{hours.toFixed(1)} volunteer hours</span>
        </div>
        <div className="flex items-center gap-2 text-gsv-gray">
          <Award className="w-4 h-4" />
          <span>{presentations} presentations</span>
        </div>
      </div>
    </div>
  );
};

