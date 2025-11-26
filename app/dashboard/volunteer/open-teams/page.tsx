"use client";
import { useState, useEffect } from "react";
import { MapPin, Users, Calendar, CheckCircle, Clock, AlertCircle, Plus } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface OpenTeam {
  id: string;
  teamName: string;
  location: string;
  maxMembers: number;
  currentMembers: number;
  description: string;
  requirements: string;
  meetingSchedule?: string;
  presentationExperience?: string;
}

interface JoinRequest {
  id: string;
  teamId: string;
  teamName: string;
  status: 'pending' | 'admin_approved' | 'admin_rejected' | 'team_accepted' | 'team_declined' | 'accepted' | 'declined';
  submittedAt: string;
  adminReviewedAt?: string;
  teamRespondedAt?: string;
  teamResponse?: string;
}

export default function VolunteerOpenTeamsPage() {
  const [teams, setTeams] = useState<OpenTeam[]>([]);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'browse' | 'requests'>('browse');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [teamsResponse, requestsResponse] = await Promise.all([
        fetch('/api/volunteers/open-teams'),
        fetch('/api/volunteers/join-requests')
      ]);

      if (teamsResponse.ok) {
        const teamsData = await teamsResponse.json();
        setTeams(teamsData.teams || []);
      }

      if (requestsResponse.ok) {
        const requestsData = await requestsResponse.json();
        setJoinRequests(requestsData.requests || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load team data');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRequest = async (teamId: string) => {
    try {
      const response = await fetch('/api/volunteers/join-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId }),
      });

      if (response.ok) {
        toast.success('Join request submitted successfully!');
        loadData(); // Refresh data to show the new request
        setActiveTab('requests'); // Switch to requests tab
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to submit join request');
      }
    } catch (error) {
      console.error('Error submitting join request:', error);
      toast.error('Failed to submit join request');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'admin_approved':
        return 'bg-blue-100 text-blue-800';
      case 'admin_rejected':
        return 'bg-red-100 text-red-800';
      case 'team_accepted':
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'team_declined':
      case 'declined':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending Admin Review';
      case 'admin_approved':
        return 'Approved - Awaiting Team Response';
      case 'admin_rejected':
        return 'Rejected by Admin';
      case 'team_accepted':
        return 'Accepted by Team';
      case 'team_declined':
        return 'Declined by Team';
      case 'accepted':
        return 'Accepted';
      case 'declined':
        return 'Declined';
      default:
        return status;
    }
  };

  const hasPendingRequest = (teamId: string) => {
    return joinRequests.some(req =>
      req.teamId === teamId &&
      ['pending', 'admin_approved'].includes(req.status)
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gsv-green"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Open Teams</h1>
          <p className="text-gray-600">Browse available teams and manage your join requests</p>
        </div>
        <Link
          href="/get-involved/volunteer"
          className="bg-gsv-green text-white px-4 py-2 rounded-lg hover:bg-gsv-greenDark transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Apply as Individual
        </Link>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('browse')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'browse'
                ? 'border-gsv-green text-gsv-green'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Browse Teams ({teams.length})
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'requests'
                ? 'border-gsv-green text-gsv-green'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            My Requests ({joinRequests.length})
          </button>
        </nav>
      </div>

      {/* Browse Teams Tab */}
      {activeTab === 'browse' && (
        <div className="space-y-6">
          {teams.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Open Teams</h3>
              <p className="text-gray-600 mb-6">There are currently no teams looking for new members.</p>
              <Link
                href="/get-involved/volunteer"
                className="bg-gsv-green text-white px-6 py-3 rounded-lg hover:bg-gsv-greenDark transition-colors"
              >
                Apply as Individual Volunteer
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {teams.map((team) => (
                <div
                  key={team.id}
                  className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{team.teamName}</h3>
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{team.location}</span>
                      </div>
                    </div>
                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                      {team.currentMembers} / {team.maxMembers} members
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    {team.meetingSchedule && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{team.meetingSchedule}</span>
                      </div>
                    )}

                    {team.presentationExperience && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4" />
                        <span>{team.presentationExperience}</span>
                      </div>
                    )}
                  </div>

                  <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                    {team.description}
                  </p>

                  {team.requirements && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <p className="text-xs font-medium text-gray-900 mb-1">Requirements:</p>
                      <p className="text-xs text-gray-600">{team.requirements}</p>
                    </div>
                  )}

                  <button
                    onClick={() => handleJoinRequest(team.id)}
                    disabled={hasPendingRequest(team.id)}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                      hasPendingRequest(team.id)
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                        : 'bg-gsv-green text-white hover:bg-gsv-greenDark'
                    }`}
                  >
                    {hasPendingRequest(team.id) ? 'Request Pending' : 'Request to Join'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* My Requests Tab */}
      {activeTab === 'requests' && (
        <div className="space-y-6">
          {joinRequests.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Join Requests</h3>
              <p className="text-gray-600 mb-6">You haven't submitted any team join requests yet.</p>
              <button
                onClick={() => setActiveTab('browse')}
                className="bg-gsv-green text-white px-6 py-3 rounded-lg hover:bg-gsv-greenDark transition-colors"
              >
                Browse Available Teams
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {joinRequests.map((request) => (
                <div
                  key={request.id}
                  className="bg-white rounded-lg shadow-sm border p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{request.teamName}</h3>
                      <p className="text-sm text-gray-600">
                        Submitted {new Date(request.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                      {getStatusText(request.status)}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {request.status === 'admin_approved' && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-900">Approved by Admin</span>
                        </div>
                        <p className="text-sm text-blue-800">
                          Your request has been approved and sent to the team for review.
                          The team will respond within a few days.
                        </p>
                      </div>
                    )}

                    {request.status === 'admin_rejected' && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertCircle className="w-4 h-4 text-red-600" />
                          <span className="text-sm font-medium text-red-900">Rejected by Admin</span>
                        </div>
                        <p className="text-sm text-red-800">
                          Unfortunately, your request was not approved at this time.
                          You can try applying to other teams or as an individual volunteer.
                        </p>
                      </div>
                    )}

                    {(request.status === 'team_accepted' || request.status === 'accepted') && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-green-900">Accepted!</span>
                        </div>
                        <p className="text-sm text-green-800">
                          Congratulations! You've been accepted to join {request.teamName}.
                          Check your email for next steps and team contact information.
                        </p>
                      </div>
                    )}

                    {(request.status === 'team_declined' || request.status === 'declined') && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertCircle className="w-4 h-4 text-gray-600" />
                          <span className="text-sm font-medium text-gray-900">Not Selected</span>
                        </div>
                        <p className="text-sm text-gray-800">
                          The team has decided not to move forward with your application at this time.
                          {request.teamResponse && (
                            <span className="block mt-2 italic">"{request.teamResponse}"</span>
                          )}
                        </p>
                      </div>
                    )}

                    {request.status === 'pending' && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-4 h-4 text-yellow-600" />
                          <span className="text-sm font-medium text-yellow-900">Under Review</span>
                        </div>
                        <p className="text-sm text-yellow-800">
                          Your application is being reviewed by our team. We'll get back to you within 3-5 business days.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
