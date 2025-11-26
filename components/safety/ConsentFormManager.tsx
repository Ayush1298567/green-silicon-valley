"use client";

import { useState, useEffect } from "react";
import { FileText, CheckCircle, Clock, AlertCircle, Download, Eye, PenTool } from "lucide-react";

interface ConsentForm {
  id: string;
  form_type: string;
  title: string;
  description: string;
  status: "pending" | "signed" | "expired";
  created_at: string;
  signed_at?: string;
  expires_at?: string;
  signature_url?: string;
}

export default function ConsentFormManager() {
  const [forms, setForms] = useState<ConsentForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedForm, setSelectedForm] = useState<ConsentForm | null>(null);

  useEffect(() => {
    fetchConsentForms();
  }, []);

  const fetchConsentForms = async () => {
    try {
      // In a real implementation, this would fetch consent forms from the database
      const sampleForms: ConsentForm[] = [
        {
          id: "1",
          form_type: "stem_participation",
          title: "STEM Education Program Participation",
          description: "Consent for participation in Green Silicon Valley STEM education presentations and activities.",
          status: "signed",
          created_at: "2024-01-01T00:00:00Z",
          signed_at: "2024-01-05T00:00:00Z",
          expires_at: "2025-01-01T00:00:00Z",
          signature_url: "/api/signatures/sample1"
        },
        {
          id: "2",
          form_type: "photo_release",
          title: "Photography and Media Release",
          description: "Permission to use photographs and videos of your child for educational and promotional purposes.",
          status: "pending",
          created_at: "2024-01-15T00:00:00Z",
          expires_at: "2024-03-15T00:00:00Z"
        },
        {
          id: "3",
          form_type: "field_trip",
          title: "Field Trip Participation",
          description: "Consent for participation in educational field trips organized by Green Silicon Valley.",
          status: "expired",
          created_at: "2023-12-01T00:00:00Z",
          expires_at: "2024-01-01T00:00:00Z"
        }
      ];

      setForms(sampleForms);
    } catch (error) {
      console.error("Error fetching consent forms:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignForm = async (formId: string) => {
    try {
      // In a real implementation, this would open a digital signature interface
      alert("Digital signature interface would open here");
    } catch (error) {
      console.error("Error signing form:", error);
    }
  };

  const handleViewForm = (form: ConsentForm) => {
    setSelectedForm(form);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "signed":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
            <CheckCircle size={12} />
            Signed
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
            <Clock size={12} />
            Pending
          </span>
        );
      case "expired":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
            <AlertCircle size={12} />
            Expired
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading consent forms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Digital Consent Forms</h2>
        <p className="text-gray-600">
          Review and sign consent forms for your child's participation in STEM education activities.
          All forms are legally binding and stored securely.
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-green-900">
            {forms.filter(f => f.status === "signed").length}
          </div>
          <div className="text-sm text-green-700">Forms Signed</div>
        </div>

        <div className="bg-yellow-50 rounded-lg p-4 text-center">
          <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-yellow-900">
            {forms.filter(f => f.status === "pending").length}
          </div>
          <div className="text-sm text-yellow-700">Pending Review</div>
        </div>

        <div className="bg-red-50 rounded-lg p-4 text-center">
          <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-red-900">
            {forms.filter(f => f.status === "expired").length}
          </div>
          <div className="text-sm text-red-700">Require Renewal</div>
        </div>
      </div>

      {/* Forms List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Consent Forms</h3>

        {forms.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No consent forms available</p>
          </div>
        ) : (
          <div className="space-y-4">
            {forms.map((form) => (
              <div key={form.id} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <h4 className="font-semibold text-gray-900">{form.title}</h4>
                      {getStatusBadge(form.status)}
                    </div>

                    <p className="text-gray-600 text-sm mb-3">{form.description}</p>

                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <span>Created: {new Date(form.created_at).toLocaleDateString()}</span>
                      {form.signed_at && (
                        <span>Signed: {new Date(form.signed_at).toLocaleDateString()}</span>
                      )}
                      {form.expires_at && (
                        <span className={new Date(form.expires_at) < new Date() ? "text-red-600" : ""}>
                          Expires: {new Date(form.expires_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleViewForm(form)}
                    className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg text-sm font-medium"
                  >
                    <Eye size={16} />
                    View Form
                  </button>

                  {form.status === "pending" && (
                    <button
                      onClick={() => handleSignForm(form.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg text-sm font-medium"
                    >
                      <PenTool size={16} />
                      Sign Form
                    </button>
                  )}

                  {form.status === "signed" && form.signature_url && (
                    <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg text-sm font-medium">
                      <Download size={16} />
                      Download Signed Form
                    </button>
                  )}

                  {form.status === "expired" && (
                    <button className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white hover:bg-orange-700 rounded-lg text-sm font-medium">
                      <PenTool size={16} />
                      Renew Form
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form Details Modal */}
      {selectedForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold">{selectedForm.title}</h2>
              <button
                onClick={() => setSelectedForm(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Form Content */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Form Details</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Type:</strong> {selectedForm.form_type.replace("_", " ").toUpperCase()}</p>
                  <p><strong>Status:</strong> {selectedForm.status}</p>
                  <p><strong>Created:</strong> {new Date(selectedForm.created_at).toLocaleDateString()}</p>
                  {selectedForm.signed_at && (
                    <p><strong>Signed:</strong> {new Date(selectedForm.signed_at).toLocaleDateString()}</p>
                  )}
                  {selectedForm.expires_at && (
                    <p><strong>Expires:</strong> {new Date(selectedForm.expires_at).toLocaleDateString()}</p>
                  )}
                </div>
              </div>

              {/* Form Text */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Consent Form Content</h3>
                <div className="text-sm text-gray-700 space-y-4">
                  <p>
                    I, the undersigned parent/guardian, hereby give consent for my child, Emma Johnson,
                    to participate in STEM education activities organized by Green Silicon Valley.
                  </p>

                  <p>
                    I understand that these activities may include interactive presentations, hands-on experiments,
                    and educational field trips. I acknowledge that reasonable precautions will be taken to ensure
                    the safety of all participants.
                  </p>

                  <p>
                    I agree to release and hold harmless Green Silicon Valley, its volunteers, and associated
                    organizations from any liability arising from normal and expected activities.
                  </p>

                  <p>
                    This consent remains in effect for the current school year unless revoked in writing.
                  </p>
                </div>
              </div>

              {/* Signature Area */}
              {selectedForm.status === "signed" && selectedForm.signature_url && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3">Digital Signature</h3>
                  <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Form signed electronically</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Signed on {selectedForm.signed_at ? new Date(selectedForm.signed_at).toLocaleDateString() : "Unknown"}
                    </p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => setSelectedForm(null)}
                  className="flex-1 px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Close
                </button>

                {selectedForm.status === "pending" && (
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    Sign Form
                  </button>
                )}

                {selectedForm.status === "signed" && (
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Download PDF
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Legal Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Legal Information</h4>
        <div className="text-sm text-blue-800 space-y-1">
          <p>• All consent forms comply with COPPA (Children's Online Privacy Protection Act)</p>
          <p>• Digital signatures are legally binding and stored with bank-level encryption</p>
          <p>• Forms automatically expire and require renewal annually</p>
          <p>• Parents may revoke consent at any time by contacting school administration</p>
        </div>
      </div>
    </div>
  );
}
