"use client";
import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, ChevronUp, ChevronDown, User } from "lucide-react";
import { toast } from "sonner";

interface Leader {
  id: string;
  name: string;
  title: string;
  department: string;
  bio: string;
  photoUrl: string;
  email?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  websiteUrl?: string;
  orderIndex: number;
  isActive: boolean;
}

export default function LeadershipManager() {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingLeader, setEditingLeader] = useState<Leader | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    department: '',
    bio: '',
    photoUrl: '',
    email: '',
    linkedinUrl: '',
    twitterUrl: '',
    websiteUrl: '',
    isActive: true,
  });

  useEffect(() => {
    loadLeaders();
  }, []);

  const loadLeaders = async () => {
    try {
      const response = await fetch('/api/admin/leadership');
      if (response.ok) {
        const data = await response.json();
        setLeaders(data.leaders || []);
      }
    } catch (error) {
      console.error('Error loading leaders:', error);
      toast.error('Failed to load leadership profiles');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingLeader ? `/api/admin/leadership/${editingLeader.id}` : '/api/admin/leadership';
      const method = editingLeader ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(editingLeader ? 'Leader updated successfully' : 'Leader added successfully');
        loadLeaders();
        setShowForm(false);
        setEditingLeader(null);
        resetForm();
      } else {
        toast.error('Failed to save leader profile');
      }
    } catch (error) {
      console.error('Error saving leader:', error);
      toast.error('Failed to save leader profile');
    }
  };

  const handleEdit = (leader: Leader) => {
    setEditingLeader(leader);
    setFormData({
      name: leader.name,
      title: leader.title,
      department: leader.department,
      bio: leader.bio,
      photoUrl: leader.photoUrl,
      email: leader.email || '',
      linkedinUrl: leader.linkedinUrl || '',
      twitterUrl: leader.twitterUrl || '',
      websiteUrl: leader.websiteUrl || '',
      isActive: leader.isActive,
    });
    setShowForm(true);
  };

  const handleDelete = async (leaderId: string) => {
    if (!confirm('Are you sure you want to delete this leadership profile?')) return;

    try {
      const response = await fetch(`/api/admin/leadership/${leaderId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Leadership profile deleted successfully');
        loadLeaders();
      } else {
        toast.error('Failed to delete leadership profile');
      }
    } catch (error) {
      console.error('Error deleting leader:', error);
      toast.error('Failed to delete leadership profile');
    }
  };

  const handleReorder = async (leaderId: string, direction: 'up' | 'down') => {
    try {
      const response = await fetch(`/api/admin/leadership/${leaderId}/reorder`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ direction }),
      });

      if (response.ok) {
        loadLeaders();
      } else {
        toast.error('Failed to reorder leader');
      }
    } catch (error) {
      console.error('Error reordering leader:', error);
      toast.error('Failed to reorder leader');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      title: '',
      department: '',
      bio: '',
      photoUrl: '',
      email: '',
      linkedinUrl: '',
      twitterUrl: '',
      websiteUrl: '',
      isActive: true,
    });
  };

  const departments = [
    'Executive',
    'Outreach',
    'Technology',
    'Media',
    'Volunteer Development',
    'Communications',
    'Operations'
  ];

  const sortedLeaders = leaders.sort((a, b) => a.orderIndex - b.orderIndex);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gsv-green"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Leadership Profiles</h2>
          <p className="text-gray-600">Manage team member profiles and bios for credibility</p>
        </div>
        <button
          onClick={() => {
            setEditingLeader(null);
            resetForm();
            setShowForm(true);
          }}
          className="bg-gsv-green text-white px-4 py-2 rounded-lg hover:bg-gsv-greenDark transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Leader
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {editingLeader ? 'Edit Leadership Profile' : 'Add New Leader'}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gsv-green focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gsv-green focus:border-transparent"
                      placeholder="e.g., Director of Outreach"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department *
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gsv-green focus:border-transparent"
                    required
                  >
                    <option value="">Select department</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bio *
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gsv-green focus:border-transparent"
                    placeholder="Brief professional background and role description..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Photo URL *
                  </label>
                  <input
                    type="url"
                    value={formData.photoUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, photoUrl: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gsv-green focus:border-transparent"
                    placeholder="https://example.com/photo.jpg"
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gsv-green focus:border-transparent"
                      placeholder="email@gsv.org"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      LinkedIn URL
                    </label>
                    <input
                      type="url"
                      value={formData.linkedinUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, linkedinUrl: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gsv-green focus:border-transparent"
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Twitter URL
                    </label>
                    <input
                      type="url"
                      value={formData.twitterUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, twitterUrl: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gsv-green focus:border-transparent"
                      placeholder="https://twitter.com/username"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Website URL
                    </label>
                    <input
                      type="url"
                      value={formData.websiteUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, websiteUrl: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gsv-green focus:border-transparent"
                      placeholder="https://personal-site.com"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="rounded border-gray-300 text-gsv-green focus:ring-gsv-green"
                    />
                    <span className="text-sm text-gray-700">Active profile (visible on leadership page)</span>
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="bg-gsv-green text-white px-6 py-2 rounded-lg hover:bg-gsv-greenDark transition-colors"
                  >
                    {editingLeader ? 'Update Profile' : 'Add Leader'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingLeader(null);
                      resetForm();
                    }}
                    className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Leadership Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedLeaders.map((leader, index) => (
          <div key={leader.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="aspect-[3/4] relative">
              <img
                src={leader.photoUrl}
                alt={leader.name}
                className="w-full h-full object-cover"
              />
              {!leader.isActive && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <span className="text-white font-medium">Inactive</span>
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-bold text-gray-900 mb-1">{leader.name}</h3>
              <p className="text-gsv-green font-medium text-sm mb-1">{leader.title}</p>
              <p className="text-gray-600 text-sm mb-3">{leader.department}</p>
              <p className="text-gray-700 text-sm line-clamp-3 mb-4">{leader.bio}</p>

              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {leader.email && <span className="text-xs text-gray-500">Email</span>}
                  {leader.linkedinUrl && <span className="text-xs text-gray-500">LinkedIn</span>}
                  {leader.twitterUrl && <span className="text-xs text-gray-500">Twitter</span>}
                  {leader.websiteUrl && <span className="text-xs text-gray-500">Web</span>}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleReorder(leader.id, 'up')}
                    disabled={index === 0}
                    className="text-gray-400 hover:text-gsv-green disabled:opacity-50 disabled:cursor-not-allowed p-1"
                    title="Move up"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleReorder(leader.id, 'down')}
                    disabled={index === sortedLeaders.length - 1}
                    className="text-gray-400 hover:text-gsv-green disabled:opacity-50 disabled:cursor-not-allowed p-1"
                    title="Move down"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(leader)}
                    className="text-gray-400 hover:text-gsv-green transition-colors p-1"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(leader.id)}
                    className="text-gray-400 hover:text-red-600 transition-colors p-1"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {sortedLeaders.length === 0 && (
        <div className="text-center py-12">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No leadership profiles yet</h3>
          <p className="text-gray-600 mb-4">Add your first leader to build credibility</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-gsv-green text-white px-4 py-2 rounded-lg hover:bg-gsv-greenDark transition-colors"
          >
            Add First Leader
          </button>
        </div>
      )}
    </div>
  );
}
