"use client";

import { useState, useEffect } from "react";
import { Download, Clock, CheckCircle, AlertCircle, Plus, FileText } from "lucide-react";
import HoursLogForm, { HoursLogData } from "@/components/hours/HoursLogForm";

interface VolunteerHours {
  id: string;
  presentation_id: string;
  hours_logged: number;
  activity: string;
  status: string;
  submitted_at: string;
  verified_at?: string;
  teacher_signature_url?: string;
  verification_method?: string;
  excused_absence_pdf_url?: string;
  presentations: {
    topic: string;
    scheduled_date: string;
    school_name?: string;
  };
}

interface VolunteerHoursInterfaceProps {
  presentations: Array<{ id: string | number; topic: string; scheduled_date?: string; school_name?: string }>;
}

export default function VolunteerHoursInterface({ presentations }: VolunteerHoursInterfaceProps) {
  const [hours, setHours] = useState<VolunteerHours[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLogForm, setShowLogForm] = useState(false);
  const [selectedHours, setSelectedHours] = useState<VolunteerHours | null>(null);

  useEffect(() => {
    fetchHours();
  }, []);

  const fetchHours = async () => {
    try {
      const res = await fetch("/api/volunteer-hours");
      const data = await res.json();
      if (data.ok) {
        setHours(data.hours || []);
      }
    } catch (error) {
      console.error("Error fetching hours:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogHours = async (data: HoursLogData) => {
    try {
      const res = await fetch("/api/volunteer-hours/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (result.ok) {
        await fetchHours(); // Refresh the list
        setShowLogForm(false);
      } else {
        throw new Error(result.error || "Failed to log hours");
      }
    } catch (error: any) {
      alert("Error logging hours: " + error.message);
    }
  };

  const downloadExcusedAbsence = async (hoursId: string) => {
    try {
      const res = await fetch(`/api/volunteer-hours/${hoursId}/excused-absence`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `excused_absence_${hoursId}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        alert("Failed to download excused absence PDF");
      }
    } catch (error) {
      console.error("Error downloading PDF:", error);
      alert("Error downloading excused absence PDF");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case "rejected":
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "text-green-800 bg-green-100";
      case "pending":
        return "text-yellow-800 bg-yellow-100";
      case "rejected":
        return "text-red-800 bg-red-100";
      default:
        return "text-gray-800 bg-gray-100";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading hours...</p>
        </div>
      </div>
    );
  }

  const totalHours = hours
    .filter(h => h.status === "verified")
    .reduce((sum, h) => sum + h.hours_logged, 0);

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Volunteer Hours</h1>
          <p className="text-gray-600">Track and verify your volunteer hours</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{totalHours}</div>
            <div className="text-sm text-gray-500">Total Verified Hours</div>
          </div>
          <button
            onClick={() => setShowLogForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={16} />
            Log Hours
          </button>
        </div>
      </div>

      {/* Hours Log Form */}
      {showLogForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Log New Hours</h2>
            <button
              onClick={() => setShowLogForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          <HoursLogForm
            onSubmit={handleLogHours}
            presentations={presentations}
          />
        </div>
      )}

      {/* Hours List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Hours History</h2>
        </div>

        {hours.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No hours logged yet</p>
            <p className="text-sm">Click "Log Hours" to get started</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {hours.map((entry) => (
              <div key={entry.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(entry.status)}
                      <h3 className="font-medium text-gray-900">
                        {entry.presentations?.topic || "Unknown Presentation"}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(entry.status)}`}>
                        {entry.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                      <div>
                        <span className="font-medium">Hours:</span> {entry.hours_logged}
                      </div>
                      <div>
                        <span className="font-medium">Activity:</span> {entry.activity || "N/A"}
                      </div>
                      <div>
                        <span className="font-medium">Date:</span>{" "}
                        {new Date(entry.submitted_at).toLocaleDateString()}
                      </div>
                      {entry.presentations?.school_name && (
                        <div>
                          <span className="font-medium">School:</span> {entry.presentations.school_name}
                        </div>
                      )}
                    </div>

                    {entry.verification_method && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Verification:</span>{" "}
                        {entry.verification_method === "signature" && "Physical signature"}
                        {entry.verification_method === "digital" && "Digital signature"}
                        {entry.verification_method === "email" && "Email verification"}
                      </div>
                    )}

                    {entry.status === "verified" && entry.excused_absence_pdf_url && (
                      <div className="mt-3">
                        <button
                          onClick={() => downloadExcusedAbsence(entry.id)}
                          className="inline-flex items-center gap-2 px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
                        >
                          <FileText size={14} />
                          Download Excused Absence PDF
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="text-right text-sm text-gray-500">
                    Submitted {new Date(entry.submitted_at).toLocaleDateString()}
                    {entry.verified_at && (
                      <div className="text-green-600">
                        Verified {new Date(entry.verified_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">How Hours Logging Works</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Log hours immediately after presentations using timestamps</li>
          <li>• Hours are automatically calculated or can be manually adjusted</li>
          <li>• Teacher verification required for excused absences</li>
          <li>• Download official excused absence PDFs once verified</li>
        </ul>
      </div>
    </div>
  );
}
