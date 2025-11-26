"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Mail, Linkedin, Twitter, Globe } from "lucide-react";

interface Leader {
  id: string;
  name: string;
  title: string;
  department: string;
  bio: string;
  photo: string;
  email?: string;
  linkedin?: string;
  twitter?: string;
  website?: string;
  order: number;
}

// Sample leadership data - in production this would come from database
const leadershipData: Leader[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    title: 'Executive Director',
    department: 'Executive',
    bio: 'Sarah founded Green Silicon Valley in 2022 with a vision to make environmental education accessible to every student. A graduate of Stanford University with a degree in Environmental Science, she brings 5+ years of experience in nonprofit leadership and STEM education.',
    photo: '/api/placeholder/300/400',
    email: 'sarah@gsv.org',
    linkedin: 'https://linkedin.com/in/sarahchen',
    order: 1
  },
  {
    id: '2',
    name: 'Marcus Rodriguez',
    title: 'Director of Outreach',
    department: 'Outreach',
    bio: 'Marcus leads our teacher partnerships and school relationships. With a background in education and community organizing, he ensures that GSV presentations reach schools that need them most. He coordinates with over 50 school districts across the Bay Area.',
    photo: '/api/placeholder/300/400',
    email: 'marcus@gsv.org',
    linkedin: 'https://linkedin.com/in/marcusrodriguez',
    order: 2
  },
  {
    id: '3',
    name: 'Priya Patel',
    title: 'Director of Technology',
    department: 'Technology',
    bio: 'Priya oversees our digital infrastructure and volunteer management systems. A computer science major at UC Berkeley, she develops the tools that make GSV run smoothly and ensures our volunteers have the best possible experience.',
    photo: '/api/placeholder/300/400',
    email: 'priya@gsv.org',
    linkedin: 'https://linkedin.com/in/priyapatel',
    twitter: 'https://twitter.com/priyapatel',
    order: 3
  },
  {
    id: '4',
    name: 'Jordan Kim',
    title: 'Director of Media',
    department: 'Media',
    bio: 'Jordan handles our content creation, social media presence, and visual storytelling. With a passion for environmental photography and digital media, Jordan captures the impact of GSV programs and shares our story with the world.',
    photo: '/api/placeholder/300/400',
    email: 'jordan@gsv.org',
    linkedin: 'https://linkedin.com/in/jordankim',
    website: 'https://jordankim.photo',
    order: 4
  },
  {
    id: '5',
    name: 'Alex Thompson',
    title: 'Director of Volunteer Development',
    department: 'Volunteer Development',
    bio: 'Alex coordinates our volunteer recruitment, training, and team formation processes. Having been a GSV volunteer himself, he understands what makes our program successful and works tirelessly to maintain our high standards.',
    photo: '/api/placeholder/300/400',
    email: 'alex@gsv.org',
    linkedin: 'https://linkedin.com/in/alexthompson',
    order: 5
  },
  {
    id: '6',
    name: 'Emma Davis',
    title: 'Director of Communications',
    department: 'Communications',
    bio: 'Emma manages our internal communications, newsletter, and stakeholder relationships. She ensures that everyone involved with GSV - from volunteers to teachers to donors - stays informed and engaged with our mission.',
    photo: '/api/placeholder/300/400',
    email: 'emma@gsv.org',
    linkedin: 'https://linkedin.com/in/emmadavis',
    twitter: 'https://twitter.com/emmadavis',
    order: 6
  },
  {
    id: '7',
    name: 'Ryan Foster',
    title: 'Director of Operations',
    department: 'Operations',
    bio: 'Ryan keeps GSV running smoothly behind the scenes. From logistics coordination to process optimization, he ensures that every presentation runs flawlessly and that our volunteers and teachers have the support they need.',
    photo: '/api/placeholder/300/400',
    email: 'ryan@gsv.org',
    linkedin: 'https://linkedin.com/in/ryanfoster',
    order: 7
  }
];

const departments = [
  'Executive',
  'Outreach',
  'Technology',
  'Media',
  'Volunteer Development',
  'Communications',
  'Operations'
];

