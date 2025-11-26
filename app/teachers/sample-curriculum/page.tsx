"use client";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, FileText, Eye, Download, Play, Image, Clock, Users } from "lucide-react";

interface CurriculumSlide {
  id: string;
  title: string;
  gradeLevel: string;
  topic: string;
  content: string;
  imageUrl?: string;
  duration?: string;
  objectives: string[];
  keyPoints: string[];
}

export default function SampleCurriculumPage() {
  const [slides, setSlides] = useState<CurriculumSlide[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [selectedSlide, setSelectedSlide] = useState<CurriculumSlide | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Sample curriculum data - in production this would come from database
  const sampleCurriculum: CurriculumSlide[] = [
    {
      id: '1',
      title: 'What is Climate Change?',
      gradeLevel: '3-5',
      topic: 'Climate Basics',
      content: 'Climate change is when the Earth\'s weather patterns change over a long time. This happens because of things people do that add heat-trapping gases to the air.',
      imageUrl: '/api/placeholder/600/400',
      duration: '10 minutes',
      objectives: [
        'Students will understand what climate change means',
        'Students will identify human activities that contribute to climate change',
        'Students will recognize that climate change affects weather patterns'
      ],
      keyPoints: [
        'Climate change = long-term changes in temperature and weather patterns',
        'Caused by greenhouse gases like carbon dioxide',
        'Human activities like driving cars and burning coal release these gases',
        'Climate change can cause more extreme weather events'
      ]
    },
    {
      id: '2',
      title: 'The Greenhouse Effect',
      gradeLevel: '3-5',
      topic: 'Climate Science',
      content: 'The greenhouse effect is like a blanket around Earth. Greenhouse gases trap heat from the sun, keeping our planet warm enough for life.',
      imageUrl: '/api/placeholder/600/400',
      duration: '15 minutes',
      objectives: [
        'Students will understand how the greenhouse effect works',
        'Students will differentiate between helpful and harmful greenhouse gases',
        'Students will see how greenhouse gases affect Earth\'s temperature'
      ],
      keyPoints: [
        'Greenhouse effect keeps Earth at a comfortable temperature',
        'Some greenhouse gases are necessary for life',
        'Too many greenhouse gases cause Earth to get too warm',
        'Carbon dioxide, methane, and water vapor are greenhouse gases'
      ]
    },
    {
      id: '3',
      title: 'Renewable Energy Solutions',
      gradeLevel: '6-8',
      topic: 'Solutions',
      content: 'Renewable energy comes from sources that nature replaces, like sunlight, wind, and water. These energy sources don\'t run out and don\'t pollute.',
      imageUrl: '/api/placeholder/600/400',
      duration: '20 minutes',
      objectives: [
        'Students will identify different types of renewable energy',
        'Students will understand the benefits of renewable energy',
        'Students will analyze the environmental impact of energy choices'
      ],
      keyPoints: [
        'Solar energy: Captures sunlight using panels',
        'Wind energy: Uses wind turbines to generate electricity',
        'Hydroelectric: Uses moving water to produce power',
        'Renewable energy reduces air pollution and greenhouse gases',
        'These sources are sustainable and will never run out'
      ]
    },
    {
      id: '4',
      title: 'Carbon Footprint and You',
      gradeLevel: '6-8',
      topic: 'Personal Impact',
      content: 'A carbon footprint is the total amount of greenhouse gases caused by your actions. By making small changes, you can reduce your carbon footprint.',
      imageUrl: '/api/placeholder/600/400',
      duration: '15 minutes',
      objectives: [
        'Students will calculate their personal carbon footprint',
        'Students will identify actions that reduce greenhouse gas emissions',
        'Students will create a personal action plan for sustainability'
      ],
      keyPoints: [
        'Carbon footprint = total greenhouse gases from your activities',
        'Driving, flying, and eating meat create large carbon footprints',
        'Walking, biking, and plant-based diets reduce your footprint',
        'Small changes like recycling and using LED bulbs add up',
        'Every person\'s actions matter in fighting climate change'
      ]
    },
    {
      id: '5',
      title: 'Climate Policy and Global Action',
      gradeLevel: '9-12',
      topic: 'Policy & Politics',
      content: 'Countries around the world are working together to fight climate change through agreements like the Paris Accord and national policies.',
      imageUrl: '/api/placeholder/600/400',
      duration: '25 minutes',
      objectives: [
        'Students will understand international climate agreements',
        'Students will analyze the role of government in climate solutions',
        'Students will evaluate different policy approaches to climate change'
      ],
      keyPoints: [
        'Paris Agreement: 196 countries agreed to limit global warming',
        'Goal is to keep global temperature rise under 1.5°C',
        'Countries submit Nationally Determined Contributions (NDCs)',
        'Policies include carbon taxes, renewable energy mandates, and emissions standards',
        'Individual actions and policy changes both necessary for success'
      ]
    }
  ];

  useEffect(() => {
    // Simulate loading curriculum data
    setTimeout(() => {
      setSlides(sampleCurriculum);
      setLoading(false);
    }, 1000);
  }, []);

  const gradeLevels = ['3-5', '6-8', '9-12'];
  const topics = ['Climate Basics', 'Climate Science', 'Solutions', 'Personal Impact', 'Policy & Politics'];

  const filteredSlides = slides.filter(slide => {
    const gradeMatch = selectedGrade === 'all' || slide.gradeLevel === selectedGrade;
    const topicMatch = selectedTopic === 'all' || slide.topic === selectedTopic;
    return gradeMatch && topicMatch;
  });

  const openSlideViewer = (slide: CurriculumSlide) => {
    setSelectedSlide(slide);
    setCurrentSlideIndex(filteredSlides.findIndex(s => s.id === slide.id));
  };

  const closeSlideViewer = () => {
    setSelectedSlide(null);
  };

  const navigateSlide = (direction: 'prev' | 'next') => {
    if (!selectedSlide) return;

    const newIndex = direction === 'next'
      ? (currentSlideIndex + 1) % filteredSlides.length
      : (currentSlideIndex - 1 + filteredSlides.length) % filteredSlides.length;

    setCurrentSlideIndex(newIndex);
    setSelectedSlide(filteredSlides[newIndex]);
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case '3-5': return 'bg-blue-100 text-blue-800';
      case '6-8': return 'bg-green-100 text-green-800';
      case '9-12': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTopicColor = (topic: string) => {
    const colors: { [key: string]: string } = {
      'Climate Basics': 'bg-orange-100 text-orange-800',
      'Climate Science': 'bg-red-100 text-red-800',
      'Solutions': 'bg-green-100 text-green-800',
      'Personal Impact': 'bg-blue-100 text-blue-800',
      'Policy & Politics': 'bg-purple-100 text-purple-800',
    };
    return colors[topic] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gsv-green"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gsv-green via-gsv-greenDark to-gsv-slate-900 text-white py-20">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Sample Curriculum
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8">
              Preview our environmental STEM curriculum slides and activities
            </p>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 max-w-2xl mx-auto">
              <p className="text-white/90">
                Browse through sample slides from our presentations to see how we structure
                environmental education for different grade levels.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-12 bg-white border-b">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Browse Curriculum</h2>
              <p className="text-gray-600">Filter by grade level and topic to find relevant content</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              {/* Grade Level Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grade Level
                </label>
                <select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gsv-green focus:border-transparent"
                >
                  <option value="all">All Grade Levels</option>
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
                  <option value="all">All Topics</option>
                  {topics.map(topic => (
                    <option key={topic} value={topic}>{topic}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Curriculum Grid */}
      <section className="py-16">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            {filteredSlides.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No curriculum found</h3>
                <p className="text-gray-600">Try adjusting your filters to see more content</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredSlides.map((slide) => (
                  <div
                    key={slide.id}
                    className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow overflow-hidden cursor-pointer"
                    onClick={() => openSlideViewer(slide)}
                  >
                    {/* Preview Image */}
                    <div className="aspect-video bg-gray-100 relative">
                      <div className="w-full h-full flex items-center justify-center">
                        <Eye className="w-12 h-12 text-gray-400" />
                      </div>
                      <div className="absolute top-2 left-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getGradeColor(slide.gradeLevel)}`}>
                          Grades {slide.gradeLevel}
                        </span>
                      </div>
                      <div className="absolute top-2 right-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getTopicColor(slide.topic)}`}>
                          {slide.topic}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="font-bold text-gray-900 mb-2">{slide.title}</h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{slide.content}</p>

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{slide.duration}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>{slide.objectives.length} objectives</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Modal Slide Viewer */}
      {selectedSlide && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedSlide.title}</h3>
                  <div className="flex gap-2 mt-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getGradeColor(selectedSlide.gradeLevel)}`}>
                      Grades {selectedSlide.gradeLevel}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getTopicColor(selectedSlide.topic)}`}>
                      {selectedSlide.topic}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-medium">
                      {selectedSlide.duration}
                    </span>
                  </div>
                </div>
                <button
                  onClick={closeSlideViewer}
                  className="text-gray-400 hover:text-gray-600 p-2"
                >
                  <span className="text-2xl">&times;</span>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="grid md:grid-cols-2 min-h-[400px]">
                {/* Left side - Content */}
                <div className="p-6">
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-2">Content Overview</h4>
                    <p className="text-gray-700">{selectedSlide.content}</p>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-2">Learning Objectives</h4>
                    <ul className="space-y-1">
                      {selectedSlide.objectives.map((objective, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-gsv-green font-bold">•</span>
                          <span>{objective}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Key Points</h4>
                    <ul className="space-y-1">
                      {selectedSlide.keyPoints.map((point, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-blue-600 font-bold">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Right side - Visual */}
                <div className="p-6 bg-gray-50">
                  <div className="aspect-video bg-white rounded-lg shadow-sm flex items-center justify-center">
                    <div className="text-center">
                      <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Curriculum Slide Preview</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Full presentation materials available to volunteer teams
                      </p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Presentation Notes</h4>
                    <div className="bg-white rounded-lg p-4 text-sm text-gray-700">
                      <p className="mb-2">
                        <strong>Timing:</strong> {selectedSlide.duration}
                      </p>
                      <p className="mb-2">
                        <strong>Grade Level:</strong> {selectedSlide.gradeLevel}
                      </p>
                      <p>
                        <strong>Materials:</strong> Projector, whiteboard markers, activity handouts
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {currentSlideIndex + 1} of {filteredSlides.length} slides
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

      {/* Call to Action */}
      <section className="py-16 bg-gsv-green/5">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Bring This Curriculum to Your Classroom</h2>
            <p className="text-lg text-gray-600 mb-8">
              Our trained volunteers deliver these engaging presentations free of charge
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/teachers/request"
                className="bg-gsv-green text-white px-8 py-3 rounded-lg hover:bg-gsv-greenDark transition-colors font-medium"
              >
                Request a Presentation
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
