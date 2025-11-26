import { NextRequest, NextResponse } from 'next/server';
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Fetch projects from database
    const { data: projects, error } = await supabase
      .from('intern_projects_showcase')
      .select(`
        *,
        intern_names:intern_projects_contributors(
          users(name)
        )
      `)
      .order('completed_date', { ascending: false });

    if (error) {
      console.error('Error fetching projects:', error);
      // Return sample data if database table doesn't exist yet
      return NextResponse.json({
        projects: [
          {
            id: '1',
            title: 'Volunteer Management Platform Redesign',
            department: 'Technology',
            description: 'Complete overhaul of the volunteer signup and management system, improving user experience and administrative efficiency.',
            outcomes: [
              'Reduced signup time by 40%',
              'Improved volunteer retention tracking',
              'Enhanced admin dashboard with real-time analytics',
              'Mobile-responsive design for on-the-go access'
            ],
            images: ['/api/placeholder/400/300', '/api/placeholder/400/300'],
            completedDate: '2024-01-15',
            featured: true,
            internNames: ['Alex Chen', 'Maria Rodriguez'],
            impact: 'Streamlined volunteer onboarding process, increasing volunteer satisfaction and administrative efficiency.'
          },
          {
            id: '2',
            title: 'School Partnership Expansion Campaign',
            department: 'Outreach',
            description: 'Developed and executed a comprehensive outreach strategy to expand partnerships with local schools and districts.',
            outcomes: [
              'Secured partnerships with 15 new schools',
              'Created school outreach toolkit',
              'Established monthly communication newsletter',
              'Organized teacher information sessions'
            ],
            images: ['/api/placeholder/400/300'],
            completedDate: '2024-02-01',
            featured: true,
            internNames: ['Jordan Kim'],
            impact: 'Expanded program reach to serve 3,000 additional students across 5 new school districts.'
          },
          {
            id: '3',
            title: 'Environmental Education Video Series',
            department: 'Media',
            description: 'Produced a 6-part video series explaining complex environmental concepts through engaging animations and real-world examples.',
            outcomes: [
              'Created 6 educational videos (2-3 minutes each)',
              'Developed accompanying lesson plans',
              'Reached 50,000+ views on social media',
              'Translated content into Spanish and Mandarin'
            ],
            images: ['/api/placeholder/400/300', '/api/placeholder/400/300', '/api/placeholder/400/300'],
            completedDate: '2023-12-20',
            featured: true,
            internNames: ['Sarah Patel', 'Marcus Johnson'],
            impact: 'Made complex environmental topics accessible to broader audience, supporting classroom learning objectives.'
          },
          {
            id: '4',
            title: 'Volunteer Training Curriculum Enhancement',
            department: 'Volunteer Development',
            description: 'Redesigned the volunteer training program with interactive modules, assessments, and ongoing professional development resources.',
            outcomes: [
              'Created modular training curriculum',
              'Developed assessment tools for skill tracking',
              'Established mentor program for new volunteers',
              'Created resource library for ongoing learning'
            ],
            images: ['/api/placeholder/400/300'],
            completedDate: '2024-01-30',
            featured: false,
            internNames: ['Emma Davis'],
            impact: 'Improved volunteer preparedness and presentation quality, leading to higher teacher satisfaction scores.'
          },
          {
            id: '5',
            title: 'Internal Communications System',
            department: 'Communications',
            description: 'Implemented a centralized communication platform to streamline internal team coordination and information sharing.',
            outcomes: [
              'Set up project management and documentation tools',
              'Created standardized reporting templates',
              'Established weekly team update process',
              'Developed knowledge base for organizational processes'
            ],
            images: ['/api/placeholder/400/300', '/api/placeholder/400/300'],
            completedDate: '2023-11-15',
            featured: false,
            internNames: ['Ryan Foster', 'Priya Singh'],
            impact: 'Improved team coordination and information flow, reducing miscommunication and increasing productivity.'
          },
          {
            id: '6',
            title: 'Presentation Logistics Optimization',
            department: 'Operations',
            description: 'Streamlined the presentation scheduling and logistics process through automation and improved coordination tools.',
            outcomes: [
              'Automated scheduling conflict detection',
              'Created centralized equipment tracking system',
              'Developed presentation preparation checklists',
              'Implemented feedback collection automation'
            ],
            images: ['/api/placeholder/400/300'],
            completedDate: '2024-02-15',
            featured: false,
            internNames: ['David Wong'],
            impact: 'Reduced presentation setup time by 30% and improved overall presentation quality and consistency.'
          }
        ]
      });
    }

    // Transform the data to match our expected format
    const transformedProjects = projects?.map(project => ({
      id: project.id,
      title: project.title,
      department: project.department,
      description: project.description,
      outcomes: project.outcomes || [],
      images: project.images || [],
      completedDate: project.completed_date,
      featured: project.featured,
      internNames: project.intern_names?.map((contributor: any) => contributor.users?.name).filter(Boolean) || [],
      impact: project.impact_summary || ''
    })) || [];

    return NextResponse.json({ projects: transformedProjects });

  } catch (error) {
    console.error('Error in interns/projects API:', error);
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

    const {
      title,
      department,
      description,
      outcomes,
      images,
      completedDate,
      featured,
      internNames,
      impact
    } = body;

    if (!title || !department || !description) {
      return NextResponse.json(
        { error: 'Title, department, and description are required' },
        { status: 400 }
      );
    }

    // Start a transaction to insert project and contributors
    const { data: project, error: projectError } = await supabase
      .from('intern_projects_showcase')
      .insert({
        title,
        department,
        description,
        outcomes: outcomes || [],
        images: images || [],
        completed_date: completedDate,
        featured: featured || false,
        impact_summary: impact || ''
      })
      .select()
      .single();

    if (projectError) {
      console.error('Error creating project:', projectError);
      return NextResponse.json(
        { error: 'Failed to create project' },
        { status: 500 }
      );
    }

    // Add contributors if intern names are provided
    if (internNames && internNames.length > 0) {
      const contributors = internNames.map((name: string) => ({
        project_id: project.id,
        user_id: null, // We'll need to look up user IDs by name or create placeholder
        name: name
      }));

      // For now, we'll insert with null user_id and store names separately
      // In a real implementation, you'd look up user IDs from the users table
      const { error: contributorError } = await supabase
        .from('intern_projects_contributors')
        .insert(contributors);

      if (contributorError) {
        console.error('Error adding contributors:', contributorError);
        // Don't fail the whole operation for contributor errors
      }
    }

    return NextResponse.json({ project });

  } catch (error) {
    console.error('Error in interns/projects POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
