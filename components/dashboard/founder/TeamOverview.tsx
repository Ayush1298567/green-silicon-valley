"use client";
import { Users, UserPlus, GraduationCap, Award } from "lucide-react";
import Link from "next/link";

interface TeamOverviewProps {
  totalUsers: number;
  volunteers: number;
  interns: number;
  founders: number;
}

export default function TeamOverview({ totalUsers, volunteers, interns, founders }: TeamOverviewProps) {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-gsv-green" />
          <h2 className="text-xl font-semibold">Team Overview</h2>
        </div>
        <Link
          href="/dashboard/founder/users"
          className="text-sm text-gsv-green hover:underline"
        >
          Manage
        </Link>
      </div>

      <div className="space-y-4">
        <TeamMetric
          icon={<Users className="w-5 h-5" />}
          label="Total Team Members"
          value={totalUsers}
          color="bg-blue-50 text-blue-600"
        />
        <TeamMetric
          icon={<UserPlus className="w-5 h-5" />}
          label="Volunteers"
          value={volunteers}
          color="bg-green-50 text-green-600"
        />
        <TeamMetric
          icon={<GraduationCap className="w-5 h-5" />}
          label="Interns"
          value={interns}
          color="bg-purple-50 text-purple-600"
        />
        <TeamMetric
          icon={<Award className="w-5 h-5" />}
          label="Founders"
          value={founders}
          color="bg-orange-50 text-orange-600"
        />
      </div>

      <div className="mt-6 pt-6 border-t">
        <Link
          href="/get-involved"
          className="block w-full text-center px-4 py-2 bg-gsv-green text-white rounded-lg font-medium hover:bg-gsv-green/90 transition"
        >
          Recruit New Members
        </Link>
      </div>
    </div>
  );
}

const TeamMetric = ({ 
  icon, 
  label, 
  value, 
  color 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: number; 
  color: string;
}) => (
  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition">
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg ${color}`}>
        {icon}
      </div>
      <span className="text-sm text-gsv-gray">{label}</span>
    </div>
    <span className="text-xl font-bold text-gsv-charcoal">{value}</span>
  </div>
);

