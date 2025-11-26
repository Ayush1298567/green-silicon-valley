"use client";

import { useState, useEffect } from "react";
import { FolderOpen, FileText, Image, Video, Upload, Download, Search, Plus, MoreVertical, Eye, Trash2, Share } from "lucide-react";

interface DepartmentResource {
  id: string;
  department_id: string;
  name: string;
  type: "document" | "image" | "video" | "link" | "other";
  file_url?: string;
  description?: string;
  tags: string[];
  access_level: "public" | "department" | "restricted";
  uploaded_by: string;
  uploaded_at: string;
  file_size?: number;
}

interface DepartmentFolderProps {
  departmentId: string;
}

export default function ResourceFolder({ departmentId }: DepartmentFolderProps) {
  const [resources, setResources] = useState<DepartmentResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    name: "",
    type: "document" as DepartmentResource["type"],
    description: "",
    tags: "",
    access_level: "department" as DepartmentResource["access_level"],
    file: null as File | null
  });

  useEffect(() => {
    fetchResources();
  }, [departmentId]);

  const fetchResources = async () => {
    try {
      const res = await fetch(`/api/departments/${departmentId}/resources`);
      const data = await res.json();
      if (data.ok) {
        setResources(data.resources || []);
      }
    } catch (error) {
      console.error("Error fetching resources:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!uploadForm.file && uploadForm.type !== "link") {
      alert("Please select a file to upload");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", uploadForm.name);
      formData.append("type", uploadForm.type);
      formData.append("description", uploadForm.description);
      formData.append("tags", uploadForm.tags);
      formData.append("access_level", uploadForm.access_level);

      if (uploadForm.file) {
        formData.append("file", uploadForm.file);
      }

      const res = await fetch(`/api/departments/${departmentId}/resources`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.ok) {
        fetchResources();
        setShowUploadForm(false);
        setUploadForm({
          name: "",
          type: "document",
          description: "",
          tags: "",
          access_level: "department",
          file: null
        });
      } else {
        alert("Error uploading resource: " + data.error);
      }
    } catch (error: any) {
      alert("Error uploading resource: " + error.message);
    }
  };

  const handleDeleteResource = async (resourceId: string) => {
    if (!confirm("Are you sure you want to delete this resource?")) return;

    try {
      const res = await fetch(`/api/departments/${departmentId}/resources/${resourceId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (data.ok) {
        fetchResources();
      }
    } catch (error: any) {
      alert("Error deleting resource: " + error.message);
    }
  };

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = selectedType === "all" || resource.type === selectedType;

    return matchesSearch && matchesType;
  });

  const getFileIcon = (type: string) => {
    switch (type) {
      case "document": return <FileText className="w-5 h-5 text-blue-600" />;
      case "image": return <Image className="w-5 h-5 text-green-600" />;
      case "video": return <Video className="w-5 h-5 text-purple-600" />;
      case "link": return <Share className="w-5 h-5 text-orange-600" />;
      default: return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const getAccessLevelBadge = (level: string) => {
    switch (level) {
      case "public":
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Public</span>;
      case "department":
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Department</span>;
      case "restricted":
        return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">Restricted</span>;
      default:
        return null;
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + " " + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Department Resources</h2>
          <p className="text-gray-600">Shared files, documents, and materials</p>
        </div>
        <button
          onClick={() => setShowUploadForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Upload size={16} />
          Upload Resource
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search resources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Types</option>
          <option value="document">Documents</option>
          <option value="image">Images</option>
          <option value="video">Videos</option>
          <option value="link">Links</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Upload Form */}
      {showUploadForm && (
        <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Upload New Resource</h3>

          <form onSubmit={handleUpload} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Resource Name *
                </label>
                <input
                  type="text"
                  value={uploadForm.name}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type *
                </label>
                <select
                  value={uploadForm.type}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, type: e.target.value as DepartmentResource["type"] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="document">Document</option>
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                  <option value="link">Link</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={uploadForm.description}
                onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={uploadForm.tags}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, tags: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="presentation, template, guide"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Access Level
                </label>
                <select
                  value={uploadForm.access_level}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, access_level: e.target.value as DepartmentResource["access_level"] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="department">Department Only</option>
                  <option value="public">Public (All Users)</option>
                  <option value="restricted">Restricted</option>
                </select>
              </div>
            </div>

            {uploadForm.type !== "link" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  File *
                </label>
                <input
                  type="file"
                  onChange={(e) => setUploadForm(prev => ({ ...prev, file: e.target.files?.[0] || null }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  accept={uploadForm.type === "image" ? "image/*" : uploadForm.type === "video" ? "video/*" : "*"}
                  required
                />
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Upload size={16} />
                Upload Resource
              </button>
              <button
                type="button"
                onClick={() => setShowUploadForm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Resources Grid */}
      {filteredResources.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <FolderOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium mb-2">No resources found</h3>
          <p className="mb-4">
            {searchTerm || selectedType !== "all"
              ? "Try adjusting your search or filters"
              : "Start by uploading your first department resource"
            }
          </p>
          {!searchTerm && selectedType === "all" && (
            <button
              onClick={() => setShowUploadForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Upload Your First Resource
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredResources.map((resource) => (
            <div key={resource.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {getFileIcon(resource.type)}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{resource.name}</h3>
                    <p className="text-sm text-gray-600 capitalize">{resource.type}</p>
                  </div>
                </div>

                <div className="relative">
                  <button className="p-1 text-gray-400 hover:text-gray-600">
                    <MoreVertical size={16} />
                  </button>
                  {/* Dropdown menu would go here */}
                </div>
              </div>

              {resource.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{resource.description}</p>
              )}

              {resource.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {resource.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      {tag}
                    </span>
                  ))}
                  {resource.tags.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      +{resource.tags.length - 3}
                    </span>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                <span>By {resource.uploaded_by}</span>
                <span>{formatFileSize(resource.file_size)}</span>
              </div>

              <div className="flex items-center justify-between">
                {getAccessLevelBadge(resource.access_level)}

                <div className="flex gap-2">
                  <button className="p-1 text-gray-400 hover:text-blue-600" title="View">
                    <Eye size={14} />
                  </button>
                  <button className="p-1 text-gray-400 hover:text-green-600" title="Download">
                    <Download size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteResource(resource.id)}
                    className="p-1 text-gray-400 hover:text-red-600"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {resources.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-3">Resource Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{resources.length}</div>
              <div className="text-sm text-gray-600">Total Resources</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {resources.filter(r => r.type === "document").length}
              </div>
              <div className="text-sm text-gray-600">Documents</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {resources.filter(r => r.type === "image").length}
              </div>
              <div className="text-sm text-gray-600">Images</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {resources.filter(r => r.access_level === "public").length}
              </div>
              <div className="text-sm text-gray-600">Public Access</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
