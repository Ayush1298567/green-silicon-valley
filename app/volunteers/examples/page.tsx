"use client";
import { useState } from "react";
import ExampleSlidesViewer from "@/components/volunteer/ExampleSlidesViewer";

export default function VolunteerExamplesPage() {
  const [selectedGradeLevel, setSelectedGradeLevel] = useState<string>('');
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);

  const gradeLevels = ['3-5', '6-8', '9-12'];
  const topics = [
    'Climate Change',
    'Renewable Energy',
    'Biodiversity',
    'Sustainable Living',
    'Ocean Conservation',
    'Waste Management',
    'Environmental Justice',
    'Green Technology'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gsv-green via-gsv-greenDark to-gsv-slate-900 text-white py-20">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Presentation Examples
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8">
              See what our environmental STEM presentations look like
            </p>
            <p className="text-lg text-white/80">
              Browse through example slides, videos, and activities to understand what volunteering entails
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-12 bg-white border-b">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Filter Examples</h2>
              <p className="text-gray-600">Find presentations that match your interests</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Grade Level Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grade Level
                </label>
                <select
                  value={selectedGradeLevel}
                  onChange={(e) => setSelectedGradeLevel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gsv-green focus:border-transparent"
                >
                  <option value="">All Grade Levels</option>
                  {gradeLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              {/* Topic Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Topic
                </label>
                <select
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gsv-green focus:border-transparent"
                >
                  <option value="">All Topics</option>
                  {topics.map(topic => (
                    <option key={topic} value={topic}>{topic}</option>
                  ))}
                </select>
              </div>

              {/* Featured Only */}
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showFeaturedOnly}
                    onChange={(e) => setShowFeaturedOnly(e.target.checked)}
                    className="rounded border-gray-300 text-gsv-green focus:ring-gsv-green"
                  />
                  <span className="text-sm font-medium text-gray-700">Featured Only</span>
                </label>
              </div>
            </div>

            {/* Active Filters */}
            {(selectedGradeLevel || selectedTopic || showFeaturedOnly) && (
              <div className="mt-6 flex flex-wrap gap-2 justify-center">
                {showFeaturedOnly && (
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm flex items-center gap-1">
                    Featured Only
                    <button
                      onClick={() => setShowFeaturedOnly(false)}
                      className="ml-1 text-yellow-600 hover:text-yellow-800"
                    >
                      ×
                    </button>
                  </span>
                )}
                {selectedGradeLevel && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-1">
                    Grade {selectedGradeLevel}
                    <button
                      onClick={() => setSelectedGradeLevel('')}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                )}
                {selectedTopic && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center gap-1">
                    {selectedTopic}
                    <button
                      onClick={() => setSelectedTopic('')}
                      className="ml-1 text-green-600 hover:text-green-800"
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Examples Viewer */}
      <section className="py-16">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <ExampleSlidesViewer
              gradeLevel={selectedGradeLevel}
              topic={selectedTopic}
              featuredOnly={showFeaturedOnly}
            />
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gsv-green/5">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Create Your Own?</h2>
            <p className="text-lg text-gray-600 mb-8">
              Join our volunteer program and start making presentations that inspire the next generation
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/get-involved/volunteer"
                className="bg-gsv-green text-white px-8 py-3 rounded-lg hover:bg-gsv-greenDark transition-colors font-medium"
              >
                Become a Volunteer
              </a>
              <a
                href="/how-it-works"
                className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Learn How It Works
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
