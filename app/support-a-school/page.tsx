"use client";
import { useState, useEffect } from "react";
import { Heart, Users, BookOpen, Award, MapPin, DollarSign, CheckCircle, Star } from "lucide-react";

interface School {
  id: string;
  name: string;
  location: string;
  gradeLevels: string;
  studentCount: number;
  currentPresentations: number;
  targetPresentations: number;
  description: string;
  needs: string[];
  impact: string;
  isPriority: boolean;
}

interface SponsorshipLevel {
  id: string;
  name: string;
  amount: number;
  description: string;
  benefits: string[];
  popular?: boolean;
}

export default function SupportASchoolPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<SponsorshipLevel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSchools();
  }, []);

  const loadSchools = async () => {
    try {
      const response = await fetch('/api/support/schools');
      if (response.ok) {
        const data = await response.json();
        setSchools(data.schools || []);
      }
    } catch (error) {
      console.error('Error loading schools:', error);
    } finally {
      setLoading(false);
    }
  };

  const sponsorshipLevels: SponsorshipLevel[] = [
    {
      id: 'presentation',
      name: 'Presentation Sponsor',
      amount: 500,
      description: 'Sponsor one complete environmental STEM presentation for a school',
      benefits: [
        'Certificate of sponsorship',
        'School recognition in presentation',
        'Impact report with student photos',
        'Tax deduction receipt'
      ]
    },
    {
      id: 'monthly',
      name: 'Monthly Champion',
      amount: 1000,
      description: 'Support multiple presentations throughout the school year',
      benefits: [
        'All Presentation Sponsor benefits',
        'Monthly impact updates',
        'Priority school selection',
        'Recognition on our website',
        'Invitation to annual celebration'
      ],
      popular: true
    },
    {
      id: 'yearly',
      name: 'Year-Long Partner',
      amount: 5000,
      description: 'Comprehensive support for an entire school year of programming',
      benefits: [
        'All Monthly Champion benefits',
        'Dedicated account manager',
        'Custom impact reports',
        'School naming opportunity',
        'Annual donor appreciation event'
      ]
    },
    {
      id: 'transformational',
      name: 'Transformational Impact',
      amount: 10000,
      description: 'Create lasting change by supporting multiple schools and program expansion',
      benefits: [
        'All Year-Long Partner benefits',
        'Board meeting attendance',
        'Program development input',
        'Legacy recognition',
        'Annual report dedication'
      ]
    }
  ];

  // Sample school data - in production this would come from the API
  const sampleSchools: School[] = [
    {
      id: '1',
      name: 'Riverside Elementary',
      location: 'Riverside, CA',
      gradeLevels: 'K-5',
      studentCount: 450,
      currentPresentations: 2,
      targetPresentations: 6,
      description: 'A diverse elementary school serving a growing community with increasing environmental awareness needs.',
      needs: ['STEM curriculum support', 'Environmental science materials', 'Teacher training'],
      impact: 'Students will gain hands-on experience with local ecosystem monitoring and conservation projects.',
      isPriority: true
    },
    {
      id: '2',
      name: 'Mountain View Middle School',
      location: 'Mountain View, CA',
      gradeLevels: '6-8',
      studentCount: 320,
      currentPresentations: 1,
      targetPresentations: 4,
      description: 'A STEM-focused middle school looking to expand environmental science offerings.',
      needs: ['Advanced environmental monitoring equipment', 'Field trip support', 'Guest speaker series'],
      impact: 'Middle school students will develop advanced environmental research and advocacy skills.',
      isPriority: true
    },
    {
      id: '3',
      name: 'Valley High School',
      location: 'Valley Center, CA',
      gradeLevels: '9-12',
      studentCount: 680,
      currentPresentations: 3,
      targetPresentations: 8,
      description: 'Large comprehensive high school with diverse student population and strong community ties.',
      needs: ['College preparation programs', 'Environmental club support', 'Internship opportunities'],
      impact: 'High school students will be prepared for environmental science careers and higher education.',
      isPriority: false
    },
    {
      id: '4',
      name: 'Oak Grove Elementary',
      location: 'Oak Grove, CA',
      gradeLevels: 'K-5',
      studentCount: 280,
      currentPresentations: 0,
      targetPresentations: 4,
      description: 'Small community school focused on project-based learning and environmental stewardship.',
      needs: ['Basic environmental education materials', 'Outdoor learning space development', 'Parent education programs'],
      impact: 'Young students will develop foundational environmental awareness and stewardship habits.',
      isPriority: false
    },
    {
      id: '5',
      name: 'Pine Ridge Charter School',
      location: 'Pine Ridge, CA',
      gradeLevels: 'K-8',
      studentCount: 200,
      currentPresentations: 1,
      targetPresentations: 3,
      description: 'Small charter school with emphasis on environmental and outdoor education.',
      needs: ['Curriculum development', 'Outdoor equipment', 'Teacher professional development'],
      impact: 'Students will engage deeply with local environmental issues and develop leadership skills.',
      isPriority: false
    },
    {
      id: '6',
      name: 'Desert Springs Academy',
      location: 'Desert Springs, CA',
      gradeLevels: '6-12',
      gradeLevels: '6-12',
      studentCount: 420,
      currentPresentations: 2,
      targetPresentations: 5,
      description: 'Regional academy serving multiple communities with focus on environmental science and sustainability.',
      needs: ['Advanced laboratory equipment', 'Research partnerships', 'Student internship programs'],
      impact: 'Students will conduct original environmental research and contribute to regional conservation efforts.',
      isPriority: true
    }
  ];

  useEffect(() => {
    // Simulate loading school data
    setTimeout(() => {
      setSchools(sampleSchools);
      setLoading(false);
    }, 1000);
  }, []);

  const handleSchoolSelect = (school: School) => {
    setSelectedSchool(school);
    setSelectedLevel(null);
  };

  const handleSponsorshipSelect = (level: SponsorshipLevel) => {
    setSelectedLevel(level);
  };

  const handleDonate = () => {
    if (!selectedSchool || !selectedLevel) return;

    // In a real implementation, this would integrate with a payment processor
    const donationUrl = `/donate?school=${selectedSchool.id}&level=${selectedLevel.id}&amount=${selectedLevel.amount}`;
    window.location.href = donationUrl;
  };

  const progressPercentage = (school: School) => {
    return Math.round((school.currentPresentations / school.targetPresentations) * 100);
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
              Support a School
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8">
              Make a direct impact on environmental STEM education
            </p>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 max-w-2xl mx-auto">
              <p className="text-white/90">
                Your donation directly supports environmental STEM presentations and programs
                at schools in your community. Choose a school and sponsorship level that matches your impact goals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">How Your Support Makes a Difference</h2>
              <p className="text-lg text-gray-600">
                Every donation directly funds environmental STEM education
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Direct Impact</h3>
                <p className="text-gray-600">
                  Your donation funds presentations that reach hundreds of students with hands-on environmental STEM learning.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Quality Education</h3>
                <p className="text-gray-600">
                  Support comprehensive environmental science curriculum and teacher professional development.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Lasting Change</h3>
                <p className="text-gray-600">
                  Create environmental stewards and future scientists who will protect our planet for generations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* School Selection */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose a School to Support</h2>
              <p className="text-lg text-gray-600">
                Select a school that needs your help to bring environmental STEM education to their students
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {schools.map((school) => (
                <div
                  key={school.id}
                  className={`bg-white rounded-lg shadow-sm border-2 p-6 cursor-pointer transition-all ${
                    selectedSchool?.id === school.id
                      ? 'border-gsv-green shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                  onClick={() => handleSchoolSelect(school)}
                >
                  {school.isPriority && (
                    <div className="flex items-center gap-1 mb-3">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-xs font-medium text-yellow-700">Priority School</span>
                    </div>
                  )}

                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">{school.name}</h3>
                      <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
                        <MapPin className="w-3 h-3" />
                        <span>{school.location}</span>
                      </div>
                      <div className="text-sm text-gray-600">{school.gradeLevels} • {school.studentCount} students</div>
                    </div>
                    {selectedSchool?.id === school.id && (
                      <CheckCircle className="w-6 h-6 text-gsv-green" />
                    )}
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Presentations</span>
                      <span>{school.currentPresentations}/{school.targetPresentations}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gsv-green h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progressPercentage(school)}%` }}
                      ></div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 mb-3 line-clamp-2">{school.description}</p>

                  <div className="text-xs text-gray-600">
                    <strong>Impact:</strong> {school.impact}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Sponsorship Levels */}
      {selectedSchool && (
        <section className="py-16 bg-white">
          <div className="container">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Impact Level</h2>
                <p className="text-lg text-gray-600">
                  Supporting <strong>{selectedSchool.name}</strong> with environmental STEM education
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {sponsorshipLevels.map((level) => (
                  <div
                    key={level.id}
                    className={`relative bg-gray-50 rounded-lg p-6 cursor-pointer transition-all border-2 ${
                      selectedLevel?.id === level.id
                        ? 'border-gsv-green shadow-md bg-green-50'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                    onClick={() => handleSponsorshipSelect(level)}
                  >
                    {level.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <div className="bg-gsv-green text-white px-3 py-1 rounded-full text-xs font-medium">
                          Most Popular
                        </div>
                      </div>
                    )}

                    <div className="text-center mb-4">
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        ${level.amount.toLocaleString()}
                      </div>
                      <h3 className="font-semibold text-gray-900">{level.name}</h3>
                    </div>

                    <p className="text-sm text-gray-600 mb-4 text-center">{level.description}</p>

                    <ul className="space-y-2 mb-4">
                      {level.benefits.map((benefit, index) => (
                        <li key={index} className="text-xs text-gray-700 flex items-start gap-2">
                          <CheckCircle className="w-3 h-3 text-gsv-green mt-0.5 flex-shrink-0" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>

                    {selectedLevel?.id === level.id && (
                      <div className="flex justify-center">
                        <CheckCircle className="w-6 h-6 text-gsv-green" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {selectedLevel && (
                <div className="mt-8 text-center">
                  <button
                    onClick={handleDonate}
                    className="bg-gsv-green text-white px-8 py-3 rounded-lg hover:bg-gsv-greenDark transition-colors font-medium flex items-center gap-2 mx-auto"
                  >
                    <Heart className="w-4 h-4" />
                    Support {selectedSchool.name} with ${selectedLevel.amount.toLocaleString()}
                  </button>
                  <p className="text-sm text-gray-600 mt-2">
                    Your donation will fund {selectedLevel.name.toLowerCase()} at {selectedSchool.name}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Impact Stats */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Impact</h2>
              <p className="text-lg text-gray-600">
                See what your support can achieve
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white rounded-lg p-6 shadow-sm text-center">
                <div className="text-3xl font-bold text-gsv-green mb-2">
                  {schools.reduce((sum, school) => sum + school.studentCount, 0).toLocaleString()}
                </div>
                <p className="text-gray-600">Students Reached</p>
                <p className="text-sm text-gray-500 mt-1">Across all supported schools</p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm text-center">
                <div className="text-3xl font-bold text-gsv-green mb-2">
                  {schools.reduce((sum, school) => sum + school.currentPresentations, 0)}
                </div>
                <p className="text-gray-600">Presentations Delivered</p>
                <p className="text-sm text-gray-500 mt-1">This school year</p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm text-center">
                <div className="text-3xl font-bold text-gsv-green mb-2">
                  {schools.reduce((sum, school) => sum + (school.targetPresentations - school.currentPresentations), 0)}
                </div>
                <p className="text-gray-600">Presentations Still Needed</p>
                <p className="text-sm text-gray-500 mt-1">Help us reach our goals</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gsv-green/5">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Make a Difference?</h2>
            <p className="text-lg text-gray-600 mb-8">
              Your support directly funds environmental STEM education and creates future environmental leaders
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#school-selection"
                className="bg-gsv-green text-white px-8 py-3 rounded-lg hover:bg-gsv-greenDark transition-colors font-medium"
              >
                Choose a School
              </a>
              <a
                href="/donate"
                className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                General Donation
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
