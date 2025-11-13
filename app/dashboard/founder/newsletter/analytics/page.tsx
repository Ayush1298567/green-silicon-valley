"use client";

import { useState, useEffect } from "react";
import { BarChart3, Mail, Users, TrendingUp, TrendingDown } from "lucide-react";

interface Analytics {
  totalSubscribers: number;
  activeSubscribers: number;
  unsubscribedCount: number;
  totalSent: number;
  totalOpened: number;
  totalClicked: number;
  totalBounced: number;
  avgOpenRate: number;
  avgClickRate: number;
  bounceRate: number;
  campaignPerformance: Array<{
    id: number;
    name: string;
    sent: number;
    opened: number;
    clicked: number;
    openRate: number;
    clickRate: number;
    sentAt: string;
  }>;
}

export default function NewsletterAnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch("/api/newsletter/analytics");
      const data = await res.json();
      if (data.ok) {
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gsv-gray">Loading analytics...</div>;
  }

  if (!analytics) {
    return <div className="text-center py-12 text-gsv-gray">No analytics data available</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gsv-charcoal">Newsletter Analytics</h1>
        <p className="text-gsv-gray mt-1">Track your email campaign performance</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gsv-charcoal">{analytics.totalSubscribers}</div>
              <div className="text-sm text-gsv-gray">Total Subscribers</div>
            </div>
          </div>
          <div className="mt-4 text-sm">
            <span className="text-green-600">{analytics.activeSubscribers} active</span>
            {" • "}
            <span className="text-gray-600">{analytics.unsubscribedCount} unsubscribed</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <Mail className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gsv-charcoal">{analytics.totalSent}</div>
              <div className="text-sm text-gsv-gray">Emails Sent</div>
            </div>
          </div>
          <div className="mt-4 text-sm text-gsv-gray">
            {analytics.totalOpened} opened • {analytics.totalClicked} clicked
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gsv-charcoal">{analytics.avgOpenRate}%</div>
              <div className="text-sm text-gsv-gray">Avg Open Rate</div>
            </div>
          </div>
          <div className="mt-4 text-sm text-gsv-gray">
            Industry avg: ~25%
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-100 rounded-lg">
              <BarChart3 className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gsv-charcoal">{analytics.avgClickRate}%</div>
              <div className="text-sm text-gsv-gray">Avg Click Rate</div>
            </div>
          </div>
          <div className="mt-4 text-sm text-gsv-gray">
            Industry avg: ~5%
          </div>
        </div>
      </div>

      {/* Campaign Performance */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gsv-charcoal mb-4">Campaign Performance</h2>
        {analytics.campaignPerformance.length === 0 ? (
          <p className="text-gsv-gray">No campaigns sent yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Campaign</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sent</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Opened</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clicked</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Open Rate</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Click Rate</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {analytics.campaignPerformance.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gsv-charcoal">{campaign.name}</td>
                    <td className="px-4 py-3 text-gsv-gray">{campaign.sent}</td>
                    <td className="px-4 py-3 text-gsv-gray">{campaign.opened}</td>
                    <td className="px-4 py-3 text-gsv-gray">{campaign.clicked}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className={campaign.openRate >= 25 ? "text-green-600" : "text-gray-600"}>
                          {campaign.openRate}%
                        </span>
                        {campaign.openRate >= 25 ? (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className={campaign.clickRate >= 5 ? "text-green-600" : "text-gray-600"}>
                          {campaign.clickRate}%
                        </span>
                        {campaign.clickRate >= 5 ? (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gsv-gray">
                      {new Date(campaign.sentAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

