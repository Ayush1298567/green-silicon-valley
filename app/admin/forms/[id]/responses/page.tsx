"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  Filter,
  Search,
  Eye,
  Calendar,
  User,
  FileText,
  BarChart3
} from "lucide-react";

interface FormResponse {
  id: string;
  form_id: string;
  responses: Record<string, any>;
  submitted_at: string;
  submitted_by?: {
    name: string;
    email: string;
  };
}

interface Form {
  id: string;
  title: string;
  schema: {
    fields: Array<{
      id: string;
      label: string;
      type: string;
    }>;
  };
}

export default function FormResponsesPage() {
  const params = useParams();
  const [form, setForm] = useState<Form | null>(null);
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedResponse, setSelectedResponse] = useState<FormResponse | null>(null);

  const supabase = createClientComponentClient();
  const formId = params.id as string;

  useEffect(() => {
    loadFormAndResponses();
  }, [formId]);

  async function loadFormAndResponses() {
    try {
      setLoading(true);

      // Load form details
      const { data: formData, error: formError } = await supabase
        .from("forms")
        .select("*")
        .eq("id", formId)
        .single();

      if (formError) throw formError;
      setForm(formData);

      // Load responses
      const { data: responsesData, error: responsesError } = await supabase
        .from("form_responses")
        .select(`
          id,
          form_id,
          responses,
          submitted_at,
          submitted_by
        `)
        .eq("form_id", formId)
        .order("submitted_at", { ascending: false });

      if (responsesError) throw responsesError;

      setResponses(responsesData || []);
    } catch (error) {
      console.error("Error loading form responses:", error);
    } finally {
      setLoading(false);
    }
  }

  function exportToCSV() {
    if (!form || !responses.length) return;

    const headers = ["Submission Date", "Submitted By", ...form.schema.fields.map(f => f.label)];

    const rows = responses.map(response => {
      const row = [
        new Date(response.submitted_at).toLocaleString(),
        response.submitted_by?.name || response.submitted_by?.email || "Anonymous"
      ];

      form.schema.fields.forEach(field => {
        const value = response.responses[field.id];
        if (Array.isArray(value)) {
          row.push(value.join(", "));
        } else if (typeof value === "object" && value !== null) {
          row.push(JSON.stringify(value));
        } else {
          row.push(String(value || ""));
        }
      });

      return row;
    });

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${form.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_responses.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  const filteredResponses = responses.filter(response => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    const submitterName = response.submitted_by?.name?.toLowerCase() || "";
    const submitterEmail = response.submitted_by?.email?.toLowerCase() || "";

    // Search in submitter info
    if (submitterName.includes(searchLower) || submitterEmail.includes(searchLower)) {
      return true;
    }

    // Search in response values
    return Object.values(response.responses).some(value => {
      if (Array.isArray(value)) {
        return value.some(v => String(v).toLowerCase().includes(searchLower));
      }
      return String(value).toLowerCase().includes(searchLower);
    });
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Form not found</p>
      </div>
    );
  }

  return (
    <div className="container py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/forms"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Forms
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{form.title}</h1>
              <p className="text-gray-600 mt-2">Form Responses ({responses.length})</p>
            </div>
          </div>

          {responses.length > 0 && (
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <FileText className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{responses.length}</p>
              <p className="text-sm text-gray-600">Total Responses</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <Calendar className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {responses.length > 0 ? new Date(responses[0].submitted_at).toLocaleDateString() : "N/A"}
              </p>
              <p className="text-sm text-gray-600">Latest Response</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <BarChart3 className="w-8 h-8 text-purple-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{form.schema.fields.length}</p>
              <p className="text-sm text-gray-600">Form Fields</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search responses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Responses Table */}
      {filteredResponses.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No responses yet</h3>
          <p className="text-gray-600">
            {responses.length === 0
              ? "This form hasn't received any responses yet."
              : "No responses match your search criteria."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    By
                  </th>
                  {form.schema.fields.slice(0, 3).map(field => (
                    <th key={field.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {field.label}
                    </th>
                  ))}
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredResponses.map((response) => (
                  <tr key={response.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {new Date(response.submitted_at).toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {response.submitted_by?.name || response.submitted_by?.email || "Anonymous"}
                        </span>
                      </div>
                    </td>
                    {form.schema.fields.slice(0, 3).map(field => (
                      <td key={field.id} className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {renderFieldValue(response.responses[field.id], field.type)}
                        </div>
                      </td>
                    ))}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => setSelectedResponse(response)}
                        className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                      >
                        <Eye className="w-4 h-4 inline mr-1" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Response Detail Modal */}
      {selectedResponse && (
        <ResponseDetailModal
          response={selectedResponse}
          form={form}
          onClose={() => setSelectedResponse(null)}
        />
      )}
    </div>
  );
}

function renderFieldValue(value: any, type: string): string {
  if (value === null || value === undefined) return "-";

  if (Array.isArray(value)) {
    return value.join(", ");
  }

  if (type === "checkbox") {
    return value ? "Yes" : "No";
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

function ResponseDetailModal({
  response,
  form,
  onClose
}: {
  response: FormResponse;
  form: Form;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Response Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Submitted At</label>
              <p className="text-sm text-gray-900">{new Date(response.submitted_at).toLocaleString()}</p>
            </div>
            {response.submitted_by && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Submitted By</label>
                <p className="text-sm text-gray-900">
                  {response.submitted_by.name || response.submitted_by.email}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {form.schema.fields.map(field => (
              <div key={field.id} className="border-b border-gray-100 pb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {field.label}
                </label>
                <div className="text-sm text-gray-900 bg-gray-50 p-3 rounded">
                  {renderDetailedFieldValue(response.responses[field.id], field.type)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function renderDetailedFieldValue(value: any, type: string): React.ReactNode {
  if (value === null || value === undefined) return <span className="text-gray-500">No response</span>;

  if (Array.isArray(value)) {
    return (
      <ul className="list-disc list-inside">
        {value.map((item, index) => (
          <li key={index}>{String(item)}</li>
        ))}
      </ul>
    );
  }

  if (type === "checkbox") {
    return <span className={value ? "text-green-600" : "text-red-600"}>{value ? "Yes" : "No"}</span>;
  }

  if (typeof value === "object") {
    return <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(value, null, 2)}</pre>;
  }

  return String(value);
}
