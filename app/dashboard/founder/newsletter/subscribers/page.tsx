"use client";

import { useState, useEffect } from "react";
import { Search, Download, Plus, Mail, Tag, X } from "lucide-react";

interface Subscriber {
  id: number;
  email: string;
  name?: string;
  status: string;
  subscribed_at: string;
  tags?: string[];
  total_emails_sent: number;
  total_emails_opened: number;
  total_emails_clicked: number;
}

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedSubscribers, setSelectedSubscribers] = useState<number[]>([]);

  useEffect(() => {
    fetchSubscribers();
  }, [statusFilter]);

  const fetchSubscribers = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }
      if (searchQuery) {
        params.append("search", searchQuery);
      }

      const res = await fetch(`/api/newsletter/subscribers?${params.toString()}`);
      const data = await res.json();
      if (data.ok) {
        setSubscribers(data.subscribers || []);
      }
    } catch (error) {
      console.error("Error fetching subscribers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const res = await fetch("/api/newsletter/subscribers/export?format=csv");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `subscribers-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error exporting:", error);
    }
  };

  const filteredSubscribers = subscribers.filter((s) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        s.email.toLowerCase().includes(query) ||
        s.name?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: "bg-green-100 text-green-800",
      unsubscribed: "bg-gray-100 text-gray-800",
      bounced: "bg-red-100 text-red-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gsv-charcoal">Subscribers</h1>
          <p className="text-gsv-gray mt-1">Manage your newsletter subscribers</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-gray-200 text-gsv-charcoal rounded-lg hover:bg-gray-300 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-2xl font-bold text-gsv-charcoal">{subscribers.length}</div>
          <div className="text-sm text-gsv-gray mt-1">Total Subscribers</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-2xl font-bold text-green-600">
            {subscribers.filter((s) => s.status === "active").length}
          </div>
          <div className="text-sm text-gsv-gray mt-1">Active</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-2xl font-bold text-gray-600">
            {subscribers.filter((s) => s.status === "unsubscribed").length}
          </div>
          <div className="text-sm text-gsv-gray mt-1">Unsubscribed</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-2xl font-bold text-red-600">
            {subscribers.filter((s) => s.status === "bounced").length}
          </div>
          <div className="text-sm text-gsv-gray mt-1">Bounced</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[300px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gsv-gray w-4 h-4" />
            <input
              type="text"
              placeholder="Search subscribers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green"
            />
          </div>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="unsubscribed">Unsubscribed</option>
          <option value="bounced">Bounced</option>
        </select>
      </div>

      {/* Subscribers List */}
      {loading ? (
        <div className="text-center py-12 text-gsv-gray">Loading subscribers...</div>
      ) : filteredSubscribers.length === 0 ? (
        <div className="text-center py-12 text-gsv-gray">No subscribers found</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tags</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Engagement</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subscribed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredSubscribers.map((subscriber) => (
                <tr key={subscriber.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gsv-gray" />
                      <span className="font-medium text-gsv-charcoal">{subscriber.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gsv-gray">{subscriber.name || "-"}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(subscriber.status)}`}>
                      {subscriber.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {subscriber.tags?.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded flex items-center gap-1"
                        >
                          <Tag className="w-3 h-3" />
                          {tag}
                        </span>
                      ))}
                      {subscriber.tags && subscriber.tags.length > 3 && (
                        <span className="text-xs text-gsv-gray">+{subscriber.tags.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gsv-gray">
                    {subscriber.total_emails_sent > 0 ? (
                      <div>
                        <div>Sent: {subscriber.total_emails_sent}</div>
                        <div>Opened: {subscriber.total_emails_opened}</div>
                        <div>Clicked: {subscriber.total_emails_clicked}</div>
                      </div>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gsv-gray">
                    {new Date(subscriber.subscribed_at).toLocaleDateString()}
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

