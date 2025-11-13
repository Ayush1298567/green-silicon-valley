"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Send, Edit, Trash2, Eye, Calendar } from "lucide-react";

interface Campaign {
  id: number;
  name: string;
  subject: string;
  status: string;
  scheduled_for?: string;
  sent_at?: string;
  recipient_count: number;
  sent_count: number;
  opened_count: number;
  clicked_count: number;
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetchCampaigns();
  }, [statusFilter]);

  const fetchCampaigns = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }

      const res = await fetch(`/api/newsletter/campaigns?${params.toString()}`);
      const data = await res.json();
      if (data.ok) {
        setCampaigns(data.campaigns || []);
      }
    } catch (error) {
      console.error("Error fetching campaigns:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this campaign?")) return;

    try {
      const res = await fetch(`/api/newsletter/campaigns/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.ok) {
        fetchCampaigns();
      }
    } catch (error) {
      console.error("Error deleting campaign:", error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: "bg-gray-100 text-gray-800",
      scheduled: "bg-blue-100 text-blue-800",
      sending: "bg-yellow-100 text-yellow-800",
      sent: "bg-green-100 text-green-800",
      paused: "bg-orange-100 text-orange-800",
      cancelled: "bg-red-100 text-red-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getOpenRate = (campaign: Campaign) => {
    if (campaign.sent_count === 0) return 0;
    return Math.round((campaign.opened_count / campaign.sent_count) * 100);
  };

  const getClickRate = (campaign: Campaign) => {
    if (campaign.sent_count === 0) return 0;
    return Math.round((campaign.clicked_count / campaign.sent_count) * 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gsv-charcoal">Campaigns</h1>
          <p className="text-gsv-gray mt-1">Create and manage email campaigns</p>
        </div>
        <Link
          href="/dashboard/founder/newsletter/campaigns/new"
          className="px-4 py-2 bg-gsv-green text-white rounded-lg hover:bg-gsv-greenDark flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Campaign
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="scheduled">Scheduled</option>
          <option value="sending">Sending</option>
          <option value="sent">Sent</option>
          <option value="paused">Paused</option>
        </select>
      </div>

      {/* Campaigns List */}
      {loading ? (
        <div className="text-center py-12 text-gsv-gray">Loading campaigns...</div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-12">
          <Send className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gsv-gray">No campaigns found</p>
          <Link
            href="/dashboard/founder/newsletter/campaigns/new"
            className="mt-4 inline-block px-4 py-2 bg-gsv-green text-white rounded-lg hover:bg-gsv-greenDark"
          >
            Create Your First Campaign
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Campaign</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recipients</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Open Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Click Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {campaigns.map((campaign) => (
                <tr key={campaign.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gsv-charcoal">{campaign.name}</div>
                      <div className="text-sm text-gsv-gray">{campaign.subject}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(campaign.status)}`}>
                      {campaign.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gsv-gray">
                    {campaign.sent_count > 0 ? `${campaign.sent_count} / ${campaign.recipient_count}` : campaign.recipient_count}
                  </td>
                  <td className="px-6 py-4 text-sm text-gsv-gray">
                    {campaign.sent_count > 0 ? `${getOpenRate(campaign)}%` : "-"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gsv-gray">
                    {campaign.sent_count > 0 ? `${getClickRate(campaign)}%` : "-"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gsv-gray">
                    {campaign.sent_at
                      ? new Date(campaign.sent_at).toLocaleDateString()
                      : campaign.scheduled_for
                      ? new Date(campaign.scheduled_for).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/dashboard/founder/newsletter/campaigns/${campaign.id}`}
                        className="p-2 hover:bg-gray-100 rounded"
                        title="View"
                      >
                        <Eye className="w-4 h-4 text-gsv-gray" />
                      </Link>
                      {campaign.status === "draft" && (
                        <Link
                          href={`/dashboard/founder/newsletter/campaigns/${campaign.id}/edit`}
                          className="p-2 hover:bg-gray-100 rounded"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4 text-gsv-gray" />
                        </Link>
                      )}
                      {campaign.status === "draft" && (
                        <button
                          onClick={() => handleDelete(campaign.id)}
                          className="p-2 hover:bg-gray-100 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

