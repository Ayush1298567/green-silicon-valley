"use client";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Download, Eye, FileText, Play, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

interface ExampleSlide {
  id: string;
  title: string;
  type: 'slides' | 'activity' | 'video' | 'worksheet';
  fileUrl: string;
  description: string;
  gradeLevels: string[];
  topics: string[];
  isFeatured: boolean;
}

interface ExampleSlidesViewerProps {
  gradeLevel?: string;
  topic?: string;
  featuredOnly?: boolean;
}

export default function ExampleSlidesViewer({
  gradeLevel,
  topic,
  featuredOnly = false
}: ExampleSlidesViewerProps) {
  const [slides, setSlides] = useState<ExampleSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlide, setSelectedSlide] = useState<ExampleSlide | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filteredSlides, setFilteredSlides] = useState<ExampleSlide[]>([]);

  useEffect(() => {
    loadExampleSlides();
  }, []);

  useEffect(() => {
    filterSlides();
  }, [slides, gradeLevel, topic, featuredOnly]);

  const loadExampleSlides = async () => {
    try {
      const response = await fetch('/api/volunteers/examples');
      if (response.ok) {
        const data = await response.json();
        setSlides(data.slides || []);
      }
    } catch (error) {
      console.error('Error loading example slides:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterSlides = () => {
    let filtered = slides;

    if (featuredOnly) {
      filtered = filtered.filter(slide => slide.isFeatured);
    }

    if (gradeLevel) {
      filtered = filtered.filter(slide =>
        slide.gradeLevels.some(level =>
          level.toLowerCase().includes(gradeLevel.toLowerCase())
        )
      );
    }

    if (topic) {
      filtered = filtered.filter(slide =>
        slide.topics.some(t =>
          t.toLowerCase().includes(topic.toLowerCase())
        )
      );
    }

    setFilteredSlides(filtered);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'slides':
        return <FileText className="w-5 h-5" />;
      case 'video':
        return <Play className="w-5 h-5" />;
      case 'activity':
        return <Eye className="w-5 h-5" />;
      case 'worksheet':
        return <Download className="w-5 h-5" />;
      default:
        return <ImageIcon className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'slides':
        return 'bg-blue-100 text-blue-800';
      case 'video':
        return 'bg-red-100 text-red-800';
      case 'activity':
        return 'bg-green-100 text-green-800';
      case 'worksheet':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const openModal = (slide: ExampleSlide) => {
    setSelectedSlide(slide);
    setCurrentIndex(filteredSlides.findIndex(s => s.id === slide.id));
  };

  const closeModal = () => {
    setSelectedSlide(null);
  };

  const navigateSlide = (direction: 'prev' | 'next') => {
    if (!selectedSlide) return;

    const newIndex = direction === 'next'
      ? (currentIndex + 1) % filteredSlides.length
      : (currentIndex - 1 + filteredSlides.length) % filteredSlides.length;

    setCurrentIndex(newIndex);
    setSelectedSlide(filteredSlides[newIndex]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gsv-green"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Example Presentations</h2>
        <p className="text-gray-600">
          See what our presentations look like before you volunteer
        </p>
      </div>

      {/* Filters */}
      {(gradeLevel || topic || featuredOnly) && (
        <div className="flex flex-wrap gap-2 justify-center">
          {featuredOnly && (
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
              Featured Only
            </span>
          )}
          {gradeLevel && (
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              Grade {gradeLevel}
            </span>
          )}
          {topic && (
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              {topic}
            </span>
          )}
        </div>
      )}

      {/* Slides Grid */}
      {filteredSlides.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No examples found</h3>
          <p className="text-gray-600">
            {gradeLevel || topic || featuredOnly
              ? "Try adjusting your filters to see more examples"
              : "Example presentations coming soon!"
            }
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSlides.map((slide) => (
            <div
              key={slide.id}
              className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow overflow-hidden cursor-pointer"
              onClick={() => openModal(slide)}
            >
              {/* Preview Image */}
              <div className="aspect-video bg-gray-100 relative">
                {slide.type === 'video' ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <Play className="w-12 h-12 text-gray-400" />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    {getTypeIcon(slide.type)}
                  </div>
                )}
                {slide.isFeatured && (
                  <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded text-xs font-medium">
                    Featured
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(slide.type)}`}>
                    {slide.type.charAt(0).toUpperCase() + slide.type.slice(1)}
                  </span>
                  {slide.gradeLevels.length > 0 && (
                    <span className="text-xs text-gray-500">
                      Grades {slide.gradeLevels.join(', ')}
                    </span>
                  )}
                </div>

                <h3 className="font-semibold text-gray-900 mb-2">{slide.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">{slide.description}</p>

                {slide.topics.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {slide.topics.slice(0, 3).map((topic, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                      >
                        {topic}
                      </span>
                    ))}
                    {slide.topics.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                        +{slide.topics.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {selectedSlide && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedSlide.title}</h3>
                  <p className="text-gray-600 mt-1">{selectedSlide.description}</p>
                </div>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 p-2"
                >
                  <span className="text-2xl">&times;</span>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="aspect-video bg-gray-100 rounded-lg mb-4 relative">
                {selectedSlide.type === 'video' ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <Play className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Video preview not available</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Contact your team leader for full video access
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      {getTypeIcon(selectedSlide.type)}
                      <p className="text-gray-600 mt-4">
                        {selectedSlide.type.charAt(0).toUpperCase() + selectedSlide.type.slice(1)} Preview
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        Full content available to team members
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Metadata */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">Type:</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${getTypeColor(selectedSlide.type)}`}>
                        {selectedSlide.type}
                      </span>
                    </div>
                    {selectedSlide.gradeLevels.length > 0 && (
                      <div>
                        <span className="text-gray-600">Grade Levels:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedSlide.gradeLevels.map((level, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                              {level}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Topics Covered</h4>
                  {selectedSlide.topics.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {selectedSlide.topics.map((topic, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No topics specified</p>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {currentIndex + 1} of {filteredSlides.length} examples
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigateSlide('prev')}
                    disabled={filteredSlides.length <= 1}
                    className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => navigateSlide('next')}
                    disabled={filteredSlides.length <= 1}
                    className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
