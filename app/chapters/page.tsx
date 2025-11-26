"use client";

import { useState, useEffect } from "react";
import { MapPin, Users, Calendar, Globe, Plus, Star } from "lucide-react";
import Link from "next/link";
import ChapterDirectory from "@/components/chapters/ChapterDirectory";

interface Chapter {
  id: string;
  name: string;
  country: string;
  language: string;
  timezone: string;
  status: string;
  contact_email?: string;
  website_url?: string;
  social_media?: any;
  leadership_count?: number;
  presentation_count?: number;
  volunteer_count?: number;
  created_at: string;
}

export default function ChaptersPage() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"active" | "upcoming" | "all">("active");

  useEffect(() => {
    fetchChapters();
  }, []);

  const fetchChapters = async () => {
    try {
      const res = await fetch("/api/chapters");
      const data = await res.json();
      if (data.ok) {
        setChapters(data.chapters || []);
      }
    } catch (error) {
      console.error("Error fetching chapters:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredChapters = chapters.filter(chapter => {
    switch (activeTab) {
      case "active":
        return chapter.status === "active";
      case "upcoming":
        return chapter.status === "upcoming" || chapter.status === "forming";
      case "all":
        return true;
      default:
        return true;
    }
  });

  const stats = {
    active: chapters.filter(c => c.status === "active").length,
    upcoming: chapters.filter(c => c.status === "upcoming" || c.status === "forming").length,
    totalVolunteers: chapters.reduce((sum, c) => sum + (c.volunteer_count || 0), 0),
    totalPresentations: chapters.reduce((sum, c) => sum + (c.presentation_count || 0), 0)
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chapters...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Hero Section */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-3 bg-blue-100 rounded-full">
                <Globe className="w-12 h-12 text-blue-600" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              International Chapters
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Green Silicon Valley is expanding globally! Join our growing network of chapters
              bringing STEM education to students worldwide.
            </p>
            <div className="flex justify-center gap-4">
              <Link
                href="/chapters/apply"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                <Plus size={20} />
                Start a Chapter
              </Link>
              <Link
                href="#chapters"
                className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                <MapPin size={20} />
                Explore Chapters
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg p-6 text-center shadow-sm">
            <div className="text-3xl font-bold text-blue-600 mb-2">{stats.active}</div>
            <div className="text-gray-600">Active Chapters</div>
          </div>
          <div className="bg-white rounded-lg p-6 text-center shadow-sm">
            <div className="text-3xl font-bold text-green-600 mb-2">{stats.upcoming}</div>
            <div className="text-gray-600">Chapters Forming</div>
          </div>
          <div className="bg-white rounded-lg p-6 text-center shadow-sm">
            <div className="text-3xl font-bold text-purple-600 mb-2">{stats.totalVolunteers}</div>
            <div className="text-gray-600">Global Volunteers</div>
          </div>
          <div className="bg-white rounded-lg p-6 text-center shadow-sm">
            <div className="text-3xl font-bold text-orange-600 mb-2">{stats.totalPresentations}</div>
            <div className="text-gray-600">Presentations Delivered</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div id="chapters" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab("active")}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === "active"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Active Chapters ({stats.active})
              </button>
              <button
                onClick={() => setActiveTab("upcoming")}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === "upcoming"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Chapters Forming ({stats.upcoming})
              </button>
              <button
                onClick={() => setActiveTab("all")}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === "all"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                All Chapters ({chapters.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Chapter Directory */}
        <ChapterDirectory
          chapters={filteredChapters}
          showApplyButton={activeTab !== "active"}
        />

        {/* Call to Action */}
        <div className="bg-white rounded-lg shadow-sm p-8 text-center mt-12">
          <Star className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Bring STEM to Your Community?
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Starting a Green Silicon Valley chapter is a rewarding way to make a difference
            in STEM education. We provide full support, resources, and training to help you succeed.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/chapters/apply"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              <Plus size={20} />
              Apply to Start a Chapter
            </Link>
            <Link
              href="/about/chapters"
              className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
