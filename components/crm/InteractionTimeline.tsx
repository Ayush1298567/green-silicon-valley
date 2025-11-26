"use client";

import { useState, useEffect } from "react";
import { Mail, Phone, Calendar, MessageSquare, Plus, Send } from "lucide-react";

interface TeacherInteraction {
  id: string;
  interaction_type: string;
  interaction_date: string;
  notes: string;
  outcome?: string;
  next_followup?: string;
  created_by: string;
  users?: {
    name: string;
  };
}

interface InteractionTimelineProps {
  teacherId: string;
  teacherName: string;
}

export default function InteractionTimeline({ teacherId, teacherName }: InteractionTimelineProps) {
  const [interactions, setInteractions] = useState<TeacherInteraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newInteraction, setNewInteraction] = useState({
    interaction_type: "email",
    notes: "",
    outcome: "",
    next_followup: ""
  });

  useEffect(() => {
    fetchInteractions();
  }, [teacherId]);

  const fetchInteractions = async () => {
    try {
      const res = await fetch(`/api/crm/teachers/${teacherId}/interactions`);
      const data = await res.json();
      if (data.ok) {
        setInteractions(data.interactions || []);
      }
    } catch (error) {
      console.error("Error fetching interactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const addInteraction = async () => {
    try {
      const res = await fetch(`/api/crm/teachers/${teacherId}/interactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newInteraction,
          interaction_date: new Date().toISOString()
        }),
      });

      const data = await res.json();
      if (data.ok) {
        fetchInteractions();
        setNewInteraction({
          interaction_type: "email",
          notes: "",
          outcome: "",
          next_followup: ""
        });
        setShowAddForm(false);
      } else {
        alert("Error adding interaction: " + data.error);
      }
    } catch (error: any) {
      alert("Error adding interaction: " + error.message);
    }
  };

  const getInteractionIcon = (type: string) => {
    switch (type) {
      case "email": return <Mail size={16} />;
      case "call": return <Phone size={16} />;
      case "meeting": return <Calendar size={16} />;
      case "presentation": return <MessageSquare size={16} />;
      default: return <MessageSquare size={16} />;
    }
  };

  const getInteractionColor = (type: string) => {
    switch (type) {
      case "email": return "bg-blue-100 text-blue-600";
      case "call": return "bg-green-100 text-green-600";
      case "meeting": return "bg-purple-100 text-purple-600";
      case "presentation": return "bg-orange-100 text-orange-600";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit"
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Interaction History</h3>
          <p className="text-sm text-gray-600">{teacherName}</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
        >
          <Plus size={14} />
          Add Interaction
        </button>
      </div>

      {/* Add Interaction Form */}
      {showAddForm && (
        <div className="p-6 border-b border-gray-200">
          <h4 className="font-medium mb-4">Add New Interaction</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Interaction Type
              </label>
              <select
                value={newInteraction.interaction_type}
                onChange={(e) => setNewInteraction(prev => ({ ...prev, interaction_type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="email">Email</option>
                <option value="call">Phone Call</option>
                <option value="meeting">Meeting</option>
                <option value="presentation">Presentation</option>
                <option value="follow_up">Follow-up</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={newInteraction.notes}
                onChange={(e) => setNewInteraction(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe the interaction..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Outcome
              </label>
              <input
                type="text"
                value={newInteraction.outcome}
                onChange={(e) => setNewInteraction(prev => ({ ...prev, outcome: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="What was the result?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Next Follow-up Date
              </label>
              <input
                type="datetime-local"
                value={newInteraction.next_followup}
                onChange={(e) => setNewInteraction(prev => ({ ...prev, next_followup: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={addInteraction}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Send size={14} />
                Save Interaction
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="max-h-[500px] overflow-y-auto">
        {interactions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No interactions recorded yet</p>
            <p className="text-sm">Add the first interaction to start tracking this relationship</p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

            <div className="space-y-6 p-6">
              {interactions.map((interaction) => (
                <div key={interaction.id} className="relative flex gap-4">
                  {/* Timeline dot */}
                  <div className={`relative z-10 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getInteractionColor(interaction.interaction_type)}`}>
                    {getInteractionIcon(interaction.interaction_type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pb-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900 capitalize">
                            {interaction.interaction_type.replace("_", " ")}
                          </span>
                          <span className="text-sm text-gray-500">
                            by {interaction.users?.name || "Unknown"}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{interaction.notes}</p>
                        {interaction.outcome && (
                          <p className="text-sm text-green-600 mb-2">
                            <strong>Outcome:</strong> {interaction.outcome}
                          </p>
                        )}
                        {interaction.next_followup && (
                          <p className="text-sm text-blue-600">
                            <strong>Next follow-up:</strong> {formatDate(interaction.next_followup)}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        {formatDate(interaction.interaction_date)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
