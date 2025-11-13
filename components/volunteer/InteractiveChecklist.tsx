"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Circle, Clock, AlertTriangle, ExternalLink, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

interface ChecklistItem {
  id: string;
  item_name: string;
  item_description: string;
  item_category: string;
  is_required: boolean;
  is_completed: boolean;
  completed_at?: string;
  due_date?: string;
  priority: string;
  order_index: number;
  help_resources: any[];
}

interface InteractiveChecklistProps {
  volunteerTeamId: number;
  onItemComplete?: (itemId: string, completed: boolean) => void;
}

const CHECKLIST_ITEMS = [
  {
    category: "application",
    title: "Application Phase",
    items: [
      {
        id: "application_submitted",
        name: "Submit Group Application",
        description: "Complete and submit the volunteer group application form",
        required: true,
        autoComplete: true
      }
    ]
  },
  {
    category: "onboarding",
    title: "Getting Started",
    items: [
      {
        id: "group_chat_created",
        name: "Group Chat Setup",
        description: "Join your team group chat for coordination",
        required: true,
        autoComplete: true
      },
      {
        id: "topic_selected",
        name: "Choose Presentation Topic",
        description: "Select and confirm your environmental presentation topic",
        required: true,
        autoComplete: true,
        helpUrl: "/resources/topics"
      },
      {
        id: "resources_viewed",
        name: "Review Resources",
        description: "Review presentation templates and guidelines",
        required: true,
        helpUrl: "/resources"
      }
    ]
  },
  {
    category: "preparation",
    title: "Content Creation",
    items: [
      {
        id: "presentation_draft_created",
        name: "Create Presentation Draft",
        description: "Build your Google Slides presentation draft",
        required: true,
        helpUrl: "/resources/templates"
      },
      {
        id: "presentation_shared",
        name: "Share with GSV",
        description: "Share your presentation with greensiliconvalley27@gmail.com",
        required: true
      }
    ]
  },
  {
    category: "presentation",
    title: "Review & Scheduling",
    items: [
      {
        id: "presentation_submitted",
        name: "Submit for Review",
        description: "Submit your final presentation for founder review",
        required: true,
        autoComplete: true
      },
      {
        id: "review_completed",
        name: "Receive Founder Feedback",
        description: "Incorporate feedback and finalize presentation",
        required: true,
        autoComplete: true
      },
      {
        id: "presentation_scheduled",
        name: "Presentation Scheduled",
        description: "Get confirmed date and school assignment",
        required: true,
        autoComplete: true
      }
    ]
  },
  {
    category: "followup",
    title: "Post-Presentation",
    items: [
      {
        id: "presentation_completed",
        name: "Complete Presentation",
        description: "Successfully deliver your environmental presentation",
        required: true,
        autoComplete: true
      },
      {
        id: "hours_logged",
        name: "Log Volunteer Hours",
        description: "Record and submit your volunteer hours",
        required: true,
        autoComplete: true,
        helpUrl: "/dashboard/volunteer/hours"
      },
      {
        id: "documents_uploaded",
        name: "Upload Signed Documents",
        description: "Upload required forms signed by teachers and volunteers",
        required: true,
        helpUrl: "/dashboard/volunteer/documents"
      }
    ]
  },
  {
    category: "graduation",
    title: "Program Completion",
    items: [
      {
        id: "orientation_completed",
        name: "Complete Orientation",
        description: "Attend required volunteer orientation session",
        required: false
      },
      {
        id: "fully_graduated",
        name: "Program Graduation",
        description: "Complete all requirements and receive certification",
        required: false,
        autoComplete: true
      }
    ]
  }
];

