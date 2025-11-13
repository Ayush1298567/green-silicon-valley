"use client";

import { useEffect, useState } from "react";

interface Props {
  schoolsCount: number;
  volunteersCount: number;
  totalHours: number;
  presentationsCount: number;
}

export default function ImpactStats({ schoolsCount, volunteersCount, totalHours, presentationsCount }: Props) {
  const [animatedCounts, setAnimatedCounts] = useState({
    schools: 0,
    volunteers: 0,
    hours: 0,
    presentations: 0,
  });

  useEffect(() => {
    const duration = 2000; // 2 seconds
    const steps = 60;
    const interval = duration / steps;

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      
      setAnimatedCounts({
        schools: Math.floor(schoolsCount * progress),
        volunteers: Math.floor(volunteersCount * progress),
        hours: Math.floor(totalHours * progress),
        presentations: Math.floor(presentationsCount * progress),
      });

      if (step >= steps) {
        clearInterval(timer);
        setAnimatedCounts({
          schools: schoolsCount,
          volunteers: volunteersCount,
          hours: totalHours,
          presentations: presentationsCount,
        });
      }
    }, interval);

    return () => clearInterval(timer);
  }, [schoolsCount, volunteersCount, totalHours, presentationsCount]);

  return (
    <div className="card p-10 shadow-2xl bg-gradient-to-br from-white to-gsv-greenSoft/30 border-2 border-gsv-green/10">
      <div className="flex items-center justify-center gap-2 mb-8">
        <div className="w-2 h-2 bg-gsv-green rounded-full animate-pulse" />
        <h3 className="text-2xl font-bold text-gsv-charcoal">Our Impact</h3>
        <div className="w-2 h-2 bg-gsv-green rounded-full animate-pulse" style={{ animationDelay: "0.5s" }} />
      </div>
      <div className="grid grid-cols-2 gap-8">
        <ImpactStat label="Schools Reached" value={animatedCounts.schools} icon="🏫" />
        <ImpactStat label="Active Volunteers" value={animatedCounts.volunteers} icon="👥" />
        <ImpactStat label="Presentations" value={animatedCounts.presentations} icon="📊" />
        <ImpactStat label="Volunteer Hours" value={animatedCounts.hours.toLocaleString()} icon="⏱️" />
      </div>
      <div className="mt-8 pt-6 border-t border-gsv-green/20">
        <p className="text-xs text-center text-gsv-gray flex items-center justify-center gap-2">
          <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Real-time data from our database
        </p>
      </div>
    </div>
  );
}

const ImpactStat = ({ label, value, icon }: { label: string; value: number | string; icon: string }) => {
  return (
    <div className="text-center group">
      <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">{icon}</div>
      <div className="text-4xl font-bold text-gsv-green mb-2 group-hover:scale-105 transition-transform">{value}</div>
      <div className="text-sm text-gsv-gray font-medium">{label}</div>
    </div>
  );
};

