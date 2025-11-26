"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";
import { VisibilityBadge, VisibilitySelector } from "@/components/admin/VisibilityControl";
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Eye,
  BarChart3,
  Copy,
  Trash2,
  Users,
  Calendar
} from "lucide-react";

interface Form {
  id: string;
  title: string;
  description?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  response_count?: number;
  last_response_at?: string;
  visibility_roles?: string[];
}

export default function FormsManagementPage() {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  const supabase = createClientComponentClient();

  useEffect(() => {
    loadForms();
  }, []);

  async function loadForms() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("forms")
        .select(`
          id,
          title,
          description,
          created_at,
          updated_at,
          is_active,
          visibility_roles,
          form_responses(count)
        `)
        .order("updated_at", { ascending: false });

      if (error) throw error;

      // Transform data to include response count
      const formsWithCounts = data?.map(form => ({
        ...form,
        response_count: form.form_responses?.[0]?.count || 0
      })) || [];

      setForms(formsWithCounts);
    } catch (error) {
      console.error("Error loading forms:", error);
    } finally {
      setLoading(false);
    }
  }

  async function deleteForm(formId: string) {
    if (!confirm("Are you sure you want to delete this form? This action cannot be undone.")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("forms")
        .delete()
        .eq("id", formId);

      if (error) throw error;

      setForms(forms.filter(form => form.id !== formId));
    } catch (error) {
      console.error("Error deleting form:", error);
      alert("Failed to delete form. Please try again.");
    }
  }

  async function toggleFormStatus(formId: string, currentStatus: boolean) {
    try {
      const { error } = await supabase
        .from("forms")
        .update({ is_active: !currentStatus })
        .eq("id", formId);

      if (error) throw error;

      setForms(forms.map(form =>
        form.id === formId
          ? { ...form, is_active: !currentStatus }
          : form
      ));
    } catch (error) {
      console.error("Error updating form status:", error);
      alert("Failed to update form status. Please try again.");
    }
  }

  const filteredForms = forms.filter(form => {
    const matchesSearch = form.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         form.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" ||
                         (statusFilter === "active" && form.is_active) ||
                         (statusFilter === "inactive" && !form.is_active);

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Form Management</h1>
            <p className="text-gray-600 mt-2">Create and manage dynamic forms with advanced features</p>
          </div>
          <Link
            href="/admin/forms/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Form
          </Link>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search forms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Forms Grid */}
      {filteredForms.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Plus className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No forms found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || statusFilter !== "all"
              ? "Try adjusting your search or filters"
              : "Get started by creating your first form"}
          </p>
          <Link
            href="/admin/forms/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Form
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredForms.map((form) => (
            <FormCard
              key={form.id}
              form={form}
              onDelete={() => deleteForm(form.id)}
              onToggleStatus={() => toggleFormStatus(form.id, form.is_active)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FormCard({
  form,
  onDelete,
  onToggleStatus
}: {
  form: Form;
  onDelete: () => void;
  onToggleStatus: () => void;
}) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Card Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{form.title}</h3>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <div className="py-1">
                  <Link
                    href={`/admin/forms/${form.id}/edit`}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Form
                  </Link>
                  <Link
                    href={`/admin/forms/${form.id}/responses`}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Responses
                  </Link>
                  <button
                    onClick={onToggleStatus}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {form.is_active ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    onClick={onDelete}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {form.description && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-4">{form.description}</p>
        )}

        {/* Status Badge */}
        <div className="flex items-center gap-2 mb-4">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            form.is_active
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {form.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div className="flex items-center text-gray-600">
            <Users className="w-4 h-4 mr-1" />
            <span>{form.response_count} responses</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Calendar className="w-4 h-4 mr-1" />
            <span>{new Date(form.updated_at).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Visibility */}
        <div className="flex items-center justify-between">
          <VisibilityBadge visibility={form.visibility_roles || []} />
          <VisibilitySelector
            currentVisibility={form.visibility_roles || []}
            onChange={(visibility) => {
              // Update form visibility in database
              supabase
                .from("forms")
                .update({ visibility_roles: visibility })
                .eq("id", form.id)
                .then(() => {
                  // Update local state
                  setForms(prev => prev.map(f =>
                    f.id === form.id ? { ...f, visibility_roles: visibility } : f
                  ));
                });
            }}
          />
        </div>
      </div>

      {/* Card Actions */}
      <div className="p-4 bg-gray-50 flex gap-2">
        <Link
          href={`/admin/forms/${form.id}/edit`}
          className="flex-1 text-center px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          <Edit className="w-4 h-4 inline mr-1" />
          Edit
        </Link>
        <Link
          href={`/admin/forms/${form.id}/responses`}
          className="flex-1 text-center px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
        >
          <BarChart3 className="w-4 h-4 inline mr-1" />
          Responses
        </Link>
      </div>
    </div>
  );
}
