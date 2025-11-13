"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Award, Trophy, Star, Users, TrendingUp, Download } from "lucide-react";

interface Badge {
  id: number;
  name: string;
  description: string;
  icon_url?: string;
  badge_type: string;
  rarity: string;
}

interface LeaderboardEntry {
  volunteer_id: number;
  rank: number;
  score: number;
  volunteer?: {
    user?: {
      name: string;
      email: string;
    };
  };
}

export default function RecognitionPage() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBadges();
    fetchLeaderboard();
  }, []);

  const fetchBadges = async () => {
    try {
      const res = await fetch("/api/recognition/badges");
      const data = await res.json();
      if (data.ok) {
        setBadges(data.badges || []);
      }
    } catch (error) {
      console.error("Error fetching badges:", error);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch("/api/recognition/leaderboard?type=hours_all_time&limit=10");
      const data = await res.json();
      if (data.ok) {
        setLeaderboard(data.entries || []);
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    const colors: Record<string, string> = {
      common: "bg-gray-100 text-gray-800",
      rare: "bg-blue-100 text-blue-800",
      epic: "bg-purple-100 text-purple-800",
      legendary: "bg-yellow-100 text-yellow-800"
    };
    return colors[rarity] || colors.common;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gsv-charcoal">Recognition & Badges</h1>
          <p className="text-gsv-gray mt-1">Recognize and reward volunteer achievements</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/dashboard/founder/recognition/badges"
            className="px-4 py-2 bg-gsv-green text-white rounded-lg hover:bg-gsv-greenDark flex items-center gap-2"
          >
            <Award className="w-4 h-4" />
            Manage Badges
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Award className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gsv-charcoal">{badges.length}</div>
              <div className="text-sm text-gsv-gray">Total Badges</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Trophy className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gsv-charcoal">{leaderboard.length}</div>
              <div className="text-sm text-gsv-gray">Top Performers</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <Star className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gsv-charcoal">-</div>
              <div className="text-sm text-gsv-gray">Badges Awarded</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gsv-charcoal">-</div>
              <div className="text-sm text-gsv-gray">Volunteer of Month</div>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gsv-charcoal">Top Volunteers (All-Time Hours)</h2>
          <select className="px-3 py-1 border border-gray-300 rounded text-sm">
            <option>All-Time</option>
            <option>This Year</option>
            <option>This Month</option>
          </select>
        </div>
        {loading ? (
          <div className="text-center py-12 text-gsv-gray">Loading leaderboard...</div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-12 text-gsv-gray">No leaderboard data yet</div>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((entry, idx) => (
              <div
                key={entry.volunteer_id}
                className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  idx === 0 ? "bg-yellow-100 text-yellow-600" :
                  idx === 1 ? "bg-gray-100 text-gray-600" :
                  idx === 2 ? "bg-orange-100 text-orange-600" :
                  "bg-gray-50 text-gray-500"
                }`}>
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gsv-charcoal">
                    {entry.volunteer?.user?.name || "Unknown"}
                  </div>
                  <div className="text-sm text-gsv-gray">{entry.volunteer?.user?.email}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gsv-charcoal">{entry.score} hours</div>
                  <div className="text-xs text-gsv-gray">Total</div>
                </div>
                {idx < 3 && (
                  <Trophy className={`w-6 h-6 ${
                    idx === 0 ? "text-yellow-500" :
                    idx === 1 ? "text-gray-400" :
                    "text-orange-500"
                  }`} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Badges Grid */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gsv-charcoal mb-4">Available Badges</h2>
        {badges.length === 0 ? (
          <p className="text-gsv-gray">No badges configured yet</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3 mb-3">
                  {badge.icon_url ? (
                    <img src={badge.icon_url} alt={badge.name} className="w-12 h-12" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gsv-green/20 flex items-center justify-center">
                      <Award className="w-6 h-6 text-gsv-green" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gsv-charcoal">{badge.name}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${getRarityColor(badge.rarity)}`}>
                      {badge.rarity}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gsv-gray">{badge.description}</p>
                <div className="mt-2 text-xs text-gsv-gray capitalize">{badge.badge_type}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

