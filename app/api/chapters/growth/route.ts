import { NextRequest, NextResponse } from 'next/server';
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Fetch chapter data
    const { data: chapters, error } = await supabase
      .from('chapters')
      .select('*')
      .order('founded_date');

    if (error) {
      console.error('Error fetching chapters:', error);
      // Return sample data if database table doesn't exist yet
      return NextResponse.json({
        chapters: [
          // California (Primary)
          {
            id: '1',
            name: 'Silicon Valley Chapter',
            location: 'San Jose, CA',
            latitude: 37.3382,
            longitude: -122.0453,
            status: 'active',
            foundedDate: '2021-01-15',
            memberCount: 156,
            schoolsServed: 45,
            presentationsDelivered: 234,
            growthMetrics: {
              monthlyGrowth: 12,
              schoolsAdded: 3,
              presentationsCompleted: 18
            }
          },
          {
            id: '2',
            name: 'Bay Area North Chapter',
            location: 'San Francisco, CA',
            latitude: 37.7749,
            longitude: -122.4194,
            status: 'active',
            foundedDate: '2021-08-20',
            memberCount: 98,
            schoolsServed: 32,
            presentationsDelivered: 156,
            growthMetrics: {
              monthlyGrowth: 8,
              schoolsAdded: 2,
              presentationsCompleted: 12
            }
          },
          {
            id: '3',
            name: 'Sacramento Valley Chapter',
            location: 'Sacramento, CA',
            latitude: 38.5816,
            longitude: -121.4944,
            status: 'active',
            foundedDate: '2022-03-10',
            memberCount: 67,
            schoolsServed: 28,
            presentationsDelivered: 134,
            growthMetrics: {
              monthlyGrowth: 6,
              schoolsAdded: 1,
              presentationsCompleted: 9
            }
          },
          {
            id: '4',
            name: 'Los Angeles Chapter',
            location: 'Los Angeles, CA',
            latitude: 34.0522,
            longitude: -118.2437,
            status: 'active',
            foundedDate: '2022-09-15',
            memberCount: 123,
            schoolsServed: 38,
            presentationsDelivered: 189,
            growthMetrics: {
              monthlyGrowth: 15,
              schoolsAdded: 4,
              presentationsCompleted: 22
            }
          },
          {
            id: '5',
            name: 'San Diego Chapter',
            location: 'San Diego, CA',
            latitude: 32.7157,
            longitude: -117.1611,
            status: 'active',
            foundedDate: '2023-01-20',
            memberCount: 89,
            schoolsServed: 31,
            presentationsDelivered: 145,
            growthMetrics: {
              monthlyGrowth: 10,
              schoolsAdded: 2,
              presentationsCompleted: 14
            }
          },
          // Southwest Expansion
          {
            id: '6',
            name: 'Phoenix Chapter',
            location: 'Phoenix, AZ',
            latitude: 33.4484,
            longitude: -112.0740,
            status: 'forming',
            foundedDate: '2024-02-15',
            memberCount: 23,
            schoolsServed: 8,
            presentationsDelivered: 24,
            growthMetrics: {
              monthlyGrowth: 4,
              schoolsAdded: 1,
              presentationsCompleted: 3
            }
          },
          {
            id: '7',
            name: 'Las Vegas Chapter',
            location: 'Las Vegas, NV',
            latitude: 36.1699,
            longitude: -115.1398,
            status: 'forming',
            foundedDate: '2024-03-01',
            memberCount: 18,
            schoolsServed: 6,
            presentationsDelivered: 18,
            growthMetrics: {
              monthlyGrowth: 3,
              schoolsAdded: 1,
              presentationsCompleted: 2
            }
          },
          // Planned Expansion
          {
            id: '8',
            name: 'Seattle Chapter',
            location: 'Seattle, WA',
            latitude: 47.6062,
            longitude: -122.3321,
            status: 'planned',
            foundedDate: '2025-01-01',
            memberCount: 0,
            schoolsServed: 0,
            presentationsDelivered: 0,
            growthMetrics: {
              monthlyGrowth: 0,
              schoolsAdded: 0,
              presentationsCompleted: 0
            }
          },
          {
            id: '9',
            name: 'Austin Chapter',
            location: 'Austin, TX',
            latitude: 30.2672,
            longitude: -97.7431,
            status: 'planned',
            foundedDate: '2025-03-01',
            memberCount: 0,
            schoolsServed: 0,
            presentationsDelivered: 0,
            growthMetrics: {
              monthlyGrowth: 0,
              schoolsAdded: 0,
              presentationsCompleted: 0
            }
          },
          {
            id: '10',
            name: 'Vancouver Chapter',
            location: 'Vancouver, BC, Canada',
            latitude: 49.2827,
            longitude: -123.1207,
            status: 'planned',
            foundedDate: '2025-06-01',
            memberCount: 0,
            schoolsServed: 0,
            presentationsDelivered: 0,
            growthMetrics: {
              monthlyGrowth: 0,
              schoolsAdded: 0,
              presentationsCompleted: 0
            }
          }
        ]
      });
    }

    // Transform the data to match our expected format
    const transformedChapters = chapters?.map(chapter => ({
      id: chapter.id,
      name: chapter.name,
      location: chapter.location,
      latitude: chapter.latitude,
      longitude: chapter.longitude,
      status: chapter.status,
      foundedDate: chapter.founded_date,
      memberCount: chapter.member_count,
      schoolsServed: chapter.schools_served,
      presentationsDelivered: chapter.presentations_delivered,
      growthMetrics: chapter.growth_metrics || {
        monthlyGrowth: 0,
        schoolsAdded: 0,
        presentationsCompleted: 0
      }
    })) || [];

    return NextResponse.json({ chapters: transformedChapters });

  } catch (error) {
    console.error('Error in chapters/growth API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const body = await request.json();

    // Check if user is authenticated and is admin/founder
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check user role
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'founder'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const {
      name,
      location,
      latitude,
      longitude,
      status,
      foundedDate,
      memberCount,
      schoolsServed,
      presentationsDelivered,
      growthMetrics
    } = body;

    if (!name || !location) {
      return NextResponse.json(
        { error: 'Name and location are required' },
        { status: 400 }
      );
    }

    const { data: chapter, error } = await supabase
      .from('chapters')
      .insert({
        name,
        location,
        latitude,
        longitude,
        status: status || 'planned',
        founded_date: foundedDate,
        member_count: memberCount || 0,
        schools_served: schoolsServed || 0,
        presentations_delivered: presentationsDelivered || 0,
        growth_metrics: growthMetrics || {
          monthlyGrowth: 0,
          schoolsAdded: 0,
          presentationsCompleted: 0
        }
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating chapter:', error);
      return NextResponse.json(
        { error: 'Failed to create chapter' },
        { status: 500 }
      );
    }

    return NextResponse.json({ chapter });

  } catch (error) {
    console.error('Error in chapters/growth POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
