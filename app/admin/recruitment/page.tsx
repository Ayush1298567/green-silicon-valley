"use client";

import { useState, useEffect } from "react";
import { Users, TrendingUp, Clock, CheckCircle, AlertCircle, Plus, Filter } from "lucide-react";
import PipelineView from "@/components/recruitment/PipelineView";

interface PipelineApplicant {
  id: string;
  applicant_id: string;
  applicant_type: string;
  current_stage: string;
  status: string;
  assigned_to?: string;
  priority: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  users?: {
    name: string;
    email: string;
  };
}

interface PipelineStage {
  id: string;
  stage_name: string;
  stage_order: number;
  applicant_type: string;
  requirements: string[];
  auto_actions: any;
  notification_template_id?: string;
  is_active: boolean;
}

export default function RecruitmentDashboard() {
  const [applicants, setApplicants] = useState<PipelineApplicant[]>([]);
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "volunteers" | "interns">("all");

  useEffect(() => {
    fetchRecruitmentData();
  }, []);

  const fetchRecruitmentData = async () => {
    try {
      // Fetch applicants
      const applicantsRes = await fetch("/api/recruitment/applicants");
      const applicantsData = await applicantsRes.json();
      if (applicantsData.ok) {
        setApplicants(applicantsData.applicants || []);
      }

      // Fetch stages
      const stagesRes = await fetch("/api/recruitment/stages");
      const stagesData = await stagesRes.json();
      if (stagesData.ok) {
        setStages(stagesData.stages || []);
      }
    } catch (error) {
      console.error("Error fetching recruitment data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredApplicants = applicants.filter(applicant => {
    if (filter === "all") return true;
    return applicant.applicant_type === filter.slice(0, -1); // Remove 's' from plural
  });

  const getStats = () => {
    const total = applicants.length;
    const active = applicants.filter(a => a.status === "new" || a.status === "screening").length;
    const hired = applicants.filter(a => a.status === "accepted" || a.status === "onboarded").length;
    const conversion = total > 0 ? Math.round((hired / total) * 100) : 0;

    return { total, active, hired, conversion };
  };

  const stats = getStats();

  const stageStats = stages.map(stage => ({
    stage: stage.stage_name,
    count: applicants.filter(a => a.current_stage === stage.stage_name).length,
    applicants: applicants.filter(a => a.current_stage === stage.stage_name)
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading recruitment data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recruitment Pipeline</h1>
          <p className="text-gray-600">Track and manage volunteer and intern applications</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users size={16} />
            {stats.total} total applicants
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus size={16} />
            Add Applicant
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Applicants</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.active}</div>
              <div className="text-sm text-gray-600">In Process</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.hired}</div>
              <div className="text-sm text-gray-600">Hired/Onboarded</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.conversion}%</div>
              <div className="text-sm text-gray-600">Conversion Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <Filter size={16} className="text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Filter by type:</span>
          <div className="flex gap-2">
            {[
              { value: "all", label: "All Applicants" },
              { value: "volunteers", label: "Volunteers" },
              { value: "interns", label: "Interns" }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value as any)}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  filter === option.value
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {option.label} ({option.value === "all" ? applicants.length :
                  applicants.filter(a => a.applicant_type === option.value.slice(0, -1)).length})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Pipeline View */}
      <PipelineView
        applicants={filteredApplicants}
        stages={stages}
        onApplicantUpdate={fetchRecruitmentData}
      />

      {/* Stage Summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Pipeline Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stageStats.map((stageStat, index) => (
            <div key={stageStat.stage} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">{stageStat.stage}</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  stageStat.count > 0 ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-600"
                }`}>
                  {stageStat.count}
                </span>
              </div>
              {stageStat.count > 0 && (
                <div className="space-y-1">
                  {stageStat.applicants.slice(0, 3).map((applicant) => (
                    <div key={applicant.id} className="text-xs text-gray-600 truncate">
                      {applicant.users?.name || "Unknown"}
                    </div>
                  ))}
                  {stageStat.count > 3 && (
                    <div className="text-xs text-gray-500">
                      +{stageStat.count - 3} more
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Quick Actions</h4>
        <div className="flex flex-wrap gap-3">
          <button className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
            Export Pipeline Data
          </button>
          <button className="px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700">
            Send Bulk Notifications
          </button>
          <button className="px-3 py-2 bg-purple-600 text-white rounded text-sm hover:bg-purple-700">
            Generate Onboarding Packets
          </button>
          <button className="px-3 py-2 bg-orange-600 text-white rounded text-sm hover:bg-orange-700">
            Schedule Interviews
          </button>
        </div>
      </div>
    </div>
  );
}
