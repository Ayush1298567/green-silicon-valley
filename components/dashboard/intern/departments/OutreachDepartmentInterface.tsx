"use client";
import { Phone, School, Calendar, Mail, MapPin, TrendingUp } from "lucide-react";
import Link from "next/link";
import { type UserRow, type SchoolRow, type PresentationRow } from "@/types/db";

interface OutreachDepartmentInterfaceProps {
  user: UserRow | null;
  schools: SchoolRow[];
  presentations: PresentationRow[];
}

export default function OutreachDepartmentInterface({ user, schools, presentations }: OutreachDepartmentInterfaceProps) {
  const activeSchools = schools.filter(s => s.status === "active").length;
  const pendingRequests = presentations.filter(p => p.status === "pending").length;
  const scheduledPresentations = presentations.filter(p => p.status === "scheduled" || p.status === "confirmed").length;

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="card p-6">
        <h2 className="font-semibold text-lg mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-4 gap-3">
          <Link href="/dashboard/founder/presentations" className="p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-center">
            <Calendar className="w-6 h-6 mx-auto mb-2" />
            <div className="text-sm font-medium">Schedule Presentation</div>
          </Link>
          <button className="p-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-center">
            <Mail className="w-6 h-6 mx-auto mb-2" />
            <div className="text-sm font-medium">Email Schools</div>
          </button>
          <button className="p-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition text-center">
            <School className="w-6 h-6 mx-auto mb-2" />
            <div className="text-sm font-medium">Add School</div>
          </button>
          <button className="p-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition text-center">
            <Phone className="w-6 h-6 mx-auto mb-2" />
            <div className="text-sm font-medium">Follow-up List</div>
          </button>
        </div>
      </div>

      {/* Outreach Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <StatCard icon={<School />} label="Active Schools" value={activeSchools} color="blue" />
        <StatCard icon={<Calendar />} label="Pending Requests" value={pendingRequests} color="yellow" />
        <StatCard icon={<TrendingUp />} label="Scheduled" value={scheduledPresentations} color="green" />
        <StatCard icon={<MapPin />} label="Total Schools" value={schools.length} color="purple" />
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* School Partners */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">School Partners</h3>
            <Link href="/dashboard/founder/schools" className="text-sm text-gsv-green hover:underline">
              View All
            </Link>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {schools.slice(0, 8).map((school) => (
              <div key={school.id} className="p-3 border rounded-lg hover:bg-gray-50 transition">
                <div className="font-medium text-sm">{school.name}</div>
                <div className="flex items-center justify-between mt-2 text-xs text-gsv-gray">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {school.city}, {school.state}
                  </span>
                  <span>{school.total_presentations_hosted || 0} presentations</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Requests */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Recent Presentation Requests</h3>
            <span className="text-sm text-gsv-gray">{pendingRequests} pending</span>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {presentations.filter(p => p.status === "pending").slice(0, 5).map((pres) => {
              const school = schools.find(s => s.id === pres.school_id);
              return (
                <div key={pres.id} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="font-medium text-sm">{school?.name || "Unknown School"}</div>
                  <div className="text-xs text-gsv-gray mt-1">
                    {pres.scheduled_date ? new Date(pres.scheduled_date).toLocaleDateString() : "No date"}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button className="text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600">
                      Approve
                    </button>
                    <button className="text-xs px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600">
                      Contact
                    </button>
                  </div>
                </div>
              );
            })}
            {pendingRequests === 0 && <p className="text-sm text-gsv-gray text-center py-4">No pending requests</p>}
          </div>
        </div>
      </div>

      {/* Communication Templates */}
      <div className="card p-6">
        <h3 className="font-semibold text-lg mb-4">Email Templates</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <TemplateCard title="Initial Outreach" description="Template for first contact with new schools" />
          <TemplateCard title="Presentation Confirmation" description="Confirm scheduled presentations with teachers" />
          <TemplateCard title="Follow-up Thank You" description="Post-presentation thank you and feedback request" />
        </div>
      </div>
    </div>
  );
}

const StatCard = ({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) => {
  const colorClasses: { [key: string]: string } = {
    blue: "bg-blue-50 text-blue-600",
    yellow: "bg-yellow-50 text-yellow-600",
    green: "bg-green-50 text-green-600",
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

const TemplateCard = ({ title, description }: { title: string; description: string }) => (
  <button className="border rounded-lg p-4 hover:border-gsv-green hover:bg-green-50 transition text-left">
    <h4 className="font-semibold text-sm mb-2">{title}</h4>
    <p className="text-xs text-gsv-gray">{description}</p>
  </button>
);

