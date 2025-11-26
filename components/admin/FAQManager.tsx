"use client";
import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, ChevronUp, ChevronDown, HelpCircle } from "lucide-react";
import { toast } from "sonner";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'volunteers' | 'teachers' | 'parents' | 'general';
  orderIndex: number;
  isPublished: boolean;
}

export default function FAQManager() {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'general' as FAQItem['category'],
    isPublished: true,
  });

  useEffect(() => {
    loadFAQs();
  }, []);

  const loadFAQs = async () => {
    try {
      const response = await fetch('/api/admin/faqs');
      if (response.ok) {
        const data = await response.json();
        setFaqs(data.faqs || []);
      }
    } catch (error) {
      console.error('Error loading FAQs:', error);
      toast.error('Failed to load FAQs');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingFaq ? `/api/admin/faqs/${editingFaq.id}` : '/api/admin/faqs';
      const method = editingFaq ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(editingFaq ? 'FAQ updated successfully' : 'FAQ created successfully');
        loadFAQs();
        setShowForm(false);
        setEditingFaq(null);
        resetForm();
      } else {
        toast.error('Failed to save FAQ');
      }
    } catch (error) {
      console.error('Error saving FAQ:', error);
      toast.error('Failed to save FAQ');
    }
  };

  const handleEdit = (faq: FAQItem) => {
    setEditingFaq(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      isPublished: faq.isPublished,
    });
    setShowForm(true);
  };

  const handleDelete = async (faqId: string) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;

    try {
      const response = await fetch(`/api/admin/faqs/${faqId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('FAQ deleted successfully');
        loadFAQs();
      } else {
        toast.error('Failed to delete FAQ');
      }
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      toast.error('Failed to delete FAQ');
    }
  };

  const handleReorder = async (faqId: string, direction: 'up' | 'down') => {
    try {
      const response = await fetch(`/api/admin/faqs/${faqId}/reorder`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ direction }),
      });

      if (response.ok) {
        loadFAQs();
      } else {
        toast.error('Failed to reorder FAQ');
      }
    } catch (error) {
      console.error('Error reordering FAQ:', error);
      toast.error('Failed to reorder FAQ');
    }
  };

  const resetForm = () => {
    setFormData({
      question: '',
      answer: '',
      category: 'general',
      isPublished: true,
    });
  };

  const filteredFAQs = selectedCategory === 'all'
    ? faqs
    : faqs.filter(faq => faq.category === selectedCategory);

  const sortedFAQs = filteredFAQs.sort((a, b) => a.orderIndex - b.orderIndex);

  const categories = [
    { id: 'all', label: 'All FAQs', color: 'bg-gray-100 text-gray-800' },
    { id: 'general', label: 'General', color: 'bg-blue-100 text-blue-800' },
    { id: 'volunteers', label: 'Volunteers', color: 'bg-green-100 text-green-800' },
    { id: 'teachers', label: 'Teachers', color: 'bg-purple-100 text-purple-800' },
    { id: 'parents', label: 'Parents', color: 'bg-orange-100 text-orange-800' }
  ];

  const getCategoryColor = (category: string) => {
    const categoryConfig = categories.find(c => c.id === category);
    return categoryConfig?.color || 'bg-gray-100 text-gray-800';
  };

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
          <h2 className="text-2xl font-bold text-gray-900">FAQ Management</h2>
          <p className="text-gray-600">Manage frequently asked questions for different user groups</p>
        </div>
        <button
          onClick={() => {
            setEditingFaq(null);
            resetForm();
            setShowForm(true);
          }}
          className="bg-gsv-green text-white px-4 py-2 rounded-lg hover:bg-gsv-greenDark transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add FAQ
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-3">
        {categories.map(({ id, label, color }) => (
          <button
            key={id}
            onClick={() => setSelectedCategory(id)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedCategory === id
                ? color.replace('100', '200')
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {editingFaq ? 'Edit FAQ' : 'Create New FAQ'}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as FAQItem['category'] }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gsv-green focus:border-transparent"
                  >
                    <option value="general">General</option>
                    <option value="volunteers">Volunteers</option>
                    <option value="teachers">Teachers</option>
                    <option value="parents">Parents</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Question *
                  </label>
                  <input
                    type="text"
                    value={formData.question}
                    onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gsv-green focus:border-transparent"
                    placeholder="Enter the frequently asked question"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Answer *
                  </label>
                  <textarea
                    value={formData.answer}
                    onChange={(e) => setFormData(prev => ({ ...prev, answer: e.target.value }))}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gsv-green focus:border-transparent"
                    placeholder="Provide a detailed answer to the question"
                    required
                  />
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isPublished}
                      onChange={(e) => setFormData(prev => ({ ...prev, isPublished: e.target.checked }))}
                      className="rounded border-gray-300 text-gsv-green focus:ring-gsv-green"
                    />
                    <span className="text-sm text-gray-700">Publish this FAQ</span>
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="bg-gsv-green text-white px-6 py-2 rounded-lg hover:bg-gsv-greenDark transition-colors"
                  >
                    {editingFaq ? 'Update FAQ' : 'Create FAQ'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingFaq(null);
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

      {/* FAQs List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {sortedFAQs.length === 0 ? (
          <div className="p-8 text-center">
            <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No FAQs yet</h3>
            <p className="text-gray-600 mb-4">Create your first FAQ to get started</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-gsv-green text-white px-4 py-2 rounded-lg hover:bg-gsv-greenDark transition-colors"
            >
              Create FAQ
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {sortedFAQs.map((faq, index) => (
              <div key={faq.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(faq.category)}`}>
                        {categories.find(c => c.id === faq.category)?.label || faq.category}
                      </span>
                      {!faq.isPublished && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          Draft
                        </span>
                      )}
                      <span className="text-sm text-gray-500">Order: {faq.orderIndex}</span>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{faq.question}</h3>
                    <p className="text-gray-600 line-clamp-2">{faq.answer}</p>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {/* Reorder buttons */}
                    <div className="flex flex-col">
                      <button
                        onClick={() => handleReorder(faq.id, 'up')}
                        disabled={index === 0}
                        className="text-gray-400 hover:text-gsv-green disabled:opacity-50 disabled:cursor-not-allowed p-1"
                        title="Move up"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleReorder(faq.id, 'down')}
                        disabled={index === sortedFAQs.length - 1}
                        className="text-gray-400 hover:text-gsv-green disabled:opacity-50 disabled:cursor-not-allowed p-1"
                        title="Move down"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => handleEdit(faq)}
                      className="text-gray-400 hover:text-gsv-green transition-colors p-2"
                      title="Edit FAQ"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(faq.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors p-2"
                      title="Delete FAQ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
