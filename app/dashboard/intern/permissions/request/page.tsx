"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  Plus,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Users,
  Eye,
  Edit3,
  AlertCircle,
  Loader2
} from "lucide-react";

interface PermissionRequest {
  id: string;
  permission_type: string;
  resource_type: string;
  resource_id?: string;
  requested_permissions: Record<string, boolean>;
  reason: string;
  justification?: string;
  status: string;
  reviewed_at?: string;
  review_notes?: string;
  created_at: string;
}

interface PermissionTemplate {
  type: string;
  name: string;
  icon: React.ComponentType<any>;
  permissions: Array<{
    key: string;
    name: string;
    description: string;
  }>;
  resources: Array<{
    type: string;
    name: string;
    getResources: () => Promise<Array<{id: string, name: string}>>;
  }>;
}

const PERMISSION_TEMPLATES: PermissionTemplate[] = [
  {
    type: "content_block",
    name: "Content Block",
    icon: FileText,
    permissions: [
      { key: "can_view", name: "View", description: "Can view this content block" },
      { key: "can_edit", name: "Edit", description: "Can edit this content block" }
    ],
    resources: [
      {
        type: "content_blocks",
        name: "Content Blocks",
        getResources: async () => {
          const supabase = createClientComponentClient();
          const { data } = await supabase
            .from("content_blocks")
            .select("id, block_key, title")
            .order("block_key");
          return data?.map(block => ({ id: block.id, name: `${block.block_key}: ${block.title || 'Untitled'}` })) || [];
        }
      }
    ]
  },
  {
    type: "form",
    name: "Form",
    icon: FileText,
    permissions: [
      { key: "can_view", name: "View", description: "Can view form responses" },
      { key: "can_edit", name: "Edit", description: "Can edit form structure" }
    ],
    resources: [
      {
        type: "forms",
        name: "Forms",
        getResources: async () => {
          const supabase = createClientComponentClient();
          const { data } = await supabase
            .from("forms")
            .select("id, title")
            .order("title");
          return data?.map(form => ({ id: form.id, name: form.title })) || [];
        }
      }
    ]
  },
  {
    type: "blog_post",
    name: "Blog Post",
    icon: FileText,
    permissions: [
      { key: "can_view", name: "View", description: "Can view this blog post" },
      { key: "can_edit", name: "Edit", description: "Can edit this blog post" },
      { key: "can_publish", name: "Publish", description: "Can publish this blog post" }
    ],
    resources: [
      {
        type: "intern_blog_posts",
        name: "Blog Posts",
        getResources: async () => {
          const supabase = createClientComponentClient();
          const { data } = await supabase
            .from("intern_blog_posts")
            .select("id, title")
            .order("title");
          return data?.map(post => ({ id: post.id, name: post.title })) || [];
        }
      }
    ]
  }
];

