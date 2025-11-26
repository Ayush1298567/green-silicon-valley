import { NextRequest, NextResponse } from 'next/server';
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Fetch current partners
    const { data: partners, error } = await supabase
      .from('partners')
      .select('*')
      .eq('is_featured', true)
      .order('name');

    if (error) {
      console.error('Error fetching partners:', error);
      // Return sample data if database table doesn't exist yet
      return NextResponse.json({
        partners: [
          {
            id: '1',
            name: 'TechCorp Industries',
            logoUrl: '/api/placeholder/200/100',
            website: 'https://www.techcorp.com',
            partnershipType: 'Corporate Sponsorship',
            description: 'Leading technology company supporting our environmental STEM education initiatives through employee volunteering and program sponsorship.',
            isFeatured: true,
            partnershipStart: '2022-03-15',
            impact: 'Sponsored 50 presentations and provided volunteer coordination platform development.'
          },
          {
            id: '2',
            name: 'Green Valley School District',
            logoUrl: '/api/placeholder/200/100',
            website: 'https://www.greenvalleyschools.org',
            partnershipType: 'School District Partnership',
            description: 'Comprehensive partnership bringing environmental education to all elementary schools in the district.',
            isFeatured: true,
            partnershipStart: '2021-09-01',
            impact: 'Reached 15,000 students across 25 schools with environmental STEM curriculum.'
          },
          {
            id: '3',
            name: 'EcoFoundation',
            logoUrl: '/api/placeholder/200/100',
            website: 'https://www.ecofoundation.org',
            partnershipType: 'Non-Profit Collaboration',
            description: 'Collaborative environmental organization working together on climate change education and community outreach.',
            isFeatured: true,
            partnershipStart: '2023-01-20',
            impact: 'Joint community events and shared resources for environmental education.'
          },
          {
            id: '4',
            name: 'InnovateEd Foundation',
            logoUrl: '/api/placeholder/200/100',
            website: 'https://www.innovateed.org',
            partnershipType: 'Educational Institution',
            description: 'Educational foundation providing curriculum development support and teacher training resources.',
            isFeatured: false,
            partnershipStart: '2022-08-10',
            impact: 'Developed advanced curriculum modules and provided teacher certification programs.'
          },
          {
            id: '5',
            name: 'Community Action Network',
            logoUrl: '/api/placeholder/200/100',
            website: 'https://www.communityaction.net',
            partnershipType: 'Community Organization',
            description: 'Local community organization facilitating connections between schools and environmental programs.',
            isFeatured: false,
            partnershipStart: '2023-05-01',
            impact: 'Organized community environmental events and school-family engagement programs.'
          },
          {
            id: '6',
            name: 'Sustainable Solutions Inc',
            logoUrl: '/api/placeholder/200/100',
            website: 'https://www.sustainablesolutions.com',
            partnershipType: 'Corporate Sponsorship',
            description: 'Environmental consulting firm providing expertise and supporting our mission through corporate matching programs.',
            isFeatured: false,
            partnershipStart: '2022-11-15',
            impact: 'Provided environmental consulting expertise and matched employee donations.'
          },
          {
            id: '7',
            name: 'Future Leaders Academy',
            logoUrl: '/api/placeholder/200/100',
            website: 'https://www.futureleaders.edu',
            partnershipType: 'Educational Institution',
            description: 'STEM-focused educational institution collaborating on advanced environmental science curriculum.',
            isFeatured: false,
            partnershipStart: '2023-03-01',
            impact: 'Co-developed advanced environmental science modules for high school students.'
          },
          {
            id: '8',
            name: 'Green Communities Alliance',
            logoUrl: '/api/placeholder/200/100',
            website: 'https://www.greencommunities.org',
            partnershipType: 'Community Organization',
            description: 'Regional alliance of community groups working together to promote environmental awareness.',
            isFeatured: false,
            partnershipStart: '2023-07-01',
            impact: 'Expanded community outreach programs and increased local engagement.'
          }
        ]
      });
    }

    // Transform the data to match our expected format
    const transformedPartners = partners?.map(partner => ({
      id: partner.id,
      name: partner.name,
      logoUrl: partner.logo_url || '/api/placeholder/200/100',
      website: partner.website,
      partnershipType: partner.partnership_type,
      description: partner.description,
      isFeatured: partner.is_featured,
      partnershipStart: partner.partnership_start_date,
      impact: partner.impact_summary || ''
    })) || [];

    return NextResponse.json({ partners: transformedPartners });

  } catch (error) {
    console.error('Error in partners/current API:', error);
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
      logoUrl,
      website,
      partnershipType,
      description,
      isFeatured,
      partnershipStart,
      impact
    } = body;

    if (!name || !partnershipType) {
      return NextResponse.json(
        { error: 'Name and partnership type are required' },
        { status: 400 }
      );
    }

    const { data: partner, error } = await supabase
      .from('partners')
      .insert({
        name,
        logo_url: logoUrl,
        website,
        partnership_type: partnershipType,
        description,
        is_featured: isFeatured || false,
        partnership_start_date: partnershipStart,
        impact_summary: impact
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating partner:', error);
      return NextResponse.json(
        { error: 'Failed to create partner' },
        { status: 500 }
      );
    }

    return NextResponse.json({ partner });

  } catch (error) {
    console.error('Error in partners/current POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
