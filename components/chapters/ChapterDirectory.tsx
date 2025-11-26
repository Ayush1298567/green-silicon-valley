"use client";

import { useState } from "react";
import { MapPin, Users, Calendar, Globe, ExternalLink, Star, Clock, CheckCircle } from "lucide-react";
import Link from "next/link";

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

interface ChapterDirectoryProps {
  chapters: Chapter[];
  showApplyButton?: boolean;
}

export default function ChapterDirectory({ chapters, showApplyButton = false }: ChapterDirectoryProps) {
  const [hoveredChapter, setHoveredChapter] = useState<string | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
            <CheckCircle size={12} />
            Active
          </span>
        );
      case "upcoming":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
            <Star size={12} />
            Upcoming
          </span>
        );
      case "forming":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
            <Clock size={12} />
            Forming
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
            {status}
          </span>
        );
    }
  };

  const getCountryFlag = (country: string) => {
    // Simple country flag emoji mapping (could be enhanced with a proper flag library)
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

  if (chapters.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-12 text-center">
        <Globe className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Chapters Found</h3>
        <p className="text-gray-600 mb-6">
          {showApplyButton
            ? "Be the first to start a chapter in your area!"
            : "Check back soon for new chapters in your region."
          }
        </p>
        {showApplyButton && (
          <Link
            href="/chapters/apply"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            <Star size={20} />
            Start the First Chapter
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {chapters.map((chapter) => (
        <div
          key={chapter.id}
          className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
          onMouseEnter={() => setHoveredChapter(chapter.id)}
          onMouseLeave={() => setHoveredChapter(null)}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getCountryFlag(chapter.country)}</span>
                <div>
                  <Link
                    href={`/chapters/${chapter.id}`}
                    className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                  >
                    {chapter.name}
                  </Link>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <MapPin size={14} />
                    {chapter.country}
                  </div>
                </div>
              </div>
              {getStatusBadge(chapter.status)}
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Globe size={14} />
                {chapter.language}
              </div>
              <div className="flex items-center gap-1">
                <Clock size={14} />
                {chapter.timezone.split('/')[1]?.replace('_', ' ') || chapter.timezone}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="px-6 py-4 bg-gray-50">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold text-gray-900">
                  {chapter.volunteer_count || 0}
                </div>
                <div className="text-xs text-gray-600">Volunteers</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900">
                  {chapter.presentation_count || 0}
                </div>
                <div className="text-xs text-gray-600">Presentations</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900">
                  {chapter.leadership_count || 0}
                </div>
                <div className="text-xs text-gray-600">Leaders</div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 py-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <Link
                href={`/chapters/${chapter.id}`}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                View Chapter →
              </Link>

              <div className="flex items-center gap-2">
                {chapter.website_url && (
                  <a
                    href={chapter.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Visit website"
                  >
                    <ExternalLink size={16} />
                  </a>
                )}

                {chapter.contact_email && (
                  <a
                    href={`mailto:${chapter.contact_email}`}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Contact chapter"
                  >
                    <Users size={16} />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Hover overlay for quick actions */}
          {hoveredChapter === chapter.id && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <div className="bg-white rounded-lg p-4 shadow-lg">
                <Link
                  href={`/chapters/${chapter.id}`}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                >
                  View Details
                </Link>
                {chapter.contact_email && (
                  <a
                    href={`mailto:${chapter.contact_email}`}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                  >
                    Contact Leaders
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
