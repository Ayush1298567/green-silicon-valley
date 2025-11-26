"use client";

import { useState } from "react";
import { Upload, ExternalLink, Plus, X, Edit } from "lucide-react";

interface WorkspaceSlide {
  id: string;
  slide_number: number;
  slide_url?: string;
  slide_content?: any;
}

interface PresentationWorkspace {
  id: string;
  workspace_name: string;
  slides_url?: string;
  workspace_slides: WorkspaceSlide[];
}

interface WorkspaceEditorProps {
  workspace: PresentationWorkspace;
  onUpdate: (updates: Partial<PresentationWorkspace>) => void;
}

export default function WorkspaceEditor({ workspace, onUpdate }: WorkspaceEditorProps) {
  const [slidesUrl, setSlidesUrl] = useState(workspace.slides_url || "");
  const [editingSlide, setEditingSlide] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleSlidesUrlChange = (url: string) => {
    setSlidesUrl(url);
    onUpdate({ slides_url: url });
  };

  const addSlide = async () => {
    try {
      const res = await fetch(`/api/presentations/workspace/${workspace.id}/slides`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slide_number: workspace.workspace_slides.length + 1,
          slide_content: { title: "New Slide", content: "" }
        }),
      });

      const data = await res.json();
      if (data.ok) {
        onUpdate({
          workspace_slides: [...workspace.workspace_slides, data.slide]
        });
      }
    } catch (error) {
      console.error("Error adding slide:", error);
    }
  };

  const updateSlide = async (slideId: string, updates: Partial<WorkspaceSlide>) => {
    try {
      const res = await fetch(`/api/presentations/workspace/${workspace.id}/slides/${slideId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      const data = await res.json();
      if (data.ok) {
        onUpdate({
          workspace_slides: workspace.workspace_slides.map(slide =>
            slide.id === slideId ? data.slide : slide
          )
        });
        setEditingSlide(null);
      }
    } catch (error) {
      console.error("Error updating slide:", error);
    }
  };

  const deleteSlide = async (slideId: string) => {
    if (!confirm("Are you sure you want to delete this slide?")) return;

    try {
      const res = await fetch(`/api/presentations/workspace/${workspace.id}/slides/${slideId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (data.ok) {
        onUpdate({
          workspace_slides: workspace.workspace_slides.filter(slide => slide.id !== slideId)
        });
      }
    } catch (error) {
      console.error("Error deleting slide:", error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload/slides", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.ok) {
        handleSlidesUrlChange(data.url);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Google Slides Integration */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Presentation Slides</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Google Slides URL
            </label>
            <div className="flex gap-3">
              <input
                type="url"
                value={slidesUrl}
                onChange={(e) => setSlidesUrl(e.target.value)}
                onBlur={() => handleSlidesUrlChange(slidesUrl)}
                placeholder="https://docs.google.com/presentation/d/..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {slidesUrl && (
                <a
                  href={slidesUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <ExternalLink size={16} />
                  View Slides
                </a>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Share your Google Slides with edit access for real-time collaboration
            </p>
          </div>

          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Or Upload Presentation File
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <input
                type="file"
                accept=".ppt,.pptx,.pdf"
                onChange={handleFileUpload}
                className="hidden"
                id="slides-upload"
                disabled={uploading}
              />
              <label htmlFor="slides-upload" className="cursor-pointer">
                <Upload className={`w-8 h-8 mx-auto mb-2 ${uploading ? "text-gray-400" : "text-gray-400"}`} />
                <p className={`text-sm ${uploading ? "text-gray-400" : "text-gray-600"}`}>
                  {uploading ? "Uploading..." : "Click to upload presentation file"}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PPT, PPTX, or PDF files accepted
                </p>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Individual Slides Management */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Slide Management</h3>
          <button
            onClick={addSlide}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            <Plus size={16} />
            Add Slide
          </button>
        </div>

        {workspace.workspace_slides.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No slides added yet. Click "Add Slide" to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workspace.workspace_slides
              .sort((a, b) => a.slide_number - b.slide_number)
              .map((slide) => (
                <div key={slide.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-900">
                      Slide {slide.slide_number}
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setEditingSlide(editingSlide === slide.id ? null : slide.id)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                        title="Edit slide"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => deleteSlide(slide.id)}
                        className="p-1 text-red-400 hover:text-red-600"
                        title="Delete slide"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>

                  {editingSlide === slide.id ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Slide title"
                        value={slide.slide_content?.title || ""}
                        onChange={(e) => {
                          const updatedContent = {
                            ...slide.slide_content,
                            title: e.target.value
                          };
                          updateSlide(slide.id, { slide_content: updatedContent });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                      />
                      <textarea
                        placeholder="Slide content/notes"
                        value={slide.slide_content?.content || ""}
                        onChange={(e) => {
                          const updatedContent = {
                            ...slide.slide_content,
                            content: e.target.value
                          };
                          updateSlide(slide.id, { slide_content: updatedContent });
                        }}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                      />
                      <input
                        type="url"
                        placeholder="Slide image URL (optional)"
                        value={slide.slide_url || ""}
                        onChange={(e) => updateSlide(slide.id, { slide_url: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                      />
                    </div>
                  ) : (
                    <div>
                      {slide.slide_url && (
                        <div className="mb-3">
                          <img
                            src={slide.slide_url}
                            alt={`Slide ${slide.slide_number}`}
                            className="w-full h-24 object-cover rounded border"
                          />
                        </div>
                      )}
                      <h4 className="font-medium text-gray-900 mb-1">
                        {slide.slide_content?.title || "Untitled Slide"}
                      </h4>
                      {slide.slide_content?.content && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {slide.slide_content.content}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Preview Section */}
      {workspace.slides_url && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Preview</h3>
          <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-500">
              <ExternalLink size={48} className="mx-auto mb-2" />
              <p>Slides will be embedded here</p>
              <p className="text-sm">Open in new tab to edit</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
