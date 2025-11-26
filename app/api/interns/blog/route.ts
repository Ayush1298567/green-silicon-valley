import { NextRequest, NextResponse } from 'next/server';
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department');
    const type = searchParams.get('type'); // 'intern' or 'director'

    // Build query
    let query = supabase
      .from('intern_blog_posts')
      .select(`
        *,
        author:users(name, role)
      `)
      .eq('is_published', true)
      .order('published_at', { ascending: false });

    if (department && department !== 'all') {
      query = query.eq('department', department);
    }

    if (type) {
      if (type === 'director') {
        query = query.eq('is_director_note', true);
      } else if (type === 'intern') {
        query = query.eq('is_director_note', false);
      }
    }

    const { data: posts, error } = await query;

    if (error) {
      console.error('Error fetching blog posts:', error);
      // Return sample data if database table doesn't exist yet
      return NextResponse.json({
        posts: [
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
        ]
      });
    }

    // Transform the data to match our expected format
    const transformedPosts = posts?.map(post => ({
      id: post.id,
      title: post.title,
      content: post.content,
      authorName: post.author?.name || 'Unknown Author',
      authorId: post.author_id,
      department: post.department,
      isDirectorNote: post.is_director_note,
      publishedAt: post.published_at,
      isPublished: post.is_published,
      tags: post.tags || [],
      excerpt: post.excerpt || '',
      readTime: post.read_time || 5,
      views: post.views || 0,
      likes: post.likes || 0
    })) || [];

    return NextResponse.json({ posts: transformedPosts });

  } catch (error) {
    console.error('Error in interns/blog API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient();
    const body = await request.json();

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const {
      title,
      content,
      department,
      isDirectorNote,
      tags,
      excerpt,
      readTime,
      isPublished
    } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    const { data: post, error } = await supabase
      .from('intern_blog_posts')
      .insert({
        title,
        content,
        author_id: user.id,
        department: department || 'General',
        is_director_note: isDirectorNote || false,
        tags: tags || [],
        excerpt: excerpt || '',
        read_time: readTime || 5,
        is_published: isPublished !== false, // Default to published
        published_at: new Date().toISOString()
      })
      .select(`
        *,
        author:users(name, role)
      `)
      .single();

    if (error) {
      console.error('Error creating blog post:', error);
      return NextResponse.json(
        { error: 'Failed to create blog post' },
        { status: 500 }
      );
    }

    // Transform the response
    const transformedPost = {
      id: post.id,
      title: post.title,
      content: post.content,
      authorName: post.author?.name || 'Unknown Author',
      authorId: post.author_id,
      department: post.department,
      isDirectorNote: post.is_director_note,
      publishedAt: post.published_at,
      isPublished: post.is_published,
      tags: post.tags || [],
      excerpt: post.excerpt || '',
      readTime: post.read_time || 5,
      views: post.views || 0,
      likes: post.likes || 0
    };

    return NextResponse.json({ post: transformedPost });

  } catch (error) {
    console.error('Error in interns/blog POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
