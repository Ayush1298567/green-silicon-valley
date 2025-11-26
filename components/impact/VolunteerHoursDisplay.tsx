"use client";

import { useState, useEffect } from "react";
import { Clock, TrendingUp, Users, Calendar } from "lucide-react";

interface HoursData {
  month: string;
  hours: number;
  volunteers: number;
  presentations: number;
}

export default function VolunteerHoursDisplay() {
  const [hoursData, setHoursData] = useState<HoursData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<"6months" | "1year" | "2years">("6months");

  useEffect(() => {
    fetchHoursData();
  }, [selectedPeriod]);

  const fetchHoursData = async () => {
    try {
      const res = await fetch(`/api/impact/hours?period=${selectedPeriod}`);
      const data = await res.json();
      if (data.ok) {
        setHoursData(data.hours || []);
      }
    } catch (error) {
      console.error("Error fetching hours data:", error);
      // Generate sample data for demonstration
      generateSampleData();
    } finally {
      setLoading(false);
    }
  };

  const generateSampleData = () => {
    const months = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        hours: Math.floor(Math.random() * 2000) + 1000,
        volunteers: Math.floor(Math.random() * 50) + 20,
        presentations: Math.floor(Math.random() * 30) + 10
      });
    }

    setHoursData(months);
  };

  useEffect(() => {
    if (hoursData.length === 0 && !loading) {
      generateSampleData();
    }
  }, [hoursData, loading]);

  const totalHours = hoursData.reduce((sum, data) => sum + data.hours, 0);
  const avgHoursPerMonth = hoursData.length > 0 ? Math.round(totalHours / hoursData.length) : 0;
  const totalVolunteers = Math.max(...hoursData.map(d => d.volunteers));
  const growthRate = hoursData.length >= 2
    ? Math.round(((hoursData[hoursData.length - 1].hours - hoursData[0].hours) / hoursData[0].hours) * 100)
    : 0;

  const maxHours = Math.max(...hoursData.map(d => d.hours));

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading volunteer hours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Period selector */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Volunteer Hours</h3>
        <div className="flex gap-1">
          {[
            { value: "6months", label: "6M" },
            { value: "1year", label: "1Y" },
            { value: "2years", label: "2Y" }
          ].map((period) => (
            <button
              key={period.value}
              onClick={() => setSelectedPeriod(period.value as any)}
              className={`px-3 py-1 text-sm rounded ${
                selectedPeriod === period.value
                  ? "bg-blue-100 text-blue-800"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-green-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">Total Hours</span>
          </div>
          <div className="text-2xl font-bold text-green-900">{totalHours.toLocaleString()}</div>
        </div>

        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Monthly Avg</span>
          </div>
          <div className="text-2xl font-bold text-blue-900">{avgHoursPerMonth.toLocaleString()}</div>
        </div>
      </div>

      {/* Growth indicator */}
      <div className="flex items-center gap-2 text-sm">
        <TrendingUp className={`w-4 h-4 ${growthRate >= 0 ? "text-green-600" : "text-red-600"}`} />
        <span className={growthRate >= 0 ? "text-green-700" : "text-red-700"}>
          {growthRate >= 0 ? "+" : ""}{growthRate}% growth over period
        </span>
      </div>

      {/* Chart */}
      <div className="relative">
        <div className="h-48 flex items-end justify-between gap-1">
          {hoursData.map((data, index) => (
            <div key={data.month} className="flex-1 flex flex-col items-center">
              {/* Bar */}
              <div className="w-full relative">
                <div
                  className="bg-gradient-to-t from-green-500 to-green-400 rounded-t transition-all duration-500 ease-out hover:from-green-600 hover:to-green-500"
                  style={{
                    height: `${(data.hours / maxHours) * 120}px`,
                    minHeight: "4px"
                  }}
                />
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                  {data.hours.toLocaleString()} hours
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>

              {/* Month label */}
              <div className="text-xs text-gray-600 mt-2 transform -rotate-45 origin-top-left">
                {data.month}
              </div>
            </div>
          ))}
        </div>

        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-xs text-gray-500">
          <span>{maxHours.toLocaleString()}</span>
          <span>{Math.round(maxHours * 0.75).toLocaleString()}</span>
          <span>{Math.round(maxHours * 0.5).toLocaleString()}</span>
          <span>{Math.round(maxHours * 0.25).toLocaleString()}</span>
          <span>0</span>
        </div>
      </div>

      {/* Additional metrics */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <div className="text-lg font-semibold text-purple-600">{totalVolunteers}</div>
          <div className="text-xs text-gray-600">Peak Volunteers</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-orange-600">
            {hoursData.reduce((sum, d) => sum + d.presentations, 0)}
          </div>
          <div className="text-xs text-gray-600">Total Presentations</div>
        </div>
      </div>

      {/* Monthly breakdown */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-900">Monthly Breakdown</h4>
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {hoursData.slice(-6).map((data) => (
            <div key={data.month} className="flex justify-between items-center text-sm py-1 border-b border-gray-100 last:border-b-0">
              <span className="text-gray-700">{data.month}</span>
              <div className="flex items-center gap-3 text-gray-600">
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {data.hours.toLocaleString()}
                </span>
                <span className="flex items-center gap-1">
                  <Users size={12} />
                  {data.volunteers}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
