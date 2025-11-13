"use client";

import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Users, Calendar, Award, School } from "lucide-react";

interface Analytics {
  totalVolunteers: number;
  activeVolunteers: number;
  totalHours: number;
  totalPresentations: number;
  schoolsReached: number;
  studentsReached: number;
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"all_time" | "this_year" | "this_month">("all_time");

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`/api/analytics/metrics?period=${period}`);
      const data = await res.json();
      if (data.ok) {
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gsv-gray">Loading analytics...</div>;
  }

  if (!analytics) {
    return <div className="text-center py-12 text-gsv-gray">No analytics data available</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gsv-charcoal">Analytics Dashboard</h1>
          <p className="text-gsv-gray mt-1">Comprehensive insights and metrics</p>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green"
        >
          <option value="all_time">All Time</option>
          <option value="this_year">This Year</option>
          <option value="this_month">This Month</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gsv-charcoal">{analytics.totalVolunteers}</div>
              <div className="text-sm text-gsv-gray">Total Volunteers</div>
            </div>
          </div>
          <div className="mt-4 text-sm text-green-600">
            {analytics.activeVolunteers} active
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gsv-charcoal">{analytics.totalHours}</div>
              <div className="text-sm text-gsv-gray">Total Hours</div>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-sm text-green-600">
            <TrendingUp className="w-4 h-4" />
            <span>Growing</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Award className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gsv-charcoal">{analytics.totalPresentations}</div>
              <div className="text-sm text-gsv-gray">Presentations</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-100 rounded-lg">
              <School className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gsv-charcoal">{analytics.schoolsReached}</div>
              <div className="text-sm text-gsv-gray">Schools Reached</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-pink-100 rounded-lg">
              <Users className="w-5 h-5 text-pink-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gsv-charcoal">{analytics.studentsReached}</div>
              <div className="text-sm text-gsv-gray">Students Reached</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gsv-charcoal">
                {analytics.schoolsReached > 0
                  ? Math.round(analytics.studentsReached / analytics.schoolsReached)
                  : 0}
              </div>
              <div className="text-sm text-gsv-gray">Avg Students/School</div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Placeholder */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gsv-charcoal mb-4">Trends</h2>
        <div className="h-64 flex items-center justify-center text-gsv-gray border-2 border-dashed border-gray-200 rounded">
          Chart visualization would go here
          <br />
          (Integrate with recharts or similar library)
        </div>
      </div>
    </div>
  );
}

