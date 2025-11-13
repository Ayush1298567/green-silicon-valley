"use client";

import { useState, useEffect } from "react";
import MetricCards from "./MetricCards";
import EnhancedCharts from "./EnhancedCharts";
import KeyInsights from "./KeyInsights";
import TopLists from "./TopLists";
import DateRangeFilter from "./DateRangeFilter";
import ExportButton from "./ExportButton";
import { CardSkeleton } from "@/components/ui/LoadingSkeleton";
import { RefreshCw } from "lucide-react";

interface AnalyticsDashboardProps {
  initialData: {
    metrics: any;
    charts: any;
    volunteers: any[];
    schools: any[];
  };
}

export default function AnalyticsDashboard({ initialData }: AnalyticsDashboardProps) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({ start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), end: new Date() });

  const handleDateRangeChange = async (start: Date, end: Date) => {
    setDateRange({ start, end });
    setLoading(true);
    try {
      const response = await fetch(
        `/api/analytics/metrics?start=${start.toISOString()}&end=${end.toISOString()}`
      );
      const result = await response.json();
      if (result.ok) {
        setData(result.data);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: "csv" | "json" | "pdf") => {
    try {
      const response = await fetch("/api/analytics/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          format,
          startDate: dateRange.start.toISOString(),
          endDate: dateRange.end.toISOString()
        })
      });

      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `analytics-export-${new Date().toISOString().split("T")[0]}.${format === "csv" ? "csv" : format === "json" ? "json" : "pdf"}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Export error:", error);
      throw error;
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    await handleDateRangeChange(dateRange.start, dateRange.end);
  };

  return (
    <div className="space-y-8" role="main" aria-label="Analytics dashboard">
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gsv-charcoal">Analytics Overview</h1>
          <p className="text-gsv-slate-600 mt-2 max-w-2xl">
            Track program momentum, volunteer engagement, and chapter health in real time. These dashboards update
            automatically as your team logs hours, schedules presentations, and grows impact.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:border-gsv-green transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-gsv-green focus:ring-offset-2"
            aria-label="Refresh analytics data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
            <span className="text-sm font-medium">Refresh</span>
          </button>
          <DateRangeFilter onRangeChange={handleDateRangeChange} />
          <ExportButton onExport={handleExport} disabled={loading} />
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : (
        <>
          {/* Metric Cards */}
          <section aria-label="Key metrics">
            <MetricCards metrics={data.metrics} />
          </section>

          {/* Enhanced Charts */}
          <section aria-label="Analytics charts">
            <EnhancedCharts metrics={data.charts} />
          </section>

          {/* Top Lists and Insights */}
          <section aria-label="Top performers and insights">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <TopLists volunteers={data.volunteers} schools={data.schools} />
              </div>
              <KeyInsights />
            </div>
          </section>
        </>
      )}
    </div>
  );
}

