"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff, Calendar, MapPin, Users, Clock, FileText, AlertTriangle } from "lucide-react";

interface PresentationRecord {
  id: string;
  topic: string;
  date: string;
  school: string;
  presenter: string;
  status: string;
  feedback?: string;
  photos?: string[];
}

export default function ParentPortal() {
  const [presentations, setPresentations] = useState<PresentationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchChildRecords();
  }, []);

  const fetchChildRecords = async () => {
    try {
      // In a real implementation, this would fetch the child's presentation records
      const sampleData: PresentationRecord[] = [
        {
          id: "1",
          topic: "Introduction to Computer Science",
          date: "2024-01-15",
          school: "Lincoln Elementary School",
          presenter: "Dr. Sarah Johnson",
          status: "completed",
          feedback: "Emma showed great enthusiasm for coding concepts and asked thoughtful questions about algorithms.",
          photos: ["/api/placeholder/300/200", "/api/placeholder/300/200"]
        },
        {
          id: "2",
          topic: "Environmental Science & Climate Change",
          date: "2024-01-22",
          school: "Lincoln Elementary School",
          presenter: "Prof. Michael Chen",
          status: "completed",
          feedback: "Emma actively participated in the recycling demonstration and shared ideas about reducing plastic waste.",
          photos: ["/api/placeholder/300/200"]
        },
        {
          id: "3",
          topic: "Basic Electronics & Circuits",
          date: "2024-02-05",
          school: "Lincoln Elementary School",
          presenter: "Engineer Lisa Rodriguez",
          status: "upcoming",
          feedback: null,
          photos: []
        }
      ];

      setPresentations(sampleData);
    } catch (error) {
      console.error("Error fetching child records:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDetails = (id: string) => {
    setShowDetails(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your child's records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Emma Johnson's STEM Education Records</h2>
        <p className="text-gray-600">
          View presentations attended and educational progress. All records are maintained with strict privacy protections.
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-blue-600" />
            <div>
              <div className="text-2xl font-bold text-blue-900">
                {presentations.filter(p => p.status === "completed").length}
              </div>
              <div className="text-sm text-blue-700">Presentations Attended</div>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-green-600" />
            <div>
              <div className="text-2xl font-bold text-green-900">
                {Math.round(presentations.filter(p => p.status === "completed").length * 1.5)}h
              </div>
              <div className="text-sm text-green-700">Learning Time</div>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <MapPin className="w-8 h-8 text-purple-600" />
            <div>
              <div className="text-2xl font-bold text-purple-900">
                {new Set(presentations.map(p => p.school)).size}
              </div>
              <div className="text-sm text-purple-700">Schools Visited</div>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-orange-600" />
            <div>
              <div className="text-2xl font-bold text-orange-900">
                {new Set(presentations.map(p => p.presenter)).size}
              </div>
              <div className="text-sm text-orange-700">STEM Mentors Met</div>
            </div>
          </div>
        </div>
      </div>

      {/* Presentations List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Presentation History</h3>

        {presentations.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No presentations recorded yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {presentations.map((presentation) => (
              <div key={presentation.id} className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Header */}
                <div className="bg-gray-50 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">{presentation.topic}</h4>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {new Date(presentation.date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin size={14} />
                          {presentation.school}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          presentation.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800"
                        }`}>
                          {presentation.status}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleDetails(presentation.id)}
                      className="flex items-center gap-2 px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                    >
                      {showDetails[presentation.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                      {showDetails[presentation.id] ? "Hide Details" : "View Details"}
                    </button>
                  </div>
                </div>

                {/* Details */}
                {showDetails[presentation.id] && (
                  <div className="px-6 py-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Left Column */}
                      <div className="space-y-4">
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">Presenter</h5>
                          <p className="text-gray-700">{presentation.presenter}</p>
                        </div>

                        {presentation.feedback && (
                          <div>
                            <h5 className="font-medium text-gray-900 mb-2">Teacher Feedback</h5>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                              <p className="text-blue-800 text-sm">{presentation.feedback}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right Column */}
                      <div className="space-y-4">
                        {presentation.photos && presentation.photos.length > 0 && (
                          <div>
                            <h5 className="font-medium text-gray-900 mb-2">Activity Photos</h5>
                            <div className="grid grid-cols-2 gap-2">
                              {presentation.photos.map((photo, index) => (
                                <div key={index} className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                                  <span className="text-xs text-gray-500">Photo {index + 1}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">Learning Objectives</h5>
                          <ul className="text-sm text-gray-700 space-y-1">
                            <li>• Understand basic STEM concepts</li>
                            <li>• Practice hands-on learning</li>
                            <li>• Ask questions and explore ideas</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Privacy Notice */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-gray-900">Privacy Protection</h4>
            <p className="text-sm text-gray-600 mt-1">
              This information is shared with you as the parent/guardian with full consent.
              All records are kept confidential and secure in compliance with privacy laws.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
