"use client";
import { Package, Calendar, FileText, TrendingUp, CheckSquare, AlertCircle } from "lucide-react";
import Link from "next/link";
import { type UserRow, type ResourceRow, type PresentationRow } from "@/types/db";

interface OperationsDepartmentInterfaceProps {
  user: UserRow | null;
  resources: ResourceRow[];
  presentations: PresentationRow[];
}

export default function OperationsDepartmentInterface({ user, resources, presentations }: OperationsDepartmentInterfaceProps) {
  const upcomingPresentations = presentations.slice(0, 10);
  const totalResources = resources.length;
  const needsPreparation = presentations.filter(p => {
    const daysUntil = Math.ceil((new Date(p.scheduled_date || "").getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return daysUntil <= 7 && daysUntil > 0;
  }).length;

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="card p-6">
        <h2 className="font-semibold text-lg mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-4 gap-3">
          <button className="p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-center">
            <Package className="w-6 h-6 mx-auto mb-2" />
            <div className="text-sm font-medium">Materials Inventory</div>
          </button>
          <Link href="/dashboard/founder/presentations" className="p-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-center">
            <Calendar className="w-6 h-6 mx-auto mb-2" />
            <div className="text-sm font-medium">View Schedule</div>
          </Link>
          <button className="p-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition text-center">
            <FileText className="w-6 h-6 mx-auto mb-2" />
            <div className="text-sm font-medium">Preparation Checklist</div>
          </button>
          <button className="p-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition text-center">
            <TrendingUp className="w-6 h-6 mx-auto mb-2" />
            <div className="text-sm font-medium">Logistics Report</div>
          </button>
        </div>
      </div>

      {/* Operations Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <StatCard icon={<Calendar />} label="Upcoming Events" value={upcomingPresentations.length} color="blue" />
        <StatCard icon={<AlertCircle />} label="Needs Prep (7 days)" value={needsPreparation} color="orange" />
        <StatCard icon={<Package />} label="Resources" value={totalResources} color="green" />
        <StatCard icon={<CheckSquare />} label="Completed This Month" value={presentations.filter(p => p.status === "completed").length} color="purple" />
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upcoming Presentations */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Upcoming Presentations</h3>
            <Link href="/dashboard/founder/presentations" className="text-sm text-gsv-green hover:underline">
              View All
            </Link>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {upcomingPresentations.map((pres) => {
              const daysUntil = Math.ceil((new Date(pres.scheduled_date || "").getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
              const needsAttention = daysUntil <= 7 && daysUntil > 0;
              
              return (
                <div key={pres.id} className={`p-3 border rounded-lg ${needsAttention ? "border-orange-300 bg-orange-50" : ""} transition`}>
                  <div className="font-medium text-sm">{pres.topic || "General Presentation"}</div>
                  <div className="flex items-center justify-between mt-2 text-xs">
                    <span className="text-gsv-gray">
                      {pres.scheduled_date ? new Date(pres.scheduled_date).toLocaleDateString() : "No date"}
                    </span>
                    {needsAttention && (
                      <span className="px-2 py-0.5 bg-orange-200 text-orange-800 rounded-full font-medium">
                        Prep needed
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Materials & Resources */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Materials & Resources</h3>
            <button className="text-sm text-gsv-green hover:underline">Add Resource</button>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {resources.slice(0, 8).map((resource) => (
              <div key={resource.id} className="p-3 border rounded-lg hover:bg-gray-50 transition">
                <div className="font-medium text-sm">{resource.filename}</div>
                <div className="flex items-center justify-between mt-2 text-xs text-gsv-gray">
                  <span>{resource.category || "General"}</span>
                  <span>{resource.download_count || 0} downloads</span>
                </div>
              </div>
            ))}
            {resources.length === 0 && <p className="text-sm text-gsv-gray text-center py-4">No resources yet</p>}
          </div>
        </div>
      </div>

      {/* Operations Checklist */}
      <div className="card p-6">
        <h3 className="font-semibold text-lg mb-4">Pre-Presentation Checklist</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <ChecklistItem task="Confirm volunteer attendance" />
          <ChecklistItem task="Prepare presentation materials" />
          <ChecklistItem task="Check equipment (projector, laptop)" />
          <ChecklistItem task="Send reminder to teacher" />
          <ChecklistItem task="Arrange transportation" />
          <ChecklistItem task="Print handouts and activity sheets" />
        </div>
      </div>
    </div>
  );
}

const StatCard = ({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) => {
  const colorClasses: { [key: string]: string } = {
    blue: "bg-blue-50 text-blue-600",
    orange: "bg-orange-50 text-orange-600",
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

const ChecklistItem = ({ task }: { task: string }) => (
  <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
    <input type="checkbox" className="rounded border-gray-300 text-gsv-green focus:ring-gsv-green" />
    <span className="text-sm">{task}</span>
  </label>
);