export default function PermissionRequestsPage() {
  const [requests, setRequests] = useState<PermissionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [availableResources, setAvailableResources] = useState<Record<string, Array<{id: string, name: string}>>>({});

  // New request form state
  const [newRequest, setNewRequest] = useState({
    permission_type: "",
    resource_id: "",
    requested_permissions: {} as Record<string, boolean>,
    reason: "",
    justification: ""
  });

  const supabase = createClientComponentClient();

  useEffect(() => {
    loadRequests();
    loadAvailableResources();
  }, []);

  async function loadRequests() {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) return;

      const { data, error } = await supabase
        .from("permission_requests")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error("Error loading requests:", error);
    } finally {
      setLoading(false);
    }
  }

  async function loadAvailableResources() {
    const resources: Record<string, Array<{id: string, name: string}>> = {};

    for (const template of PERMISSION_TEMPLATES) {
      for (const resourceType of template.resources) {
        try {
          resources[resourceType.type] = await resourceType.getResources();
        } catch (error) {
          console.error(`Error loading ${resourceType.type} resources:`, error);
        }
      }
    }

    setAvailableResources(resources);
  }

  async function submitRequest() {
    if (!newRequest.permission_type || !newRequest.reason || Object.keys(newRequest.requested_permissions).length === 0) {
      alert("Please fill in all required fields and select at least one permission.");
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) throw new Error("Not authenticated");

      const template = PERMISSION_TEMPLATES.find(t => t.type === newRequest.permission_type);
      const resourceType = template?.resources[0]?.type || newRequest.permission_type;

      const { data, error } = await supabase
        .from("permission_requests")
        .insert({
          user_id: session.user.id,
          permission_type: newRequest.permission_type,
          resource_type: resourceType,
          resource_id: newRequest.resource_id || null,
          requested_permissions: newRequest.requested_permissions,
          reason: newRequest.reason,
          justification: newRequest.justification || null
        })
        .select()
        .single();

      if (error) throw error;

      setRequests([data, ...requests]);
      setNewRequest({
        permission_type: "",
        resource_id: "",
        requested_permissions: {},
        reason: "",
        justification: ""
      });
      setShowRequestForm(false);

      alert("Permission request submitted successfully! You'll be notified when it's reviewed.");

    } catch (error: any) {
      console.error("Error submitting request:", error);
      alert("Failed to submit request: " + error.message);
    }
  }

  function getPermissionTemplate(type: string): PermissionTemplate | undefined {
    return PERMISSION_TEMPLATES.find(t => t.type === type);
  }

  function getResourceName(resourceType: string, resourceId: string): string {
    const resources = availableResources[resourceType];
    const resource = resources?.find(r => r.id === resourceId);
    return resource?.name || resourceId;
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "approved":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  }

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
            <h1 className="text-3xl font-bold text-gray-900">Permission Requests</h1>
            <p className="text-gray-600 mt-2">Request additional permissions for specific resources</p>
          </div>
          <button
            onClick={() => setShowRequestForm(!showRequestForm)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Request Permission
          </button>
        </div>
      </div>

      {/* Request Form */}
      {showRequestForm && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Custom Permission</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Permission Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Permission Type *
              </label>
              <select
                value={newRequest.permission_type}
                onChange={(e) => {
                  const type = e.target.value;
                  setNewRequest(prev => ({
                    ...prev,
                    permission_type: type,
                    resource_id: "",
                    requested_permissions: {}
                  }));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select permission type</option>
                {PERMISSION_TEMPLATES.map(template => (
                  <option key={template.type} value={template.type}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Resource Selection */}
            {newRequest.permission_type && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specific Resource (Optional)
                </label>
                <select
                  value={newRequest.resource_id}
                  onChange={(e) => setNewRequest(prev => ({ ...prev, resource_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All resources of this type</option>
                  {(() => {
                    const template = getPermissionTemplate(newRequest.permission_type);
                    const resourceType = template?.resources[0];
                    const resources = resourceType ? availableResources[resourceType.type] : [];
                    return resources?.map(resource => (
                      <option key={resource.id} value={resource.id}>
                        {resource.name}
                      </option>
                    ));
                  })()}
                </select>
              </div>
            )}
          </div>

          {/* Permissions Selection */}
          {newRequest.permission_type && (
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Permissions to Request *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {getPermissionTemplate(newRequest.permission_type)?.permissions.map(perm => (
                  <label key={perm.key} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newRequest.requested_permissions[perm.key] || false}
                      onChange={(e) => setNewRequest(prev => ({
                        ...prev,
                        requested_permissions: {
                          ...prev.requested_permissions,
                          [perm.key]: e.target.checked
                        }
                      }))}
                      className="mt-1 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{perm.name}</div>
                      <div className="text-xs text-gray-600">{perm.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Reason and Justification */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Request *
              </label>
              <select
                value={newRequest.reason}
                onChange={(e) => setNewRequest(prev => ({ ...prev, reason: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a reason</option>
                <option value="project_work">Working on a specific project</option>
                <option value="expanded_responsibilities">Taking on expanded responsibilities</option>
                <option value="skill_development">Developing specific skills</option>
                <option value="mentorship">Mentoring other interns</option>
                <option value="content_creation">Creating educational content</option>
                <option value="other">Other (explain below)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Justification
              </label>
              <textarea
                value={newRequest.justification}
                onChange={(e) => setNewRequest(prev => ({ ...prev, justification: e.target.value }))}
                rows={3}
                placeholder="Provide more details about why you need these permissions..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t">
            <button
              onClick={() => setShowRequestForm(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={submitRequest}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Send className="w-4 h-4" />
              Submit Request
            </button>
          </div>
        </div>
      )}

      {/* Requests List */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-900">Your Permission Requests</h3>

        {requests.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No Permission Requests</h4>
            <p className="text-gray-600">
              You haven't submitted any permission requests yet. Request additional permissions to access specific resources.
            </p>
          </div>
        ) : (
          requests.map((request) => {
            const template = getPermissionTemplate(request.permission_type);
            const Icon = template?.icon || FileText;

            return (
              <div key={request.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      request.status === 'approved' ? 'bg-green-100' :
                      request.status === 'rejected' ? 'bg-red-100' :
                      'bg-yellow-100'
                    }`}>
                      {request.status === 'approved' ? <CheckCircle className="w-5 h-5 text-green-600" /> :
                       request.status === 'rejected' ? <XCircle className="w-5 h-5 text-red-600" /> :
                       <Clock className="w-5 h-5 text-yellow-600" />}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900">
                        {template?.name || request.permission_type}
                        {request.resource_id && (
                          <span className="text-sm text-gray-600 ml-2">
                            - {getResourceName(request.resource_type, request.resource_id)}
                          </span>
                        )}
                      </h4>

                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          request.status === 'approved' ? 'bg-green-100 text-green-800' :
                          request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {getStatusIcon(request.status)}
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                        <span>Submitted {new Date(request.created_at).toLocaleDateString()}</span>
                        {request.reviewed_at && (
                          <span>Reviewed {new Date(request.reviewed_at).toLocaleDateString()}</span>
                        )}
                      </div>

                      {/* Requested Permissions */}
                      <div className="mt-3">
                        <div className="text-sm text-gray-700 mb-2">Requested permissions:</div>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(request.requested_permissions).map(([key, requested]) => {
                            if (!requested) return null;
                            const perm = template?.permissions.find(p => p.key === key);
                            return (
                              <span
                                key={key}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                              >
                                {perm?.name || key}
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      {/* Reason */}
                      <div className="mt-3 text-sm text-gray-600">
                        <strong>Reason:</strong> {request.reason}
                        {request.justification && (
                          <div className="mt-1">
                            <strong>Details:</strong> {request.justification}
                          </div>
                        )}
                      </div>

                      {/* Review Notes */}
                      {request.review_notes && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <div className="text-sm text-gray-700">
                            <strong>Review Notes:</strong> {request.review_notes}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
