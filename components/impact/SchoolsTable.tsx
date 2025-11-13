"use client";
import { useState } from "react";
import { Search, ExternalLink, ArrowUpDown } from "lucide-react";

interface School {
  id: number;
  name: string;
  city?: string;
  state?: string;
  total_presentations_hosted?: number;
  last_presentation_date?: string;
  status?: string;
}

interface SchoolsTableProps {
  schools: School[];
}

export default function SchoolsTable({ schools }: SchoolsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "presentations" | "date">("presentations");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Filter schools
  const filteredSchools = schools.filter(
    (school) =>
      school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort schools
  const sortedSchools = [...filteredSchools].sort((a, b) => {
    let comparison = 0;
    
    if (sortBy === "name") {
      comparison = a.name.localeCompare(b.name);
    } else if (sortBy === "presentations") {
      comparison = (a.total_presentations_hosted || 0) - (b.total_presentations_hosted || 0);
    } else if (sortBy === "date") {
      const dateA = a.last_presentation_date ? new Date(a.last_presentation_date).getTime() : 0;
      const dateB = b.last_presentation_date ? new Date(b.last_presentation_date).getTime() : 0;
      comparison = dateA - dateB;
    }

    return sortOrder === "asc" ? comparison : -comparison;
  });

  const toggleSort = (column: "name" | "presentations" | "date") => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gsv-gray w-5 h-5" />
        <input
          type="text"
          placeholder="Search schools by name or city..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green"
        />
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left">
                  <button
                    onClick={() => toggleSort("name")}
                    className="flex items-center gap-2 font-semibold text-sm text-gsv-charcoal hover:text-gsv-green"
                  >
                    School Name
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
                <th className="px-6 py-3 text-left">
                  <div className="font-semibold text-sm text-gsv-charcoal">Location</div>
                </th>
                <th className="px-6 py-3 text-left">
                  <button
                    onClick={() => toggleSort("presentations")}
                    className="flex items-center gap-2 font-semibold text-sm text-gsv-charcoal hover:text-gsv-green"
                  >
                    Presentations
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
                <th className="px-6 py-3 text-left">
                  <button
                    onClick={() => toggleSort("date")}
                    className="flex items-center gap-2 font-semibold text-sm text-gsv-charcoal hover:text-gsv-green"
                  >
                    Last Visit
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
                <th className="px-6 py-3 text-left">
                  <div className="font-semibold text-sm text-gsv-charcoal">Status</div>
                </th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {sortedSchools.map((school) => (
                <tr key={school.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gsv-charcoal">{school.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gsv-gray">
                      {school.city && school.state ? `${school.city}, ${school.state}` : "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="inline-flex items-center justify-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                      {school.total_presentations_hosted || 0}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gsv-gray">
                      {school.last_presentation_date
                        ? new Date(school.last_presentation_date).toLocaleDateString()
                        : "Never"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        school.status === "active"
                          ? "bg-green-100 text-green-800"
                          : school.status === "inactive"
                          ? "bg-gray-100 text-gray-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {school.status || "unknown"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <a
                      href={`/dashboard/founder/schools/${school.id}`}
                      className="text-gsv-green hover:text-gsv-green/80 inline-flex items-center gap-1 text-sm"
                    >
                      View
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {sortedSchools.length === 0 && (
          <div className="text-center py-12 text-gsv-gray">
            No schools found matching “{searchTerm}”
          </div>
        )}
      </div>

      <div className="text-sm text-gsv-gray">
        Showing {sortedSchools.length} of {schools.length} schools
      </div>
    </div>
  );
}

