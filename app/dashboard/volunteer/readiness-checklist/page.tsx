"use client";
import { useState, useEffect } from "react";
import { CheckCircle, Circle, Clock, AlertCircle, CheckSquare } from "lucide-react";
import { toast } from "sonner";

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  required: boolean;
}

interface ReadinessChecklistProps {
  teamId?: string;
}

export default function ReadinessChecklist({ teamId }: ReadinessChecklistProps) {
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Default checklist items for presentation readiness
  const defaultChecklist = [
    {
      id: 'content_review',
      title: 'Content Review Complete',
      description: 'Review all presentation slides and key talking points',
      completed: false,
      required: true,
    },
    {
      id: 'practice_session',
      title: 'Practice Session',
      description: 'Complete at least one full practice run of the presentation',
      completed: false,
      required: true,
    },
    {
      id: 'team_coordination',
      title: 'Team Coordination',
      description: 'Confirm roles and timing with all team members',
      completed: false,
      required: true,
    },
    {
      id: 'materials_prepared',
      title: 'Materials Prepared',
      description: 'Gather all props, handouts, and presentation materials',
      completed: false,
      required: true,
    },
    {
      id: 'equipment_check',
      title: 'Equipment Check',
      description: 'Test projector, clicker, and any tech equipment',
      completed: false,
      required: true,
    },
    {
      id: 'backup_plan',
      title: 'Backup Plan Ready',
      description: 'Prepare contingency plans for technical issues or absences',
      completed: false,
      required: false,
    },
    {
      id: 'questions_prep',
      title: 'Q&A Preparation',
      description: 'Prepare answers for common student questions',
      completed: false,
      required: false,
    },
    {
      id: 'timing_practice',
      title: 'Timing Practice',
      description: 'Ensure presentation fits within the allotted time',
      completed: false,
      required: true,
    },
  ];

  useEffect(() => {
    loadChecklist();
  }, [teamId]);

  const loadChecklist = async () => {
    try {
      const response = await fetch(`/api/volunteers/readiness/${teamId || 'default'}`);
      if (response.ok) {
        const data = await response.json();
        setChecklistItems(data.checklist || defaultChecklist);
      } else {
        // Use default checklist if no saved data
        setChecklistItems(defaultChecklist);
      }
    } catch (error) {
      console.error('Error loading checklist:', error);
      setChecklistItems(defaultChecklist);
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = async (itemId: string) => {
    const updatedItems = checklistItems.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    setChecklistItems(updatedItems);

    // Auto-save
    await saveChecklist(updatedItems);
  };

  const saveChecklist = async (items: ChecklistItem[]) => {
    setSaving(true);
    try {
      const response = await fetch(`/api/volunteers/readiness/${teamId || 'default'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checklist: items }),
      });

      if (response.ok) {
        toast.success('Checklist saved successfully');
      } else {
        toast.error('Failed to save checklist');
      }
    } catch (error) {
      console.error('Error saving checklist:', error);
      toast.error('Failed to save checklist');
    } finally {
      setSaving(false);
    }
  };

  const completedCount = checklistItems.filter(item => item.completed).length;
  const totalCount = checklistItems.length;
  const requiredCompleted = checklistItems.filter(item => item.required && item.completed).length;
  const requiredTotal = checklistItems.filter(item => item.required).length;
  const isReady = requiredCompleted === requiredTotal;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gsv-green"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Presentation Readiness Checklist</h1>
        <p className="text-gray-600">
          Ensure your team is fully prepared for a successful presentation
        </p>
      </div>

      {/* Progress Overview */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Readiness Progress</h2>
          {saving && <span className="text-sm text-gray-500">Saving...</span>}
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-gsv-green mb-1">
              {completedCount}/{totalCount}
            </div>
            <p className="text-sm text-gray-600">Total Items</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-1">
              {requiredCompleted}/{requiredTotal}
            </div>
            <p className="text-sm text-gray-600">Required Items</p>
          </div>
          <div className="text-center">
            <div className={`text-3xl font-bold mb-1 ${isReady ? 'text-green-600' : 'text-orange-600'}`}>
              {Math.round((completedCount / totalCount) * 100)}%
            </div>
            <p className="text-sm text-gray-600">Complete</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
          <div
            className={`h-3 rounded-full transition-all duration-300 ${
              isReady ? 'bg-green-500' : 'bg-gsv-green'
            }`}
            style={{ width: `${(completedCount / totalCount) * 100}%` }}
          />
        </div>

        {/* Status Message */}
        <div className={`p-4 rounded-lg ${
          isReady
            ? 'bg-green-50 border border-green-200'
            : 'bg-orange-50 border border-orange-200'
        }`}>
          <div className="flex items-center gap-3">
            {isReady ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <Clock className="w-5 h-5 text-orange-600" />
            )}
            <div>
              <p className={`font-medium ${
                isReady ? 'text-green-900' : 'text-orange-900'
              }`}>
                {isReady ? 'Your team is ready!' : 'Almost there!'}
              </p>
              <p className={`text-sm ${
                isReady ? 'text-green-700' : 'text-orange-700'
              }`}>
                {isReady
                  ? 'All required items are complete. You can proceed with confidence.'
                  : `${requiredTotal - requiredCompleted} required item${requiredTotal - requiredCompleted === 1 ? '' : 's'} remaining.`
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Checklist Items */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Checklist Items</h2>
          <p className="text-gray-600 text-sm mt-1">
            Check off items as you complete them. Required items are marked with an asterisk (*).
          </p>
        </div>

        <div className="divide-y divide-gray-200">
          {checklistItems.map((item) => (
            <div key={item.id} className="p-6">
              <div className="flex items-start gap-4">
                <button
                  onClick={() => toggleItem(item.id)}
                  className={`mt-1 flex-shrink-0 ${
                    item.completed ? 'text-green-600' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {item.completed ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <Circle className="w-6 h-6" />
                  )}
                </button>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className={`font-medium ${
                      item.completed ? 'text-gray-900' : 'text-gray-900'
                    }`}>
                      {item.title}
                      {item.required && <span className="text-red-500 ml-1">*</span>}
                    </h3>
                    {item.required && (
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">
                        Required
                      </span>
                    )}
                  </div>
                  <p className={`text-sm ${
                    item.completed ? 'text-gray-600' : 'text-gray-600'
                  }`}>
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 border-t">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <span className="font-medium">Legend:</span> * = Required for presentation readiness
            </div>
            <div className="text-sm text-gray-600">
              Last updated: {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* Tips Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900 mb-2">Presentation Tips</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Arrive at the school 30 minutes early to set up</li>
              <li>• Test all equipment before students arrive</li>
              <li>• Have a team member designated as the "time keeper"</li>
              <li>• Prepare engaging activities for different attention spans</li>
              <li>• Follow up with the teacher after the presentation</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
