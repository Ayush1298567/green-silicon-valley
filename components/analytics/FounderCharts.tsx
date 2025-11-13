"use client";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from "recharts";

export default function FounderCharts({ metrics }: { metrics: any }) {
  const pie = [
    { name: "Active", value: metrics?.activeVsInactive?.active ?? 0 },
    { name: "Inactive", value: metrics?.activeVsInactive?.inactive ?? 0 }
  ];
  const colors = ["#2BAE66", "#E8F5EE"];
  const bars = metrics?.volunteerHoursByTeam ?? [];
  const lines = metrics?.presentationsPerMonth ?? [];
  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="card p-4">
        <div className="font-semibold mb-2">Presentations per Month</div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lines}>
              <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
              <XAxis dataKey="month" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#2BAE66" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="card p-4">
        <div className="font-semibold mb-2">Chapter Health</div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pie} dataKey="value" nameKey="name" outerRadius={80} label>
                {pie.map((_, i) => (
                  <Cell key={i} fill={colors[i % colors.length]} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="card p-4">
        <div className="font-semibold mb-2">Volunteer Hours by Team</div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={bars}>
              <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
              <XAxis dataKey="team" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="hours" fill="#2BAE66" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}


