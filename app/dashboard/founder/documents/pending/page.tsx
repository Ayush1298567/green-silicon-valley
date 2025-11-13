"use client";

import { useState, useEffect } from "react";
import { FileText, CheckCircle2, XCircle, Download, Upload, PenTool } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Document {
  id: number;
  volunteer_id: number;
  presentation_id: number | null;
  document_type: string;
  file_name: string;
  file_url: string;
  status: string;
  uploaded_at: string;
  notes: string | null;
  volunteer: {
    team_name: string | null;
  };
  presentation: {
    topic: string | null;
    scheduled_date: string | null;
  } | null;
}

export default function PendingDocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState<number | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [signatureFile, setSignatureFile] = useState<File | null>(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/documents/pending");
      const data = await res.json();
      
      if (data.ok) {
        setDocuments(data.documents || []);
      }
    } catch (error) {
      console.error("Error loading documents:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    if (!confirm("Approve this document?")) return;

    try {
      const res = await fetch(`/api/documents/${id}/approve`, {
        method: "POST"
      });

      const data = await res.json();
      if (data.ok) {
        loadDocuments();
      } else {
        alert(data.error || "Failed to approve document");
      }
    } catch (error) {
      console.error("Error approving document:", error);
      alert("Failed to approve document");
    }
  };

  const handleReject = async (id: number, reason: string) => {
    if (!reason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }

    try {
      const res = await fetch(`/api/documents/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason })
      });

      const data = await res.json();
      if (data.ok) {
        loadDocuments();
      } else {
        alert(data.error || "Failed to reject document");
      }
    } catch (error) {
      console.error("Error rejecting document:", error);
      alert("Failed to reject document");
    }
  };

  const handleSign = async (doc: Document) => {
    if (!signatureFile) {
      alert("Please upload the signed document");
      return;
    }

    try {
      setSigning(doc.id);

      const formData = new FormData();
      formData.append("file", signatureFile);
      formData.append("document_id", doc.id.toString());

      const res = await fetch(`/api/documents/${doc.id}/sign`, {
        method: "POST",
        body: formData
      });

      const data = await res.json();
      if (data.ok) {
        setSelectedDoc(null);
        setSignatureFile(null);
        loadDocuments();
        alert("Document signed and sent back to volunteer!");
      } else {
        alert(data.error || "Failed to sign document");
      }
    } catch (error) {
      console.error("Error signing document:", error);
      alert("Failed to sign document");
    } finally {
      setSigning(null);
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
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gsv-charcoal mb-2">Pending Documents</h1>
          <p className="text-gsv-gray">
            Review and sign volunteer-submitted documents
          </p>
        </div>

        {documents.length === 0 ? (
          <div className="card p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gsv-gray text-lg">No pending documents</p>
            <p className="text-gsv-gray text-sm mt-2">All documents have been reviewed.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="card p-6 border-l-4 border-yellow-400"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <FileText className="w-5 h-5 text-gsv-green" />
                      <div>
                        <div className="font-semibold text-gsv-charcoal">{doc.file_name}</div>
                        <div className="text-sm text-gsv-gray">
                          {getDocumentTypeLabel(doc.document_type)}
                          {doc.volunteer && <> • {doc.volunteer.team_name || `Team #${doc.volunteer_id}`}</>}
                          {doc.presentation && (
                            <> • {doc.presentation.topic || `Presentation #${doc.presentation.id}`}</>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-gsv-gray mb-4">
                      Uploaded {formatDistanceToNow(new Date(doc.uploaded_at), { addSuffix: true })}
                    </div>

                    <div className="flex gap-2">
                      <a
                        href={doc.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        View Document
                      </a>
                      <button
                        onClick={() => {
                          setSelectedDoc(doc);
                          setSignatureFile(null);
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                      >
                        <PenTool className="w-4 h-4" />
                        Sign & Send Back
                      </button>
                      <button
                        onClick={() => handleApprove(doc.id)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Approve Only
                      </button>
                      <button
                        onClick={() => {
                          const reason = prompt("Rejection reason:");
                          if (reason) {
                            handleReject(doc.id, reason);
                          }
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Sign Document Modal */}
        {selectedDoc && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-semibold text-gsv-charcoal mb-4">
                Sign Document: {selectedDoc.file_name}
              </h2>
              
              <div className="mb-4">
                <p className="text-sm text-gsv-gray mb-2">
                  Download the document, sign it, then upload the signed version below.
                </p>
                <a
                  href={selectedDoc.file_url}
                  download
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition mb-4"
                >
                  Download Original
                </a>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gsv-charcoal mb-2">
                  Upload Signed Document <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setSignatureFile(e.target.files?.[0] || null)}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedDoc(null);
                    setSignatureFile(null);
                  }}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSign(selectedDoc)}
                  disabled={!signatureFile || signing === selectedDoc.id}
                  className="px-4 py-2 bg-gsv-green text-white rounded-lg hover:bg-gsv-greenDark transition disabled:opacity-50 flex items-center gap-2"
                >
                  {signing === selectedDoc.id ? (
                    <>Uploading...</>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Upload & Send Back
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