export default function InteractiveChecklist({ volunteerTeamId, onItemComplete }: InteractiveChecklistProps) {
  const [checklistData, setChecklistData] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategory, setExpandedCategory] = useState<string>("application");

  useEffect(() => {
    loadChecklistData();
  }, [volunteerTeamId]);

  const loadChecklistData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/groups/${volunteerTeamId}/checklist`);
      if (response.ok) {
        const data = await response.json();
        setChecklistData(data.items || []);
      }
    } catch (error) {
      console.error('Error loading checklist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleItemToggle = async (itemId: string, currentCompleted: boolean) => {
    try {
      const response = await fetch(`/api/groups/${volunteerTeamId}/checklist/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !currentCompleted })
      });

      if (response.ok) {
        setChecklistData(prev =>
          prev.map(item =>
            item.id === itemId
              ? { ...item, is_completed: !currentCompleted, completed_at: !currentCompleted ? new Date().toISOString() : undefined }
              : item
          )
        );
        onItemComplete?.(itemId, !currentCompleted);
      }
    } catch (error) {
      console.error('Error updating checklist item:', error);
    }
  };

  const getItemStatus = (item: ChecklistItem) => {
    if (item.is_completed) return 'completed';
    if (item.due_date && new Date(item.due_date) < new Date()) return 'overdue';
    if (item.priority === 'urgent') return 'urgent';
    return 'pending';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'overdue':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'urgent':
        return <Clock className="w-5 h-5 text-orange-600" />;
      default:
        return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'border-green-200 bg-green-50';
      case 'overdue':
        return 'border-red-200 bg-red-50';
      case 'urgent':
        return 'border-orange-200 bg-orange-50';
      default:
        return 'border-gray-200 bg-white';
    }
  };

  const calculateProgress = (categoryItems: any[]) => {
    const completed = categoryItems.filter(item => item.is_completed).length;
    return categoryItems.length > 0 ? Math.round((completed / categoryItems.length) * 100) : 0;
  };

  if (loading) {
    return <div className="text-center py-8 text-gsv-gray">Loading checklist...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gsv-charcoal mb-2">Your Progress Checklist</h2>
        <p className="text-gsv-gray">Track your journey from application to program completion</p>
      </div>

      {CHECKLIST_ITEMS.map((category) => {
        const categoryItems = checklistData.filter(item => item.item_category === category.category);
        const progress = calculateProgress(categoryItems);
        const isExpanded = expandedCategory === category.category;

        return (
          <motion.div
            key={category.category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-gray-200 rounded-lg overflow-hidden"
          >
            <button
              onClick={() => setExpandedCategory(isExpanded ? '' : category.category)}
              className="w-full p-4 bg-gray-50 hover:bg-gray-100 transition flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-gsv-charcoal">{category.title}</h3>
                <span className="text-sm text-gsv-gray">
                  {categoryItems.filter(item => item.is_completed).length} / {categoryItems.length} completed
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gsv-green transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{progress}%</span>
              </div>
            </button>

            {isExpanded && (
              <div className="p-4 space-y-3">
                {categoryItems.length === 0 ? (
                  <div className="text-center py-4 text-gsv-gray">
                    No items in this category yet. Check back as you progress!
                  </div>
                ) : (
                  categoryItems.map((item) => {
                    const status = getItemStatus(item);
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-4 rounded-lg border-2 transition-all ${getStatusColor(status)}`}
                      >
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => handleItemToggle(item.id, item.is_completed)}
                            className="flex-shrink-0 mt-0.5"
                            disabled={item.autoComplete} // Some items auto-complete based on actions
                          >
                            {getStatusIcon(status)}
                          </button>

                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className={`font-medium ${item.is_completed ? 'text-green-800' : 'text-gsv-charcoal'}`}>
                                {item.item_name}
                                {item.is_required && <span className="text-red-500 ml-1">*</span>}
                              </h4>
                              {item.priority === 'urgent' && !item.is_completed && (
                                <span className="px-2 py-0.5 text-xs bg-red-100 text-red-800 rounded">Urgent</span>
                              )}
                            </div>

                            <p className="text-sm text-gsv-gray mb-2">{item.item_description}</p>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                {item.due_date && (
                                  <div className={`text-xs flex items-center gap-1 ${
                                    new Date(item.due_date) < new Date() && !item.is_completed
                                      ? 'text-red-600'
                                      : 'text-gsv-gray'
                                  }`}>
                                    <Clock className="w-3 h-3" />
                                    Due: {new Date(item.due_date).toLocaleDateString()}
                                  </div>
                                )}

                                {item.completed_at && (
                                  <div className="text-xs text-green-600">
                                    ✓ Completed {new Date(item.completed_at).toLocaleDateString()}
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center gap-2">
                                {item.help_resources && item.help_resources.length > 0 && (
                                  <button className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition">
                                    <MessageSquare className="w-3 h-3" />
                                    Help
                                  </button>
                                )}

                                {item.helpUrl && (
                                  <Link
                                    href={item.helpUrl}
                                    className="flex items-center gap-1 px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded hover:bg-purple-200 transition"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                    Resources
                                  </Link>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            )}
          </motion.div>
        );
      })}

      {/* Progress Summary */}
      <div className="bg-gsv-green/5 border border-gsv-green/20 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gsv-charcoal mb-4">Progress Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gsv-green">
              {checklistData.filter(item => item.is_completed).length}
            </div>
            <div className="text-sm text-gsv-gray">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {checklistData.filter(item => !item.is_completed).length}
            </div>
            <div className="text-sm text-gsv-gray">Remaining</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {checklistData.filter(item => item.priority === 'urgent' && !item.is_completed).length}
            </div>
            <div className="text-sm text-gsv-gray">Urgent</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round((checklistData.filter(item => item.is_completed).length / Math.max(checklistData.length, 1)) * 100)}%
            </div>
            <div className="text-sm text-gsv-gray">Complete</div>
          </div>
        </div>
      </div>
    </div>
  );
}
