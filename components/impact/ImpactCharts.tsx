"use client";
import { BarChart3 } from "lucide-react";

interface ChartData {
  month: string;
  count?: number;
  hours?: number;
}

interface ImpactChartsProps {
  presentationsByMonth: ChartData[];
  hoursByMonth: ChartData[];
}

export default function ImpactCharts({ presentationsByMonth, hoursByMonth }: ImpactChartsProps) {
  const maxPresentations = Math.max(...presentationsByMonth.map(d => d.count || 0), 1);
  const maxHours = Math.max(...hoursByMonth.map(d => d.hours || 0), 1);

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Presentations Chart */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="w-5 h-5 text-gsv-green" />
          <h3 className="font-semibold text-lg">Presentations Per Month</h3>
        </div>
        <div className="space-y-3">
          {presentationsByMonth.map((data, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div className="w-16 text-xs text-gsv-gray">{formatMonth(data.month)}</div>
              <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden relative">
                <div
                  className="h-full bg-gradient-to-r from-gsv-green to-green-400 transition-all duration-500 flex items-center justify-end pr-2"
                  style={{ width: `${((data.count || 0) / maxPresentations) * 100}%` }}
                >
                  {(data.count || 0) > 0 && (
                    <span className="text-xs font-semibold text-white">{data.count}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-xs text-gsv-gray">
          Total presentations in last 12 months: <strong>{presentationsByMonth.reduce((sum, d) => sum + (d.count || 0), 0)}</strong>
        </div>
      </div>

      {/* Volunteer Hours Chart */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold text-lg">Volunteer Hours Per Month</h3>
        </div>
        <div className="space-y-3">
          {hoursByMonth.map((data, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div className="w-16 text-xs text-gsv-gray">{formatMonth(data.month)}</div>
              <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden relative">
                <div
                  className="h-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all duration-500 flex items-center justify-end pr-2"
                  style={{ width: `${((data.hours || 0) / maxHours) * 100}%` }}
                >
                  {(data.hours || 0) > 0 && (
                    <span className="text-xs font-semibold text-white">{Math.round(data.hours || 0)}h</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-xs text-gsv-gray">
          Total hours in last 12 months: <strong>{Math.round(hoursByMonth.reduce((sum, d) => sum + (d.hours || 0), 0))}h</strong>
        </div>
      </div>
    </div>
  );
}

