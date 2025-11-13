"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Folder, File, Upload, Search, MoreVertical, Download, Eye, Trash2 } from "lucide-react";

interface Document {
  id: number;
  filename: string;
  file_type: string;
  file_size: number;
  folder_id?: number;
  description?: string;
  tags?: string[];
  uploaded_at: string;
  download_count: number;
  view_count: number;
}

interface Folder {
  id: number;
  name: string;
  parent_id?: number;
  description?: string;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentFolder, setCurrentFolder] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchFolders();
    fetchDocuments();
  }, [currentFolder]);

  const fetchFolders = async () => {
    try {
      const res = await fetch("/api/documents/folders");
      const data = await res.json();
      if (data.ok) {
        setFolders(data.folders || []);
      }
    } catch (error) {
      console.error("Error fetching folders:", error);
    }
  };

  const fetchDocuments = async () => {
    try {
      const params = new URLSearchParams();
      if (currentFolder) {
        params.append("folder_id", currentFolder.toString());
      }

      const res = await fetch(`/api/documents?${params.toString()}`);
      const data = await res.json();
      if (data.ok) {
        setDocuments(data.documents || []);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType?.includes("pdf")) return "📄";
    if (fileType?.includes("image")) return "🖼️";
    if (fileType?.includes("word") || fileType?.includes("document")) return "📝";
    if (fileType?.includes("spreadsheet") || fileType?.includes("excel")) return "📊";
    return "📎";
  };

  const filteredDocuments = documents.filter((doc) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        doc.filename.toLowerCase().includes(query) ||
        doc.description?.toLowerCase().includes(query) ||
        doc.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }
    return true;
  });

  const currentFolderData = folders.find((f) => f.id === currentFolder);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gsv-charcoal">Documents</h1>
          <p className="text-gsv-gray mt-1">Manage and organize your documents</p>
        </div>
        <button className="px-4 py-2 bg-gsv-green text-white rounded-lg hover:bg-gsv-greenDark flex items-center gap-2">
          <Upload className="w-4 h-4" />
          Upload
        </button>
      </div>

      {/* Breadcrumb */}
      {currentFolder && (
        <div className="flex items-center gap-2 text-sm">
          <button
            onClick={() => setCurrentFolder(null)}
            className="text-gsv-green hover:text-gsv-greenDark"
          >
            All Documents
          </button>
          <span className="text-gsv-gray">/</span>
          <span className="text-gsv-charcoal">{currentFolderData?.name}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Folders Sidebar */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-semibold text-gsv-charcoal mb-4">Folders</h2>
          <div className="space-y-2">
            <button
              onClick={() => setCurrentFolder(null)}
              className={`w-full text-left px-3 py-2 rounded flex items-center gap-2 ${
                currentFolder === null
                  ? "bg-gsv-green/20 text-gsv-green"
                  : "hover:bg-gray-100 text-gsv-charcoal"
              }`}
            >
              <Folder className="w-4 h-4" />
              All Documents
            </button>
            {folders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => setCurrentFolder(folder.id)}
                className={`w-full text-left px-3 py-2 rounded flex items-center gap-2 ${
                  currentFolder === folder.id
                    ? "bg-gsv-green/20 text-gsv-green"
                    : "hover:bg-gray-100 text-gsv-charcoal"
                }`}
              >
                <Folder className="w-4 h-4" />
                {folder.name}
              </button>
            ))}
          </div>
        </div>

        {/* Documents Grid */}
        <div className="lg:col-span-3">
          {/* Search */}
          <div className="bg-white rounded-lg shadow p-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gsv-gray w-4 h-4" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green"
              />
            </div>
          </div>

          {/* Documents */}
          {loading ? (
            <div className="text-center py-12 text-gsv-gray">Loading documents...</div>
          ) : filteredDocuments.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <File className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gsv-gray">No documents found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-3xl">{getFileIcon(doc.file_type)}</div>
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <MoreVertical className="w-4 h-4 text-gsv-gray" />
                    </button>
                  </div>
                  <h3 className="font-medium text-gsv-charcoal mb-1 truncate" title={doc.filename}>
                    {doc.filename}
                  </h3>
                  {doc.description && (
                    <p className="text-sm text-gsv-gray mb-2 line-clamp-2">{doc.description}</p>
                  )}
                  <div className="flex items-center justify-between text-xs text-gsv-gray mb-3">
                    <span>{formatFileSize(doc.file_size)}</span>
                    <span>{new Date(doc.uploaded_at).toLocaleDateString()}</span>
                  </div>
                  {doc.tags && doc.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {doc.tags.slice(0, 2).map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2 pt-3 border-t">
                    <button
                      className="flex-1 px-3 py-1 text-sm bg-gray-100 text-gsv-charcoal rounded hover:bg-gray-200 flex items-center justify-center gap-1"
                      title="View"
                    >
                      <Eye className="w-3 h-3" />
                      View
                    </button>
                    <button
                      className="flex-1 px-3 py-1 text-sm bg-gsv-green/20 text-gsv-green rounded hover:bg-gsv-green/30 flex items-center justify-center gap-1"
                      title="Download"
                    >
                      <Download className="w-3 h-3" />
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

