"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Users, MapPin, Globe, Award, Target, Calendar, Download } from "lucide-react";
import ImpactCounter from "@/components/impact/ImpactCounter";
import SchoolsMap from "@/components/impact/SchoolsMap";
import VolunteerHoursDisplay from "@/components/impact/VolunteerHoursDisplay";
import PresentationsByTopic from "@/components/impact/PresentationsByTopic";
import InternationalStats from "@/components/impact/InternationalStats";

interface ImpactStats {
  totalVolunteers: number;
  totalPresentations: number;
  totalSchools: number;
  totalHours: number;
  totalCountries: number;
  activeChapters: number;
  monthlyGrowth: number;
  impactScore: number;
}

export default function PublicImpactDashboard() {
  const [stats, setStats] = useState<ImpactStats>({
    totalVolunteers: 0,
    totalPresentations: 0,
    totalSchools: 0,
    totalHours: 0,
    totalCountries: 0,
    activeChapters: 0,
    monthlyGrowth: 0,
    impactScore: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchImpactData();
  }, []);

  const fetchImpactData = async () => {
    try {
      const res = await fetch("/api/impact/public");
      const data = await res.json();
      if (data.ok) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching impact data:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportImpactReport = async () => {
    try {
      const res = await fetch("/api/impact/public/export");
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `green-silicon-valley-impact-report-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Error exporting report:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading impact data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Hero Section */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-3 bg-green-100 rounded-full">
                <Award className="w-12 h-12 text-green-600" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Our Impact
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Discover how Green Silicon Valley is transforming STEM education worldwide,
              one presentation at a time.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={exportImpactReport}
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                <Download size={20} />
                Export Report
              </button>
              <button className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
                <Target size={20} />
                Our Mission
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Impact Counter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ImpactCounter stats={stats} />
      </div>

      {/* Key Metrics Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-sm text-center">
            <div className="flex justify-center mb-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {stats.totalVolunteers.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Active Volunteers</div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm text-center">
            <div className="flex justify-center mb-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {stats.totalPresentations.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Presentations Delivered</div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm text-center">
            <div className="flex justify-center mb-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <MapPin className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {stats.totalSchools.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Schools Reached</div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm text-center">
            <div className="flex justify-center mb-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Globe className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {stats.totalCountries}
            </div>
            <div className="text-sm text-gray-600">Countries</div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Interactive Schools Map */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Schools Reached</h2>
            <SchoolsMap />
          </div>

          {/* Volunteer Hours Visualization */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Volunteer Hours</h2>
            <VolunteerHoursDisplay />
          </div>
        </div>
      </div>

      {/* Additional Visualizations */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Presentations by Topic */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Presentations by Topic</h2>
            <PresentationsByTopic />
          </div>

          {/* International Statistics */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">International Reach</h2>
            <InternationalStats />
          </div>
        </div>
      </div>

      {/* Growth Metrics */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Our Growth Story</h2>
            <p className="text-gray-600">Measuring our impact month over month</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">
                +{stats.monthlyGrowth}%
              </div>
              <div className="text-gray-600">Monthly Growth</div>
              <div className="text-sm text-gray-500 mt-1">Presentations delivered</div>
            </div>

            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {stats.impactScore}
              </div>
              <div className="text-gray-600">Impact Score</div>
              <div className="text-sm text-gray-500 mt-1">Out of 100 possible points</div>
            </div>

            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">
                {stats.activeChapters}
              </div>
              <div className="text-gray-600">Active Chapters</div>
              <div className="text-sm text-gray-500 mt-1">Across {stats.totalCountries} countries</div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-lg p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Join Our Mission</h2>
          <p className="text-xl mb-6 opacity-90">
            Be part of the movement to bring STEM education to every student worldwide.
          </p>
          <div className="flex justify-center gap-4">
            <a
              href="/get-involved"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 font-medium"
            >
              Get Involved
            </a>
            <a
              href="/chapters/apply"
              className="inline-flex items-center gap-2 px-6 py-3 border border-white text-white rounded-lg hover:bg-white hover:bg-opacity-10 font-medium"
            >
              Start a Chapter
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
