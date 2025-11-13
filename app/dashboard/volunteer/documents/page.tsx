"use client";

import { useState, useEffect } from "react";
import { Upload, FileText, Download, CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { formatDistanceToNow } from "date-fns";

interface Document {
  id: number;
  document_type: string;
  file_name: string;
  file_url: string;
  status: string;
  uploaded_at: string;
  reviewed_at: string | null;
  signed_at: string | null;
  signed_document_url: string | null;
  rejection_reason: string | null;
  notes: string | null;
  presentation: {
    id: number;
    topic: string | null;
    scheduled_date: string | null;
  } | null;
}

interface Template {
  id: number;
  template_name: string;
  template_type: string;
  file_url: string;
  description: string | null;
}

export default function VolunteerDocumentsPage() {
  const supabase = createClientComponentClient();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedPresentation, setSelectedPresentation] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<string>("");
  const [presentations, setPresentations] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load documents
      const { data: docs } = await supabase
        .from("volunteer_documents")
        .select(`
          *,
          presentation:presentations(id, topic, scheduled_date)
        `)
        .order("uploaded_at", { ascending: false });

      if (docs) {
        setDocuments(docs);
      }

      // Load templates
      const { data: tmpls } = await supabase
        .from("document_templates")
        .select("*")
        .eq("is_active", true)
        .order("template_type");

      if (tmpls) {
        setTemplates(tmpls);
      }

      // Load presentations
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Get user's team ID
        const { data: teamMember } = await supabase
          .from("team_members")
          .select("volunteer_team_id")
          .eq("user_id", session.user.id)
          .single();

        if (teamMember) {
          const { data: pres } = await supabase
            .from("presentations")
            .select("id, topic, scheduled_date")
            .eq("volunteer_team_id", teamMember.volunteer_team_id)
            .order("scheduled_date", { ascending: false });

          if (pres) {
            setPresentations(pres);
          }
        }
      }
    } catch (error) {
      console.error("Error loading documents:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!selectedPresentation || !selectedType) {
      alert("Please select a presentation and document type");
      return;
    }

    try {
      setUploading(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert("Not authenticated");
        return;
      }

      // Get team ID
      const { data: teamMember } = await supabase
        .from("team_members")
        .select("volunteer_team_id")
        .eq("user_id", session.user.id)
        .single();

      if (!teamMember) {
        alert("Not part of a team");
        return;
      }

      // Upload file to Supabase Storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${teamMember.volunteer_team_id}_${selectedPresentation}_${Date.now()}.${fileExt}`;
      const filePath = `volunteer-documents/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("documents")
        .getPublicUrl(filePath);

      // Create document record
      const { error: insertError } = await supabase
        .from("volunteer_documents")
        .insert({
          volunteer_id: teamMember.volunteer_team_id,
          presentation_id: selectedPresentation,
          document_type: selectedType,
          file_url: publicUrl,
          file_name: file.name,
          file_size: file.size,
          file_type: file.type,
          uploaded_by: session.user.id,
          status: "pending"
        });

      if (insertError) throw insertError;

      // Reset form
      e.target.value = "";
      setSelectedPresentation(null);
      setSelectedType("");

      await loadData();
      alert("Document uploaded successfully! Founders will review it.");
    } catch (error: any) {
      console.error("Error uploading document:", error);
      alert(error.message || "Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
      case "signed_by_founder":
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "under_review":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
      case "signed_by_founder":
      case "approved":
        return <CheckCircle2 className="w-4 h-4" />;
      case "rejected":
        return <XCircle className="w-4 h-4" />;
      case "under_review":
        return <Clock className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case "volunteer_signature_form":
        return "Volunteer Signature Form";
      case "teacher_signature_form":
        return "Teacher Signature Form";
      case "hours_verification":
        return "Hours Verification";
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="container py-14">
        <div className="text-center py-12 text-gsv-gray">Loading documents...</div>
      </div>
    );
  }

  return (
    <div className="container py-14">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gsv-charcoal mb-2">Document Submission</h1>
          <p className="text-gsv-gray">
            Upload signed documents after your presentation is complete
          </p>
        </div>

        {/* Instructions */}
        <div className="card p-6 mb-6 bg-blue-50 border-blue-200">
          <h2 className="text-lg font-semibold text-blue-900 mb-3">How to Submit Documents</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
            <li>Download the required forms from the templates below</li>
            <li>Print the forms</li>
            <li>Get them signed by the teacher and all volunteers after your presentation</li>
            <li>Scan or take photos of the signed documents</li>
            <li>Upload them here</li>
            <li>Founders will review and sign off on them</li>
          </ol>
        </div>

        {/* Templates Section */}
        {templates.length > 0 && (
          <div className="card p-6 mb-6">
            <h2 className="text-xl font-semibold text-gsv-charcoal mb-4">Download Forms</h2>
            <div className="space-y-3">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gsv-green" />
                    <div>
                      <div className="font-medium text-gsv-charcoal">{template.template_name}</div>
                      {template.description && (
                        <div className="text-sm text-gsv-gray">{template.description}</div>
                      )}
                    </div>
                  </div>
                  <a
                    href={template.file_url}
                    download
                    className="px-4 py-2 bg-gsv-green text-white rounded-lg hover:bg-gsv-greenDark transition flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Section */}
        <div className="card p-6 mb-6">
          <h2 className="text-xl font-semibold text-gsv-charcoal mb-4">Upload Signed Documents</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gsv-charcoal mb-2">
                Presentation <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedPresentation || ""}
                onChange={(e) => setSelectedPresentation(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gsv-green"
              >
                <option value="">Select a presentation...</option>
                {presentations.map((pres) => (
                  <option key={pres.id} value={pres.id}>
                    {pres.topic || `Presentation #${pres.id}`} - {pres.scheduled_date ? new Date(pres.scheduled_date).toLocaleDateString() : "TBD"}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gsv-charcoal mb-2">
                Document Type <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gsv-green"
              >
                <option value="">Select document type...</option>
                <option value="volunteer_signature_form">Volunteer Signature Form</option>
                <option value="teacher_signature_form">Teacher Signature Form</option>
                <option value="hours_verification">Hours Verification</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gsv-charcoal mb-2">
                Upload File <span className="text-red-500">*</span>
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gsv-green transition">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                  disabled={uploading || !selectedPresentation || !selectedType}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className={`cursor-pointer flex flex-col items-center gap-2 ${
                    uploading || !selectedPresentation || !selectedType
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  <Upload className="w-8 h-8 text-gsv-gray" />
                  <span className="text-sm text-gsv-gray">
                    {uploading ? "Uploading..." : "Click to upload or drag and drop"}
                  </span>
                  <span className="text-xs text-gsv-gray">PDF, JPG, or PNG (max 10MB)</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Documents List */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gsv-charcoal mb-4">Your Documents</h2>
          {documents.length === 0 ? (
            <div className="text-center py-8 text-gsv-gray">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No documents uploaded yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="border rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <FileText className="w-5 h-5 text-gsv-green" />
                        <div>
                          <div className="font-medium text-gsv-charcoal">{doc.file_name}</div>
                          <div className="text-sm text-gsv-gray">
                            {getDocumentTypeLabel(doc.document_type)}
                            {doc.presentation && (
                              <> • {doc.presentation.topic || `Presentation #${doc.presentation.id}`}</>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gsv-gray">
                        <span>Uploaded {formatDistanceToNow(new Date(doc.uploaded_at), { addSuffix: true })}</span>
                        {doc.reviewed_at && (
                          <span>Reviewed {formatDistanceToNow(new Date(doc.reviewed_at), { addSuffix: true })}</span>
                        )}
                        {doc.signed_at && (
                          <span>Signed {formatDistanceToNow(new Date(doc.signed_at), { addSuffix: true })}</span>
                        )}
                      </div>
                      {doc.rejection_reason && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                          <strong>Rejection reason:</strong> {doc.rejection_reason}
                        </div>
                      )}
                      {doc.signed_document_url && (
                        <div className="mt-2">
                          <a
                            href={doc.signed_document_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-gsv-green hover:underline flex items-center gap-1"
                          >
                            <Download className="w-4 h-4" />
                            Download Signed Document
                          </a>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(doc.status)}`}>
                        {getStatusIcon(doc.status)}
                        {doc.status.replace("_", " ")}
                      </span>
                      <a
                        href={doc.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gsv-green hover:underline text-sm"
                      >
                        View
                      </a>
                    </div>
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

