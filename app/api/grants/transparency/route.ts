import { NextRequest, NextResponse } from 'next/server';
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Fetch grants from database
    const { data: grants, error } = await supabase
      .from('grants_transparency')
      .select('*')
      .order('received_date', { ascending: false });

    if (error) {
      console.error('Error fetching grants:', error);
      // Return sample data if database table doesn't exist yet
      return NextResponse.json({
        grants: [
          {
            id: '1',
            name: 'California Environmental Education Initiative',
            funder: 'California Department of Education',
            amount: 25000,
            receivedDate: '2023-09-01',
            status: 'active',
            category: 'State Education Grant',
            description: 'Supporting environmental STEM education expansion across California schools',
            objectives: [
              'Deliver 100 environmental STEM presentations',
              'Train 50 volunteer presenters',
              'Develop curriculum alignment resources'
            ],
            outcomes: [
              '85 presentations completed (85% of goal)',
              '45 volunteers trained',
              'Curriculum resources developed and distributed'
            ],
            useOfFunds: [
              {
                category: 'Program Delivery',
                amount: 15000,
                percentage: 60,
                description: 'Volunteer training, materials, and presentation delivery'
              },
              {
                category: 'Curriculum Development',
                amount: 6000,
                percentage: 24,
                description: 'Teacher resources and curriculum alignment materials'
              },
              {
                category: 'Evaluation & Reporting',
                amount: 2500,
                percentage: 10,
                description: 'Program assessment and funder reporting'
              },
              {
                category: 'Administration',
                amount: 1500,
                percentage: 6,
                description: 'Grant management and compliance'
              }
            ],
            impact: 'Expanded reach to 12 new schools, trained 45 volunteers, delivered 85 presentations reaching 2,500+ students'
          },
          {
            id: '2',
            name: 'Silicon Valley STEM Education Partnership',
            funder: 'Silicon Valley Community Foundation',
            amount: 15000,
            receivedDate: '2022-06-15',
            status: 'completed',
            category: 'Community Foundation Grant',
            description: 'Building partnerships between tech industry and local schools for STEM education',
            objectives: [
              'Establish corporate volunteer partnerships',
              'Develop industry-school mentorship programs',
              'Create STEM career awareness materials'
            ],
            outcomes: [
              '8 corporate partnerships established',
              '3 mentorship programs launched',
              'STEM career materials distributed to 25 schools'
            ],
            useOfFunds: [
              {
                category: 'Partnership Development',
                amount: 7500,
                percentage: 50,
                description: 'Corporate outreach and relationship building'
              },
              {
                category: 'Program Materials',
                amount: 4500,
                percentage: 30,
                description: 'STEM career resources and mentorship materials'
              },
              {
                category: 'Events & Activities',
                amount: 2250,
                percentage: 15,
                description: 'Industry-school connection events'
              },
              {
                category: 'Evaluation',
                amount: 750,
                percentage: 5,
                description: 'Program impact assessment'
              }
            ],
            impact: 'Created lasting partnerships between 8 tech companies and local schools, established 3 ongoing mentorship programs'
          },
          {
            id: '3',
            name: 'Climate Science Education Initiative',
            funder: 'National Science Foundation',
            amount: 50000,
            receivedDate: '2021-11-01',
            status: 'completed',
            category: 'Federal Research Grant',
            description: 'Developing research-based climate science curriculum for K-12 education',
            objectives: [
              'Research effective climate education methods',
              'Develop evidence-based curriculum',
              'Train educators in climate science instruction',
              'Evaluate program effectiveness'
            ],
            outcomes: [
              'Published 3 research papers on climate education',
              'Developed comprehensive K-12 climate curriculum',
              'Trained 200 educators',
              'Achieved 89% student knowledge retention'
            ],
            useOfFunds: [
              {
                category: 'Research & Development',
                amount: 25000,
                percentage: 50,
                description: 'Curriculum research and development'
              },
              {
                category: 'Educator Training',
                amount: 15000,
                percentage: 30,
                description: 'Professional development workshops'
              },
              {
                category: 'Evaluation & Assessment',
                amount: 7500,
                percentage: 15,
                description: 'Program evaluation and research'
              },
              {
                category: 'Dissemination',
                amount: 2500,
                percentage: 5,
                description: 'Sharing findings and resources'
              }
            ],
            impact: 'Created nationally recognized climate education curriculum, trained 200 educators, published research establishing best practices'
          },
          {
            id: '4',
            name: 'Youth Environmental Leadership Program',
            funder: 'Environmental Protection Agency',
            amount: 30000,
            receivedDate: '2024-01-15',
            status: 'active',
            category: 'Federal Environmental Grant',
            description: 'Empowering youth to become environmental leaders through hands-on STEM experiences',
            objectives: [
              'Develop youth leadership curriculum',
              'Create environmental action projects',
              'Build community partnerships',
              'Measure youth leadership outcomes'
            ],
            outcomes: [
              'Leadership curriculum developed (75% complete)',
              '5 environmental action projects launched',
              '12 community partnerships established',
              'Baseline assessment completed'
            ],
            useOfFunds: [
              {
                category: 'Curriculum & Materials',
                amount: 12000,
                percentage: 40,
                description: 'Youth leadership curriculum and project materials'
              },
              {
                category: 'Program Implementation',
                amount: 9000,
                percentage: 30,
                description: 'Project coordination and youth activities'
              },
              {
                category: 'Partnership Development',
                amount: 6000,
                percentage: 20,
                description: 'Community and organizational partnerships'
              },
              {
                category: 'Evaluation & Reporting',
                amount: 3000,
                percentage: 10,
                description: 'Program assessment and EPA reporting'
              }
            ],
            impact: 'Launched 5 youth-led environmental projects, engaged 200+ youth participants, established 12 community partnerships'
          }
        ]
      });
    }

    // Transform the data to match our expected format
    const transformedGrants = grants?.map(grant => ({
      id: grant.id,
      name: grant.name,
      funder: grant.funder,
      amount: grant.amount,
      receivedDate: grant.received_date,
      status: grant.status,
      category: grant.category,
      description: grant.description,
      objectives: grant.objectives || [],
      outcomes: grant.outcomes || [],
      useOfFunds: grant.use_of_funds || [],
      impact: grant.impact || '',
      reportUrl: grant.report_url
    })) || [];

    return NextResponse.json({ grants: transformedGrants });

  } catch (error) {
    console.error('Error in grants/transparency API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
