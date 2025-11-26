"use client";

import { useState, useEffect } from "react";
import { Check, Star, Clock, Users, Wrench } from "lucide-react";

interface WorkspaceActivity {
  id: string;
  activity_name: string;
  activity_type: string;
  requirements: string[];
  materials_needed: string[];
  estimated_duration?: number;
  difficulty_level?: string;
  participant_count?: string;
  is_selected: boolean;
}

interface PresentationWorkspace {
  id: string;
  selected_activity_id?: string;
}

interface ActivitySelectorProps {
  workspace: PresentationWorkspace;
  onActivitySelect: (activityId: string) => void;
}

export default function ActivitySelector({ workspace, onActivitySelect }: ActivitySelectorProps) {
  const [activities, setActivities] = useState<WorkspaceActivity[]>([]);
  const [loading, setLoading] = useState(true);

  // Predefined activities (in a real app, these would come from the database)
  const predefinedActivities: WorkspaceActivity[] = [
    {
      id: "activity_1",
      activity_name: "Circuit Board Design Challenge",
      activity_type: "hands_on",
      requirements: ["Basic understanding of circuits", "Group work skills"],
      materials_needed: ["Breadboards", "LEDs", "Resistors", "Wires", "Batteries"],
      estimated_duration: 45,
      difficulty_level: "intermediate",
      participant_count: "3-5 per group",
      is_selected: false
    },
    {
      id: "activity_2",
      activity_name: "Coding Introduction Workshop",
      activity_type: "interactive",
      requirements: ["No prior experience needed", "Curiosity about technology"],
      materials_needed: ["Computers/Laptops", "Internet access", "Scratch or similar platform"],
      estimated_duration: 60,
      difficulty_level: "beginner",
      participant_count: "Individual or pairs",
      is_selected: false
    },
    {
      id: "activity_3",
      activity_name: "AI Ethics Discussion",
      activity_type: "discussion",
      requirements: ["Interest in technology ethics", "Communication skills"],
      materials_needed: ["Discussion prompts", "Whiteboard/markers", "Timer"],
      estimated_duration: 30,
      difficulty_level: "intermediate",
      participant_count: "Whole class",
      is_selected: false
    },
    {
      id: "activity_4",
      activity_name: "Renewable Energy Demo",
      activity_type: "demonstration",
      requirements: ["Basic science knowledge", "Observation skills"],
      materials_needed: ["Solar panels (small)", "Wind turbine model", "Batteries", "Multimeter"],
      estimated_duration: 40,
      difficulty_level: "beginner",
      participant_count: "Whole class",
      is_selected: false
    },
    {
      id: "activity_5",
      activity_name: "Future Careers in STEM",
      activity_type: "career_guidance",
      requirements: ["Interest in future planning", "Open-mindedness"],
      materials_needed: ["Career brochures", "Video clips", "Guest speaker materials"],
      estimated_duration: 50,
      difficulty_level: "all_levels",
      participant_count: "Whole class",
      is_selected: false
    }
  ];

  useEffect(() => {
    // Simulate loading activities from API
    setTimeout(() => {
      setActivities(predefinedActivities.map(activity => ({
        ...activity,
        is_selected: workspace.selected_activity_id === activity.id
      })));
      setLoading(false);
    }, 500);
  }, [workspace.selected_activity_id]);

  const handleActivitySelect = (activityId: string) => {
    // Update local state
    setActivities(prev => prev.map(activity => ({
      ...activity,
      is_selected: activity.id === activityId
    })));

    // Notify parent
    onActivitySelect(activityId);
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case "beginner": return "text-green-600 bg-green-100";
      case "intermediate": return "text-yellow-600 bg-yellow-100";
      case "advanced": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getActivityTypeIcon = (type: string) => {
    switch (type) {
      case "hands_on": return <Wrench size={16} />;
      case "interactive": return <Users size={16} />;
      case "discussion": return <Users size={16} />;
      case "demonstration": return <Star size={16} />;
      case "career_guidance": return <Star size={16} />;
      default: return <Star size={16} />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Select Presentation Activity</h3>
        <p className="text-gray-600 mb-6">
          Choose an engaging activity that complements your presentation and helps students learn through hands-on experience.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                activity.is_selected
                  ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                  : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
              }`}
              onClick={() => handleActivitySelect(activity.id)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded ${activity.is_selected ? "bg-blue-100" : "bg-gray-100"}`}>
                    {getActivityTypeIcon(activity.activity_type)}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{activity.activity_name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(activity.difficulty_level || "beginner")}`}>
                        {activity.difficulty_level}
                      </span>
                      {activity.estimated_duration && (
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock size={12} />
                          {activity.estimated_duration}min
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {activity.is_selected && (
                  <div className="bg-blue-600 text-white rounded-full p-1">
                    <Check size={14} />
                  </div>
                )}
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Participants:</span> {activity.participant_count}
                </div>

                <div>
                  <span className="font-medium">Requirements:</span>
                  <ul className="list-disc list-inside ml-4 mt-1">
                    {activity.requirements.slice(0, 2).map((req, idx) => (
                      <li key={idx}>{req}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <span className="font-medium">Materials:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {activity.materials_needed.slice(0, 3).map((material, idx) => (
                      <span key={idx} className="inline-block bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs">
                        {material}
                      </span>
                    ))}
                    {activity.materials_needed.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{activity.materials_needed.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Activity Details */}
      {workspace.selected_activity_id && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Selected Activity Details</h3>

          {(() => {
            const selectedActivity = activities.find(a => a.id === workspace.selected_activity_id);
            if (!selectedActivity) return null;

            return (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    {getActivityTypeIcon(selectedActivity.activity_type)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg text-gray-900">
                      {selectedActivity.activity_name}
                    </h4>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <span className={`px-2 py-1 rounded-full ${getDifficultyColor(selectedActivity.difficulty_level || "beginner")}`}>
                        {selectedActivity.difficulty_level}
                      </span>
                      <span>{selectedActivity.participant_count}</span>
                      <span>{selectedActivity.estimated_duration} minutes</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Requirements</h5>
                    <ul className="space-y-1">
                      {selectedActivity.requirements.map((req, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                          <Check size={14} className="text-green-600 mt-0.5 flex-shrink-0" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Materials Needed</h5>
                    <div className="flex flex-wrap gap-2">
                      {selectedActivity.materials_needed.map((material, idx) => (
                        <span key={idx} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                          {material}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-blue-600 mt-0.5">
                      <Check size={16} />
                    </div>
                    <div>
                      <h5 className="font-medium text-blue-900">Activity Selected</h5>
                      <p className="text-blue-700 text-sm mt-1">
                        This activity will be linked to your presentation and included in your preparation checklist.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
