import { NextRequest, NextResponse } from 'next/server';
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Fetch schools available for sponsorship
    const { data: schools, error } = await supabase
      .from('schools')
      .select(`
        id,
        name,
        location,
        grade_levels,
        student_count,
        current_presentations,
        target_presentations,
        description,
        needs,
        impact_summary,
        is_priority
      `)
      .order('is_priority', { ascending: false })
      .order('name');

    if (error) {
      console.error('Error fetching schools:', error);
      // Return sample data if database table doesn't exist yet
      return NextResponse.json({
        schools: [
          {
            id: '1',
            name: 'Riverside Elementary',
            location: 'Riverside, CA',
            gradeLevels: 'K-5',
            studentCount: 450,
            currentPresentations: 2,
            targetPresentations: 6,
            description: 'A diverse elementary school serving a growing community with increasing environmental awareness needs.',
            needs: ['STEM curriculum support', 'Environmental science materials', 'Teacher training'],
            impact: 'Students will gain hands-on experience with local ecosystem monitoring and conservation projects.',
            isPriority: true
          },
          {
            id: '2',
            name: 'Mountain View Middle School',
            location: 'Mountain View, CA',
            gradeLevels: '6-8',
            studentCount: 320,
            currentPresentations: 1,
            targetPresentations: 4,
            description: 'A STEM-focused middle school looking to expand environmental science offerings.',
            needs: ['Advanced environmental monitoring equipment', 'Field trip support', 'Guest speaker series'],
            impact: 'Middle school students will develop advanced environmental research and advocacy skills.',
            isPriority: true
          },
          {
            id: '3',
            name: 'Valley High School',
            location: 'Valley Center, CA',
            gradeLevels: '9-12',
            studentCount: 680,
            currentPresentations: 3,
            targetPresentations: 8,
            description: 'Large comprehensive high school with diverse student population and strong community ties.',
            needs: ['College preparation programs', 'Environmental club support', 'Internship opportunities'],
            impact: 'High school students will be prepared for environmental science careers and higher education.',
            isPriority: false
          },
          {
            id: '4',
            name: 'Oak Grove Elementary',
            location: 'Oak Grove, CA',
            gradeLevels: 'K-5',
            studentCount: 280,
            currentPresentations: 0,
            targetPresentations: 4,
            description: 'Small community school focused on project-based learning and environmental stewardship.',
            needs: ['Basic environmental education materials', 'Outdoor learning space development', 'Parent education programs'],
            impact: 'Young students will develop foundational environmental awareness and stewardship habits.',
            isPriority: false
          },
          {
            id: '5',
            name: 'Pine Ridge Charter School',
            location: 'Pine Ridge, CA',
            gradeLevels: 'K-8',
            studentCount: 200,
            currentPresentations: 1,
            targetPresentations: 3,
            description: 'Small charter school with emphasis on environmental and outdoor education.',
            needs: ['Curriculum development', 'Outdoor equipment', 'Teacher professional development'],
            impact: 'Students will engage deeply with local environmental issues and develop leadership skills.',
            isPriority: false
          },
          {
            id: '6',
            name: 'Desert Springs Academy',
            location: 'Desert Springs, CA',
            gradeLevels: '6-12',
            studentCount: 420,
            currentPresentations: 2,
            targetPresentations: 5,
            description: 'Regional academy serving multiple communities with focus on environmental science and sustainability.',
            needs: ['Advanced laboratory equipment', 'Research partnerships', 'Student internship programs'],
            impact: 'Students will conduct original environmental research and contribute to regional conservation efforts.',
            isPriority: true
          }
        ]
      });
    }

    // Transform the data to match our expected format
    const transformedSchools = schools?.map(school => ({
      id: school.id,
      name: school.name,
      location: school.location,
      gradeLevels: school.grade_levels,
      studentCount: school.student_count,
      currentPresentations: school.current_presentations || 0,
      targetPresentations: school.target_presentations || 0,
      description: school.description,
      needs: school.needs || [],
      impact: school.impact_summary || '',
      isPriority: school.is_priority || false
    })) || [];

    return NextResponse.json({ schools: transformedSchools });

  } catch (error) {
    console.error('Error in support/schools API:', error);
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

    const {
      schoolId,
      sponsorshipLevel,
      amount,
      donorName,
      donorEmail,
      message
    } = body;

    if (!schoolId || !sponsorshipLevel || !amount || !donorName || !donorEmail) {
      return NextResponse.json(
        { error: 'Required fields missing' },
        { status: 400 }
      );
    }

    // Create sponsorship record
    const { data: sponsorship, error } = await supabase
      .from('school_sponsorships')
      .insert({
        school_id: schoolId,
        sponsor_name: donorName,
        sponsor_email: donorEmail,
        amount: amount,
        sponsorship_level: sponsorshipLevel,
        message: message,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating sponsorship:', error);
      return NextResponse.json(
        { error: 'Failed to create sponsorship' },
        { status: 500 }
      );
    }

    // In production, this would integrate with a payment processor
    // For now, we'll just return success and simulate processing

    return NextResponse.json({
      message: 'Sponsorship created successfully',
      sponsorship: {
        id: sponsorship.id,
        schoolId: sponsorship.school_id,
        sponsorshipLevel: sponsorship.sponsorship_level,
        amount: sponsorship.amount,
        status: sponsorship.status
      }
    });

  } catch (error) {
    console.error('Error in support/schools POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
