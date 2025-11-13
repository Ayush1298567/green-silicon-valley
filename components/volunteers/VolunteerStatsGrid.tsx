"use client";
import { Users, Clock, Award, TrendingUp, UserCheck } from "lucide-react";

interface VolunteerStatsGridProps {
  totalVolunteers: number;
  activeVolunteers: number;
  totalHours: number;
  avgHoursPerVolunteer: number;
  totalPresentations: number;
}

export default function VolunteerStatsGrid({
  totalVolunteers,
  activeVolunteers,
  totalHours,
  avgHoursPerVolunteer,
  totalPresentations,
}: VolunteerStatsGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      <StatCard
        icon={<Users className="w-5 h-5" />}
        label="Total Volunteers"
        value={totalVolunteers}
        color="blue"
      />
      <StatCard
        icon={<UserCheck className="w-5 h-5" />}
        label="Active"
        value={activeVolunteers}
        color="green"
      />
      <StatCard
        icon={<Clock className="w-5 h-5" />}
        label="Total Hours"
        value={Math.round(totalHours)}
        color="orange"
      />
      <StatCard
        icon={<TrendingUp className="w-5 h-5" />}
        label="Avg Hours/Volunteer"
        value={Math.round(avgHoursPerVolunteer)}
        color="purple"
      />
      <StatCard
        icon={<Award className="w-5 h-5" />}
        label="Presentations"
        value={totalPresentations}
        color="pink"
      />
    </div>
  );
}

const StatCard = ({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: "blue" | "green" | "orange" | "purple" | "pink";
}) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    orange: "bg-orange-50 text-orange-600",
    purple: "bg-purple-50 text-purple-600",
    pink: "bg-pink-50 text-pink-600",
  };

  return (
    <div className="card p-4">
      <div className={`inline-flex p-2 rounded-lg ${colorClasses[color]} mb-2`}>
        {icon}
      </div>
      <div className="text-2xl font-bold text-gsv-charcoal">{value}</div>
      <div className="text-sm text-gsv-gray">{label}</div>
    </div>
  );
};

