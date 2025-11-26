"use client";
import { useState, useEffect } from "react";
import { Calendar, User, Tag, Eye, Heart, MessageSquare, Filter, Plus, Edit3, Send, Clock } from "lucide-react";
import Link from "next/link";

interface BlogPost {
  id: string;
  title: string;
  content: string;
  authorName: string;
  authorId: string;
  department: string;
  isDirectorNote: boolean;
  publishedAt?: string;
  isPublished: boolean;
  status: string;
  tags: string[];
  excerpt: string;
  readTime: number;
  views: number;
  likes: number;
  created_at: string;
  updated_at: string;
  created_by: string;
  submitted_for_review_at?: string;
  review_notes?: string;
}

export default function InternBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, []);

  useEffect(() => {
    filterPosts();
  }, [posts, selectedDepartment, selectedType]);

  const loadPosts = async () => {
    try {
      const response = await fetch('/api/interns/blog');
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
      }
    } catch (error) {
      console.error('Error loading blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterPosts = () => {
    // Show published posts, plus current user's drafts/submitted posts
    let filtered = posts.filter(post =>
      post.isPublished ||
      post.status === 'draft' ||
      post.status === 'submitted'
    );

    if (selectedDepartment !== 'all') {
      filtered = filtered.filter(post => post.department === selectedDepartment);
    }

    if (selectedType !== 'all') {
      if (selectedType === 'director') {
        filtered = filtered.filter(post => post.isDirectorNote);
      } else if (selectedType === 'intern') {
        filtered = filtered.filter(post => !post.isDirectorNote);
      }
    }

    // Sort by updated date (newest first)
    filtered.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

    setFilteredPosts(filtered);
  };

  const submitForReview = async (postId: string) => {
    try {
      const response = await fetch(`/api/interns/blog/${postId}/submit`, {
        method: 'POST',
      });

      if (response.ok) {
        // Update local state
        setPosts(posts.map(post =>
          post.id === postId
            ? { ...post, status: 'submitted', submitted_for_review_at: new Date().toISOString() }
            : post
        ));
        alert('Post submitted for review successfully!');
      } else {
        alert('Failed to submit post for review');
      }
    } catch (error) {
      console.error('Error submitting post for review:', error);
      alert('An error occurred while submitting the post');
    }
  };

  // Sample blog post data - in production this would come from the API
  const samplePosts: BlogPost[] = [
    {
      id: '1',
      title: 'My First Month as a Technology Intern',
      content: 'Reflecting on my initial experiences working on the volunteer management platform...',
      authorName: 'Alex Chen',
      authorId: 'alex-chen',
      department: 'Technology',
      isDirectorNote: false,
      publishedAt: '2024-02-15T10:00:00Z',
      isPublished: true,
      tags: ['internship', 'technology', 'growth'],
      excerpt: 'My journey from classroom learning to real-world application in nonprofit technology.',
      readTime: 5,
      views: 245,
      likes: 12
    },
    {
      id: '2',
      title: 'Q1 Achievements and Looking Ahead',
      content: 'A comprehensive overview of our accomplishments this quarter and strategic priorities moving forward...',
      authorName: 'Director Sarah Chen',
      authorId: 'sarah-chen',
      department: 'Executive',
      isDirectorNote: true,
      publishedAt: '2024-02-01T09:00:00Z',
      isPublished: true,
      tags: ['quarterly', 'achievements', 'strategy'],
      excerpt: 'Celebrating our growth and setting ambitious goals for the next quarter.',
      readTime: 8,
      views: 189,
      likes: 24
    },
    {
      id: '3',
      title: 'Building School Partnerships: Lessons Learned',
      content: 'Insights from developing relationships with local educational institutions...',
      authorName: 'Jordan Kim',
      authorId: 'jordan-kim',
      department: 'Outreach',
      isDirectorNote: false,
      publishedAt: '2024-01-28T14:30:00Z',
      isPublished: true,
      tags: ['outreach', 'schools', 'relationships'],
      excerpt: 'Key strategies for successful school partnerships and community engagement.',
      readTime: 6,
      views: 156,
      likes: 8
    },
    {
      id: '4',
      title: 'Volunteer Training Program Redesign',
      content: 'How we evolved our training approach to better serve our volunteer community...',
      authorName: 'Emma Davis',
      authorId: 'emma-davis',
      department: 'Volunteer Development',
      isDirectorNote: false,
      publishedAt: '2024-01-20T11:15:00Z',
      isPublished: true,
      tags: ['training', 'volunteers', 'development'],
      excerpt: 'Creating more effective and engaging training experiences for our volunteers.',
      readTime: 7,
      views: 203,
      likes: 15
    },
    {
      id: '5',
      title: 'Winter Break Reflections',
      content: 'Taking time to reflect on our mission and recharge for the new year...',
      authorName: 'Director Sarah Chen',
      authorId: 'sarah-chen',
      department: 'Executive',
      isDirectorNote: true,
      publishedAt: '2024-01-15T08:00:00Z',
      isPublished: true,
      tags: ['reflection', 'holiday', 'mission'],
      excerpt: 'A moment of gratitude and forward-looking optimism for our environmental education work.',
      readTime: 4,
      views: 312,
      likes: 31
    },
    {
      id: '6',
      title: 'Creating Compelling Environmental Content',
      content: 'Strategies for making complex environmental topics engaging and accessible...',
      authorName: 'Marcus Johnson',
      authorId: 'marcus-johnson',
      department: 'Media',
      isDirectorNote: false,
      publishedAt: '2024-01-10T13:45:00Z',
      isPublished: true,
      tags: ['content', 'media', 'education'],
      excerpt: 'Balancing scientific accuracy with engaging storytelling in environmental communications.',
      readTime: 6,
      views: 178,
      likes: 11
    }
  ];

  useEffect(() => {
    // Simulate loading blog post data
    setTimeout(() => {
      setPosts(samplePosts);
      setLoading(false);
    }, 1000);
  }, []);

  const departments = ['Technology', 'Outreach', 'Media', 'Volunteer Development', 'Communications', 'Operations', 'Executive'];

  const getDepartmentColor = (department: string) => {
    const colors: { [key: string]: string } = {
      'Technology': 'bg-purple-100 text-purple-800',
      'Outreach': 'bg-blue-100 text-blue-800',
      'Media': 'bg-yellow-100 text-yellow-800',
      'Volunteer Development': 'bg-red-100 text-red-800',
      'Communications': 'bg-green-100 text-green-800',
      'Operations': 'bg-indigo-100 text-indigo-800',
      'Executive': 'bg-gray-100 text-gray-800'
    };
    return colors[department] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gsv-green"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gsv-green via-gsv-greenDark to-gsv-slate-900 text-white py-20">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Intern Blog
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8">
              Stories, insights, and updates from our team
            </p>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 max-w-2xl mx-auto">
              <p className="text-white/90">
                Read about our interns&apos; experiences, director reflections, and the latest happenings
                at Green Silicon Valley.
              </p>
            </div>
            <div className="mt-8">
              <Link
                href="/interns/blog/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gsv-green font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Write New Post
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-12 bg-white border-b">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Filter Posts</h2>
                <p className="text-gray-600">Find posts by department or type</p>
              </div>

              <div className="flex flex-wrap gap-4">
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gsv-green focus:border-transparent"
                >
                  <option value="all">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>

                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gsv-green focus:border-transparent"
                >
                  <option value="all">All Posts</option>
                  <option value="intern">Intern Posts</option>
                  <option value="director">Director Notes</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="py-16">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            {filteredPosts.length === 0 ? (
              <div className="text-center py-12">
                <Filter className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No posts found</h3>
                <p className="text-gray-600">Try adjusting your filters to see more posts</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPosts.map((post) => (
                  <article
                    key={post.id}
                    className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow overflow-hidden"
                  >
                    {/* Status and Type Badges */}
                    <div className="flex items-center gap-2 mb-3">
                      {post.isDirectorNote && (
                        <div className="bg-gsv-green text-white px-3 py-1 text-xs font-medium rounded-full">
                          Director Note
                        </div>
                      )}
                      {post.status === 'draft' && (
                        <div className="bg-yellow-100 text-yellow-800 px-3 py-1 text-xs font-medium rounded-full">
                          Draft
                        </div>
                      )}
                      {post.status === 'submitted' && (
                        <div className="bg-blue-100 text-blue-800 px-3 py-1 text-xs font-medium rounded-full flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Under Review
                        </div>
                      )}
                      {post.status === 'published' && (
                        <div className="bg-green-100 text-green-800 px-3 py-1 text-xs font-medium rounded-full">
                          Published
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      {/* Department & Type */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDepartmentColor(post.department)}`}>
                          {post.department}
                        </span>
                        {post.isDirectorNote && (
                          <span className="px-2 py-1 bg-gsv-green text-white rounded-full text-xs font-medium">
                            Director
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="text-lg font-bold text-gray-900 mb-2 hover:text-gsv-green transition-colors cursor-pointer">
                        {post.title}
                      </h3>

                      {/* Excerpt */}
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>

                      {/* Author & Meta */}
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>{post.authorName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(post.publishedAt || post.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Tags */}
                      {post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {post.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Stats */}
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            <span>{post.views}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="w-4 h-4" />
                            <span>{post.likes}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageSquare className="w-4 h-4" />
                            <span>{Math.floor(Math.random() * 10)}</span>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {post.readTime} min read
                        </div>
                      </div>

                      {/* Action Buttons */}
                      {(post.status === 'draft' || post.status === 'submitted') && (
                        <div className="flex items-center gap-2 pt-3 border-t">
                          <Link
                            href={`/interns/blog/${post.id}/edit`}
                            className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                            Edit
                          </Link>
                          {post.status === 'draft' && (
                            <button
                              onClick={() => submitForReview(post.id)}
                              className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            >
                              <Send className="w-4 h-4" />
                              Submit for Review
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Blog Community</h2>
              <p className="text-lg text-gray-600">
                Sharing our journey and insights
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-gsv-green mb-2">{posts.length}</div>
                <p className="text-gray-600">Total Posts</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gsv-green mb-2">
                  {posts.filter(p => !p.isDirectorNote).length}
                </div>
                <p className="text-gray-600">Intern Posts</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gsv-green mb-2">
                  {posts.filter(p => p.isDirectorNote).length}
                </div>
                <p className="text-gray-600">Director Notes</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gsv-green mb-2">
                  {posts.reduce((sum, p) => sum + p.views, 0)}
                </div>
                <p className="text-gray-600">Total Views</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gsv-green/5">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Have a Story to Share?</h2>
            <p className="text-lg text-gray-600 mb-8">
              Join our intern blog and share your experiences and insights
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/interns/onboarding"
                className="bg-gsv-green text-white px-8 py-3 rounded-lg hover:bg-gsv-greenDark transition-colors font-medium"
              >
                Start Your Journey
              </a>
              <a
                href="/contact"
                className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
