"use client";
import { School, Presentation, Users, Clock, GraduationCap, MapPin, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";

interface ImpactMetricsGridProps {
  totalSchools: number;
  totalPresentations: number;
  completedPresentations: number;
  totalVolunteers: number;
  totalHours: number;
  totalStudentsReached: number;
  totalChapters: number;
  presentationsGrowth: number;
}

const AnimatedNumber = ({ value }: { value: number }) => {
  const [currentValue, setCurrentValue] = useState(0);

  useEffect(() => {
    let start: number | null = null;
    const duration = 1500; // milliseconds

    const animate = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setCurrentValue(Math.floor(progress * value));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  return <span>{currentValue.toLocaleString()}</span>;
};

export default function ImpactMetricsGrid({
  totalSchools,
  totalPresentations,
  completedPresentations,
  totalVolunteers,
  totalHours,
  totalStudentsReached,
  totalChapters,
  presentationsGrowth,
}: ImpactMetricsGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      <MetricCard
        icon={<School className="w-8 h-8" />}
        label="Schools Reached"
        value={totalSchools}
        color="blue"
      />
      <MetricCard
        icon={<Presentation className="w-8 h-8" />}
        label="Total Presentations"
        value={totalPresentations}
        subtitle={`${completedPresentations} completed`}
        color="green"
      />
      <MetricCard
        icon={<Users className="w-8 h-8" />}
        label="Active Volunteers"
        value={totalVolunteers}
        color="purple"
      />
      <MetricCard
        icon={<Clock className="w-8 h-8" />}
        label="Volunteer Hours"
        value={totalHours}
        color="orange"
      />
      <MetricCard
        icon={<GraduationCap className="w-8 h-8" />}
        label="Students Reached"
        value={totalStudentsReached}
        color="pink"
      />
      <MetricCard
        icon={<MapPin className="w-8 h-8" />}
        label="Active Chapters"
        value={totalChapters}
        color="teal"
      />
      <MetricCard
        icon={<TrendingUp className="w-8 h-8" />}
        label="Monthly Growth"
        value={presentationsGrowth}
        suffix="%"
        color="emerald"
      />
      <MetricCard
        icon={<School className="w-8 h-8" />}
        label="Avg. Students/Event"
        value={totalPresentations > 0 ? Math.round(totalStudentsReached / totalPresentations) : 0}
        color="indigo"
      />
    </div>
  );
}

const MetricCard = ({ 
  icon, 
  label, 
  value, 
  suffix = "", 
  subtitle, 
  color 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: number; 
  suffix?: string; 
  subtitle?: string; 
  color: string;
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

  return (
    <div className="card p-6 hover:shadow-lg transition-shadow">
      <div className={`inline-flex p-3 rounded-lg ${colorClasses[color as keyof typeof colorClasses]} mb-4`}>
        {icon}
      </div>
      <div className="text-3xl font-bold text-gsv-charcoal mb-1">
        <AnimatedNumber value={value} />
        {suffix}
      </div>
      <div className="text-sm text-gsv-gray mb-1">{label}</div>
      {subtitle && <div className="text-xs text-gsv-gray">{subtitle}</div>}
    </div>
  );
};

