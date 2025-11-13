"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, CheckCircle2, XCircle, Plus, MessageSquare } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface PresentationRequest {
  id: number;
  school_id: number | null;
  topic: string | null;
  scheduled_date: string | null;
  status: string;
  volunteer_team_id: number | null;
  student_count: number | null;
  school: {
    name: string;
    email: string;
  } | null;
}

export default function TeacherDashboardPage() {
  const supabase = createClientComponentClient();
  const [requests, setRequests] = useState<PresentationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      setUserEmail(session.user.email || null);

      // Get school associated with teacher's email
      const { data: school } = await supabase
        .from("schools")
        .select("id")
        .eq("email", session.user.email)
        .single();

      if (school) {
        // Get presentations for this school
        const { data: pres, error } = await supabase
          .from("presentations")
          .select(`
            *,
            school:schools(id, name, email)
          `)
          .eq("school_id", school.id)
          .order("scheduled_date", { ascending: false });

        if (error) throw error;
        setRequests((pres || []) as any);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-4 h-4" />;
      case "scheduled":
        return <Calendar className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="container py-14">
        <div className="text-center py-12 text-gsv-gray">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container py-14">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gsv-charcoal mb-2">Teacher Dashboard</h1>
          <p className="text-gsv-gray">
            Manage your presentation requests and view scheduled sessions
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <Link
            href="/teachers/request"
            className="card p-6 hover:shadow-lg transition text-center"
          >
            <Plus className="w-8 h-8 text-gsv-green mx-auto mb-2" />
            <h3 className="font-semibold text-gsv-charcoal">Request Presentation</h3>
            <p className="text-sm text-gsv-gray mt-1">Schedule a new GSV presentation</p>
          </Link>
          <Link
            href="/teachers/history"
            className="card p-6 hover:shadow-lg transition text-center"
          >
            <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <h3 className="font-semibold text-gsv-charcoal">View History</h3>
            <p className="text-sm text-gsv-gray mt-1">See past presentations</p>
          </Link>
          <div className="card p-6 text-center">
            <MessageSquare className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <h3 className="font-semibold text-gsv-charcoal">Contact Support</h3>
            <p className="text-sm text-gsv-gray mt-1">Get help with requests</p>
          </div>
        </div>

        {/* Upcoming Presentations */}
        <div className="card p-6 mb-6">
          <h2 className="text-xl font-semibold text-gsv-charcoal mb-4">Upcoming Presentations</h2>
          {requests.filter(r => r.status === "scheduled" && r.scheduled_date && new Date(r.scheduled_date) > new Date()).length === 0 ? (
            <div className="text-center py-8 text-gsv-gray">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p>No upcoming presentations scheduled</p>
              <Link href="/teachers/request" className="text-gsv-green hover:underline mt-2 inline-block">
                Request a presentation →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {requests
                .filter(r => r.status === "scheduled" && r.scheduled_date && new Date(r.scheduled_date) > new Date())
                .map((request) => (
                  <div
                    key={request.id}
                    className="border rounded-lg p-4 hover:shadow-md transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gsv-charcoal">
                            {request.topic || "Presentation"}
                          </h3>
                          <span className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 ${getStatusColor(request.status)}`}>
                            {getStatusIcon(request.status)}
                            {request.status}
                          </span>
                        </div>
                        {request.scheduled_date && (
                          <p className="text-sm text-gsv-gray flex items-center gap-1 mb-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(request.scheduled_date).toLocaleDateString()} at {new Date(request.scheduled_date).toLocaleTimeString()}
                          </p>
                        )}
                        {request.student_count && (
                          <p className="text-sm text-gsv-gray">
                            Expected students: {request.student_count}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Recent Requests */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gsv-charcoal mb-4">Recent Requests</h2>
          {requests.length === 0 ? (
            <div className="text-center py-8 text-gsv-gray">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p>No presentation requests yet</p>
              <Link href="/teachers/request" className="text-gsv-green hover:underline mt-2 inline-block">
                Make your first request →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.slice(0, 10).map((request) => (
                <div
                  key={request.id}
                  className="border rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gsv-charcoal">
                          {request.topic || "Presentation Request"}
                        </h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 ${getStatusColor(request.status)}`}>
                          {getStatusIcon(request.status)}
                          {request.status}
                        </span>
                      </div>
                      {request.scheduled_date && (
                        <p className="text-sm text-gsv-gray flex items-center gap-1 mb-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(request.scheduled_date).toLocaleDateString()}
                        </p>
                      )}
                      {request.school && (
                        <p className="text-sm text-gsv-gray">
                          School: {request.school.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

