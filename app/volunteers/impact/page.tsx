"use client";
import { useState, useEffect } from "react";
import { Trophy, Users, Clock, Target, Award, Star, TrendingUp } from "lucide-react";

interface VolunteerStats {
  totalVolunteers: number;
  totalPresentations: number;
  totalStudentsReached: number;
  totalHours: number;
}

interface TopVolunteer {
  id: string;
  name: string;
  presentationsCount: number;
  hoursLogged: number;
  studentsReached: number;
  teams: string[];
  joinDate: string;
}

interface RecentTeam {
  id: string;
  name: string;
  location: string;
  presentationsCompleted: number;
  members: number;
  lastPresentation: string;
}

export default function VolunteerImpactPage() {
  const [stats, setStats] = useState<VolunteerStats>({
    totalVolunteers: 0,
    totalPresentations: 0,
    totalStudentsReached: 0,
    totalHours: 0,
  });
  const [topVolunteers, setTopVolunteers] = useState<TopVolunteer[]>([]);
  const [recentTeams, setRecentTeams] = useState<RecentTeam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadImpactData();
  }, []);

  const loadImpactData = async () => {
    try {
      const [statsResponse, volunteersResponse, teamsResponse] = await Promise.all([
        fetch('/api/volunteers/impact/stats'),
        fetch('/api/volunteers/impact/top-volunteers'),
        fetch('/api/volunteers/impact/recent-teams')
      ]);

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.stats);
      }

      if (volunteersResponse.ok) {
        const volunteersData = await volunteersResponse.json();
        setTopVolunteers(volunteersData.volunteers || []);
      }

      if (teamsResponse.ok) {
        const teamsData = await teamsResponse.json();
        setRecentTeams(teamsData.teams || []);
      }
    } catch (error) {
      console.error('Error loading impact data:', error);
    } finally {
      setLoading(false);
    }
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
              Volunteer Impact
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8">
              Celebrating the amazing work of our student volunteers
            </p>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 max-w-2xl mx-auto">
              <p className="text-white/90">
                Our volunteers don't just participate—they make a real difference.
                See the impact of their dedication to environmental education.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Overview */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Impact So Far</h2>
              <p className="text-lg text-gray-600">
                Numbers that show the difference our volunteers are making
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {stats.totalVolunteers.toLocaleString()}
                </div>
                <p className="text-gray-600">Active Volunteers</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-green-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {stats.totalPresentations.toLocaleString()}
                </div>
                <p className="text-gray-600">Presentations Delivered</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {stats.totalStudentsReached.toLocaleString()}
                </div>
                <p className="text-gray-600">Students Reached</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-orange-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {stats.totalHours.toLocaleString()}
                </div>
                <p className="text-gray-600">Volunteer Hours</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Top Volunteers */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Top Volunteers</h2>
              <p className="text-lg text-gray-600">
                Recognizing our most dedicated and impactful volunteers
              </p>
            </div>

            {topVolunteers.length === 0 ? (
              <div className="text-center py-8">
                <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Volunteer impact data coming soon!</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {topVolunteers.map((volunteer, index) => (
                  <div
                    key={volunteer.id}
                    className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gsv-green rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">#{index + 1}</span>
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">{volunteer.name}</h3>
                          <p className="text-sm text-gray-600">
                            Joined {new Date(volunteer.joinDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Trophy className="w-6 h-6 text-yellow-500" />
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Presentations</span>
                        <span className="font-semibold text-gsv-green">{volunteer.presentationsCount}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Students Reached</span>
                        <span className="font-semibold text-gsv-green">{volunteer.studentsReached}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Hours Logged</span>
                        <span className="font-semibold text-gsv-green">{volunteer.hoursLogged}h</span>
                      </div>
                    </div>

                    {volunteer.teams.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-gray-700 mb-2">Teams:</p>
                        <div className="flex flex-wrap gap-1">
                          {volunteer.teams.slice(0, 2).map((team, teamIndex) => (
                            <span
                              key={teamIndex}
                              className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                            >
                              {team}
                            </span>
                          ))}
                          {volunteer.teams.length > 2 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                              +{volunteer.teams.length - 2} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Recent Teams */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Active Teams</h2>
              <p className="text-lg text-gray-600">
                Teams making a difference in their communities
              </p>
            </div>

            {recentTeams.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Team data coming soon!</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentTeams.map((team) => (
                  <div
                    key={team.id}
                    className="bg-gray-50 rounded-lg p-6 hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-gray-200"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-gray-900 mb-1">{team.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>{team.location}</span>
                        </div>
                      </div>
                      <div className="bg-gsv-green/10 text-gsv-green px-3 py-1 rounded-full text-xs font-medium">
                        {team.members} members
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Presentations Completed</span>
                        <span className="font-semibold text-gsv-green">{team.presentationsCompleted}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-3">
                        Last active: {new Date(team.lastPresentation).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gsv-green/5">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Join the Impact</h2>
            <p className="text-lg text-gray-600 mb-8">
              Ready to make a difference? Join our volunteer community and be part of the solution.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/get-involved/volunteer"
                className="bg-gsv-green text-white px-8 py-3 rounded-lg hover:bg-gsv-greenDark transition-colors font-medium"
              >
                Become a Volunteer
              </a>
              <a
                href="/get-involved/open-teams"
                className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Browse Open Teams
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
