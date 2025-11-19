"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Clock, Users, TrendingUp, MessageSquare } from "lucide-react";
import Link from "next/link";

interface GroupProgress {
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
  days_since_last_activity: number;
  next_deadline?: string;
  risk_level: 'low' | 'medium' | 'high' | 'urgent';
}

interface GroupProgressDashboardProps {
  initialData?: any;
}

export default function GroupProgressDashboard({ initialData }: GroupProgressDashboardProps = {}) {
  const [groups, setGroups] = useState<GroupProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchGroupProgress();
  }, [filter]);

  const fetchGroupProgress = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('status', filter);

      const response = await fetch(`/api/groups/progress?${params}`);
      if (response.ok) {
        const data = await response.json();
        setGroups(data.groups || []);
      }
    } catch (error) {
      console.error('Error fetching group progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'stuck': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'urgent': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'high': return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'medium': return <Clock className="w-4 h-4 text-yellow-500" />;
      default: return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
  };

  const filteredGroups = groups.filter(group => {
    if (filter === 'all') return true;
    if (filter === 'at_risk') return group.risk_level === 'high' || group.risk_level === 'urgent';
    if (filter === 'completed') return group.status === 'completed';
    if (filter === 'active') return group.status === 'in_progress' || group.status === 'scheduled';
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gsv-charcoal">Group Progress Dashboard</h1>
          <p className="text-gsv-gray mt-1">Monitor volunteer group progress and identify bottlenecks</p>
        </div>
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green"
          >
            <option value="all">All Groups</option>
            <option value="active">Active Groups</option>
            <option value="at_risk">At Risk</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-sm text-gsv-gray">Total Groups</p>
              <p className="text-2xl font-bold">{groups.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <div>
              <p className="text-sm text-gsv-gray">Completed</p>
              <p className="text-2xl font-bold">{groups.filter(g => g.status === 'completed').length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <div>
              <p className="text-sm text-gsv-gray">At Risk</p>
              <p className="text-2xl font-bold">{groups.filter(g => g.risk_level === 'high' || g.risk_level === 'urgent').length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-500" />
            <div>
              <p className="text-sm text-gsv-gray">Avg Progress</p>
              <p className="text-2xl font-bold">
                {groups.length > 0 ? Math.round(groups.reduce((sum, g) => sum + g.progress_percentage, 0) / groups.length) : 0}%
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Groups List */}
      <Card className="p-6">
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8 text-gsv-gray">Loading group progress...</div>
          ) : filteredGroups.length === 0 ? (
            <div className="text-center py-8 text-gsv-gray">No groups found</div>
          ) : (
            filteredGroups.map((group) => (
              <div key={group.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gsv-charcoal">{group.team_name}</h3>
                      <Badge className={getStatusColor(group.status)}>
                        {group.status.replace('_', ' ')}
                      </Badge>
                      {getRiskIcon(group.risk_level)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gsv-gray">
                      <span>{group.member_count} members</span>
                      <span>{group.hours_total} hours logged</span>
                      <span>Last active: {group.days_since_last_activity} days ago</span>
                      {group.next_deadline && (
                        <span className="text-orange-600">Due: {new Date(group.next_deadline).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  <Link
                    href={`/dashboard/founder/groups/${group.id}`}
                    className="px-4 py-2 bg-gsv-green text-white rounded-lg hover:bg-gsv-greenDark transition"
                  >
                    View Details
                  </Link>
                </div>

                {/* Progress Bar */}
                <div className="mb-2">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>Overall Progress</span>
                    <span>{group.progress_percentage}% ({group.milestones_completed}/{group.total_milestones} milestones)</span>
                  </div>
                  <Progress value={group.progress_percentage} className="h-2" />
                </div>

                {/* Quick Actions */}
                <div className="flex items-center gap-2 mt-3">
                  <button className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition">
                    <MessageSquare className="w-3 h-3" />
                    Message Group
                  </button>
                  <button className="flex items-center gap-1 px-3 py-1 text-sm bg-purple-100 text-purple-800 rounded hover:bg-purple-200 transition">
                    📋 View Checklist
                  </button>
                  {group.risk_level !== 'low' && (
                    <button className="flex items-center gap-1 px-3 py-1 text-sm bg-red-100 text-red-800 rounded hover:bg-red-200 transition">
                      🚨 Help Needed
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
