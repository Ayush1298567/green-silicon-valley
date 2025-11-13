"use client";
import { useState } from "react";
import { X, Upload, Loader2 } from "lucide-react";

interface UploadMaterialModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function UploadMaterialModal({ onClose, onSuccess }: UploadMaterialModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subcategory: "orientation",
  });
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert("Please select a file to upload");
      return;
    }

    setUploading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("file", file);
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("subcategory", formData.subcategory);
      formDataToSend.append("category", "training");

      const res = await fetch("/api/resources/upload", {
        method: "POST",
        body: formDataToSend,
      });

      if (res.ok) {
        onSuccess();
        alert("Training material uploaded successfully!");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to upload material");
      }
    } catch (error) {
      console.error("Error uploading material:", error);
      alert("Error uploading material");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
        {/* Header */}
        <div className="border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gsv-charcoal">Upload Training Material</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="file" className="block text-sm font-medium text-gsv-charcoal mb-1">
              File (PDF, DOCX, PPTX) *
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gsv-green transition">
              <Upload className="w-8 h-8 mx-auto text-gsv-gray mb-2" />
              <input
                type="file"
                id="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-gsv-gray file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gsv-green file:text-white hover:file:bg-gsv-green/90"
                required
              />
              {file && (
                <p className="mt-2 text-sm text-gsv-green font-medium">
                  Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gsv-charcoal mb-1">
              Title *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green"
              placeholder="e.g., Volunteer Handbook 2024"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gsv-charcoal mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green"
              placeholder="Brief description of this material..."
            />
          </div>

          <div>
            <label htmlFor="subcategory" className="block text-sm font-medium text-gsv-charcoal mb-1">
              Category *
            </label>
            <select
              id="subcategory"
              value={formData.subcategory}
              onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green"
            >
              <option value="orientation">Orientation</option>
              <option value="presentation_skills">Presentation Skills</option>
              <option value="classroom_management">Classroom Management</option>
              <option value="safety">Safety & Protocols</option>
              <option value="activities">Activity Guides</option>
              <option value="general">General</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gsv-charcoal rounded-lg hover:bg-gray-50 transition"
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="inline-flex items-center gap-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

