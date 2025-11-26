"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { MapPin, Users, Calendar, CheckCircle, Clock, Target } from "lucide-react";

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

export default function OpenTeamsPage() {
  const [teams, setTeams] = useState<OpenTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState<OpenTeam | null>(null);

  useEffect(() => {
    loadOpenTeams();
  }, []);

  const loadOpenTeams = async () => {
    try {
      const response = await fetch('/api/volunteers/open-teams');
      if (response.ok) {
        const data = await response.json();
        setTeams(data.teams || []);
      }
    } catch (error) {
      console.error('Error loading open teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRequest = async (teamId: string) => {
    // Redirect to volunteer signup with team preference
    window.location.href = `/get-involved/volunteer?joinTeam=${teamId}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gsv-green"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gsv-green via-gsv-greenDark to-gsv-slate-900 text-white py-20">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Join an Existing Team
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8">
              Find and join a volunteer team that's already formed and ready to present
            </p>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 max-w-2xl mx-auto">
              <p className="text-white/90 text-lg">
                Browse available teams, learn about their focus areas, and submit a join request.
                Teams review applications and accept members based on fit and availability.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Teams Grid */}
      <section className="py-16">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Available Teams</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                These teams are actively looking for new members. Each team has specific focus areas,
                meeting schedules, and presentation styles.
              </p>
            </div>

            {teams.length === 0 ? (
              <div className="text-center py-16">
                <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Open Teams Currently</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  There are no teams currently looking for new members. Check back later or consider starting your own team.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/get-involved/volunteer"
                    className="bg-gsv-green text-white px-6 py-3 rounded-lg hover:bg-gsv-greenDark transition-colors font-medium"
                  >
                    Apply as Individual Volunteer
                  </Link>
                  <Link
                    href="/start-here"
                    className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Learn More About Volunteering
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {teams.map((team) => (
                  <div
                    key={team.id}
                    className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">{team.teamName}</h3>
                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="w-4 h-4" />
                            <span className="text-sm">{team.location}</span>
                          </div>
                        </div>
                        <div className="bg-gsv-green/10 text-gsv-green px-3 py-1 rounded-full text-xs font-medium">
                          Open
                        </div>
                      </div>

                      <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Users className="w-4 h-4" />
                          <span>{team.currentMembers} / {team.maxMembers} members</span>
                        </div>

                        {team.meetingSchedule && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>{team.meetingSchedule}</span>
                          </div>
                        )}

                        {team.presentationExperience && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Target className="w-4 h-4" />
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
                        className="w-full bg-gsv-green text-white py-3 px-4 rounded-lg hover:bg-gsv-greenDark transition-colors font-medium"
                      >
                        Request to Join Team
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">How Team Joining Works</h2>
              <p className="text-lg text-gray-600">
                A simple process to find your perfect team match
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Browse Teams</h3>
                <p className="text-gray-600 text-sm">Review available teams and their focus areas</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Submit Request</h3>
                <p className="text-gray-600 text-sm">Apply to join with your background and interests</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-yellow-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Admin Review</h3>
                <p className="text-gray-600 text-sm">Our team reviews your application for fit</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Team Decision</h3>
                <p className="text-gray-600 text-sm">Team reviews and accepts or declines your request</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gsv-green/5">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Don't See a Good Fit?</h2>
            <p className="text-lg text-gray-600 mb-8">
              No problem! You can still apply as an individual volunteer and we'll help you find or form the perfect team.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/get-involved/volunteer"
                className="bg-gsv-green text-white px-8 py-3 rounded-lg hover:bg-gsv-greenDark transition-colors font-medium"
              >
                Apply as Individual Volunteer
              </Link>
              <Link
                href="/how-it-works"
                className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Learn More About the Process
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
