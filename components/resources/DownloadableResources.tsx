"use client";
import { useState } from "react";
import { Download, FileText, Image, Video, File, Eye, ExternalLink, Search, Filter } from "lucide-react";

interface DownloadableResource {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  fileType: 'pdf' | 'docx' | 'pptx' | 'jpg' | 'png' | 'mp4' | 'zip';
  fileSize: number; // in bytes
  category: 'flyers' | 'posters' | 'presentations' | 'handouts' | 'videos' | 'brochures' | 'logos';
  audience: 'teachers' | 'parents' | 'students' | 'administrators' | 'general';
  thumbnailUrl?: string;
  previewUrl?: string;
  downloads: number;
  featured: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// Sample resources data - in production, this would come from database
const sampleResources: DownloadableResource[] = [
  {
    id: "1",
    title: "Green Silicon Valley Program Flyer",
    description: "One-page overview of our environmental STEM education program for teachers and administrators",
    fileUrl: "/downloads/gsv-program-flyer.pdf",
    fileType: "pdf",
    fileSize: 245760, // 240KB
    category: "flyers",
    audience: "teachers",
    thumbnailUrl: "/downloads/thumbnails/flyer-thumb.jpg",
    previewUrl: "/downloads/previews/flyer-preview.pdf",
    downloads: 1247,
    featured: true,
    tags: ["overview", "program-info", "schools", "environmental-education"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "2",
    title: "Parent Information Brochure",
    description: "Comprehensive guide for parents about our presentations and how to get involved",
    fileUrl: "/downloads/parent-brochure.pdf",
    fileType: "pdf",
    fileSize: 512000, // 500KB
    category: "brochures",
    audience: "parents",
    thumbnailUrl: "/downloads/thumbnails/brochure-thumb.jpg",
    downloads: 892,
    featured: true,
    tags: ["parents", "information", "get-involved", "support"],
    createdAt: "2024-01-05T00:00:00Z",
    updatedAt: "2024-01-05T00:00:00Z"
  },
  {
    id: "3",
    title: "Environmental STEM Poster Set",
    description: "Beautiful posters featuring environmental themes and STEM concepts for classroom decoration",
    fileUrl: "/downloads/poster-set.zip",
    fileType: "zip",
    fileSize: 15728640, // 15MB
    category: "posters",
    audience: "teachers",
    thumbnailUrl: "/downloads/thumbnails/posters-thumb.jpg",
    downloads: 634,
    featured: true,
    tags: ["classroom-decor", "posters", "environmental-themes", "STEM"],
    createdAt: "2024-01-10T00:00:00Z",
    updatedAt: "2024-01-10T00:00:00Z"
  },
  {
    id: "4",
    title: "Presentation Follow-up Handouts",
    description: "Activity sheets and discussion guides for teachers to use after our presentations",
    fileUrl: "/downloads/followup-handouts.pdf",
    fileType: "pdf",
    fileSize: 1024000, // 1MB
    category: "handouts",
    audience: "teachers",
    downloads: 756,
    featured: false,
    tags: ["activities", "follow-up", "discussion-guides", "homework"],
    createdAt: "2024-01-15T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z"
  },
  {
    id: "5",
    title: "Green Silicon Valley Logo Pack",
    description: "Official logos in various formats for partners and collaborators",
    fileUrl: "/downloads/logo-pack.zip",
    fileType: "zip",
    fileSize: 2097152, // 2MB
    category: "logos",
    audience: "administrators",
    downloads: 234,
    featured: false,
    tags: ["logos", "branding", "partners", "official"],
    createdAt: "2024-01-20T00:00:00Z",
    updatedAt: "2024-01-20T00:00:00Z"
  },
  {
    id: "6",
    title: "Student Action Project Ideas",
    description: "Creative project ideas for students to continue environmental learning at home",
    fileUrl: "/downloads/student-projects.pdf",
    fileType: "pdf",
    fileSize: 768000, // 750KB
    category: "handouts",
    audience: "students",
    downloads: 543,
    featured: false,
    tags: ["projects", "student-led", "home-activities", "creative"],
    createdAt: "2024-01-25T00:00:00Z",
    updatedAt: "2024-01-25T00:00:00Z"
  }
];

interface DownloadableResourcesProps {
  category?: string;
  audience?: string;
  featuredOnly?: boolean;
  maxItems?: number;
  searchable?: boolean;
}

export default function DownloadableResources({
  category,
  audience,
  featuredOnly = false,
  maxItems,
  searchable = true
}: DownloadableResourcesProps) {
  const [resources, setResources] = useState<DownloadableResource[]>(sampleResources);
  const [filteredResources, setFilteredResources] = useState<DownloadableResource[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>(category || "all");
  const [selectedAudience, setSelectedAudience] = useState<string>(audience || "all");

  useState(() => {
    let filtered = featuredOnly ? resources.filter(r => r.featured) : resources;

    if (category) {
      filtered = filtered.filter(r => r.category === category);
    }

    if (audience) {
      filtered = filtered.filter(r => r.audience === audience);
    }

    setFilteredResources(filtered);
  });

  useState(() => {
    let filtered = resources;

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(r =>
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(r => r.category === selectedCategory);
    }

    // Apply audience filter
    if (selectedAudience !== "all") {
      filtered = filtered.filter(r => r.audience === selectedAudience);
    }

    setFilteredResources(filtered);
  });

  const displayResources = maxItems ? filteredResources.slice(0, maxItems) : filteredResources;

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf': return FileText;
      case 'docx': return FileText;
      case 'pptx': return FileText;
      case 'jpg':
      case 'png': return Image;
      case 'mp4': return Video;
      case 'zip': return File;
      default: return File;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleDownload = async (resource: DownloadableResource) => {
    // In production, this would track downloads in the database
    console.log(`Downloading: ${resource.title}`);

    // Simulate download
    const link = document.createElement('a');
    link.href = resource.fileUrl;
    link.download = resource.title + '.' + resource.fileType;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const categories = Array.from(new Set(resources.map(r => r.category)));
  const audiences = Array.from(new Set(resources.map(r => r.audience)));

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      {searchable && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search resources..."
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
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
            <select
              value={selectedAudience}
              onChange={(e) => setSelectedAudience(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gsv-green focus:border-transparent"
            >
              <option value="all">All Audiences</option>
              {audiences.map(aud => (
                <option key={aud} value={aud}>
                  {aud.charAt(0).toUpperCase() + aud.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Resources Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayResources.map((resource) => {
          const FileIcon = getFileIcon(resource.fileType);
          return (
            <div
              key={resource.id}
              className={`bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow ${
                resource.featured ? 'ring-2 ring-gsv-green' : ''
              }`}
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <FileIcon className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                        resource.category === 'flyers' ? 'bg-blue-100 text-blue-800' :
                        resource.category === 'brochures' ? 'bg-green-100 text-green-800' :
                        resource.category === 'posters' ? 'bg-purple-100 text-purple-800' :
                        resource.category === 'handouts' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {resource.category}
                      </span>
                      {resource.featured && (
                        <span className="ml-2 inline-block px-2 py-1 bg-gsv-green text-white text-xs rounded-full">
                          Featured
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <h3 className="font-semibold text-gray-900 mb-2">{resource.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{resource.description}</p>

                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>{resource.audience}</span>
                  <span>•</span>
                  <span>{formatFileSize(resource.fileSize)}</span>
                  <span>•</span>
                  <span>{resource.downloads} downloads</span>
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    {resource.previewUrl && (
                      <button className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded hover:bg-gray-100 transition-colors">
                        <Eye className="w-3 h-3" />
                        Preview
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => handleDownload(resource)}
                    className="flex items-center gap-2 px-4 py-2 bg-gsv-green text-white text-sm rounded-lg hover:bg-gsv-greenDark transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>

                {/* Tags */}
                {resource.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {resource.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {displayResources.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No resources found</h3>
          <p className="text-gray-600">
            {searchQuery || selectedCategory !== "all" || selectedAudience !== "all"
              ? "Try adjusting your search or filter criteria."
              : "No downloadable resources are currently available."
            }
          </p>
        </div>
      )}

      {/* Load More */}
      {maxItems && filteredResources.length > maxItems && (
        <div className="text-center">
          <button className="px-6 py-3 bg-gsv-green text-white rounded-lg hover:bg-gsv-greenDark transition-colors font-medium">
            Load More Resources
          </button>
        </div>
      )}
    </div>
  );
}
