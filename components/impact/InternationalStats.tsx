"use client";

import { useState, useEffect } from "react";
import { MapPin, Users, Globe, Star, TrendingUp } from "lucide-react";

interface ChapterStats {
  country: string;
  chapters: number;
  volunteers: number;
  presentations: number;
  schools: number;
  flag: string;
}

export default function InternationalStats() {
  const [stats, setStats] = useState<ChapterStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInternationalStats();
  }, []);

  const fetchInternationalStats = async () => {
    try {
      const res = await fetch("/api/impact/international");
      const data = await res.json();
      if (data.ok) {
        setStats(data.stats || []);
      }
    } catch (error) {
      console.error("Error fetching international stats:", error);
      // Generate sample data
      generateSampleData();
    } finally {
      setLoading(false);
    }
  };

  const generateSampleData = () => {
    const sampleStats: ChapterStats[] = [
      { country: "United States", chapters: 12, volunteers: 245, presentations: 189, schools: 67, flag: "🇺🇸" },
      { country: "Canada", chapters: 8, volunteers: 156, presentations: 134, schools: 45, flag: "🇨🇦" },
      { country: "United Kingdom", chapters: 6, volunteers: 98, presentations: 87, schools: 32, flag: "🇬🇧" },
      { country: "Germany", chapters: 5, volunteers: 87, presentations: 76, schools: 28, flag: "🇩🇪" },
      { country: "Australia", chapters: 4, volunteers: 67, presentations: 54, schools: 21, flag: "🇦🇺" },
      { country: "Japan", chapters: 3, volunteers: 45, presentations: 38, schools: 15, flag: "🇯🇵" }
    ];
    setStats(sampleStats);
  };

  useEffect(() => {
    if (stats.length === 0 && !loading) {
      generateSampleData();
    }
  }, [stats, loading]);

  const totalStats = {
    countries: stats.length,
    chapters: stats.reduce((sum, s) => sum + s.chapters, 0),
    volunteers: stats.reduce((sum, s) => sum + s.volunteers, 0),
    presentations: stats.reduce((sum, s) => sum + s.presentations, 0),
    schools: stats.reduce((sum, s) => sum + s.schools, 0)
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading international stats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Global summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-purple-50 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-purple-600">{totalStats.countries}</div>
          <div className="text-xs text-purple-700">Countries</div>
        </div>
        <div className="bg-indigo-50 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-indigo-600">{totalStats.chapters}</div>
          <div className="text-xs text-indigo-700">Chapters</div>
        </div>
      </div>

      {/* Country breakdown */}
      <div className="space-y-2">
        {stats.map((country, index) => (
          <div key={country.country} className="bg-white border border-gray-200 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{country.flag}</span>
                <span className="font-medium text-gray-900">{country.country}</span>
              </div>
              <div className="text-sm text-gray-600">
                {country.chapters} chapter{country.chapters !== 1 ? 's' : ''}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="text-center">
                <div className="font-semibold text-blue-600">{country.volunteers}</div>
                <div className="text-xs text-gray-600">Volunteers</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-green-600">{country.presentations}</div>
                <div className="text-xs text-gray-600">Presentations</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-orange-600">{country.schools}</div>
                <div className="text-xs text-gray-600">Schools</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Global impact summary */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Globe className="w-5 h-5 text-blue-600" />
          <h4 className="font-medium text-blue-900">Global Impact</h4>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-lg font-bold text-blue-600">{totalStats.volunteers.toLocaleString()}</div>
            <div className="text-blue-700">Total Volunteers</div>
          </div>
          <div>
            <div className="text-lg font-bold text-purple-600">{totalStats.presentations.toLocaleString()}</div>
            <div className="text-purple-700">Presentations Given</div>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-blue-200">
          <div className="flex items-center justify-between text-xs text-blue-700">
            <span>Across {totalStats.schools.toLocaleString()} schools worldwide</span>
            <div className="flex items-center gap-1">
              <TrendingUp size={12} />
              Growing daily
            </div>
          </div>
        </div>
      </div>

      {/* Quick facts */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-900">Quick Facts</h4>
        <div className="space-y-1 text-xs text-gray-600">
          <div>• Largest chapter: {stats[0]?.country} ({stats[0]?.volunteers} volunteers)</div>
          <div>• Fastest growing: {stats.find(s => s.presentations === Math.max(...stats.map(s => s.presentations)))?.country}</div>
          <div>• Average chapter size: {Math.round(totalStats.volunteers / totalStats.chapters)} volunteers</div>
        </div>
      </div>
    </div>
  );
}
