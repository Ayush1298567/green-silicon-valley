"use client";
import { useState, useEffect } from "react";
import { MapPin, Users, TrendingUp, Award, Globe, Calendar, Target, BarChart3 } from "lucide-react";

interface Chapter {
  id: string;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  status: 'active' | 'forming' | 'planned';
  foundedDate: string;
  memberCount: number;
  schoolsServed: number;
  presentationsDelivered: number;
  growthMetrics: {
    monthlyGrowth: number;
    schoolsAdded: number;
    presentationsCompleted: number;
  };
}

interface GrowthMilestone {
  year: number;
  chapters: number;
  schools: number;
  presentations: number;
  members: number;
  description: string;
}

export default function ChapterGrowthPage() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [mapView, setMapView] = useState<'national' | 'international'>('national');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChapters();
  }, []);

  const loadChapters = async () => {
    try {
      const response = await fetch('/api/chapters/growth');
      if (response.ok) {
        const data = await response.json();
        setChapters(data.chapters || []);
      }
    } catch (error) {
      console.error('Error loading chapters:', error);
    } finally {
      setLoading(false);
    }
  };

  const growthMilestones: GrowthMilestone[] = [
    {
      year: 2021,
      chapters: 1,
      schools: 12,
      presentations: 48,
      members: 25,
      description: "Founded in Silicon Valley with initial school partnerships"
    },
    {
      year: 2022,
      chapters: 3,
      schools: 35,
      presentations: 156,
      members: 85,
      description: "Expanded to Bay Area and Sacramento regions"
    },
    {
      year: 2023,
      chapters: 8,
      schools: 89,
      presentations: 445,
      members: 234,
      description: "Major expansion across California with teacher training program launch"
    },
    {
      year: 2024,
      chapters: 15,
      schools: 167,
      presentations: 892,
      members: 456,
      description: "National expansion begins with partnerships in Arizona and Nevada"
    },
    {
      year: 2025,
      chapters: 25,
      schools: 312,
      presentations: 1456,
      members: 789,
      description: "Projected: International chapters and comprehensive curriculum rollout"
    }
  ];

  // Sample chapter data - in production this would come from the API
  const sampleChapters: Chapter[] = [
    // California (Primary)
    {
      id: '1',
      name: 'Silicon Valley Chapter',
      location: 'San Jose, CA',
      latitude: 37.3382,
      longitude: -122.0453,
      status: 'active',
      foundedDate: '2021-01-15',
      memberCount: 156,
      schoolsServed: 45,
      presentationsDelivered: 234,
      growthMetrics: {
        monthlyGrowth: 12,
        schoolsAdded: 3,
        presentationsCompleted: 18
      }
    },
    {
      id: '2',
      name: 'Bay Area North Chapter',
      location: 'San Francisco, CA',
      latitude: 37.7749,
      longitude: -122.4194,
      status: 'active',
      foundedDate: '2021-08-20',
      memberCount: 98,
      schoolsServed: 32,
      presentationsDelivered: 156,
      growthMetrics: {
        monthlyGrowth: 8,
        schoolsAdded: 2,
        presentationsCompleted: 12
      }
    },
    {
      id: '3',
      name: 'Sacramento Valley Chapter',
      location: 'Sacramento, CA',
      latitude: 38.5816,
      longitude: -121.4944,
      status: 'active',
      foundedDate: '2022-03-10',
      memberCount: 67,
      schoolsServed: 28,
      presentationsDelivered: 134,
      growthMetrics: {
        monthlyGrowth: 6,
        schoolsAdded: 1,
        presentationsCompleted: 9
      }
    },
    {
      id: '4',
      name: 'Los Angeles Chapter',
      location: 'Los Angeles, CA',
      latitude: 34.0522,
      longitude: -118.2437,
      status: 'active',
      foundedDate: '2022-09-15',
      memberCount: 123,
      schoolsServed: 38,
      presentationsDelivered: 189,
      growthMetrics: {
        monthlyGrowth: 15,
        schoolsAdded: 4,
        presentationsCompleted: 22
      }
    },
    {
      id: '5',
      name: 'San Diego Chapter',
      location: 'San Diego, CA',
      latitude: 32.7157,
      longitude: -117.1611,
      status: 'active',
      foundedDate: '2023-01-20',
      memberCount: 89,
      schoolsServed: 31,
      presentationsDelivered: 145,
      growthMetrics: {
        monthlyGrowth: 10,
        schoolsAdded: 2,
        presentationsCompleted: 14
      }
    },
    // Southwest Expansion
    {
      id: '6',
      name: 'Phoenix Chapter',
      location: 'Phoenix, AZ',
      latitude: 33.4484,
      longitude: -112.0740,
      status: 'forming',
      foundedDate: '2024-02-15',
      memberCount: 23,
      schoolsServed: 8,
      presentationsDelivered: 24,
      growthMetrics: {
        monthlyGrowth: 4,
        schoolsAdded: 1,
        presentationsCompleted: 3
      }
    },
    {
      id: '7',
      name: 'Las Vegas Chapter',
      location: 'Las Vegas, NV',
      latitude: 36.1699,
      longitude: -115.1398,
      status: 'forming',
      foundedDate: '2024-03-01',
      memberCount: 18,
      schoolsServed: 6,
      presentationsDelivered: 18,
      growthMetrics: {
        monthlyGrowth: 3,
        schoolsAdded: 1,
        presentationsCompleted: 2
      }
    },
    // Planned Expansion
    {
      id: '8',
      name: 'Seattle Chapter',
      location: 'Seattle, WA',
      latitude: 47.6062,
      longitude: -122.3321,
      status: 'planned',
      foundedDate: '2025-01-01',
      memberCount: 0,
      schoolsServed: 0,
      presentationsDelivered: 0,
      growthMetrics: {
        monthlyGrowth: 0,
        schoolsAdded: 0,
        presentationsCompleted: 0
      }
    },
    {
      id: '9',
      name: 'Austin Chapter',
      location: 'Austin, TX',
      latitude: 30.2672,
      longitude: -97.7431,
      status: 'planned',
      foundedDate: '2025-03-01',
      memberCount: 0,
      schoolsServed: 0,
      presentationsDelivered: 0,
      growthMetrics: {
        monthlyGrowth: 0,
        schoolsAdded: 0,
        presentationsCompleted: 0
      }
    },
    {
      id: '10',
      name: 'Vancouver Chapter',
      location: 'Vancouver, BC, Canada',
      latitude: 49.2827,
      longitude: -123.1207,
      status: 'planned',
      foundedDate: '2025-06-01',
      memberCount: 0,
      schoolsServed: 0,
      presentationsDelivered: 0,
      growthMetrics: {
        monthlyGrowth: 0,
        schoolsAdded: 0,
        presentationsCompleted: 0
      }
    }
  ];

  useEffect(() => {
    // Simulate loading chapter data
    setTimeout(() => {
      setChapters(sampleChapters);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredChapters = mapView === 'international'
    ? chapters.filter(chapter => !chapter.location.includes('CA'))
    : chapters.filter(chapter => chapter.location.includes('CA'));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'forming': return 'bg-yellow-100 text-yellow-800';
      case 'planned': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Award className="w-4 h-4" />;
      case 'forming': return <TrendingUp className="w-4 h-4" />;
      case 'planned': return <Calendar className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  const totalStats = {
    chapters: chapters.filter(c => c.status === 'active').length,
    forming: chapters.filter(c => c.status === 'forming').length,
    planned: chapters.filter(c => c.status === 'planned').length,
    schools: chapters.reduce((sum, c) => sum + c.schoolsServed, 0),
    presentations: chapters.reduce((sum, c) => sum + c.presentationsDelivered, 0),
    members: chapters.reduce((sum, c) => sum + c.memberCount, 0)
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
              Chapter Growth Map
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8">
              Our expanding network of environmental STEM education
            </p>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 max-w-2xl mx-auto">
              <p className="text-white/90">
                Watch as Green Silicon Valley grows from a single Silicon Valley chapter
                to a nationwide and international network of environmental STEM educators.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Overview */}
      <section className="py-16 bg-white border-b">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gsv-green mb-1">{totalStats.chapters}</div>
                <p className="text-sm text-gray-600">Active Chapters</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600 mb-1">{totalStats.forming}</div>
                <p className="text-sm text-gray-600">Forming</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600 mb-1">{totalStats.planned}</div>
                <p className="text-sm text-gray-600">Planned</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">{totalStats.schools}</div>
                <p className="text-sm text-gray-600">Schools Served</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 mb-1">{totalStats.presentations}</div>
                <p className="text-sm text-gray-600">Presentations</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 mb-1">{totalStats.members}</div>
                <p className="text-sm text-gray-600">Members</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map View Toggle */}
      <section className="py-8 bg-white">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setMapView('national')}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  mapView === 'national'
                    ? 'bg-gsv-green text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                National Focus
              </button>
              <button
                onClick={() => setMapView('international')}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  mapView === 'international'
                    ? 'bg-gsv-green text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                International Expansion
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Map Visualization */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {mapView === 'national' ? 'National Chapter Network' : 'International Expansion'}
              </h2>
              <p className="text-lg text-gray-600">
                {mapView === 'national'
                  ? 'Our growing presence across the United States'
                  : 'Planned expansion beyond our borders'
                }
              </p>
            </div>

            {/* Simple map visualization - in production, this would be an interactive map */}
            <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
              <div className="aspect-video bg-gradient-to-br from-blue-50 to-green-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <Globe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Interactive Map</h3>
                  <p className="text-gray-600">
                    Interactive map showing chapter locations and growth metrics
                    <br />
                    <span className="text-sm text-gray-500">(Map integration coming soon)</span>
                  </p>
                </div>
              </div>

              {/* Chapter markers simulation */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-6">
                {filteredChapters.map((chapter) => (
                  <div
                    key={chapter.id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedChapter?.id === chapter.id
                        ? 'border-gsv-green bg-green-50'
                        : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                    }`}
                    onClick={() => setSelectedChapter(chapter)}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(chapter.status)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(chapter.status)}`}>
                        {chapter.status}
                      </span>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">{chapter.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">{chapter.location}</p>
                    <div className="text-xs text-gray-500">
                      {chapter.memberCount} members • {chapter.schoolsServed} schools
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Chapter Details */}
      {selectedChapter && (
        <section className="py-16 bg-white">
          <div className="container">
            <div className="max-w-4xl mx-auto">
              <div className="bg-gray-50 rounded-lg p-8">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedChapter.name}</h3>
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-gray-600" />
                      <span className="text-gray-700">{selectedChapter.location}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className={`px-2 py-1 rounded-full ${getStatusColor(selectedChapter.status)}`}>
                        {selectedChapter.status}
                      </span>
                      <span>Founded {new Date(selectedChapter.foundedDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gsv-green">{selectedChapter.memberCount}</div>
                    <div className="text-sm text-gray-600">Active Members</div>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-white rounded-lg p-4 text-center">
                    <div className="text-xl font-bold text-blue-600 mb-1">{selectedChapter.schoolsServed}</div>
                    <p className="text-sm text-gray-600">Schools Served</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center">
                    <div className="text-xl font-bold text-purple-600 mb-1">{selectedChapter.presentationsDelivered}</div>
                    <p className="text-sm text-gray-600">Presentations Delivered</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center">
                    <div className="text-xl font-bold text-green-600 mb-1">+{selectedChapter.growthMetrics.monthlyGrowth}</div>
                    <p className="text-sm text-gray-600">Monthly Growth</p>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Recent Growth</h4>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-green-600">+{selectedChapter.growthMetrics.schoolsAdded}</div>
                      <div className="text-xs text-gray-600">Schools Added</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-blue-600">+{selectedChapter.growthMetrics.presentationsCompleted}</div>
                      <div className="text-xs text-gray-600">Presentations This Month</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-purple-600">+{selectedChapter.growthMetrics.monthlyGrowth}%</div>
                      <div className="text-xs text-gray-600">Member Growth</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Growth Timeline */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Growth Journey</h2>
              <p className="text-lg text-gray-600">
                From local impact to national movement
              </p>
            </div>

            <div className="space-y-8">
              {growthMilestones.map((milestone, index) => (
                <div key={milestone.year} className="flex gap-8">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gsv-green rounded-full flex items-center justify-center text-white font-bold">
                      {milestone.year}
                    </div>
                    {index < growthMilestones.length - 1 && (
                      <div className="w-0.5 bg-gsv-green h-16 mx-auto mt-4"></div>
                    )}
                  </div>

                  <div className="flex-1 bg-white rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{milestone.year}: {milestone.description}</h3>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-xl font-bold text-gsv-green">{milestone.chapters}</div>
                        <div className="text-sm text-gray-600">Chapters</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-blue-600">{milestone.schools}</div>
                        <div className="text-sm text-gray-600">Schools</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-purple-600">{milestone.presentations}</div>
                        <div className="text-sm text-gray-600">Presentations</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-orange-600">{milestone.members}</div>
                        <div className="text-sm text-gray-600">Members</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Future Goals */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Vision for 2030</h2>
              <p className="text-lg text-gray-600">
                Scaling environmental STEM education nationwide and beyond
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">50 Chapters</h3>
                <p className="text-gray-600">
                  Active chapters across the United States and Canada, bringing environmental STEM education to communities nationwide.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">10,000 Students</h3>
                <p className="text-gray-600">
                  Reaching over 10,000 students annually with hands-on environmental science education and climate action projects.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Global Impact</h3>
                <p className="text-gray-600">
                  Measuring and demonstrating the real-world impact of environmental education on student outcomes and community action.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gsv-green/5">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Join the Movement</h2>
            <p className="text-lg text-gray-600 mb-8">
              Help us expand environmental STEM education to more schools and communities
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/get-involved/volunteer"
                className="bg-gsv-green text-white px-8 py-3 rounded-lg hover:bg-gsv-greenDark transition-colors font-medium"
              >
                Start a Chapter
              </a>
              <a
                href="/partners/inquiry"
                className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Partner With Us
              </a>
              <a
                href="/support-a-school"
                className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Support Growth
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
