"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { motion } from "framer-motion";
import { TrendingUp, Users, Clock, Award } from "lucide-react";

interface EnhancedChartsProps {
  metrics: {
    presentationsPerMonth: Array<{ month: string; count: number }>;
    volunteerHoursByTeam: Array<{ team: string; hours: number }>;
    studentEngagement?: Array<{ month: string; students: number }>;
    volunteerRetention?: Array<{ month: string; active: number; new: number }>;
    hoursTrend?: Array<{ month: string; hours: number }>;
  };
}

const COLORS = {
  primary: "#2BAE66",
  secondary: "#E8F5EE",
  accent: "#FFA500",
  warning: "#FF6B6B"
};

export default function EnhancedCharts({ metrics }: EnhancedChartsProps) {
  const chartVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-6">
      {/* Main Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Presentations Trend - Area Chart */}
        <motion.div
          variants={chartVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.4 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-gsv-green" aria-hidden="true" />
              <h3 className="text-lg font-semibold text-gsv-charcoal">Presentations Trend</h3>
            </div>
          </div>
          <div className="h-64" role="img" aria-label="Line chart showing presentations per month">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.presentationsPerMonth}>
                <defs>
                  <linearGradient id="colorPresentations" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: "#666" }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#666" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    padding: "8px"
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke={COLORS.primary}
                  strokeWidth={2}
                  fill="url(#colorPresentations)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Volunteer Hours by Team - Bar Chart */}
        <motion.div
          variants={chartVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.4, delay: 0.1 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-gsv-green" aria-hidden="true" />
              <h3 className="text-lg font-semibold text-gsv-charcoal">Hours by Team</h3>
            </div>
          </div>
          <div className="h-64" role="img" aria-label="Bar chart showing volunteer hours by team">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.volunteerHoursByTeam}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis
                  dataKey="team"
                  tick={{ fontSize: 12, fill: "#666" }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fontSize: 12, fill: "#666" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    padding: "8px"
                  }}
                />
                <Bar dataKey="hours" fill={COLORS.primary} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Student Engagement & Volunteer Retention */}
      {(metrics.studentEngagement || metrics.volunteerRetention) && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Student Engagement */}
          {metrics.studentEngagement && (
            <motion.div
              variants={chartVariants}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.4, delay: 0.2 }}
              className="card p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-gsv-green" aria-hidden="true" />
                  <h3 className="text-lg font-semibold text-gsv-charcoal">Student Engagement</h3>
                </div>
              </div>
              <div className="h-64" role="img" aria-label="Line chart showing student engagement over time">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metrics.studentEngagement}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 12, fill: "#666" }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis tick={{ fontSize: 12, fill: "#666" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        padding: "8px"
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="students"
                      stroke={COLORS.accent}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}

          {/* Volunteer Retention */}
          {metrics.volunteerRetention && (
            <motion.div
              variants={chartVariants}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.4, delay: 0.3 }}
              className="card p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-gsv-green" aria-hidden="true" />
                  <h3 className="text-lg font-semibold text-gsv-charcoal">Volunteer Retention</h3>
                </div>
              </div>
              <div className="h-64" role="img" aria-label="Stacked area chart showing volunteer retention">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metrics.volunteerRetention}>
                    <defs>
                      <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.accent} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={COLORS.accent} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 12, fill: "#666" }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis tick={{ fontSize: 12, fill: "#666" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        padding: "8px"
                      }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="active"
                      stackId="1"
                      stroke={COLORS.primary}
                      fill="url(#colorActive)"
                    />
                    <Area
                      type="monotone"
                      dataKey="new"
                      stackId="1"
                      stroke={COLORS.accent}
                      fill="url(#colorNew)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Hours Trend */}
      {metrics.hoursTrend && (
        <motion.div
          variants={chartVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.4, delay: 0.4 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-gsv-green" aria-hidden="true" />
              <h3 className="text-lg font-semibold text-gsv-charcoal">Hours Trend</h3>
            </div>
          </div>
          <div className="h-64" role="img" aria-label="Line chart showing volunteer hours trend">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics.hoursTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: "#666" }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 12, fill: "#666" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    padding: "8px"
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="hours"
                  stroke={COLORS.primary}
                  strokeWidth={3}
                  dot={{ r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}
    </div>
  );
}

