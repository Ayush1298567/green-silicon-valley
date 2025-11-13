"use client";
import { useState } from "react";
import { Upload, FileText, ExternalLink, Link as LinkIcon, Trash2, Plus, Filter } from "lucide-react";
import { type ResourceRow } from "@/types/db";
import UploadMaterialModal from "./UploadMaterialModal";
import AddLinkModal from "./AddLinkModal";

interface TrainingMaterialsInterfaceProps {
  materials: ResourceRow[];
  canEdit: boolean;
}

export default function TrainingMaterialsInterface({ materials, canEdit }: TrainingMaterialsInterfaceProps) {
  const [filterType, setFilterType] = useState<string>("all");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);

  const filteredMaterials = filterType === "all"
    ? materials
    : materials.filter(m => {
        if (filterType === "file") return m.file_url && !m.file_url.includes("docs.google");
        if (filterType === "google") return m.file_url && m.file_url.includes("docs.google");
        return true;
      });

  const handleDelete = async (materialId: number) => {
    if (!confirm("Are you sure you want to delete this training material?")) return;

    try {
      const res = await fetch(`/api/resources/${materialId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        window.location.reload();
      } else {
        alert("Failed to delete material");
      }
    } catch (error) {
      console.error("Error deleting material:", error);
      alert("Error deleting material");
    }
  };

  const getMaterialIcon = (material: ResourceRow) => {
    if (material.file_url?.includes("docs.google.com/document")) return "📄"; // Google Docs
    if (material.file_url?.includes("docs.google.com/presentation")) return "📊"; // Google Slides
    if (material.file_url?.includes("docs.google.com/spreadsheets")) return "📈"; // Google Sheets
    if (material.filename?.endsWith(".pdf")) return "📕";
    return "📎";
  };

  return (
    <div className="space-y-6">
      {/* Actions Bar */}
      <div className="card p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Filters */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterType("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filterType === "all" ? "bg-gsv-green text-white" : "bg-gray-100 text-gsv-gray hover:bg-gray-200"
              }`}
            >
              All Materials ({materials.length})
            </button>
            <button
              onClick={() => setFilterType("file")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filterType === "file" ? "bg-gsv-green text-white" : "bg-gray-100 text-gsv-gray hover:bg-gray-200"
              }`}
            >
              Files & PDFs
            </button>
            <button
              onClick={() => setFilterType("google")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filterType === "google" ? "bg-gsv-green text-white" : "bg-gray-100 text-gsv-gray hover:bg-gray-200"
              }`}
            >
              Google Docs/Slides
            </button>
          </div>

          {/* Actions */}
          {canEdit && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowUploadModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              >
                <Upload className="w-4 h-4" />
                Upload File
              </button>
              <button
                onClick={() => setShowLinkModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
              >
                <LinkIcon className="w-4 h-4" />
                Add Google Link
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Info Card */}
      <div className="card p-4 bg-blue-50 border border-blue-200">
        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <strong>Tip:</strong> For Google Docs/Slides/Sheets, make sure to set sharing to “Anyone with the link can view” before adding the link here.
          </div>
        </div>
      </div>

      {/* Materials Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMaterials.length === 0 ? (
          <div className="col-span-full card p-12 text-center">
            <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gsv-gray mb-4">No training materials yet</p>
            {canEdit && (
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Upload a file
                </button>
                <span className="text-gsv-gray">or</span>
                <button
                  onClick={() => setShowLinkModal(true)}
                  className="text-sm text-green-600 hover:underline"
                >
                  Add a Google link
                </button>
              </div>
            )}
          </div>
        ) : (
          filteredMaterials.map((material) => (
            <div key={material.id} className="card p-6 hover:shadow-lg transition">
              {/* Icon & Title */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{getMaterialIcon(material)}</span>
                  <div>
                    <h3 className="font-semibold text-gsv-charcoal mb-1">{material.filename}</h3>
                    {material.description && (
                      <p className="text-xs text-gsv-gray">{material.description}</p>
                    )}
                  </div>
                </div>
                {canEdit && (
                  <button
                    onClick={() => handleDelete(material.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Metadata */}
              <div className="space-y-2 text-xs text-gsv-gray mb-4">
                {material.subcategory && (
                  <div className="inline-block px-2 py-1 bg-gray-100 rounded-full">
                    {material.subcategory}
                  </div>
                )}
                <div>Added {material.created_at ? new Date(material.created_at).toLocaleDateString() : "Unknown"}</div>
                {material.download_count !== null && material.download_count !== undefined && material.download_count > 0 && (
                  <div>{material.download_count} downloads</div>
                )}
              </div>

              {/* Action */}
              <a
                href={material.file_url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 w-full justify-center px-4 py-2 bg-gsv-green text-white rounded-lg hover:bg-gsv-green/90 transition text-sm"
              >
                {material.file_url?.includes("docs.google") ? "Open in Google" : "Download"}
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          ))
        )}
      </div>

      {/* Modals */}
      {showUploadModal && (
        <UploadMaterialModal
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => {
            setShowUploadModal(false);
            window.location.reload();
          }}
        />
      )}

      {showLinkModal && (
        <AddLinkModal
          onClose={() => setShowLinkModal(false)}
          onSuccess={() => {
            setShowLinkModal(false);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}

