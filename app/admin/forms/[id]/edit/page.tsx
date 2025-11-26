"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import FormBuilder, { FormSchema } from "@/components/forms/FormBuilder";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";

export default function FormEditPage() {
  const params = useParams();
  const router = useRouter();
  const [schema, setSchema] = useState<FormSchema | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClientComponentClient();
  const formId = params.id as string;

  useEffect(() => {
    loadForm();
  }, [formId]);

  async function loadForm() {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("forms")
        .select("*")
        .eq("id", formId)
        .single();

      if (error) throw error;

      if (data) {
        // Convert database schema to FormSchema
        const formSchema: FormSchema = {
          id: data.id,
          title: data.title,
          description: data.description,
          fields: data.schema?.fields || []
        };
        setSchema(formSchema);
      } else {
        // Create new form
        setSchema({
          id: formId,
          title: "New Form",
          description: "",
          fields: []
        });
      }
    } catch (error: any) {
      setError(error.message || "Failed to load form");
    } finally {
      setLoading(false);
    }
  }

  async function saveForm(updatedSchema: FormSchema) {
    try {
      setSaving(true);
      setError(null);

      const formData = {
        title: updatedSchema.title,
        description: updatedSchema.description,
        schema: {
          fields: updatedSchema.fields,
          version: 1
        },
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from("forms")
        .upsert({
          id: formId,
          ...formData
        });

      if (error) throw error;

      // Update local state
      setSchema(updatedSchema);

      // Show success message
      alert("Form saved successfully!");
    } catch (error: any) {
      setError(error.message || "Failed to save form");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading form...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">Error: {error}</div>
          <button
            onClick={loadForm}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!schema) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
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
              <h1 className="text-xl font-semibold text-gray-900">{schema.title}</h1>
              <p className="text-sm text-gray-600">Form Builder</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {saving && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </div>
            )}

            <button
              onClick={() => saveForm(schema)}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-4 h-4" />
              Save Form
            </button>
          </div>
        </div>
      </div>

      {/* Form Builder */}
      <div className="h-[calc(100vh-80px)]">
        <FormBuilder
          schema={schema}
          onChange={setSchema}
          onSave={() => saveForm(schema)}
          className="h-full"
        />
      </div>
    </div>
  );
}
