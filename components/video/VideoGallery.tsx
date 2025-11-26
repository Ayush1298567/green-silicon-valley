"use client";
import { useState } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, X, ChevronLeft, ChevronRight } from "lucide-react";

interface VideoClip {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  duration: number; // in seconds
  studentName?: string;
  schoolName?: string;
  presentationDate: string;
  category: string;
  featured: boolean;
}

interface VideoGalleryProps {
  videos?: VideoClip[];
  autoplay?: boolean;
  maxVideos?: number;
}

// Sample video data - in production, this would come from database
const sampleVideos: VideoClip[] = [
  {
    id: "1",
    title: "Emma's Environmental Journey",
    description: "Emma shares how the presentation inspired her to start recycling and help the planet",
    thumbnailUrl: "/videos/thumbnails/emma-thumb.jpg",
    videoUrl: "/videos/emma-environment.mp4",
    duration: 28,
    studentName: "Emma Chen",
    schoolName: "Lincoln Elementary",
    presentationDate: "2024-01-15",
    category: "inspiration",
    featured: true
  },
  {
    id: "2",
    title: "Marcus Builds Wind Turbine",
    description: "Watch Marcus demonstrate his homemade wind turbine project",
    thumbnailUrl: "/videos/thumbnails/marcus-thumb.jpg",
    videoUrl: "/videos/marcus-wind-turbine.mp4",
    duration: 32,
    studentName: "Marcus Rodriguez",
    schoolName: "Oak Grove Middle School",
    presentationDate: "2024-01-20",
    category: "projects",
    featured: true
  },
  {
    id: "3",
    title: "Aisha's Ocean Conservation",
    description: "Aisha explains what she learned about plastic pollution and sea turtles",
    thumbnailUrl: "/videos/thumbnails/aisha-thumb.jpg",
    videoUrl: "/videos/aisha-ocean.mp4",
    duration: 25,
    studentName: "Aisha Patel",
    schoolName: "Washington Elementary",
    presentationDate: "2024-01-10",
    category: "conservation",
    featured: true
  },
  {
    id: "4",
    title: "Solar Power Experiment",
    description: "Students conduct hands-on solar power experiments during presentation",
    thumbnailUrl: "/videos/thumbnails/solar-thumb.jpg",
    videoUrl: "/videos/solar-experiment.mp4",
    duration: 30,
    schoolName: "Jefferson Intermediate",
    presentationDate: "2024-01-08",
    category: "experiments",
    featured: false
  },
  {
    id: "5",
    title: "Water Conservation Challenge",
    description: "Sophia's water conservation campaign results and student testimonials",
    thumbnailUrl: "/videos/thumbnails/water-thumb.jpg",
    videoUrl: "/videos/water-conservation.mp4",
    duration: 35,
    studentName: "Sophia Nguyen",
    schoolName: "Roosevelt Middle School",
    presentationDate: "2024-01-25",
    category: "conservation",
    featured: false
  },
  {
    id: "6",
    title: "Ecosystem Food Web Activity",
    description: "Interactive food web demonstration with student participation",
    thumbnailUrl: "/videos/thumbnails/foodweb-thumb.jpg",
    videoUrl: "/videos/food-web-activity.mp4",
    duration: 27,
    schoolName: "Madison Elementary",
    presentationDate: "2024-01-18",
    category: "activities",
    featured: false
  }
];

export default function VideoGallery({ videos = sampleVideos, autoplay = false, maxVideos }: VideoGalleryProps) {
  const [selectedVideo, setSelectedVideo] = useState<VideoClip | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const displayVideos = maxVideos ? videos.slice(0, maxVideos) : videos;
  const featuredVideos = videos.filter(v => v.featured);
  const regularVideos = videos.filter(v => !v.featured);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVideoSelect = (video: VideoClip) => {
    setSelectedVideo(video);
    setCurrentTime(0);
    setIsPlaying(false);
  };

  const closeModal = () => {
    setSelectedVideo(null);
    setIsPlaying(false);
    setCurrentTime(0);
  };

  return (
    <>
      <div className="space-y-8">
        {/* Featured Videos */}
        {featuredVideos.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Featured Stories</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredVideos.map((video) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  onSelect={handleVideoSelect}
                  featured={true}
                />
              ))}
            </div>
          </div>
        )}

        {/* All Videos */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            {featuredVideos.length > 0 ? "More Stories" : "Student Stories"}
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {regularVideos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                onSelect={handleVideoSelect}
                featured={false}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{selectedVideo.title}</h3>
                <p className="text-sm text-gray-600">{selectedVideo.description}</p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Player */}
            <div className="relative bg-black aspect-video">
              <video
                className="w-full h-full"
                poster={selectedVideo.thumbnailUrl}
                controls
                onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
              >
                <source src={selectedVideo.videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>

            {/* Video Info */}
            <div className="p-4 bg-gray-50">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div>
                  {selectedVideo.studentName && (
                    <span>Student: {selectedVideo.studentName} • </span>
                  )}
                  <span>School: {selectedVideo.schoolName} • </span>
                  <span>Date: {new Date(selectedVideo.presentationDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span>Duration: {formatDuration(selectedVideo.duration)}</span>
                  <span className="px-2 py-1 bg-gsv-green text-white text-xs rounded-full">
                    {selectedVideo.category}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

interface VideoCardProps {
  video: VideoClip;
  onSelect: (video: VideoClip) => void;
  featured: boolean;
}

function VideoCard({ video, onSelect, featured }: VideoCardProps) {
  return (
    <div
      className={`group cursor-pointer rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 ${
        featured ? 'ring-2 ring-gsv-green' : ''
      }`}
      onClick={() => onSelect(video)}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gray-200">
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
          <Play className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
          {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
        </div>
        {featured && (
          <div className="absolute top-2 left-2 bg-gsv-green text-white text-xs px-2 py-1 rounded-full">
            Featured
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h4 className="font-medium text-gray-900 mb-1 line-clamp-2">{video.title}</h4>
        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{video.description}</p>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{video.schoolName}</span>
          <span>{new Date(video.presentationDate).toLocaleDateString()}</span>
        </div>
        <div className="mt-2">
          <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
            {video.category}
          </span>
        </div>
      </div>
    </div>
  );
}
