"use client";

import { useState, useEffect } from "react";
import { Camera, Video, Upload, X, CheckCircle, AlertCircle, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface Presentation {
  id: string;
  topic: string;
  scheduled_date: string;
  school_name: string;
  status: string;
}

interface MediaSubmission {
  id: string;
  presentation_id: string;
  file_url: string;
  file_type: 'image' | 'video';
  caption: string;
  approved_for_social: boolean;
  uploaded_at: string;
  status: 'pending' | 'approved' | 'rejected';
}

export default function MediaSubmissionPage() {
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [selectedPresentation, setSelectedPresentation] = useState<string>("");
  const [uploadedFiles, setUploadedFiles] = useState<MediaSubmission[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPresentations();
  }, []);

  useEffect(() => {
    if (selectedPresentation) {
      fetchUploadedFiles();
    }
  }, [selectedPresentation]);

  const fetchPresentations = async () => {
    try {
      const res = await fetch("/api/volunteer/presentations/completed");
      const data = await res.json();
      if (data.ok) {
        setPresentations(data.presentations || []);
      }
    } catch (error) {
      console.error("Error fetching presentations:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUploadedFiles = async () => {
    try {
      const res = await fetch(`/api/volunteer/media?presentation_id=${selectedPresentation}`);
      const data = await res.json();
      if (data.ok) {
        setUploadedFiles(data.media || []);
      }
    } catch (error) {
      console.error("Error fetching media:", error);
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || !selectedPresentation) {
      toast.error("Please select a presentation first");
      return;
    }

    const validFiles = Array.from(files).filter(file => {
      const isValidType = file.type.startsWith('image/') || file.type.startsWith('video/');
      const isValidSize = file.size <= 50 * 1024 * 1024; // 50MB limit

      if (!isValidType) {
        toast.error(`${file.name} is not a valid image or video file`);
        return false;
      }
      if (!isValidSize) {
        toast.error(`${file.name} is too large (max 50MB)`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setUploading(true);

    try {
      for (const file of validFiles) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('presentation_id', selectedPresentation);
        formData.append('caption', `Photo from ${presentations.find(p => p.id === selectedPresentation)?.topic || 'presentation'}`);

        const res = await fetch('/api/volunteer/media/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (!data.ok) {
          toast.error(`Failed to upload ${file.name}`);
        } else {
          toast.success(`${file.name} uploaded successfully`);
        }
      }

      fetchUploadedFiles(); // Refresh the list
    } catch (error) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleCaptionUpdate = async (mediaId: string, caption: string) => {
    try {
      const res = await fetch(`/api/volunteer/media/${mediaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caption }),
      });

      const data = await res.json();
      if (data.ok) {
        setUploadedFiles(files =>
          files.map(file =>
            file.id === mediaId ? { ...file, caption } : file
          )
        );
        toast.success("Caption updated");
      }
    } catch (error) {
      toast.error("Failed to update caption");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gsv-green"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Share Your Presentation Moments</h1>
        <p className="text-gray-600">
          Upload photos and videos from your presentations to help us showcase the impact on social media and grants
        </p>
      </div>

      {/* Presentation Selection */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Presentation</h2>

        {presentations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Camera className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">No completed presentations yet</p>
            <p className="text-xs text-gray-400 mt-1">Complete a presentation to start sharing media</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {presentations.map((presentation) => (
              <div
                key={presentation.id}
                onClick={() => setSelectedPresentation(presentation.id)}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedPresentation === presentation.id
                    ? 'border-gsv-green bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <h3 className="font-medium text-gray-900 mb-1">{presentation.topic}</h3>
                <p className="text-sm text-gray-600 mb-1">{presentation.school_name}</p>
                <p className="text-xs text-gray-500">
                  {new Date(presentation.scheduled_date).toLocaleDateString()}
                </p>
                <div className="mt-2">
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    Completed
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Section */}
      {selectedPresentation && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Media</h2>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <div className="mb-4">
              <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">Share photos and videos from your presentation</p>
              <p className="text-sm text-gray-500 mt-1">
                Images: JPG, PNG (max 10MB each) • Videos: MP4 (max 50MB each)
              </p>
            </div>

            <input
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
              id="media-upload"
              disabled={uploading}
            />

            <label
              htmlFor="media-upload"
              className={`inline-flex items-center gap-2 px-4 py-2 bg-gsv-green text-white rounded-lg hover:bg-gsv-greenDark transition-colors cursor-pointer ${
                uploading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={16} />
                  Choose Files
                </>
              )}
            </label>
          </div>

          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900 mb-1">Privacy & Usage</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Media may be used on social media and grant applications</li>
                  <li>• Student faces will be blurred for privacy</li>
                  <li>• You can add captions to tell your story</li>
                  <li>• Founders review all submissions before sharing</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Uploaded Media */}
      {selectedPresentation && uploadedFiles.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Uploaded Media</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {uploadedFiles.map((media) => (
              <div key={media.id} className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Media Preview */}
                <div className="aspect-video bg-gray-100 relative">
                  {media.file_type === 'image' ? (
                    <img
                      src={media.file_url}
                      alt="Presentation media"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Video className="w-8 h-8 text-gray-400" />
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="absolute top-2 right-2">
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
                </div>

                {/* Media Details */}
                <div className="p-4">
                  <textarea
                    value={media.caption}
                    onChange={(e) => {
                      const newCaption = e.target.value;
                      setUploadedFiles(files =>
                        files.map(file =>
                          file.id === media.id ? { ...file, caption: newCaption } : file
                        )
                      );
                    }}
                    onBlur={(e) => handleCaptionUpdate(media.id, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gsv-green focus:border-gsv-green"
                    placeholder="Add a caption..."
                    rows={2}
                  />

                  <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                    <span>{new Date(media.uploaded_at).toLocaleDateString()}</span>
                    <div className="flex items-center gap-1">
                      {media.file_type === 'image' ? (
                        <ImageIcon size={12} />
                      ) : (
                        <Video size={12} />
                      )}
                      <span className="capitalize">{media.file_type}</span>
                    </div>
                  </div>

                  {media.approved_for_social && (
                    <div className="mt-2 flex items-center gap-1 text-green-600 text-xs">
                      <CheckCircle size={12} />
                      Approved for social media
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Impact Message */}
      <div className="bg-gradient-to-r from-gsv-green to-gsv-greenDark rounded-lg p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">
            <Camera className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-semibold mb-1">Your Photos Make a Difference</h3>
            <p className="text-sm opacity-90">
              Sharing your presentation moments helps us attract more volunteers, secure grants,
              and show the real impact of environmental education. Thank you for being part of the story!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
