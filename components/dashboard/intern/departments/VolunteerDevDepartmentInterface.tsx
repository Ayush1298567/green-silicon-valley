"use client";
import { Users, Award, TrendingUp, UserPlus, GraduationCap, Star } from "lucide-react";
import Link from "next/link";
import { type UserRow, type VolunteerRow, type VolunteerHoursRow } from "@/types/db";

interface VolunteerDevDepartmentInterfaceProps {
  user: UserRow | null;
  volunteers: VolunteerRow[];
  volunteerHours: VolunteerHoursRow[];
}

export default function VolunteerDevDepartmentInterface({ user, volunteers, volunteerHours }: VolunteerDevDepartmentInterfaceProps) {
  const activeVolunteers = volunteers.filter(v => v.status === "active").length;
  const needsOrientation = volunteers.filter(v => !v.orientation_completed).length;
  const totalHours = volunteerHours.reduce((sum, h) => sum + (h.hours_logged || 0), 0);
  
  // Calculate top volunteers
  const volunteerHoursMap = new Map<string, number>();
  volunteerHours.forEach(h => {
    const current = volunteerHoursMap.get(h.volunteer_id) || 0;
    volunteerHoursMap.set(h.volunteer_id, current + (h.hours_logged || 0));
  });
  const topVolunteers = Array.from(volunteerHoursMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="card p-6">
        <h2 className="font-semibold text-lg mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-4 gap-3">
          <Link href="/dashboard/founder/volunteers" className="p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-center">
            <Users className="w-6 h-6 mx-auto mb-2" />
            <div className="text-sm font-medium">Manage Volunteers</div>
          </Link>
          <button className="p-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-center">
            <UserPlus className="w-6 h-6 mx-auto mb-2" />
            <div className="text-sm font-medium">Recruit</div>
          </button>
          <button className="p-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition text-center">
            <GraduationCap className="w-6 h-6 mx-auto mb-2" />
            <div className="text-sm font-medium">Schedule Training</div>
          </button>
          <button className="p-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition text-center">
            <Award className="w-6 h-6 mx-auto mb-2" />
            <div className="text-sm font-medium">Recognition Program</div>
          </button>
        </div>
      </div>

      {/* Volunteer Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <StatCard icon={<Users />} label="Total Volunteers" value={volunteers.length} color="blue" />
        <StatCard icon={<UserPlus />} label="Active" value={activeVolunteers} color="green" />
        <StatCard icon={<GraduationCap />} label="Need Orientation" value={needsOrientation} color="orange" />
        <StatCard icon={<TrendingUp />} label="Total Hours" value={Math.round(totalHours)} color="purple" />
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Volunteers */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <h3 className="font-semibold text-lg">Top Contributors</h3>
            </div>
          </div>
          <div className="space-y-3">
            {topVolunteers.map(([volunteerId, hours], index) => {
              const volunteer = volunteers.find(v => v.user_id === volunteerId);
              return (
                <div key={volunteerId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-gsv-green text-white rounded-full flex items-center justify-center font-bold text-sm">
                    #{index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">Volunteer {volunteerId.slice(0, 8)}</div>
                    <div className="text-xs text-gsv-gray">{Math.round(hours)} hours logged</div>
                  </div>
                  <Award className="w-5 h-5 text-yellow-500" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Orientation Needed */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Pending Orientation</h3>
            <span className="text-sm text-gsv-gray">{needsOrientation} volunteers</span>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {volunteers.filter(v => !v.orientation_completed).slice(0, 8).map((volunteer) => (
              <div key={volunteer.id} className="p-3 border border-yellow-300 bg-yellow-50 rounded-lg">
                <div className="font-medium text-sm">Volunteer {volunteer.user_id ? volunteer.user_id.slice(0, 8) : volunteer.id}</div>
                <div className="text-xs text-gsv-gray mt-1">
                  Joined: {volunteer.created_at ? new Date(volunteer.created_at).toLocaleDateString() : "Unknown"}
                </div>
                <button className="mt-2 text-xs px-3 py-1 bg-gsv-green text-white rounded hover:bg-gsv-green/90">
                  Schedule Orientation
                </button>
              </div>
            ))}
            {needsOrientation === 0 && <p className="text-sm text-gsv-gray text-center py-4">All volunteers oriented!</p>}
          </div>
        </div>
      </div>

      {/* Volunteer Development Programs */}
      <div className="card p-6">
        <h3 className="font-semibold text-lg mb-4">Development Programs</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <ProgramCard 
            title="New Volunteer Orientation" 
            description="2-hour onboarding covering GSV mission, presentation basics, and safety"
            status="Active"
          />
          <ProgramCard 
            title="Advanced Training" 
            description="Specialized workshops on facilitation, classroom management, and content"
            status="Coming Soon"
          />
          <ProgramCard 
            title="Recognition Program" 
            description="Monthly awards, certificates, and volunteer appreciation events"
            status="Active"
          />
        </div>
      </div>

      {/* Recruitment Resources */}
      <div className="card p-6">
        <h3 className="font-semibold text-lg mb-4">Recruitment Resources</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <ResourceItem title="Volunteer Application Form" link="/get-involved#volunteer" />
          <ResourceItem title="Recruitment Flyer Template" link="#" />
          <ResourceItem title="Social Media Graphics" link="#" />
          <ResourceItem title="School Club Presentation" link="#" />
        </div>
      </div>
    </div>
  );
}

const StatCard = ({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) => {
  const colorClasses: { [key: string]: string } = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    orange: "bg-orange-50 text-orange-600",
    purple: "bg-purple-50 text-purple-600",
  };

  return (
    <div className="card p-4">
      <div className={`inline-flex p-2 rounded-lg ${colorClasses[color]} mb-2`}>{icon}</div>
      <div className="text-2xl font-bold text-gsv-charcoal">{value}</div>
      <div className="text-sm text-gsv-gray">{label}</div>
    </div>
  );
};

const ProgramCard = ({ title, description, status }: { title: string; description: string; status: string }) => (
  <div className="border rounded-lg p-4">
    <div className="flex items-center justify-between mb-2">
      <h4 className="font-semibold text-sm">{title}</h4>
      <span className={`text-xs px-2 py-0.5 rounded-full ${
        status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
      }`}>
        {status}
      </span>
    </div>
    <p className="text-xs text-gsv-gray">{description}</p>
  </div>
);

const ResourceItem = ({ title, link }: { title: string; link: string }) => (
  <a href={link} className="flex items-center justify-between p-3 border rounded-lg hover:border-gsv-green hover:bg-green-50 transition">
    <span className="text-sm font-medium">{title}</span>
    <span className="text-gsv-green text-sm">→</span>
  </a>
);

