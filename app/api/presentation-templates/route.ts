import { NextRequest, NextResponse } from 'next/server';
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Fetch presentation templates with version history
    const { data: templates, error } = await supabase
      .from('presentation_templates')
      .select('*')
      .order('version', { ascending: false });

    if (error) {
      console.error('Error fetching templates:', error);
      // Return sample data if database table doesn't exist yet
      return NextResponse.json({
        templates: [
          {
            id: '1',
            name: 'Environmental STEM Presentation Template',
            version: '2.1',
            description: 'Current template with updated climate data and activities',
            fileUrl: '/templates/presentation-template-v2.1.pptx',
            fileSize: 3145728,
            updatedAt: '2024-01-10T09:00:00Z',
            isCurrent: true,
            uploadedBy: 'admin',
            changelog: 'Updated climate data, added new interactive activities, improved visual design'
          },
          {
            id: '2',
            name: 'Environmental STEM Presentation Template',
            version: '2.0',
            description: 'Previous version with legacy content',
            fileUrl: '/templates/presentation-template-v2.0.pptx',
            fileSize: 2936012,
            updatedAt: '2023-11-15T11:30:00Z',
            isCurrent: false,
            uploadedBy: 'admin',
            changelog: 'Major content update, new activity modules, updated statistics'
          },
          {
            id: '3',
            name: 'Activity Worksheets Template',
            version: '1.3',
            description: 'Updated worksheets with new environmental challenges',
            fileUrl: '/templates/worksheets-template-v1.3.docx',
            fileSize: 524288,
            updatedAt: '2024-01-05T14:20:00Z',
            isCurrent: true,
            uploadedBy: 'admin',
            changelog: 'Added new environmental challenges, improved accessibility, updated graphics'
          }
        ]
      });
    }

    return NextResponse.json({ templates });

  } catch (error) {
    console.error('Error in presentation-templates API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

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

    const body = await request.json();
    const { name, version, description, fileUrl, fileSize, changelog } = body;

    if (!name || !version || !fileUrl) {
      return NextResponse.json(
        { error: 'Name, version, and file URL are required' },
        { status: 400 }
      );
    }

    // First, mark all existing templates as not current
    await supabase
      .from('presentation_templates')
      .update({ is_current: false })
      .eq('name', name);

    // Insert new template version
    const { data: template, error } = await supabase
      .from('presentation_templates')
      .insert({
        name,
        version,
        description,
        file_url: fileUrl,
        file_size: fileSize,
        is_current: true,
        uploaded_by: user.id,
        changelog
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating template:', error);
      return NextResponse.json(
        { error: 'Failed to create template' },
        { status: 500 }
      );
    }

    return NextResponse.json({ template });

  } catch (error) {
    console.error('Error in presentation-templates POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
