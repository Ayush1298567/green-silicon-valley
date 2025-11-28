"use client";

import { useState, useEffect } from "react";
import { Camera, Video, CheckCircle, XCircle, Eye, Download, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface MediaSubmission {
  id: string;
  presentation_id: string;
  uploaded_by: string;
  uploader_name: string;
  file_url: string;
  file_type: 'image' | 'video';
  caption: string;
  approved_for_social: boolean;
  status: 'pending' | 'approved' | 'rejected';
  uploaded_at: string;
  presentation_topic?: string;
  school_name?: string;
}

export default function MediaReviewPage() {
  const [mediaSubmissions, setMediaSubmissions] = useState<MediaSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState<MediaSubmission | null>(null);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetchMediaSubmissions();
  }, []);

  const fetchMediaSubmissions = async () => {
    try {
      const res = await fetch("/api/admin/media-review");
      const data = await res.json();
      if (data.ok) {
        setMediaSubmissions(data.media || []);
      }
    } catch (error) {
      console.error("Error fetching media:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateMediaStatus = async (mediaId: string, status: 'approved' | 'rejected', approvedForSocial?: boolean) => {
    try {
      const res = await fetch(`/api/admin/media-review/${mediaId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, approved_for_social: approvedForSocial }),
      });

      const data = await res.json();
      if (data.ok) {
        toast.success(`Media ${status}`);
        fetchMediaSubmissions();
        setSelectedMedia(null);
      } else {
        toast.error(data.error || "Failed to update media");
      }
    } catch (error) {
      toast.error("Network error");
    }
  };

  const filteredMedia = mediaSubmissions.filter(media => {
    if (filter === "all") return true;
    return media.status === filter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Media Review</h1>
          <p className="text-gray-600">Review and approve volunteer-submitted photos and videos</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{mediaSubmissions.filter(m => m.status === "pending").length}</div>
              <div className="text-sm text-gray-600">Pending Review</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{mediaSubmissions.filter(m => m.status === "approved").length}</div>
              <div className="text-sm text-gray-600">Approved</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{mediaSubmissions.filter(m => m.status === "rejected").length}</div>
              <div className="text-sm text-gray-600">Rejected</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Camera className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{mediaSubmissions.length}</div>
              <div className="text-sm text-gray-600">Total Submissions</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex gap-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="all">All Submissions</option>
            <option value="pending">Pending Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMedia.length === 0 ? (
          <div className="col-span-full bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Camera className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No media submissions</h3>
            <p className="text-gray-600">Volunteers haven't submitted any media yet, or all submissions have been reviewed.</p>
          </div>
        ) : (
          filteredMedia.map((media) => (
            <div key={media.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* Media Preview */}
              <div className="aspect-video bg-gray-100 relative group cursor-pointer" onClick={() => setSelectedMedia(media)}>
                {media.file_type === 'image' ? (
                  <img
                    src={media.file_url}
                    alt="Presentation media"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Video className="w-12 h-12 text-gray-400" />
                    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-white bg-opacity-90 rounded-full p-3">
                        <Eye className="w-6 h-6 text-gray-900" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Status Badge */}
                <div className="absolute top-2 left-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    media.status === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : media.status === 'rejected'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {media.status}
                  </span>
                </div>

                {/* File Type Badge */}
                <div className="absolute top-2 right-2">
                  <span className="bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-full">
                    {media.file_type}
                  </span>
                </div>
              </div>

              {/* Media Info */}
              <div className="p-4">
                <h3 className="font-medium text-gray-900 mb-1 truncate">
                  {media.presentation_topic || "Presentation"}
                </h3>
                <p className="text-sm text-gray-600 mb-2">{media.school_name}</p>
                <p className="text-sm text-gray-700 mb-3 line-clamp-2">{media.caption}</p>

                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <span>{media.uploader_name}</span>
                  <span>{new Date(media.uploaded_at).toLocaleDateString()}</span>
                </div>

                {/* Action Buttons */}
                {media.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateMediaStatus(media.id, 'approved', true)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                    >
                      <CheckCircle size={14} />
                      Approve
                    </button>
                    <button
                      onClick={() => updateMediaStatus(media.id, 'rejected')}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                    >
                      <XCircle size={14} />
                      Reject
                    </button>
                  </div>
                )}

                {media.status === 'approved' && (
                  <div className="flex items-center gap-2 text-green-600 text-sm">
                    <CheckCircle size={14} />
                    <span>Approved for social media</span>
                  </div>
                )}

                {media.status === 'rejected' && (
                  <div className="flex items-center gap-2 text-red-600 text-sm">
                    <XCircle size={14} />
                    <span>Rejected</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Media Modal */}
      {selectedMedia && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h3 className="font-semibold text-gray-900">{selectedMedia.presentation_topic}</h3>
                <p className="text-sm text-gray-600">{selectedMedia.school_name}</p>
              </div>
              <button
                onClick={() => setSelectedMedia(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="p-4">
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-4">
                {selectedMedia.file_type === 'image' ? (
                  <img
                    src={selectedMedia.file_url}
                    alt="Presentation media"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <video
                    src={selectedMedia.file_url}
                    controls
                    className="w-full h-full object-contain"
                  />
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Caption</label>
                  <p className="text-gray-900">{selectedMedia.caption}</p>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Uploaded by: {selectedMedia.uploader_name}</span>
                  <span>{new Date(selectedMedia.uploaded_at).toLocaleString()}</span>
                </div>

                {selectedMedia.status === 'pending' && (
                  <div className="flex gap-3 pt-4 border-t">
                    <button
                      onClick={() => updateMediaStatus(selectedMedia.id, 'approved', true)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      <CheckCircle size={16} />
                      Approve for Social Media
                    </button>
                    <button
                      onClick={() => updateMediaStatus(selectedMedia.id, 'approved', false)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      <CheckCircle size={16} />
                      Approve (No Social)
                    </button>
                    <button
                      onClick={() => updateMediaStatus(selectedMedia.id, 'rejected')}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      <XCircle size={16} />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
