import { getServerComponentClient } from "@/lib/supabase/server";

export interface ActionItem {
  id: string;
  title: string;
  description?: string;
  type: 'task' | 'review' | 'approval' | 'followup' | 'deadline' | 'reminder' | 'system_alert';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';
  assigned_to: string[];
  assigned_by?: string;
  due_date?: string;
  completed_at?: string;
  completed_by?: string;
  metadata: Record<string, any>;
  related_entity_type?: string;
  related_entity_id?: string;
  action_required: Record<string, any>;
  is_system_generated: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export class ActionItemsService {
  private supabase = getServerComponentClient();

  /**
   * Create an action item from a system event
   */
  async createFromEvent(
    title: string,
    description: string,
    type: ActionItem['type'],
    priority: ActionItem['priority'] = 'medium',
    assignedTo: string[] = [],
    dueDate?: Date,
    metadata: Record<string, any> = {},
    relatedEntityType?: string,
    relatedEntityId?: string
  ): Promise<string | null> {
    try {
      const { data, error } = await this.supabase.rpc('create_action_item_from_event', {
        p_title: title,
        p_description: description,
        p_type: type,
        p_priority: priority,
        p_assigned_to: assignedTo,
        p_due_date: dueDate?.toISOString(),
        p_metadata: metadata,
        p_related_entity_type: relatedEntityType,
        p_related_entity_id: relatedEntityId
      });

      if (error) {
        console.error('Error creating action item from event:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in createFromEvent:', error);
      return null;
    }
  }

  /**
   * Create action item for volunteer application review
   */
  async createVolunteerReview(volunteerId: string, teamName: string): Promise<string | null> {
    return this.createFromEvent(
      `Review volunteer application: ${teamName}`,
      'New volunteer application requires review and approval.',
      'review',
      'high',
      [], // Will be assigned to founders via trigger
      new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
      {
        volunteer_id: volunteerId,
        team_name: teamName,
        action_buttons: [
          {
            label: 'Review Application',
            action: 'navigate',
            url: `/dashboard/founder/volunteers/${volunteerId}/review`
          }
        ]
      },
      'volunteer',
      volunteerId
    );
  }

  /**
   * Create action item for teacher request review
   */
  async createTeacherReview(schoolId: string, schoolName: string): Promise<string | null> {
    return this.createFromEvent(
      `Review teacher request: ${schoolName}`,
      'New teacher presentation request requires review.',
      'review',
      'high',
      [], // Will be assigned to founders via trigger
      new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
      {
        school_id: schoolId,
        school_name: schoolName,
        action_buttons: [
          {
            label: 'Review Request',
            action: 'navigate',
            url: `/dashboard/founder/schools/${schoolId}`
          }
        ]
      },
      'school',
      schoolId
    );
  }

  /**
   * Create followup action item for completed presentation
   */
  async createPresentationFollowup(presentationId: string, schoolId: string): Promise<string | null> {
    // Get school name
    const { data: school } = await this.supabase
      .from('schools')
      .select('school_name')
      .eq('id', schoolId)
      .single();

    if (!school) return null;

    return this.createFromEvent(
      `Follow up with ${school.school_name}`,
      'Send thank you note and gather feedback from the presentation.',
      'followup',
      'medium',
      [], // Will be assigned to founders/interns via trigger
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week
      {
        presentation_id: presentationId,
        school_id: schoolId,
        school_name: school.school_name,
        action_buttons: [
          {
            label: 'Send Follow-up',
            action: 'navigate',
            url: `/dashboard/followup/${presentationId}`
          }
        ]
      },
      'presentation',
      presentationId
    );
  }

  /**
   * Create action item for blog post review
   */
  async createBlogReview(blogPostId: string, title: string, authorName: string): Promise<string | null> {
    return this.createFromEvent(
      `Review blog post: ${title}`,
      `Blog post by ${authorName} is ready for review.`,
      'review',
      'medium',
      [], // Will be assigned to founders/interns
      new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days
      {
        blog_post_id: blogPostId,
        title,
        author_name: authorName,
        action_buttons: [
          {
            label: 'Review Post',
            action: 'navigate',
            url: `/admin/blog/review/${blogPostId}`
          }
        ]
      },
      'blog_post',
      blogPostId
    );
  }

  /**
   * Get action items for user with permissions
   */
  async getUserActionItems(userId: string, userRole: string, filters: {
    status?: string;
    priority?: string;
    type?: string;
    limit?: number;
  } = {}): Promise<ActionItem[]> {
    let query = this.supabase
      .from('action_items')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters.status) query = query.eq('status', filters.status);
    if (filters.priority) query = query.eq('priority', filters.priority);
    if (filters.type) query = query.eq('type', filters.type);
    if (filters.limit) query = query.limit(filters.limit);

    // Permission-based filtering
    if (userRole === 'founder') {
      // Founders see all items
      query = query.or(`assigned_to.cs.{${userId}},assigned_by.eq.${userId}`);
    } else if (userRole === 'intern') {
      // Interns only see items assigned to them or they created, excluding admin items
      query = query
        .or(`assigned_to.cs.{${userId}},assigned_by.eq.${userId}`)
        .neq('type', 'admin');
    } else {
      // Other roles only see items assigned to them
      query = query.contains('assigned_to', [userId]);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching user action items:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Update action item status with history logging
   */
  async updateStatus(
    itemId: string,
    newStatus: ActionItem['status'],
    userId: string
  ): Promise<boolean> {
    try {
      const { error } = await this.supabase.rpc('update_action_item_status', {
        p_item_id: itemId,
        p_new_status: newStatus,
        p_user_id: userId
      });

      return !error;
    } catch (error) {
      console.error('Error updating action item status:', error);
      return false;
    }
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStats(userId: string, userRole: string): Promise<{
    total: number;
    pending: number;
    in_progress: number;
    completed: number;
    overdue: number;
    urgent: number;
  }> {
    const items = await this.getUserActionItems(userId, userRole);

    return {
      total: items.length,
      pending: items.filter(item => item.status === 'pending').length,
      in_progress: items.filter(item => item.status === 'in_progress').length,
      completed: items.filter(item => item.status === 'completed').length,
      overdue: items.filter(item => {
        if (item.status !== 'completed' && item.due_date) {
          return new Date(item.due_date) < new Date();
        }
        return false;
      }).length,
      urgent: items.filter(item => item.priority === 'urgent').length
    };
  }

  /**
   * Add comment to action item
   */
  async addComment(
    itemId: string,
    userId: string,
    comment: string,
    isInternal = false
  ): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('action_item_comments')
        .insert({
          action_item_id: itemId,
          user_id: userId,
          comment,
          is_internal: isInternal
        });

      return !error;
    } catch (error) {
      console.error('Error adding comment:', error);
      return false;
    }
  }

  /**
   * Integration: Create action item when volunteer application is submitted
   */
  async onVolunteerApplicationSubmitted(volunteerId: string, teamName: string): Promise<void> {
    // Check if action item already exists
    const { data: existing } = await this.supabase
      .from('action_items')
      .select('id')
      .eq('related_entity_type', 'volunteer')
      .eq('related_entity_id', volunteerId)
      .eq('type', 'review')
      .single();

    if (!existing) {
      await this.createFromEvent(
        `Review volunteer application: ${teamName}`,
        'New volunteer application requires review and approval before scheduling presentations.',
        'review',
        'high',
        [], // Will be assigned to founders via database trigger
        new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
        {
          volunteer_id: volunteerId,
          team_name: teamName,
          review_steps: [
            'Verify application completeness',
            'Check team member details',
            'Review presentation preferences',
            'Assess school fit'
          ]
        },
        'volunteer',
        volunteerId
      );
    }
  }

  /**
   * Integration: Create action item when teacher request is submitted
   */
  async onTeacherRequestSubmitted(schoolId: string, schoolName: string): Promise<void> {
    // Check if action item already exists
    const { data: existing } = await this.supabase
      .from('action_items')
      .select('id')
      .eq('related_entity_type', 'school')
      .eq('related_entity_id', schoolId)
      .eq('type', 'review')
      .single();

    if (!existing) {
      await this.createFromEvent(
        `Review teacher request: ${schoolName}`,
        'New teacher presentation request requires review and scheduling.',
        'review',
        'high',
        [], // Will be assigned to founders/interns via database trigger
        new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
        {
          school_id: schoolId,
          school_name: schoolName,
          review_steps: [
            'Verify school information',
            'Review presentation requirements',
            'Check scheduling preferences',
            'Assess curriculum alignment'
          ]
        },
        'school',
        schoolId
      );
    }
  }

  /**
   * Integration: Create followup action item when presentation is completed
   */
  async onPresentationCompleted(presentationId: string, schoolId: string, schoolName: string): Promise<void> {
    // Check if followup action item already exists
    const { data: existing } = await this.supabase
      .from('action_items')
      .select('id')
      .eq('related_entity_type', 'presentation')
      .eq('related_entity_id', presentationId)
      .eq('type', 'followup')
      .single();

    if (!existing) {
      await this.createFromEvent(
        `Follow up with ${schoolName}`,
        'Send thank you note, gather feedback, and strengthen partnership.',
        'followup',
        'medium',
        [], // Will be assigned to founders/interns via database trigger
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week
        {
          presentation_id: presentationId,
          school_id: schoolId,
          school_name: schoolName,
          followup_tasks: [
            'Send thank you email to teacher',
            'Request student feedback',
            'Share additional resources',
            'Schedule future engagement'
          ]
        },
        'presentation',
        presentationId
      );
    }
  }

  /**
   * Integration: Create action item when blog post is submitted for review
   */
  async onBlogPostSubmitted(postId: string, title: string, authorName: string): Promise<void> {
    // Check if action item already exists
    const { data: existing } = await this.supabase
      .from('action_items')
      .select('id')
      .eq('related_entity_type', 'blog_post')
      .eq('related_entity_id', postId)
      .eq('type', 'review')
      .single();

    if (!existing) {
      await this.createFromEvent(
        `Review blog post: ${title}`,
        `Blog post by ${authorName} is ready for review and publishing.`,
        'review',
        'medium',
        [], // Will be assigned to founders via database trigger
        new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days
        {
          blog_post_id: postId,
          title,
          author_name: authorName,
          review_steps: [
            'Check content quality and accuracy',
            'Verify grammar and formatting',
            'Ensure appropriate tone',
            'Confirm publishing readiness'
          ]
        },
        'blog_post',
        postId
      );
    }
  }

  /**
   * Integration: Update action item when application is approved/rejected
   */
  async onApplicationStatusChanged(entityType: string, entityId: string, status: string, reviewerId?: string): Promise<void> {
    // Find related action item
    const { data: actionItem } = await this.supabase
      .from('action_items')
      .select('id, status')
      .eq('related_entity_type', entityType)
      .eq('related_entity_id', entityId)
      .eq('type', 'review')
      .single();

    if (actionItem && actionItem.status !== 'completed') {
      // Update action item status
      await this.updateStatus(actionItem.id, 'completed', reviewerId || '');

      // Add completion comment
      const statusMessage = status === 'approved' ? 'Application approved' :
                           status === 'rejected' ? 'Application rejected' : 'Application status updated';

      await this.addComment(
        actionItem.id,
        reviewerId || '',
        `${statusMessage} - Action item resolved.`,
        true
      );
    }
  }

  /**
   * Integration: Create reminder action items for upcoming deadlines
   */
  async createDeadlineReminders(): Promise<void> {
    // Find action items due in the next 24 hours that don't have reminders
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const { data: dueItems } = await this.supabase
      .from('action_items')
      .select('id, title, assigned_to, due_date')
      .eq('status', 'pending')
      .lt('due_date', tomorrow.toISOString())
      .gt('due_date', new Date().toISOString());

    for (const item of dueItems || []) {
      // Check if reminder already exists
      const { data: existing } = await this.supabase
        .from('action_items')
        .select('id')
        .eq('related_entity_type', 'action_item')
        .eq('related_entity_id', item.id)
        .eq('type', 'reminder')
        .single();

      if (!existing) {
        await this.createFromEvent(
          `Reminder: ${item.title}`,
          'This action item is due soon. Please complete or update status.',
          'reminder',
          'high',
          item.assigned_to || [],
          new Date(item.due_date), // Due at the same time as original
          {
            original_item_id: item.id,
            reminder_type: 'deadline_approaching'
          },
          'action_item',
          item.id
        );
      }
    }
  }
}

// Export singleton instance
export const actionItemsService = new ActionItemsService();
