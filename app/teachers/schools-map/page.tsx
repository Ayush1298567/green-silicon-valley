"use client";
import { useState, useEffect } from "react";
import { MapPin, School, Users, Calendar, Star } from "lucide-react";

interface SchoolLocation {
  id: string;
  name: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  presentationsCount: number;
  lastPresentation: string;
  gradeLevels: string[];
  totalStudents: number;
}

export default function SchoolsMapPage() {
  const [schools, setSchools] = useState<SchoolLocation[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<SchoolLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterGrade, setFilterGrade] = useState<string>('all');

  useEffect(() => {
    loadSchoolLocations();
  }, []);

  const loadSchoolLocations = async () => {
    try {
      const response = await fetch('/api/schools/locations');
      if (response.ok) {
        const data = await response.json();
        setSchools(data.schools || []);
      }
    } catch (error) {
      console.error('Error loading school locations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Sample data for demonstration - in production this would come from the API
  const sampleSchools: SchoolLocation[] = [
    {
      id: '1',
      name: 'Palo Alto High School',
      city: 'Palo Alto',
      state: 'CA',
      latitude: 37.4419,
      longitude: -122.1430,
      presentationsCount: 8,
      lastPresentation: '2024-01-15',
      gradeLevels: ['9-12'],
      totalStudents: 2100
    },
    {
      id: '2',
      name: 'Mountain View Middle School',
      city: 'Mountain View',
      state: 'CA',
      latitude: 37.3861,
      longitude: -122.0839,
      presentationsCount: 12,
      lastPresentation: '2024-01-20',
      gradeLevels: ['6-8'],
      totalStudents: 950
    },
    {
      id: '3',
      name: 'Sunnyvale Elementary',
      city: 'Sunnyvale',
      state: 'CA',
      latitude: 37.3688,
      longitude: -122.0363,
      presentationsCount: 15,
      lastPresentation: '2024-01-10',
      gradeLevels: ['3-5'],
      totalStudents: 620
    },
    {
      id: '4',
      name: 'Los Altos High School',
      city: 'Los Altos',
      state: 'CA',
      latitude: 37.3852,
      longitude: -122.1141,
      presentationsCount: 6,
      lastPresentation: '2023-12-18',
      gradeLevels: ['9-12'],
      totalStudents: 1850
    },
    {
      id: '5',
      name: 'Cupertino Middle School',
      city: 'Cupertino',
      state: 'CA',
      latitude: 37.3230,
      longitude: -122.0322,
      presentationsCount: 9,
      lastPresentation: '2024-01-08',
      gradeLevels: ['6-8'],
      totalStudents: 1100
    }
  ];

  useEffect(() => {
    // Simulate loading school data
    setTimeout(() => {
      setSchools(sampleSchools);
      setLoading(false);
    }, 1000);
  }, []);

  const gradeLevels = ['3-5', '6-8', '9-12'];
  const filteredSchools = filterGrade === 'all'
    ? schools
    : schools.filter(school => school.gradeLevels.includes(filterGrade));

  const totalPresentations = schools.reduce((sum, school) => sum + school.presentationsCount, 0);
  const totalStudents = schools.reduce((sum, school) => sum + school.totalStudents, 0);

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
              Schools We've Worked With
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8">
              See the impact of environmental STEM education across our region
            </p>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 max-w-2xl mx-auto">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">{schools.length}</div>
                  <div className="text-sm text-white/80">Schools</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{totalPresentations}</div>
                  <div className="text-sm text-white/80">Presentations</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{totalStudents.toLocaleString()}</div>
                  <div className="text-sm text-white/80">Students Reached</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters and Map */}
      <section className="py-16">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            {/* Filter */}
            <div className="mb-8">
              <div className="flex flex-wrap gap-3 justify-center">
                <button
                  onClick={() => setFilterGrade('all')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filterGrade === 'all'
                      ? 'bg-gsv-green text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All Grades
                </button>
                {gradeLevels.map(grade => (
                  <button
                    key={grade}
                    onClick={() => setFilterGrade(grade)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      filterGrade === grade
                        ? 'bg-gsv-green text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Grades {grade}
                  </button>
                ))}
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="bg-white rounded-lg shadow-sm border mb-8">
              <div className="aspect-[16/9] bg-gray-100 rounded-t-lg flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Interactive Schools Map</h3>
                  <p className="text-gray-600 max-w-md">
                    An interactive map showing all schools we've partnered with would be displayed here.
                    Click on school markers to see details and presentation history.
                  </p>
                </div>
              </div>

              {/* Map Legend */}
              <div className="p-6 border-t">
                <div className="flex items-center justify-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Elementary (3-5)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Middle School (6-8)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">High School (9-12)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Schools List */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSchools.map((school) => (
                <div
                  key={school.id}
                  className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedSchool(school)}
                >
                  <div className="flex items-start gap-3 mb-4">
                    <School className="w-8 h-8 text-gsv-green flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">{school.name}</h3>
                      <p className="text-sm text-gray-600">{school.city}, {school.state}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>{school.totalStudents.toLocaleString()} students</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Star className="w-4 h-4" />
                      <span>{school.presentationsCount} presentations</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>Last: {new Date(school.lastPresentation).toLocaleDateString()}</span>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-3">
                      {school.gradeLevels.map(grade => (
                        <span
                          key={grade}
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            grade === '3-5' ? 'bg-blue-100 text-blue-800' :
                            grade === '6-8' ? 'bg-green-100 text-green-800' :
                            'bg-purple-100 text-purple-800'
                          }`}
                        >
                          Grades {grade}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* School Detail Modal */}
      {selectedSchool && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <School className="w-8 h-8 text-gsv-green flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{selectedSchool.name}</h3>
                    <p className="text-gray-600">{selectedSchool.city}, {selectedSchool.state}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedSchool(null)}
                  className="text-gray-400 hover:text-gray-600 p-2"
                >
                  <span className="text-2xl">&times;</span>
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-blue-900">{selectedSchool.totalStudents.toLocaleString()}</div>
                    <div className="text-sm text-blue-700">Students</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-green-900">{selectedSchool.presentationsCount}</div>
                    <div className="text-sm text-green-700">Presentations</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Grade Levels</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedSchool.gradeLevels.map(grade => (
                      <span
                        key={grade}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          grade === '3-5' ? 'bg-blue-100 text-blue-800' :
                          grade === '6-8' ? 'bg-green-100 text-green-800' :
                          'bg-purple-100 text-purple-800'
                        }`}
                      >
                        Grades {grade}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Last Presentation</h4>
                  <p className="text-gray-600">
                    {new Date(selectedSchool.lastPresentation).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>

                <div className="pt-4 border-t">
                  <button
                    onClick={() => setSelectedSchool(null)}
                    className="w-full bg-gsv-green text-white py-3 px-4 rounded-lg hover:bg-gsv-greenDark transition-colors font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Call to Action */}
      <section className="py-16 bg-gsv-green/5">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Join Our Partner Schools</h2>
            <p className="text-lg text-gray-600 mb-8">
              Bring free environmental STEM education to your school
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/teachers/request"
                className="bg-gsv-green text-white px-8 py-3 rounded-lg hover:bg-gsv-greenDark transition-colors font-medium"
              >
                Request a Presentation
              </a>
              <a
                href="/contact"
                className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
