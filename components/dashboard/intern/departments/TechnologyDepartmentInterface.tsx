"use client";
import { Code, Database, Shield, Activity, Server, Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import { type UserRow, type SystemLogRow } from "@/types/db";

interface TechnologyDepartmentInterfaceProps {
  user: UserRow | null;
  users: UserRow[];
  systemLogs: SystemLogRow[];
}

export default function TechnologyDepartmentInterface({ user, users, systemLogs }: TechnologyDepartmentInterfaceProps) {
  const activeUsers = users.filter(u => u.status === "active").length;
  const recentLogs = systemLogs.slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="card p-6">
        <h2 className="font-semibold text-lg mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-4 gap-3">
          <Link href="/dashboard/founder/users" className="p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-center">
            <Shield className="w-6 h-6 mx-auto mb-2" />
            <div className="text-sm font-medium">Manage Users</div>
          </Link>
          <Link href="/admin/page-builder" className="p-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-center">
            <Code className="w-6 h-6 mx-auto mb-2" />
            <div className="text-sm font-medium">Edit Website</div>
          </Link>
          <Link href="/admin/data" className="p-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition text-center">
            <Database className="w-6 h-6 mx-auto mb-2" />
            <div className="text-sm font-medium">Database</div>
          </Link>
          <button className="p-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition text-center">
            <Server className="w-6 h-6 mx-auto mb-2" />
            <div className="text-sm font-medium">System Status</div>
          </button>
        </div>
      </div>

      {/* System Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="card p-4 border-l-4 border-blue-500">
          <div className="text-2xl font-bold">{users.length}</div>
          <div className="text-sm text-gsv-gray">Total Users</div>
        </div>
        <div className="card p-4 border-l-4 border-green-500">
          <div className="text-2xl font-bold">{activeUsers}</div>
          <div className="text-sm text-gsv-gray">Active Users</div>
        </div>
        <div className="card p-4 border-l-4 border-purple-500">
          <div className="text-2xl font-bold">{systemLogs.length}</div>
          <div className="text-sm text-gsv-gray">System Events</div>
        </div>
        <div className="card p-4 border-l-4 border-green-500">
          <div className="text-2xl font-bold text-green-600">● Online</div>
          <div className="text-sm text-gsv-gray">System Status</div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* System Logs */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-gsv-green" />
              <h3 className="font-semibold text-lg">Recent System Activity</h3>
            </div>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {recentLogs.map((log) => (
              <div key={log.id} className="p-3 bg-gray-50 rounded-lg text-xs">
                <div className="font-medium text-gsv-charcoal mb-1">{log.action}</div>
                <div className="text-gsv-gray">
                  {log.timestamp ? new Date(log.timestamp).toLocaleString() : "Unknown time"}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tech Resources */}
        <div className="card p-6">
          <h3 className="font-semibold text-lg mb-4">Developer Resources</h3>
          <div className="space-y-3">
            <ResourceItem icon={<Code />} title="API Documentation" link="#" />
            <ResourceItem icon={<Database />} title="Database Schema" link="#" />
            <ResourceItem icon={<Shield />} title="Security Guidelines" link="#" />
            <ResourceItem icon={<LinkIcon />} title="GitHub Repository" link="#" />
          </div>
        </div>
      </div>

      {/* Technical Guidelines */}
      <div className="card p-6">
        <h3 className="font-semibold text-lg mb-4">Technical Best Practices</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <GuidelineCard title="Code Standards" description="Follow TypeScript, React, and Next.js best practices" />
          <GuidelineCard title="Security" description="Implement RLS policies and secure authentication" />
          <GuidelineCard title="Performance" description="Optimize database queries and implement caching" />
        </div>
      </div>
    </div>
  );
}

const ResourceItem = ({ icon, title, link }: { icon: React.ReactNode; title: string; link: string }) => (
  <a href={link} className="flex items-center gap-3 p-3 border rounded-lg hover:border-gsv-green hover:bg-green-50 transition">
    <div className="text-gsv-green">{icon}</div>
    <span className="text-sm font-medium">{title}</span>
  </a>
);

const GuidelineCard = ({ title, description }: { title: string; description: string }) => (
  <div className="border rounded-lg p-4">
    <h4 className="font-semibold text-sm mb-2">{title}</h4>
    <p className="text-xs text-gsv-gray">{description}</p>
  </div>
);

