"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Save, Eye, CheckCircle, AlertTriangle } from "lucide-react";
import Link from "next/link";
import WorkspaceEditor from "@/components/presentations/WorkspaceEditor";
import ActivitySelector from "@/components/presentations/ActivitySelector";
import PresentationChecklist from "@/components/presentations/PresentationChecklist";

interface PresentationWorkspace {
  id: string;
  presentation_id: string;
  team_id: string;
  workspace_name: string;
  slides_url?: string;
  status: string;
  selected_activity_id?: string;
  review_notes?: string;
  approved_by?: string;
  approved_at?: string;
  presentations: {
    topic: string;
    scheduled_date: string;
    schools: {
      name: string;
    };
  };
  workspace_slides: Array<{
    id: string;
    slide_number: number;
    slide_url?: string;
    slide_content?: any;
  }>;
  workspace_tasks: Array<{
    id: string;
    task_name: string;
    task_type: string;
    is_completed: boolean;
    due_date?: string;
  }>;
}

export default function PresentationWorkspacePage() {
  const params = useParams();
  const workspaceId = params.id as string;

  const [workspace, setWorkspace] = useState<PresentationWorkspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"slides" | "activities" | "checklist" | "review">("slides");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchWorkspace();
  }, [workspaceId]);

  const fetchWorkspace = async () => {
    try {
      const res = await fetch(`/api/presentations/workspace/${workspaceId}`);
      const data = await res.json();
      if (data.ok) {
        setWorkspace(data.workspace);
      }
    } catch (error) {
      console.error("Error fetching workspace:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveWorkspace = async () => {
    if (!workspace) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/presentations/workspace/${workspaceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slides_url: workspace.slides_url,
          selected_activity_id: workspace.selected_activity_id,
          status: workspace.status
        }),
      });

      const data = await res.json();
      if (data.ok) {
        setWorkspace(data.workspace);
      }
    } catch (error) {
      console.error("Error saving workspace:", error);
    } finally {
      setSaving(false);
    }
  };

  const submitForReview = async () => {
    if (!workspace) return;

    try {
      const res = await fetch(`/api/presentations/workspace/${workspaceId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "submit" }),
      });

      const data = await res.json();
      if (data.ok) {
        setWorkspace(data.workspace);
      }
    } catch (error) {
      console.error("Error submitting for review:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading workspace...</p>
        </div>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Workspace Not Found</h2>
        <p className="text-gray-600">The presentation workspace you're looking for doesn't exist.</p>
      </div>
    );
  }

  const allTasksCompleted = workspace.workspace_tasks?.every(task => task.is_completed) || false;
  const canSubmitForReview = workspace.slides_url && allTasksCompleted;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/presentations"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft size={20} />
              Back to Presentations
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {workspace.workspace_name}
              </h1>
              <p className="text-sm text-gray-600">
                {workspace.presentations?.topic} • {workspace.presentations?.schools?.name} •{" "}
                {workspace.presentations?.scheduled_date ?
                  new Date(workspace.presentations.scheduled_date).toLocaleDateString() :
                  "Date TBD"
                }
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              workspace.status === "approved" ? "bg-green-100 text-green-800" :
              workspace.status === "under_review" ? "bg-yellow-100 text-yellow-800" :
              workspace.status === "draft" ? "bg-blue-100 text-blue-800" :
              "bg-gray-100 text-gray-800"
            }`}>
              {workspace.status.replace("_", " ").toUpperCase()}
            </span>

            <button
              onClick={saveWorkspace}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
            >
              <Save size={16} />
              {saving ? "Saving..." : "Save"}
            </button>

            {workspace.status === "draft" && canSubmitForReview && (
              <button
                onClick={submitForReview}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Eye size={16} />
                Submit for Review
              </button>
            )}
          </div>
        </div>

        {/* Status Indicator */}
        <div className="mt-4 flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className={`w-4 h-4 ${workspace.slides_url ? "text-green-600" : "text-gray-400"}`} />
            <span className={workspace.slides_url ? "text-green-700" : "text-gray-600"}>
              Slides {workspace.slides_url ? "Ready" : "Not Uploaded"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <CheckCircle className={`w-4 h-4 ${workspace.selected_activity_id ? "text-green-600" : "text-gray-400"}`} />
            <span className={workspace.selected_activity_id ? "text-green-700" : "text-gray-600"}>
              Activity Selected
            </span>
          </div>

          <div className="flex items-center gap-2">
            <CheckCircle className={`w-4 h-4 ${allTasksCompleted ? "text-green-600" : "text-gray-400"}`} />
            <span className={allTasksCompleted ? "text-green-700" : "text-gray-600"}>
              Checklist Complete ({workspace.workspace_tasks?.filter(t => t.is_completed).length || 0}/{workspace.workspace_tasks?.length || 0})
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6">
          <nav className="flex space-x-8">
            {[
              { id: "slides", label: "Slides", count: workspace.workspace_slides?.length },
              { id: "activities", label: "Activities" },
              { id: "checklist", label: "Checklist", count: workspace.workspace_tasks?.filter(t => t.is_completed).length + "/" + workspace.workspace_tasks?.length },
              { id: "review", label: "Review" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
                {tab.count && (
                  <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                    activeTab === tab.id ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === "slides" && (
          <WorkspaceEditor
            workspace={workspace}
            onUpdate={(updates) => setWorkspace(prev => prev ? { ...prev, ...updates } : null)}
          />
        )}

        {activeTab === "activities" && (
          <ActivitySelector
            workspace={workspace}
            onActivitySelect={(activityId) => setWorkspace(prev => prev ? { ...prev, selected_activity_id: activityId } : null)}
          />
        )}

        {activeTab === "checklist" && (
          <PresentationChecklist
            workspaceId={workspaceId}
            tasks={workspace.workspace_tasks || []}
            onTaskUpdate={fetchWorkspace}
          />
        )}

        {activeTab === "review" && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">Presentation Review</h3>

              {workspace.review_notes && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Review Notes
                  </label>
                  <div className="bg-gray-50 rounded-lg p-4 text-gray-700">
                    {workspace.review_notes}
                  </div>
                </div>
              )}

              {workspace.approved_at && workspace.approved_by && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-800">
                    <CheckCircle size={20} />
                    <div>
                      <div className="font-medium">Approved</div>
                      <div className="text-sm">
                        Approved on {new Date(workspace.approved_at).toLocaleDateString()} by {workspace.approved_by}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {workspace.status === "needs_revision" && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-2 text-yellow-800">
                    <AlertTriangle size={20} className="mt-0.5" />
                    <div>
                      <div className="font-medium">Revision Requested</div>
                      <div className="text-sm mt-1">
                        Please review the feedback above and make necessary changes before resubmitting.
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
