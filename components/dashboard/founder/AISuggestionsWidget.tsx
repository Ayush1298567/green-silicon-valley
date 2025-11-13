"use client";
import { useState, useEffect } from "react";
import { AlertTriangle, Clock, Users, TrendingUp, Loader2 } from "lucide-react";
import Link from "next/link";

interface StuckGroup {
  groupId: string;
  groupName: string;
  riskLevel: 'low' | 'medium' | 'high' | 'urgent';
  issues: string[];
  lastActivity: string;
  daysStuck: number;
  recommendations: string[];
  priority: number;
}

export default function AISuggestionsWidget() {
  const [stuckGroups, setStuckGroups] = useState<StuckGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStuckGroups();
  }, []);

  const fetchStuckGroups = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/ai/stuck-groups-analysis');
      const data = await res.json();

      if (data.ok) {
        setStuckGroups(data.stuckGroups.slice(0, 5)); // Show top 5
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to load AI suggestions');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'urgent': return <AlertTriangle className="w-4 h-4" />;
      case 'high': return <TrendingUp className="w-4 h-4" />;
      case 'medium': return <Clock className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-gsv-green/10 rounded-lg flex items-center justify-center">
            <Loader2 className="w-4 h-4 animate-spin text-gsv-green" />
          </div>
          <h3 className="text-lg font-semibold text-gsv-charcoal">AI Suggestions</h3>
        </div>
        <div className="text-center py-8 text-gsv-gray">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
          Analyzing groups...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gsv-charcoal">AI Suggestions</h3>
        </div>
        <div className="text-center py-4">
          <p className="text-red-600 text-sm">{error}</p>
          <button
            onClick={fetchStuckGroups}
            className="mt-2 text-gsv-green hover:underline text-sm"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gsv-green/10 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-gsv-green" />
          </div>
          <h3 className="text-lg font-semibold text-gsv-charcoal">AI Suggestions</h3>
        </div>
        <span className="text-xs text-gsv-gray bg-gray-100 px-2 py-1 rounded-full">
          {stuckGroups.length} groups need attention
        </span>
      </div>

      {stuckGroups.length === 0 ? (
        <div className="text-center py-8 text-gsv-gray">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-sm">All groups are progressing well!</p>
          <p className="text-xs mt-1">AI analysis shows no immediate concerns.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {stuckGroups.map((group) => (
            <Link
              key={group.groupId}
              href={`/dashboard/founder/groups/${group.groupId}`}
              className="block p-3 rounded-lg border hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-medium text-gsv-charcoal text-sm">
                    {group.groupName}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${getRiskColor(group.riskLevel)}`}>
                      {getRiskIcon(group.riskLevel)}
                      {group.riskLevel}
                    </span>
                    <span className="text-xs text-gsv-gray">
                      {group.daysStuck} days inactive
                    </span>
                  </div>
                </div>
              </div>

              {group.issues.length > 0 && (
                <p className="text-xs text-gsv-gray mb-2">
                  {group.issues[0]}
                </p>
              )}

              {group.recommendations.length > 0 && (
                <div className="text-xs text-gsv-green font-medium">
                  💡 {group.recommendations[0]}
                </div>
              )}
            </Link>
          ))}

          {stuckGroups.length >= 5 && (
            <Link
              href="/dashboard/founder/group-progress"
              className="block text-center text-gsv-green hover:underline text-sm py-2"
            >
              View all groups →
            </Link>
          )}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs text-gsv-gray text-center">
          AI analysis updates every 15 minutes
        </p>
      </div>
    </div>
  );
}
