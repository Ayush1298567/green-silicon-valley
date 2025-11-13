"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Filter, Download, Plus, MoreVertical, User, Clock, Award } from "lucide-react";

interface Volunteer {
  id: number;
  user_id: string;
  status: string;
  hours_total: number;
  join_date: string;
  last_activity_date: string;
  user?: {
    name: string;
    email: string;
  };
}

export default function VolunteersPage() {
  const router = useRouter();
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedVolunteers, setSelectedVolunteers] = useState<number[]>([]);

  useEffect(() => {
    fetchVolunteers();
  }, [statusFilter]);

  const fetchVolunteers = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }
      if (searchQuery) {
        params.append("search", searchQuery);
      }

      const res = await fetch(`/api/volunteers?${params.toString()}`);
      const data = await res.json();
      if (data.ok) {
        setVolunteers(data.volunteers || []);
      }
    } catch (error) {
      console.error("Error fetching volunteers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const ids = selectedVolunteers.length > 0 ? selectedVolunteers.join(",") : undefined;
      const params = new URLSearchParams();
      if (ids) params.append("ids", ids);
      params.append("format", "csv");

      const res = await fetch(`/api/volunteers/export?${params.toString()}`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `volunteers-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error exporting:", error);
    }
  };

  const filteredVolunteers = volunteers.filter((v) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        v.user?.name?.toLowerCase().includes(query) ||
        v.user?.email?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gsv-charcoal">Volunteers</h1>
          <p className="text-gsv-gray mt-1">Manage and track volunteer activity</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-gsv-green text-white rounded-lg hover:bg-gsv-greenDark flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <Link
            href="/dashboard/founder/volunteers/new"
            className="px-4 py-2 bg-gsv-green text-white rounded-lg hover:bg-gsv-greenDark flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Volunteer
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[300px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gsv-gray w-4 h-4" />
            <input
              type="text"
              placeholder="Search volunteers..."
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
          <option value="inactive">Inactive</option>
          <option value="pending">Pending</option>
          <option value="on_leave">On Leave</option>
        </select>
      </div>

      {/* Volunteers List */}
      {loading ? (
        <div className="text-center py-12 text-gsv-gray">Loading volunteers...</div>
      ) : filteredVolunteers.length === 0 ? (
        <div className="text-center py-12 text-gsv-gray">No volunteers found</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedVolunteers(filteredVolunteers.map((v) => v.id));
                      } else {
                        setSelectedVolunteers([]);
                      }
                    }}
                    className="rounded"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hours</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Join Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Activity</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredVolunteers.map((volunteer) => (
                <tr key={volunteer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedVolunteers.includes(volunteer.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedVolunteers([...selectedVolunteers, volunteer.id]);
                        } else {
                          setSelectedVolunteers(selectedVolunteers.filter((id) => id !== volunteer.id));
                        }
                      }}
                      className="rounded"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gsv-green/20 flex items-center justify-center">
                        <User className="w-5 h-5 text-gsv-green" />
                      </div>
                      <div>
                        <div className="font-medium text-gsv-charcoal">{volunteer.user?.name || "Unknown"}</div>
                        <div className="text-sm text-gsv-gray">{volunteer.user?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        volunteer.status === "active"
                          ? "bg-green-100 text-green-800"
                          : volunteer.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {volunteer.status || "pending"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-gsv-charcoal">
                      <Clock className="w-4 h-4" />
                      {volunteer.hours_total || 0}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gsv-gray">
                    {volunteer.join_date ? new Date(volunteer.join_date).toLocaleDateString() : "-"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gsv-gray">
                    {volunteer.last_activity_date
                      ? new Date(volunteer.last_activity_date).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/dashboard/founder/volunteers/${volunteer.id}`}
                      className="text-gsv-green hover:text-gsv-greenDark font-medium"
                    >
                      View
                    </Link>
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
