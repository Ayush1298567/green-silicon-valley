"use client";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface MetricCardsProps {
  metrics: {
    totalPresentations: number;
    totalVolunteerHours: number;
    activeVolunteers: number;
    avgHoursPerVolunteer: number;
    upcomingPresentations: number;
    volunteerGrowth?: number;
    presentationGrowth?: number;
  };
}

export default function MetricCards({ metrics }: MetricCardsProps) {
  const items = [
    {
      label: "Total Presentations",
      value: metrics.totalPresentations,
      growth: metrics.presentationGrowth,
      suffix: ""
    },
    {
      label: "Volunteer Hours",
      value: metrics.totalVolunteerHours,
      suffix: " hrs"
    },
    {
      label: "Active Volunteers",
      value: metrics.activeVolunteers,
      growth: metrics.volunteerGrowth,
      suffix: ""
    },
    {
      label: "Avg Hours / Volunteer",
      value: metrics.avgHoursPerVolunteer,
      suffix: " hrs"
    },
    {
      label: "Upcoming Presentations",
      value: metrics.upcomingPresentations,
      suffix: ""
    }
  ];

  return (
    <div className="grid md:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
      {items.map((item, idx) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05, duration: 0.4 }}
          className="rounded-2xl border border-gsv-slate-200 bg-white/80 backdrop-blur-sm p-4 shadow-soft hover:shadow-soft-lg transition-shadow"
        >
          <div className="text-xs uppercase tracking-wide text-gsv-slate-500 font-semibold mb-2">{item.label}</div>
          <div className="text-3xl font-bold text-gsv-charcoal">
            {item.value.toLocaleString(undefined, { maximumFractionDigits: 1 })}
            <span className="text-base font-semibold text-gsv-slate-500 ml-1">{item.suffix}</span>
          </div>
          {typeof item.growth === "number" ? (
            <div className={`flex items-center gap-1 mt-2 text-sm font-semibold ${item.growth >= 0 ? "text-gsv-green" : "text-gsv-warm"}`}>
              {item.growth >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              {Math.abs(item.growth).toFixed(1)}% vs last month
            </div>
          ) : (
            <div className="text-xs text-gsv-slate-400 mt-2">Last 30 days</div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
