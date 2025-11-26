"use client";

import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { User, Mail, Phone, Calendar, MapPin, Clock, CheckCircle, AlertCircle } from "lucide-react";
import ApplicantCard from "@/components/recruitment/ApplicantCard";

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

interface PipelineViewProps {
  applicants: PipelineApplicant[];
  stages: PipelineStage[];
  onApplicantUpdate: () => void;
}

export default function PipelineView({ applicants, stages, onApplicantUpdate }: PipelineViewProps) {
  const [selectedApplicant, setSelectedApplicant] = useState<PipelineApplicant | null>(null);

  const onDragEnd = async (result: any) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (destination.droppableId === source.droppableId) return;

    // Find the stage being moved to
    const newStage = stages.find(s => s.id === destination.droppableId);
    if (!newStage) return;

    try {
      const res = await fetch(`/api/recruitment/applicants/${draggableId}/stage`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: newStage.stage_name }),
      });

      const data = await res.json();
      if (data.ok) {
        onApplicantUpdate();
      } else {
        alert("Error moving applicant: " + data.error);
      }
    } catch (error: any) {
      alert("Error moving applicant: " + error.message);
    }
  };

  const getApplicantsForStage = (stageName: string) => {
    return applicants.filter(applicant => applicant.current_stage === stageName);
  };

  const getStageColor = (stageName: string) => {
    const colors: Record<string, string> = {
      "New": "bg-gray-100 border-gray-300",
      "Screening": "bg-blue-100 border-blue-300",
      "Interview": "bg-yellow-100 border-yellow-300",
      "Accepted": "bg-green-100 border-green-300",
      "Onboarded": "bg-purple-100 border-purple-300",
      "Rejected": "bg-red-100 border-red-300",
      "Withdrawn": "bg-orange-100 border-orange-300"
    };
    return colors[stageName] || "bg-gray-100 border-gray-300";
  };

  const getStageHeaderColor = (stageName: string) => {
    const colors: Record<string, string> = {
      "New": "bg-gray-200 text-gray-800",
      "Screening": "bg-blue-200 text-blue-800",
      "Interview": "bg-yellow-200 text-yellow-800",
      "Accepted": "bg-green-200 text-green-800",
      "Onboarded": "bg-purple-200 text-purple-800",
      "Rejected": "bg-red-200 text-red-800",
      "Withdrawn": "bg-orange-200 text-orange-800"
    };
    return colors[stageName] || "bg-gray-200 text-gray-800";
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Recruitment Pipeline</h2>
        <p className="text-sm text-gray-600">Drag applicants between stages to update their status</p>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex overflow-x-auto p-4 space-x-4 min-h-[600px]">
          {stages
            .filter(stage => stage.is_active)
            .sort((a, b) => a.stage_order - b.stage_order)
            .map((stage) => {
              const stageApplicants = getApplicantsForStage(stage.stage_name);

              return (
                <div key={stage.id} className="flex-shrink-0 w-80">
                  <div className={`rounded-lg border-2 ${getStageColor(stage.stage_name)}`}>
                    {/* Stage Header */}
                    <div className={`p-3 ${getStageHeaderColor(stage.stage_name)} rounded-t-lg`}>
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-sm">{stage.stage_name}</h3>
                        <span className="bg-white bg-opacity-50 px-2 py-1 rounded text-xs font-medium">
                          {stageApplicants.length}
                        </span>
                      </div>
                      {stage.requirements && stage.requirements.length > 0 && (
                        <div className="mt-2 text-xs opacity-75">
                          Requirements: {stage.requirements.slice(0, 2).join(", ")}
                          {stage.requirements.length > 2 && "..."}
                        </div>
                      )}
                    </div>

                    {/* Stage Content */}
                    <Droppable droppableId={stage.id}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`p-3 min-h-[500px] transition-colors ${
                            snapshot.isDraggingOver ? "bg-blue-50" : ""
                          }`}
                        >
                          {stageApplicants.length === 0 ? (
                            <div className="text-center py-8 text-gray-400">
                              <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
                              <p className="text-sm">No applicants</p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {stageApplicants.map((applicant, index) => (
                                <Draggable
                                  key={applicant.id}
                                  draggableId={applicant.id}
                                  index={index}
                                >
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className={`cursor-move ${
                                        snapshot.isDragging ? "rotate-3 shadow-lg" : ""
                                      }`}
                                      onClick={() => setSelectedApplicant(applicant)}
                                    >
                                      <ApplicantCard
                                        applicant={applicant}
                                        onUpdate={onApplicantUpdate}
                                      />
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                            </div>
                          )}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                </div>
              );
            })}
        </div>
      </DragDropContext>

      {/* Applicant Detail Modal */}
      {selectedApplicant && (
        <ApplicantDetailModal
          applicant={selectedApplicant}
          onClose={() => setSelectedApplicant(null)}
          onUpdate={onApplicantUpdate}
        />
      )}
    </div>
  );
}

// Applicant Detail Modal Component
function ApplicantDetailModal({
  applicant,
  onClose,
  onUpdate
}: {
  applicant: PipelineApplicant;
  onClose: () => void;
  onUpdate: () => void;
}) {
  const [notes, setNotes] = useState(applicant.notes || "");

  const handleSaveNotes = async () => {
    try {
      const res = await fetch(`/api/recruitment/applicants/${applicant.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });

      const data = await res.json();
      if (data.ok) {
        onUpdate();
        onClose();
      } else {
        alert("Error saving notes: " + data.error);
      }
    } catch (error: any) {
      alert("Error saving notes: " + error.message);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-100 text-red-800";
      case "high": return "bg-orange-100 text-orange-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {applicant.users?.name || "Applicant Details"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                <User size={16} className="text-gray-400" />
                <span>{applicant.users?.name || "Unknown"}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                <Mail size={16} className="text-gray-400" />
                <span>{applicant.users?.email || "No email"}</span>
              </div>
            </div>
          </div>

          {/* Status Info */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm capitalize">
                {applicant.applicant_type}
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <span className={`inline-block px-3 py-1 rounded text-sm font-medium capitalize ${getPriorityColor(applicant.priority)}`}>
                {applicant.priority}
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <span className={`inline-block px-3 py-1 rounded text-sm font-medium capitalize ${
                applicant.status === "accepted" ? "bg-green-100 text-green-800" :
                applicant.status === "rejected" ? "bg-red-100 text-red-800" :
                "bg-yellow-100 text-yellow-800"
              }`}>
                {applicant.status}
              </span>
            </div>
          </div>

          {/* Timeline */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Timeline</label>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar size={14} />
                <span>Applied: {new Date(applicant.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={14} />
                <span>Last Updated: {new Date(applicant.updated_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add notes about this applicant..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={handleSaveNotes}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save Notes
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
