"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Users, Calendar, Clock, CheckCircle, AlertTriangle, MessageSquare } from "lucide-react";
import Link from "next/link";
import InteractiveChecklist from "@/components/volunteer/InteractiveChecklist";

interface GroupDetails {
  id: number;
  team_name: string;
  status: string;
  application_status: string;
  onboarding_step: string;
  presentation_status: string;
  hours_total: number;
  created_at: string;
  updated_at: string;
  member_count: number;
  milestones_completed: number;
  total_milestones: number;
  progress_percentage: number;
  members: Array<{
    user_id: string;
    name: string;
    email: string;
  }>;
  recent_presentations: Array<{
    id: number;
    topic: string;
    scheduled_date: string;
    status: string;
    school_name?: string;
  }>;
}

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.id as string;

  const [group, setGroup] = useState<GroupDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'checklist' | 'members' | 'presentations'>('overview');

  useEffect(() => {
    loadGroupDetails();
  }, [groupId]);

  const loadGroupDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/groups/${groupId}`);
      if (response.ok) {
        const data = await response.json();
        setGroup(data.group);
      }
    } catch (error) {
      console.error('Error loading group details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = () => {
    // TODO: Implement group messaging
    alert('Group messaging feature coming soon!');
  };

  const handleChecklistUpdate = () => {
    // Reload group data when checklist is updated
    loadGroupDetails();
  };

  if (loading) {
    return (
      <div className="container py-10">
        <div className="text-center py-12 text-gsv-gray">Loading group details...</div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="container py-10">
        <div className="text-center py-12 text-red-500">Group not found</div>
      </div>
    );
  }

  return (
    <div className="container py-10 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-3 py-2 text-gsv-gray hover:text-gsv-charcoal transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gsv-charcoal">{group.team_name}</h1>
            <p className="text-gsv-gray mt-1">Group #{group.id} • {group.member_count} members</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSendMessage}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <MessageSquare className="w-4 h-4" />
            Message Group
          </button>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-medium text-gsv-gray">Status</span>
          </div>
          <div className="text-xl font-bold text-gsv-charcoal capitalize">{group.status.replace('_', ' ')}</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium text-gsv-gray">Progress</span>
          </div>
          <div className="text-xl font-bold text-gsv-charcoal">{group.progress_percentage}%</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-purple-500" />
            <span className="text-sm font-medium text-gsv-gray">Hours</span>
          </div>
          <div className="text-xl font-bold text-gsv-charcoal">{group.hours_total}</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-orange-500" />
            <span className="text-sm font-medium text-gsv-gray">Presentations</span>
          </div>
          <div className="text-xl font-bold text-gsv-charcoal">{group.recent_presentations?.length || 0}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: CheckCircle },
            { id: 'checklist', label: 'Checklist', icon: CheckCircle },
            { id: 'members', label: 'Members', icon: Users },
            { id: 'presentations', label: 'Presentations', icon: Calendar }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-gsv-green text-gsv-green'
                  : 'border-transparent text-gsv-gray hover:text-gsv-charcoal hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="py-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Status Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gsv-charcoal mb-4">Current Status</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gsv-gray">Application Status:</span>
                    <span className="font-medium capitalize">{group.application_status.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gsv-gray">Onboarding Step:</span>
                    <span className="font-medium capitalize">{group.onboarding_step.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gsv-gray">Presentation Status:</span>
                    <span className="font-medium capitalize">{group.presentation_status?.replace('_', ' ') || 'Not started'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gsv-charcoal mb-4">Progress Breakdown</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gsv-gray">Milestones Completed:</span>
                    <span className="font-medium">{group.milestones_completed}/{group.total_milestones}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gsv-gray">Overall Progress:</span>
                    <span className="font-medium">{group.progress_percentage}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gsv-gray">Last Updated:</span>
                    <span className="font-medium">{new Date(group.updated_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gsv-charcoal mb-4">Recent Activity</h3>
              {group.recent_presentations && group.recent_presentations.length > 0 ? (
                <div className="space-y-3">
                  {group.recent_presentations.slice(0, 3).map((presentation) => (
                    <div key={presentation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium">{presentation.topic}</div>
                        <div className="text-sm text-gsv-gray">
                          {presentation.school_name} • {new Date(presentation.scheduled_date).toLocaleDateString()}
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded capitalize ${
                        presentation.status === 'completed' ? 'bg-green-100 text-green-800' :
                        presentation.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {presentation.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gsv-gray">No presentations scheduled yet</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'checklist' && (
          <InteractiveChecklist
            volunteerTeamId={group.id}
            onItemComplete={handleChecklistUpdate}
          />
        )}

        {activeTab === 'members' && (
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gsv-charcoal mb-4">Team Members</h3>
            {group.members && group.members.length > 0 ? (
              <div className="space-y-3">
                {group.members.map((member) => (
                  <div key={member.user_id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <div className="font-medium">{member.name}</div>
                      <div className="text-sm text-gsv-gray">{member.email}</div>
                    </div>
                    <Link
                      href={`/admin/user-manager?user=${member.user_id}`}
                      className="text-gsv-green hover:text-gsv-greenDark text-sm font-medium"
                    >
                      View Profile
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gsv-gray">No members found</p>
            )}
          </div>
        )}

        {activeTab === 'presentations' && (
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gsv-charcoal mb-4">Presentation History</h3>
            {group.recent_presentations && group.recent_presentations.length > 0 ? (
              <div className="space-y-3">
                {group.recent_presentations.map((presentation) => (
                  <div key={presentation.id} className="flex items-center justify-between p-4 border border-gray-200 rounded">
                    <div>
                      <div className="font-medium">{presentation.topic}</div>
                      <div className="text-sm text-gsv-gray">
                        {presentation.school_name || 'TBD'} • {new Date(presentation.scheduled_date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 text-sm rounded capitalize ${
                        presentation.status === 'completed' ? 'bg-green-100 text-green-800' :
                        presentation.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                        presentation.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {presentation.status}
                      </span>
                      <Link
                        href={`/dashboard/founder/presentations/${presentation.id}`}
                        className="text-gsv-green hover:text-gsv-greenDark text-sm font-medium"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gsv-gray">No presentations found</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
