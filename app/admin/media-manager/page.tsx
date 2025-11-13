"use client";

import { useState, useEffect } from "react";
import { Upload, Image as ImageIcon, FileText, Trash2, Search, Filter, Download } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import ImageUploader from "@/components/website-builder/ImageUploader";

interface MediaFile {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploaded_at: string;
  folder?: string;
}

export default function MediaManagerPage() {
  const supabase = createClientComponentClient();
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [selectedFolder, setSelectedFolder] = useState<string>("all");
  const [folders, setFolders] = useState<string[]>([]);

  useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = async () => {
    try {
      setLoading(true);
      
      // List all files from public-media bucket
      const { data: fileList, error } = await supabase.storage
        .from("public-media")
        .list("", {
          limit: 100,
          offset: 0,
          sortBy: { column: "created_at", order: "desc" }
        });

      if (error) throw error;

      // Get folders
      const folderSet = new Set<string>();
      const mediaFiles: MediaFile[] = [];

      if (fileList) {
        for (const item of fileList) {
          if (item.id) {
            // It's a file
            const { data: { publicUrl } } = supabase.storage
              .from("public-media")
              .getPublicUrl(item.name);

            const folder = item.name.split("/")[0];
            if (folder !== item.name) {
              folderSet.add(folder);
            }

            mediaFiles.push({
              id: item.id,
              name: item.name,
              url: publicUrl,
              type: item.metadata?.mimetype || "unknown",
              size: item.metadata?.size || 0,
              uploaded_at: item.created_at || new Date().toISOString(),
              folder: folder !== item.name ? folder : undefined
            });
          } else {
            // It's a folder
            folderSet.add(item.name);
          }
        }
      }

      setFolders(Array.from(folderSet).sort());
      setFiles(mediaFiles);
    } catch (error) {
      console.error("Error loading media:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (file: MediaFile) => {
    if (!confirm(`Delete ${file.name}?`)) return;

    try {
      const { error } = await supabase.storage
        .from("public-media")
        .remove([file.name]);

      if (error) throw error;

      await loadMedia();
    } catch (error: any) {
      alert(error.message || "Failed to delete file");
    }
  };

  const handleUploadComplete = async (url: string) => {
    await loadMedia();
  };

  const filteredFiles = files.filter(file => {
    if (searchQuery && !file.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filterType !== "all") {
      if (filterType === "image" && !file.type.startsWith("image/")) return false;
      if (filterType === "document" && !file.type.includes("pdf")) return false;
    }
    if (selectedFolder !== "all" && file.folder !== selectedFolder) {
      return false;
    }
    return true;
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="container py-14">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gsv-charcoal mb-2">Media Manager</h1>
        <p className="text-gsv-gray">
          Upload and manage images, documents, and other media files
        </p>
      </div>

      {/* Upload Section */}
      <div className="card p-6 mb-6">
        <h2 className="text-xl font-semibold text-gsv-charcoal mb-4">Upload New Media</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gsv-charcoal mb-2">
              Upload to Folder
            </label>
            <select
              value={selectedFolder}
              onChange={(e) => setSelectedFolder(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="all">Root</option>
              {folders.map(folder => (
                <option key={folder} value={folder}>{folder}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gsv-charcoal mb-2">
              Upload File
            </label>
            <ImageUploader
              onUploadComplete={handleUploadComplete}
              folder={selectedFolder !== "all" ? selectedFolder : "uploads"}
              accept="*/*"
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6 flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[300px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gsv-gray w-4 h-4" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green"
            />
          </div>
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green"
        >
          <option value="all">All Types</option>
          <option value="image">Images</option>
          <option value="document">Documents</option>
        </select>
      </div>

      {/* Files Grid */}
      {loading ? (
        <div className="text-center py-12 text-gsv-gray">Loading media...</div>
      ) : filteredFiles.length === 0 ? (
        <div className="card p-12 text-center">
          <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gsv-gray text-lg">No media files found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredFiles.map((file) => (
            <div
              key={file.id}
              className="border rounded-lg overflow-hidden hover:shadow-lg transition"
            >
              {file.type.startsWith("image/") ? (
                <img
                  src={file.url}
                  alt={file.name}
                  className="w-full h-32 object-cover"
                />
              ) : (
                <div className="w-full h-32 bg-gray-100 flex items-center justify-center">
                  <FileText className="w-12 h-12 text-gray-400" />
                </div>
              )}
              <div className="p-2">
                <div className="text-xs font-medium text-gsv-charcoal truncate mb-1" title={file.name}>
                  {file.name.split("/").pop()}
                </div>
                <div className="text-xs text-gsv-gray mb-2">
                  {formatFileSize(file.size)}
                </div>
                <div className="flex gap-1">
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition text-center"
                  >
                    View
                  </a>
                  <button
                    onClick={() => handleDelete(file)}
                    className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
