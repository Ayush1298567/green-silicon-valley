"use client";
import { Presentation, Users, School, Clock, GraduationCap, UserPlus, MapPin, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface DashboardKPIsProps {
  totalPresentations: number;
  upcomingPresentations: number;
  completedPresentations: number;
  totalVolunteers: number;
  activeVolunteers: number;
  totalSchools: number;
  activeSchools: number;
  totalHours: number;
  totalStudentsReached: number;
  totalInterns: number;
  totalChapters: number;
  presentationsGrowth: number;
  hoursGrowth: number;
}

export default function DashboardKPIs({
  totalPresentations,
  upcomingPresentations,
  completedPresentations,
  totalVolunteers,
  activeVolunteers,
  totalSchools,
  activeSchools,
  totalHours,
  totalStudentsReached,
  totalInterns,
  totalChapters,
  presentationsGrowth,
  hoursGrowth,
}: DashboardKPIsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <KPICard
        icon={<Presentation className="w-5 h-5" />}
        label="Total Presentations"
        value={totalPresentations}
        subtitle={`${upcomingPresentations} upcoming`}
        color="blue"
        trend={presentationsGrowth}
      />
      <KPICard
        icon={<Users className="w-5 h-5" />}
        label="Active Volunteers"
        value={activeVolunteers}
        subtitle={`of ${totalVolunteers} total`}
        color="purple"
      />
      <KPICard
        icon={<School className="w-5 h-5" />}
        label="School Partners"
        value={activeSchools}
        subtitle={`${totalSchools} total`}
        color="green"
      />
      <KPICard
        icon={<Clock className="w-5 h-5" />}
        label="Volunteer Hours"
        value={totalHours}
        subtitle="All time"
        color="orange"
        trend={hoursGrowth}
      />
      <KPICard
        icon={<GraduationCap className="w-5 h-5" />}
        label="Students Reached"
        value={totalStudentsReached}
        subtitle="All time"
        color="pink"
      />
      <KPICard
        icon={<UserPlus className="w-5 h-5" />}
        label="Interns"
        value={totalInterns}
        subtitle="Current team"
        color="indigo"
      />
      <KPICard
        icon={<MapPin className="w-5 h-5" />}
        label="Active Chapters"
        value={totalChapters}
        subtitle="Locations"
        color="teal"
      />
      <KPICard
        icon={<Presentation className="w-5 h-5" />}
        label="Completed"
        value={completedPresentations}
        subtitle="Presentations"
        color="emerald"
      />
    </div>
  );
}

const KPICard = ({ 
  icon, 
  label, 
  value, 
  subtitle, 
  color,
  trend
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: number; 
  subtitle: string; 
  color: string;
  trend?: number;
}) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
    pink: "bg-pink-50 text-pink-600",
    teal: "bg-teal-50 text-teal-600",
    emerald: "bg-emerald-50 text-emerald-600",
    indigo: "bg-indigo-50 text-indigo-600",
  };

  const getTrendIcon = () => {
    if (trend === undefined) return null;
    if (trend > 0) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (trend < 0) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const getTrendColor = () => {
    if (trend === undefined) return "";
    if (trend > 0) return "text-green-600";
    if (trend < 0) return "text-red-600";
    return "text-gray-400";
  };

  return (
    <div className="card p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
          {icon}
        </div>
        {trend !== undefined && (
          <div className="flex items-center gap-1">
            {getTrendIcon()}
            <span className={`text-xs font-semibold ${getTrendColor()}`}>
              {Math.abs(trend)}%
            </span>
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-gsv-charcoal mb-1">
        {value.toLocaleString()}
      </div>
      <div className="text-xs text-gsv-gray">{label}</div>
      <div className="text-xs text-gsv-gray mt-1">{subtitle}</div>
    </div>
  );
};

