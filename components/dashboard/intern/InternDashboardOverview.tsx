"use client";
import Link from "next/link";
import { Camera, Code, Phone, Package, Users as UsersIcon, MessageSquare, Briefcase } from "lucide-react";
import InternTasksList from "./InternTasksList";
import InternProjectsList from "./InternProjectsList";
import InternActivityFeed from "./InternActivityFeed";
import { type UserRow, type InternProjectRow, type SystemLogRow } from "@/types/db";

interface InternDashboardOverviewProps {
  user: UserRow | null;
  department: string;
  myTasks: InternProjectRow[];
  myProjects: InternProjectRow[];
  recentActivity: SystemLogRow[];
  teamMembers: UserRow[];
}

export default function InternDashboardOverview({
  user,
  department,
  myTasks,
  myProjects,
  recentActivity,
  teamMembers,
}: InternDashboardOverviewProps) {
  const departments = [
    {
      id: "media",
      name: "Media",
      icon: <Camera className="w-6 h-6" />,
      color: "bg-pink-500",
      description: "Social media, graphic design, photography, videography",
      href: "/dashboard/intern/media",
    },
    {
      id: "technology",
      name: "Technology",
      icon: <Code className="w-6 h-6" />,
      color: "bg-blue-500",
      description: "Website, technical infrastructure, data systems",
      href: "/dashboard/intern/technology",
    },
    {
      id: "outreach",
      name: "Outreach",
      icon: <Phone className="w-6 h-6" />,
      color: "bg-green-500",
      description: "School communication, partnerships, scheduling",
      href: "/dashboard/intern/outreach",
    },
    {
      id: "operations",
      name: "Operations",
      icon: <Package className="w-6 h-6" />,
      color: "bg-orange-500",
      description: "Logistics, materials, event coordination",
      href: "/dashboard/intern/operations",
    },
    {
      id: "volunteer_dev",
      name: "Volunteer Dev",
      icon: <UsersIcon className="w-6 h-6" />,
      color: "bg-purple-500",
      description: "Recruitment, training, recognition",
      href: "/dashboard/intern/volunteer-dev",
    },
    {
      id: "communications",
      name: "Communications",
      icon: <MessageSquare className="w-6 h-6" />,
      color: "bg-teal-500",
      description: "Newsletters, press releases, PR",
      href: "/dashboard/intern/communications",
    },
  ];

  const myDepartment = departments.find((d) => d.id === department);

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="My Tasks" value={myTasks.length} color="blue" />
        <StatCard label="In Progress" value={myTasks.filter((t) => t.status === "in_progress").length} color="orange" />
        <StatCard label="Completed" value={myTasks.filter((t) => t.status === "completed").length} color="green" />
        <StatCard label="Team Members" value={teamMembers.length} color="purple" />
      </div>

      {/* My Department */}
      {myDepartment && (
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">My Department</h2>
          <Link
            href={myDepartment.href as any}
            className="flex items-start gap-4 p-4 rounded-lg border-2 border-gray-200 hover:border-gsv-green hover:shadow-lg transition"
          >
            <div className={`${myDepartment.color} text-white p-3 rounded-lg`}>
              {myDepartment.icon}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-gsv-charcoal mb-1">{myDepartment.name} Department</h3>
              <p className="text-sm text-gsv-gray">{myDepartment.description}</p>
              <span className="inline-block mt-2 text-sm text-gsv-green font-medium">
                View Department Dashboard →
              </span>
            </div>
          </Link>
        </div>
      )}

      {/* All Departments (if they want to explore) */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold mb-4">All Departments</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept) => (
            <Link
              key={dept.id}
              href={dept.href as any}
              className={`p-4 rounded-lg border ${
                dept.id === department ? "border-gsv-green bg-green-50" : "border-gray-200 hover:border-gray-300"
              } transition`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`${dept.color} text-white p-2 rounded-lg`}>
                  {dept.icon}
                </div>
                <h3 className="font-semibold text-gsv-charcoal">{dept.name}</h3>
              </div>
              <p className="text-xs text-gsv-gray">{dept.description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left - 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          <InternTasksList tasks={myTasks} />
          <InternActivityFeed activities={recentActivity} />
        </div>

        {/* Right - 1/3 */}
        <div className="space-y-6">
          <InternProjectsList projects={myProjects} />
          
          {/* Team Members */}
          <div className="card p-6">
            <h3 className="font-semibold text-lg mb-4">Team Members</h3>
            <div className="space-y-2">
              {teamMembers.slice(0, 5).map((member) => (
                <div key={member.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                  <div className="w-8 h-8 bg-gsv-green text-white rounded-full flex items-center justify-center text-sm font-semibold">
                    {member.name?.charAt(0) || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gsv-charcoal truncate">{member.name}</div>
                    <div className="text-xs text-gsv-gray truncate">{member.email}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const StatCard = ({ label, value, color }: { label: string; value: number; color: string }) => {
  const colorClasses: { [key: string]: string } = {
    blue: "bg-blue-50 border-blue-200 text-blue-800",
    orange: "bg-orange-50 border-orange-200 text-orange-800",
    green: "bg-green-50 border-green-200 text-green-800",
    purple: "bg-purple-50 border-purple-200 text-purple-800",
  };

  return (
    <div className={`card p-4 border-2 ${colorClasses[color]}`}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm">{label}</div>
    </div>
  );
};

