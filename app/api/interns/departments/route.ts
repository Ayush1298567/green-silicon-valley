import { NextRequest, NextResponse } from 'next/server';
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Fetch departments from database
    const { data: departments, error } = await supabase
      .from('intern_departments')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching departments:', error);
      // Return sample data if database table doesn't exist yet
      return NextResponse.json({
        departments: [
          {
            id: 'outreach',
            name: 'Outreach',
            description: 'Build partnerships with schools and coordinate presentation logistics',
            responsibilities: [
              'Manage teacher relationships and communications',
              'Schedule presentations and handle logistics',
              'Track presentation impact and feedback',
              'Develop outreach materials and strategies',
              'Coordinate with school districts and administrators'
            ],
            requirements: [
              'Strong communication and organizational skills',
              'Experience with customer relationship management',
              'Interest in education and community engagement',
              'Ability to coordinate complex logistics'
            ]
          },
          {
            id: 'technology',
            name: 'Technology',
            description: 'Develop and maintain digital platforms and volunteer management systems',
            responsibilities: [
              'Maintain and improve volunteer management platform',
              'Develop new features and user interfaces',
              'Manage databases and ensure data integrity',
              'Implement automation and workflow improvements',
              'Handle technical support and troubleshooting'
            ],
            requirements: [
              'Programming experience (preferred languages: TypeScript, Python)',
              'Understanding of web development and databases',
              'Problem-solving and analytical thinking',
              'Interest in educational technology'
            ]
          },
          {
            id: 'media',
            name: 'Media',
            description: 'Create content, manage social media, and tell our story visually',
            responsibilities: [
              'Create engaging social media content',
              'Produce videos and photography for presentations',
              'Design marketing materials and presentations',
              'Manage website content and blog posts',
              'Track engagement metrics and analytics'
            ],
            requirements: [
              'Graphic design or video production experience',
              'Social media management skills',
              'Creative writing and storytelling abilities',
              'Photography or videography skills'
            ]
          },
          {
            id: 'volunteer-development',
            name: 'Volunteer Development',
            description: 'Recruit, train, and support our volunteer teams',
            responsibilities: [
              'Manage volunteer recruitment and applications',
              'Coordinate training sessions and workshops',
              'Support volunteer team formation and dynamics',
              'Track volunteer engagement and retention',
              'Develop volunteer resources and support materials'
            ],
            requirements: [
              'Experience with volunteer management or HR',
              'Strong interpersonal and training skills',
              'Understanding of team dynamics',
              'Passion for mentorship and development'
            ]
          },
          {
            id: 'communications',
            name: 'Communications',
            description: 'Manage internal communications and stakeholder relationships',
            responsibilities: [
              'Coordinate internal team communications',
              'Manage newsletter and email campaigns',
              'Handle stakeholder relationships and partnerships',
              'Organize events and team meetings',
              'Maintain organizational documentation'
            ],
            requirements: [
              'Excellent written and verbal communication skills',
              'Experience with email marketing tools',
              'Strong organizational and coordination abilities',
              'Understanding of nonprofit communications'
            ]
          },
          {
            id: 'operations',
            name: 'Operations',
            description: 'Handle logistics, process optimization, and behind-the-scenes coordination',
            responsibilities: [
              'Manage operational workflows and processes',
              'Coordinate logistics for events and presentations',
              'Handle administrative tasks and record-keeping',
              'Optimize operational efficiency and scalability',
              'Support cross-departmental coordination'
            ],
            requirements: [
              'Strong organizational and logistical skills',
              'Attention to detail and process orientation',
              'Experience with operational management',
              'Problem-solving and analytical abilities'
            ]
          }
        ]
      });
    }

    return NextResponse.json({ departments });

  } catch (error) {
    console.error('Error in interns/departments API:', error);
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

    const { name, description, responsibilities, requirements } = body;

    if (!name || !description) {
      return NextResponse.json(
        { error: 'Name and description are required' },
        { status: 400 }
      );
    }

    const { data: department, error } = await supabase
      .from('intern_departments')
      .insert({
        name,
        description,
        responsibilities: responsibilities || [],
        requirements: requirements || []
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating department:', error);
      return NextResponse.json(
        { error: 'Failed to create department' },
        { status: 500 }
      );
    }

    return NextResponse.json({ department });

  } catch (error) {
    console.error('Error in interns/departments POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