export default function LeadershipPage() {
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [leaders, setLeaders] = useState<Leader[]>(leadershipData);

  useEffect(() => {
    // In production, this would fetch from API
    setLeaders(leadershipData);
  }, []);

  const filteredLeaders = selectedDepartment === 'all'
    ? leaders
    : leaders.filter(leader => leader.department === selectedDepartment);

  const sortedLeaders = filteredLeaders.sort((a, b) => a.order - b.order);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gsv-green via-gsv-greenDark to-gsv-slate-900 text-white py-20">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Meet Our Leadership Team
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8">
              Student leaders driving environmental education forward
            </p>
            <p className="text-lg text-white/80 max-w-3xl mx-auto">
              Green Silicon Valley is led by dedicated high school and college students
              who are passionate about environmental education and community impact.
            </p>
          </div>
        </div>
      </section>

      {/* Department Filter */}
      <section className="py-12 bg-white border-b">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Filter by Department</h2>
              <p className="text-gray-600">Learn about the different teams that make GSV possible</p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={() => setSelectedDepartment('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedDepartment === 'all'
                    ? 'bg-gsv-green text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Departments
              </button>
              {departments.map(dept => (
                <button
                  key={dept}
                  onClick={() => setSelectedDepartment(dept)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedDepartment === dept
                      ? 'bg-gsv-green text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Grid */}
      <section className="py-16">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sortedLeaders.map((leader) => (
                <div key={leader.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="aspect-[3/4] relative">
                    <Image
                      src={leader.photo}
                      alt={leader.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{leader.name}</h3>
                    <p className="text-gsv-green font-medium mb-1">{leader.title}</p>
                    <p className="text-sm text-gray-600 mb-4">{leader.department} Department</p>
                    <p className="text-gray-700 text-sm leading-relaxed mb-4">{leader.bio}</p>

                    {/* Social Links */}
                    <div className="flex gap-3">
                      {leader.email && (
                        <a
                          href={`mailto:${leader.email}`}
                          className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gsv-green hover:text-white transition-colors"
                          aria-label={`Email ${leader.name}`}
                        >
                          <Mail className="w-4 h-4" />
                        </a>
                      )}
                      {leader.linkedin && (
                        <a
                          href={leader.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gsv-green hover:text-white transition-colors"
                          aria-label={`${leader.name}'s LinkedIn`}
                        >
                          <Linkedin className="w-4 h-4" />
                        </a>
                      )}
                      {leader.twitter && (
                        <a
                          href={leader.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gsv-green hover:text-white transition-colors"
                          aria-label={`${leader.name}'s Twitter`}
                        >
                          <Twitter className="w-4 h-4" />
                        </a>
                      )}
                      {leader.website && (
                        <a
                          href={leader.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gsv-green hover:text-white transition-colors"
                          aria-label={`${leader.name}'s website`}
                        >
                          <Globe className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {sortedLeaders.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No leaders found</h3>
                <p className="text-gray-600">Try selecting a different department filter</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Department Overview */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Departments</h2>
              <p className="text-lg text-gray-600">
                Each department plays a crucial role in our mission
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="p-6 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Outreach</h3>
                <p className="text-gray-600 text-sm">Builds partnerships with schools and coordinates presentation logistics</p>
              </div>
              <div className="p-6 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Technology</h3>
                <p className="text-gray-600 text-sm">Develops and maintains our digital platforms and volunteer management systems</p>
              </div>
              <div className="p-6 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Media</h3>
                <p className="text-gray-600 text-sm">Creates content, manages social media, and tells our story visually</p>
              </div>
              <div className="p-6 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Volunteer Development</h3>
                <p className="text-gray-600 text-sm">Recruits, trains, and supports our volunteer teams</p>
              </div>
              <div className="p-6 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Communications</h3>
                <p className="text-gray-600 text-sm">Manages internal communications and stakeholder relationships</p>
              </div>
              <div className="p-6 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Operations</h3>
                <p className="text-gray-600 text-sm">Handles logistics, process optimization, and behind-the-scenes coordination</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Join the Team */}
      <section className="py-16 bg-gsv-green/5">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Join Our Leadership Team</h2>
            <p className="text-lg text-gray-600 mb-8">
              Interested in becoming a department director or joining our leadership team?
              We&apos;re always looking for passionate students to step up and lead.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/get-involved"
                className="bg-gsv-green text-white px-8 py-3 rounded-lg font-semibold hover:bg-gsv-greenDark transition-colors"
              >
                Apply to Join GSV
              </a>
              <a
                href="/contact"
                className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Contact Leadership
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
