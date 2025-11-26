"use client";
import { useState, useEffect } from "react";
import { Calendar, Clock, MapPin, Users, AlertCircle, Plus, Edit } from "lucide-react";

interface Event {
  id: string;
  title: string;
  type: 'deadline' | 'recruitment' | 'presentation' | 'training' | 'meeting';
  description: string;
  date: string;
  endDate?: string;
  location?: string;
  isVirtual: boolean;
  capacity?: number;
  registeredCount?: number;
  isEditable: boolean;
  createdBy: string;
}

const eventTypes = [
  { value: 'all', label: 'All Events', color: 'bg-gray-100 text-gray-800' },
  { value: 'deadline', label: 'Deadlines', color: 'bg-red-100 text-red-800' },
  { value: 'recruitment', label: 'Recruitment', color: 'bg-blue-100 text-blue-800' },
  { value: 'presentation', label: 'Presentations', color: 'bg-green-100 text-green-800' },
  { value: 'training', label: 'Training', color: 'bg-purple-100 text-purple-800' },
  { value: 'meeting', label: 'Meetings', color: 'bg-yellow-100 text-yellow-800' }
];

// Sample events data - in production this would come from database
const sampleEvents: Event[] = [
  {
    id: '1',
    title: 'Volunteer Application Deadline - Spring 2024',
    type: 'deadline',
    description: 'Last day to apply for the Spring 2024 volunteer cohort. Applications submitted after this date will be considered for Fall 2024.',
    date: '2024-03-15T23:59:00',
    isVirtual: false,
    isEditable: true,
    createdBy: 'admin'
  },
  {
    id: '2',
    title: 'Team Formation Meeting',
    type: 'meeting',
    description: 'Mandatory meeting for all accepted volunteers. Teams will be assigned and initial training will begin.',
    date: '2024-03-20T18:00:00',
    endDate: '2024-03-20T20:00:00',
    location: 'Green Silicon Valley Office, Palo Alto',
    isVirtual: false,
    capacity: 50,
    registeredCount: 23,
    isEditable: true,
    createdBy: 'admin'
  },
  {
    id: '3',
    title: 'Environmental Science Training Workshop',
    type: 'training',
    description: 'Comprehensive training on climate science, renewable energy, and presentation techniques. Required for all new volunteers.',
    date: '2024-03-25T09:00:00',
    endDate: '2024-03-25T16:00:00',
    location: 'Stanford University, Herrin Labs',
    isVirtual: false,
    capacity: 30,
    registeredCount: 18,
    isEditable: true,
    createdBy: 'admin'
  },
  {
    id: '4',
    title: 'Presentation Skills Workshop',
    type: 'training',
    description: 'Learn effective presentation techniques, classroom management, and how to engage young audiences.',
    date: '2024-04-01T14:00:00',
    endDate: '2024-04-01T17:00:00',
    isVirtual: true,
    capacity: 25,
    registeredCount: 12,
    isEditable: true,
    createdBy: 'admin'
  },
  {
    id: '5',
    title: 'Elementary School Presentation - Maple Elementary',
    type: 'presentation',
    description: 'Climate Change and Renewable Energy presentation for 4th and 5th grade classes.',
    date: '2024-04-10T10:00:00',
    endDate: '2024-04-10T11:30:00',
    location: 'Maple Elementary School, Sunnyvale',
    isVirtual: false,
    isEditable: true,
    createdBy: 'admin'
  },
  {
    id: '6',
    title: 'Summer Internship Applications Open',
    type: 'recruitment',
    description: 'Applications now open for summer internships in Media, Technology, Outreach, and Operations departments.',
    date: '2024-04-15T00:00:00',
    endDate: '2024-05-15T23:59:00',
    isVirtual: true,
    isEditable: true,
    createdBy: 'admin'
  }
];

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>(sampleEvents);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isAdmin, setIsAdmin] = useState(false); // In production, this would come from auth

  useEffect(() => {
    // In production, fetch events from API
    setEvents(sampleEvents);
    // Check user role for edit permissions
    setIsAdmin(true); // Mock admin status
  }, []);

  const filteredEvents = selectedType === 'all'
    ? events
    : events.filter(event => event.type === selectedType);

  const sortedEvents = filteredEvents.sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getTypeColor = (type: string) => {
    const typeConfig = eventTypes.find(t => t.value === type);
    return typeConfig?.color || 'bg-gray-100 text-gray-800';
  };

  const isUpcoming = (dateString: string) => {
    return new Date(dateString) > new Date();
  };

  const isDeadline = (type: string) => type === 'deadline';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gsv-green via-gsv-greenDark to-gsv-slate-900 text-white py-20">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Events & Deadlines
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8">
              Stay updated with important dates, deadlines, and upcoming opportunities
            </p>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 max-w-2xl mx-auto">
              <p className="text-white/90">
                📅 <strong>Next Important Deadline:</strong> Volunteer Applications - March 15, 2024
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-12 bg-white border-b">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Filter Events</h2>
                <p className="text-gray-600">Find events by type or view all upcoming activities</p>
              </div>
              {isAdmin && (
                <button className="bg-gsv-green text-white px-4 py-2 rounded-lg hover:bg-gsv-greenDark transition-colors flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Event
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              {eventTypes.map(({ value, label, color }) => (
                <button
                  key={value}
                  onClick={() => setSelectedType(value)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedType === value
                      ? color.replace('100', '200')
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Events List */}
      <section className="py-16">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-6">
              {sortedEvents.map((event) => (
                <div
                  key={event.id}
                  className={`bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow ${
                    !isUpcoming(event.date) ? 'opacity-75' : ''
                  }`}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(event.type)}`}>
                            {eventTypes.find(t => t.value === event.type)?.label || event.type}
                          </span>
                          {!isUpcoming(event.date) && (
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                              Past Event
                            </span>
                          )}
                          {isDeadline(event.type) && isUpcoming(event.date) && (
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              Deadline
                            </span>
                          )}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
                        <p className="text-gray-700 mb-4">{event.description}</p>
                      </div>
                      {isAdmin && event.isEditable && (
                        <button className="text-gray-400 hover:text-gsv-green transition-colors p-2">
                          <Edit className="w-5 h-5" />
                        </button>
                      )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-3 text-gray-600">
                        <Calendar className="w-5 h-5 text-gsv-green flex-shrink-0" />
                        <div>
                          <p className="font-medium">{formatDate(event.date)}</p>
                          <p className="text-sm">
                            {formatTime(event.date)}
                            {event.endDate && ` - ${formatTime(event.endDate)}`}
                          </p>
                        </div>
                      </div>

                      {event.location && (
                        <div className="flex items-center gap-3 text-gray-600">
                          <MapPin className="w-5 h-5 text-gsv-green flex-shrink-0" />
                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        {event.isVirtual && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                            Virtual Event
                          </span>
                        )}
                        {event.capacity && (
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>
                              {event.registeredCount || 0} / {event.capacity} registered
                            </span>
                          </div>
                        )}
                      </div>

                      {isUpcoming(event.date) && (
                        <button className="bg-gsv-green text-white px-4 py-2 rounded-lg hover:bg-gsv-greenDark transition-colors text-sm font-medium">
                          {event.capacity ? 'Register' : 'Learn More'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {sortedEvents.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No events found</h3>
                <p className="text-gray-600">Try selecting a different filter or check back later for new events</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-16 bg-gsv-green/5">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Stay Updated</h2>
            <p className="text-lg text-gray-600 mb-8">
              Get notified about new events, deadlines, and opportunities
            </p>
            <div className="max-w-md mx-auto">
              <div className="flex gap-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gsv-green focus:border-transparent"
                />
                <button className="bg-gsv-green text-white px-6 py-3 rounded-lg hover:bg-gsv-greenDark transition-colors font-medium">
                  Subscribe
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-3">
                We respect your privacy. Unsubscribe at any time.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
