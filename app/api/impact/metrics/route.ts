import { NextRequest, NextResponse } from 'next/server';
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // In production, this would aggregate real data from various tables
    // For now, return sample impact metrics
    const metrics = [
      {
        id: '1',
        category: 'Students',
        title: 'Students Reached',
        value: '2,847',
        description: 'Students have participated in our environmental STEM presentations since 2021',
        trend: 'up',
        icon: 'Users'
      },
      {
        id: '2',
        category: 'Schools',
        title: 'Schools Served',
        value: '67',
        description: 'Schools across California and Arizona have hosted our programs',
        trend: 'up',
        icon: 'BookOpen'
      },
      {
        id: '3',
        category: 'Presentations',
        title: 'Presentations Delivered',
        value: '312',
        description: 'Complete environmental STEM presentations delivered to date',
        trend: 'up',
        icon: 'Award'
      },
      {
        id: '4',
        category: 'Satisfaction',
        title: 'Teacher Satisfaction',
        value: '96%',
        description: 'Teachers report high satisfaction with our program quality and impact',
        trend: 'stable',
        icon: 'Star'
      },
      {
        id: '5',
        category: 'Retention',
        title: 'Knowledge Retention',
        value: '89%',
        description: 'Students retain environmental science concepts 6 months after presentation',
        trend: 'up',
        icon: 'Target'
      },
      {
        id: '6',
        category: 'Expansion',
        title: 'Geographic Reach',
        value: '8 States',
        description: 'States where we have active programs or partnerships',
        trend: 'new',
        icon: 'Globe'
      }
    ];

    const stories = [
      {
        id: '1',
        school: 'Riverside Elementary School',
        location: 'Riverside, CA',
        quote: 'Green Silicon Valley transformed our students&apos; understanding of environmental science. They now lead school-wide recycling initiatives and have started a community garden project.',
        author: 'Dr. Maria Rodriguez',
        role: 'Principal',
        impact: '30 students became environmental ambassadors, school recycling increased by 40%',
        image: '/api/placeholder/400/300'
      },
      {
        id: '2',
        school: 'Mountain View Middle School',
        location: 'Mountain View, CA',
        quote: 'The hands-on approach made complex climate science accessible and exciting. Our students are now designing their own environmental research projects.',
        author: 'Mr. James Chen',
        role: 'Science Teacher',
        impact: '15 student research projects launched, science fair finalists increased by 300%',
        image: '/api/placeholder/400/300'
      },
      {
        id: '3',
        school: 'Valley High School',
        location: 'Valley Center, CA',
        quote: 'This program bridged the gap between classroom learning and real-world environmental action. Students gained practical skills and confidence in addressing climate challenges.',
        author: 'Ms. Sarah Johnson',
        role: 'Environmental Science Teacher',
        impact: 'Environmental club grew from 12 to 45 members, school won district environmental award',
        image: '/api/placeholder/400/300'
      },
      {
        id: '4',
        school: 'Oak Grove Charter School',
        location: 'Oak Grove, CA',
        quote: 'The volunteer presenters brought enthusiasm and real-world experience that textbooks alone couldn&apos;t provide. Our students are now passionate about environmental careers.',
        author: 'Mr. David Park',
        role: 'STEM Coordinator',
        impact: '8 students pursued environmental science majors, school won district environmental award',
        image: '/api/placeholder/400/300'
      }
    ];

    return NextResponse.json({
      metrics,
      stories
    });

  } catch (error) {
    console.error('Error in impact/metrics API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
