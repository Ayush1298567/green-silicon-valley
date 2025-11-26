"use client";
import { useState, useEffect } from "react";
import { Star, Quote, MapPin, Award, CheckCircle, Play, Search, Filter } from "lucide-react";
import { sampleTestimonials, getTestimonialStats, type Testimonial } from "@/lib/testimonials";

interface EnhancedTestimonialsProps {
  limit?: number;
  featuredOnly?: boolean;
  showStats?: boolean;
  searchable?: boolean;
  category?: string;
}

export default function EnhancedTestimonials({
  limit,
  featuredOnly = false,
  showStats = true,
  searchable = false,
  category
}: EnhancedTestimonialsProps) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [filteredTestimonials, setFilteredTestimonials] = useState<Testimonial[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>(category || "all");
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    let initialTestimonials = featuredOnly
      ? sampleTestimonials.filter(t => t.featured)
      : sampleTestimonials;

    if (category) {
      initialTestimonials = initialTestimonials.filter(t => t.categories.includes(category));
    }

    setTestimonials(initialTestimonials);
    setFilteredTestimonials(initialTestimonials);
    setStats(getTestimonialStats());
  }, [featuredOnly, category]);

  useEffect(() => {
    let filtered = testimonials;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(t =>
        t.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.schoolName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.testimonial.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.categories.some(cat => cat.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(t => t.categories.includes(selectedCategory));
    }

    setFilteredTestimonials(filtered);
  }, [searchQuery, selectedCategory, testimonials]);

  const displayTestimonials = limit ? filteredTestimonials.slice(0, limit) : filteredTestimonials;

  const categories = Array.from(new Set(testimonials.flatMap(t => t.categories)));

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="space-y-8">
      {/* Stats Section */}
      {showStats && stats && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-gsv-green">{stats.totalTestimonials}</div>
              <div className="text-sm text-gray-600">Student Voices</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gsv-green">{stats.verifiedTestimonials}</div>
              <div className="text-sm text-gray-600">Verified</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gsv-green">{stats.schoolsReached}</div>
              <div className="text-sm text-gray-600">Schools Reached</div>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1">
                {renderStars(Math.round(stats.averageRating))}
              </div>
              <div className="text-sm text-gray-600">Average Rating</div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      {searchable && (
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search testimonials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gsv-green focus:border-transparent"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gsv-green focus:border-transparent"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' ')}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Testimonials Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayTestimonials.map((testimonial) => (
          <div
            key={testimonial.id}
            className={`bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow ${
              testimonial.featured ? 'ring-2 ring-gsv-green' : ''
            }`}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {testimonial.imageUrl ? (
                    <img
                      src={testimonial.imageUrl}
                      alt={testimonial.studentName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gsv-green text-white rounded-full flex items-center justify-center font-semibold text-lg">
                      {testimonial.studentName.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900">{testimonial.studentName}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-3 h-3" />
                      {testimonial.schoolName}, {testimonial.schoolState}
                    </div>
                  </div>
                </div>
                {testimonial.verified && (
                  <div className="flex items-center gap-1 text-green-600 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    Verified
                  </div>
                )}
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-2">
                <div className="flex">{renderStars(testimonial.rating)}</div>
                <span className="text-sm text-gray-600">
                  {testimonial.grade} • Age {testimonial.studentAge}
                </span>
              </div>

              {/* Categories */}
              <div className="flex flex-wrap gap-1 mb-3">
                {testimonial.categories.slice(0, 3).map((cat) => (
                  <span
                    key={cat}
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                  >
                    {cat.replace('-', ' ')}
                  </span>
                ))}
              </div>
            </div>

            {/* Testimonial Content */}
            <div className="p-6">
              <Quote className="w-6 h-6 text-gsv-green mb-3" />
              <p className="text-gray-700 mb-4 leading-relaxed">
                &ldquo;{testimonial.testimonial}&rdquo;
              </p>

              {/* Impact */}
              <div className="bg-green-50 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Impact</span>
                </div>
                <p className="text-sm text-green-700">{testimonial.impact}</p>
              </div>

              {/* Video */}
              {testimonial.videoUrl && (
                <div className="mb-4">
                  <button className="flex items-center gap-2 text-gsv-green hover:text-gsv-greenDark transition-colors">
                    <Play className="w-4 h-4" />
                    <span className="text-sm font-medium">Watch {testimonial.studentName}&apos;s Story</span>
                  </button>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                <span>Presented by {testimonial.volunteerName}</span>
                <span>{new Date(testimonial.presentationDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      {limit && filteredTestimonials.length > limit && (
        <div className="text-center">
          <button className="px-6 py-3 bg-gsv-green text-white rounded-lg hover:bg-gsv-greenDark transition-colors font-medium">
            Load More Testimonials
          </button>
        </div>
      )}

      {/* Empty State */}
      {displayTestimonials.length === 0 && (
        <div className="text-center py-12">
          <Quote className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No testimonials found</h3>
          <p className="text-gray-600">
            {searchQuery || selectedCategory !== "all"
              ? "Try adjusting your search or filter criteria."
              : "Testimonials will appear here once students share their experiences."
            }
          </p>
        </div>
      )}
    </div>
  );
}
