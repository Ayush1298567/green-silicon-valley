"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { MapPin, Users, Calendar, Globe, Mail, ExternalLink, Star, ArrowLeft, Clock } from "lucide-react";
import Link from "next/link";

interface Chapter {
  id: string;
  name: string;
  country: string;
  language: string;
  timezone: string;
  currency: string;
  status: string;
  contact_email?: string;
  website_url?: string;
  social_media?: any;
  leadership_count?: number;
  presentation_count?: number;
  volunteer_count?: number;
  created_at: string;
}

interface ChapterLeader {
  id: string;
  user_id: string;
  role: string;
  start_date: string;
  end_date?: string;
  is_active: boolean;
  users?: {
    name: string;
    email: string;
  };
}

interface RecentPresentation {
  id: string;
  topic: string;
  scheduled_date: string;
  status: string;
  schools?: {
    name: string;
  };
}

export default function ChapterDetailPage() {
  const params = useParams();
  const chapterId = params.id as string;

  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [leaders, setLeaders] = useState<ChapterLeader[]>([]);
  const [presentations, setPresentations] = useState<RecentPresentation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChapterDetails();
  }, [chapterId]);

  const fetchChapterDetails = async () => {
    try {
      // Fetch chapter details
      const chapterRes = await fetch(`/api/chapters/${chapterId}`);
      const chapterData = await chapterRes.json();

      if (chapterData.ok) {
        setChapter(chapterData.chapter);
      }

      // Fetch chapter leadership
      const leadersRes = await fetch(`/api/chapters/${chapterId}/leadership`);
      const leadersData = await leadersRes.json();

      if (leadersData.ok) {
        setLeaders(leadersData.leaders || []);
      }

      // Fetch recent presentations
      const presentationsRes = await fetch(`/api/chapters/${chapterId}/presentations?limit=5`);
      const presentationsData = await presentationsRes.json();

      if (presentationsData.ok) {
        setPresentations(presentationsData.presentations || []);
      }
    } catch (error) {
      console.error("Error fetching chapter details:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCountryFlag = (country: string) => {
    const flags: Record<string, string> = {
      "USA": "🇺🇸",
      "Canada": "🇨🇦",
      "UK": "🇬🇧",
      "Germany": "🇩🇪",
      "France": "🇫🇷",
      "Spain": "🇪🇸",
      "Italy": "🇮🇹",
      "Japan": "🇯🇵",
      "Australia": "🇦🇺",
      "Brazil": "🇧🇷",
      "Mexico": "🇲🇽",
      "India": "🇮🇳",
      "China": "🇨🇳",
      "South Korea": "🇰🇷",
    };
    return flags[country] || "🌍";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            <Star size={14} />
            Active Chapter
          </span>
        );
      case "upcoming":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            <Clock size={14} />
            Coming Soon
          </span>
        );
      case "forming":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
            <Star size={14} />
            Forming Now
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
            {status}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chapter details...</p>
        </div>
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <MapPin className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Chapter Not Found</h2>
          <p className="text-gray-600 mb-6">The chapter you're looking for doesn't exist or has been removed.</p>
          <Link
            href="/chapters"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <ArrowLeft size={20} />
            Back to Chapters
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/chapters"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft size={20} />
              Back to Chapters
            </Link>
          </div>

          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <span className="text-4xl">{getCountryFlag(chapter.country)}</span>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{chapter.name}</h1>
                <div className="flex items-center gap-4 mt-2 text-gray-600">
                  <div className="flex items-center gap-1">
                    <MapPin size={16} />
                    {chapter.country}
                  </div>
                  <div className="flex items-center gap-1">
                    <Globe size={16} />
                    {chapter.language}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={16} />
                    {chapter.timezone.split('/')[1]?.replace('_', ' ') || chapter.timezone}
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              {getStatusBadge(chapter.status)}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {chapter.volunteer_count || 0}
                    </div>
                    <div className="text-sm text-gray-600">Active Volunteers</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Calendar className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {chapter.presentation_count || 0}
                    </div>
                    <div className="text-sm text-gray-600">Presentations Delivered</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Star className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {leaders.filter(l => l.is_active).length}
                    </div>
                    <div className="text-sm text-gray-600">Chapter Leaders</div>
                  </div>
                </div>
              </div>
            </div>

            {/* About Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About This Chapter</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700">
                  The {chapter.name} chapter is part of the global Green Silicon Valley network,
                  bringing STEM education to students in {chapter.country}. Our chapter focuses on
                  providing hands-on learning experiences that inspire the next generation of
                  scientists, engineers, and innovators.
                </p>

                <p className="text-gray-700 mt-4">
                  Founded in {new Date(chapter.created_at).getFullYear()}, our chapter has grown to
                  include {chapter.volunteer_count || 0} dedicated volunteers who have delivered
                  {chapter.presentation_count || 0} presentations to local schools and communities.
                </p>
              </div>
            </div>

            {/* Recent Presentations */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Presentations</h2>

              {presentations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No presentations scheduled yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {presentations.map((presentation) => (
                    <div key={presentation.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900">{presentation.topic}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <span>{presentation.schools?.name || "School"}</span>
                          <span>{new Date(presentation.scheduled_date).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        presentation.status === "completed" ? "bg-green-100 text-green-800" :
                        presentation.status === "confirmed" ? "bg-blue-100 text-blue-800" :
                        "bg-yellow-100 text-yellow-800"
                      }`}>
                        {presentation.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>

              <div className="space-y-3">
                {chapter.contact_email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <a
                      href={`mailto:${chapter.contact_email}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {chapter.contact_email}
                    </a>
                  </div>
                )}

                {chapter.website_url && (
                  <div className="flex items-center gap-3">
                    <ExternalLink className="w-5 h-5 text-gray-400" />
                    <a
                      href={chapter.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Visit Website
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Chapter Leadership */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Chapter Leadership</h3>

              {leaders.length === 0 ? (
                <p className="text-gray-600">Leadership team to be announced</p>
              ) : (
                <div className="space-y-3">
                  {leaders.filter(leader => leader.is_active).map((leader) => (
                    <div key={leader.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {leader.users?.name || "Leader"}
                        </div>
                        <div className="text-sm text-gray-600 capitalize">
                          {leader.role.replace("_", " ")}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Social Media */}
            {chapter.social_media && Object.keys(chapter.social_media).length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Follow Us</h3>
                <div className="space-y-2">
                  {Object.entries(chapter.social_media).map(([platform, url]) => (
                    <a
                      key={platform}
                      href={url as string}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-blue-600 hover:text-blue-800"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span className="capitalize">{platform}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Get Involved */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Get Involved</h3>
              <p className="text-blue-700 text-sm mb-4">
                Interested in joining the {chapter.name} chapter? Contact our leadership team to learn how you can contribute.
              </p>
              {chapter.contact_email && (
                <a
                  href={`mailto:${chapter.contact_email}?subject=Interest in joining ${chapter.name} chapter`}
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                >
                  Contact Chapter Leaders
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
