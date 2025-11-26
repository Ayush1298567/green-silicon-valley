"use client";

import { useState, useEffect } from "react";
import { Users, Presentation, MapPin, Clock, TrendingUp } from "lucide-react";

interface ImpactStats {
  totalVolunteers: number;
  totalPresentations: number;
  totalSchools: number;
  totalHours: number;
  totalCountries: number;
  activeChapters: number;
  monthlyGrowth: number;
  impactScore: number;
}

interface ImpactCounterProps {
  stats: ImpactStats;
}

export default function ImpactCounter({ stats }: ImpactCounterProps) {
  const [animatedStats, setAnimatedStats] = useState<ImpactStats>({
    totalVolunteers: 0,
    totalPresentations: 0,
    totalSchools: 0,
    totalHours: 0,
    totalCountries: 0,
    activeChapters: 0,
    monthlyGrowth: 0,
    impactScore: 0
  });

  useEffect(() => {
    // Animate counters when stats change
    const duration = 2000; // 2 seconds
    const steps = 60;
    const stepDuration = duration / steps;

    const animateCounter = (key: keyof ImpactStats, targetValue: number) => {
      const startValue = animatedStats[key] as number;
      const increment = (targetValue - startValue) / steps;

      let currentStep = 0;
      const timer = setInterval(() => {
        currentStep++;
        const newValue = Math.round(startValue + increment * currentStep);

        setAnimatedStats(prev => ({
          ...prev,
          [key]: newValue
        }));

        if (currentStep >= steps) {
          clearInterval(timer);
          setAnimatedStats(prev => ({
            ...prev,
            [key]: targetValue
          }));
        }
      }, stepDuration);
    };

    // Animate all counters
    Object.keys(stats).forEach(key => {
      const statKey = key as keyof ImpactStats;
      animateCounter(statKey, stats[statKey]);
    });
  }, [stats]);

  const metrics = [
    {
      label: "Volunteers",
      value: animatedStats.totalVolunteers,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      description: "Dedicated STEM educators"
    },
    {
      label: "Presentations",
      value: animatedStats.totalPresentations,
      icon: Presentation,
      color: "text-green-600",
      bgColor: "bg-green-100",
      description: "Interactive sessions delivered"
    },
    {
      label: "Schools",
      value: animatedStats.totalSchools,
      icon: MapPin,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      description: "Educational institutions reached"
    },
    {
      label: "Volunteer Hours",
      value: animatedStats.totalHours,
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      description: "Hours of educational impact"
    },
    {
      label: "Countries",
      value: animatedStats.totalCountries,
      icon: MapPin,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
      description: "Global reach achieved"
    },
    {
      label: "Impact Score",
      value: animatedStats.impactScore,
      icon: TrendingUp,
      color: "text-red-600",
      bgColor: "bg-red-100",
      description: "Overall effectiveness rating"
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Real-Time Impact</h2>
        <p className="text-gray-600">Our growing community of educators and students</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {metrics.map((metric, index) => (
          <div key={metric.label} className="text-center">
            <div className={`inline-flex items-center justify-center w-12 h-12 ${metric.bgColor} rounded-lg mb-3`}>
              <metric.icon className={`w-6 h-6 ${metric.color}`} />
            </div>

            <div className={`text-3xl font-bold ${metric.color} mb-1`}>
              {metric.value.toLocaleString()}
            </div>

            <div className="text-sm font-medium text-gray-900 mb-1">
              {metric.label}
            </div>

            <div className="text-xs text-gray-600">
              {metric.description}
            </div>

            {/* Animated background effect */}
            <div className="relative mt-2">
              <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${metric.color.replace('text-', 'bg-')} transition-all duration-1000 ease-out`}
                  style={{
                    width: `${Math.min(100, (metric.value / (stats[Object.keys(stats)[index] as keyof ImpactStats] as number)) * 100)}%`
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Growth indicator */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
          <TrendingUp className="w-4 h-4 text-green-600" />
          <span>
            <span className="font-medium text-green-600">+{stats.monthlyGrowth}%</span> growth this month
          </span>
          <span className="text-gray-400">•</span>
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
}
