import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export interface VisibilityRule {
  resourceType: string;
  resourceId: string;
  allowedRoles: string[];
  allowedUsers?: string[]; // Specific user IDs
  isPublic?: boolean; // Visible to everyone
  restrictions?: {
    excludeRoles?: string[]; // Roles that cannot see this
    excludeUsers?: string[]; // Users that cannot see this
    requireApproval?: boolean; // Requires admin approval to view
    timeBased?: {
      startDate?: string;
      endDate?: string;
      timezone?: string;
    };
  };
}

export interface VisibilityCheck {
  userId: string;
  resourceType: string;
  resourceId: string;
  userRole?: string;
}

export class VisibilityManager {
  private supabase = createClientComponentClient();

  /**
   * Check if a user can view a specific resource
   */
  async canUserView(
    userId: string,
    resourceType: string,
    resourceId: string
  ): Promise<boolean> {
    try {
      // Get user's role
      const { data: user } = await this.supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

      if (!user) return false;

      // Check visibility rules from database
      const visibilityRules = await this.getVisibilityRules(resourceType, resourceId);

      if (visibilityRules.length === 0) {
        // No specific rules - fall back to role-based defaults
        return this.checkDefaultVisibility(user.role, resourceType);
      }

      // Check each visibility rule
      for (const rule of visibilityRules) {
        if (this.evaluateVisibilityRule(rule, userId, user.role)) {
          return true;
        }
      }

      return false;

    } catch (error) {
      console.error('Error checking visibility:', error);
      return false;
    }
  }

  /**
   * Set visibility rules for a resource
   */
  async setVisibility(
    resourceType: string,
    resourceId: string,
    allowedRoles: string[],
    options?: {
      allowedUsers?: string[];
      isPublic?: boolean;
      restrictions?: VisibilityRule['restrictions'];
    }
  ): Promise<void> {
    try {
      const visibilityRule: VisibilityRule = {
        resourceType,
        resourceId,
        allowedRoles,
        allowedUsers: options?.allowedUsers,
        isPublic: options?.isPublic,
        restrictions: options?.restrictions
      };

      // Store in visibility_rules table (if it exists)
      // For now, we'll update the resource directly with visibility_roles column
      await this.updateResourceVisibility(resourceType, resourceId, visibilityRule);

    } catch (error) {
      console.error('Error setting visibility:', error);
      throw error;
    }
  }

  /**
   * Get visibility rules for a resource
   */
  async getVisibilityRules(
    resourceType: string,
    resourceId: string
  ): Promise<VisibilityRule[]> {
    try {
      // Try to get from visibility_rules table first
      const { data: rules } = await this.supabase
        .from('visibility_rules')
        .select('*')
        .eq('resource_type', resourceType)
        .eq('resource_id', resourceId);

      if (rules && rules.length > 0) {
        return rules.map(rule => ({
          resourceType: rule.resource_type,
          resourceId: rule.resource_id,
          allowedRoles: rule.allowed_roles || [],
          allowedUsers: rule.allowed_users,
          isPublic: rule.is_public,
          restrictions: rule.restrictions
        }));
      }

      // Fall back to checking resource table directly
      return await this.getResourceVisibility(resourceType, resourceId);

    } catch (error) {
      console.error('Error getting visibility rules:', error);
      return [];
    }
  }

  /**
   * Get all visible resources for a user
   */
  async getVisibleResources(
    userId: string,
    resourceType: string
  ): Promise<string[]> {
    try {
      // Get user's role
      const { data: user } = await this.supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

      if (!user) return [];

      // Query resources that this user can see
      const visibleResourceIds: string[] = [];

      // Check different resource tables
      switch (resourceType) {
        case 'form':
          const { data: forms } = await this.supabase
            .from('forms')
            .select('id, visibility_roles')
            .not('visibility_roles', 'is', null);

          if (forms) {
            forms.forEach(form => {
              if (this.checkVisibilityRoles(form.visibility_roles, user.role, userId)) {
                visibleResourceIds.push(form.id);
              }
            });
          }
          break;

        case 'volunteer_application':
          const { data: volunteers } = await this.supabase
            .from('volunteers')
            .select('id, visibility_roles')
            .not('visibility_roles', 'is', null);

          if (volunteers) {
            volunteers.forEach(volunteer => {
              if (this.checkVisibilityRoles(volunteer.visibility_roles, user.role, userId)) {
                visibleResourceIds.push(volunteer.id);
              }
            });
          }
          break;

        case 'school_request':
          const { data: schools } = await this.supabase
            .from('schools')
            .select('id, visibility_roles')
            .not('visibility_roles', 'is', null);

          if (schools) {
            schools.forEach(school => {
              if (this.checkVisibilityRoles(school.visibility_roles, user.role, userId)) {
                visibleResourceIds.push(school.id);
              }
            });
          }
          break;

        case 'presentation':
          const { data: presentations } = await this.supabase
            .from('presentations')
            .select('id, visibility_roles')
            .not('visibility_roles', 'is', null);

          if (presentations) {
            presentations.forEach(presentation => {
              if (this.checkVisibilityRoles(presentation.visibility_roles, user.role, userId)) {
                visibleResourceIds.push(presentation.id);
              }
            });
          }
          break;
      }

      return visibleResourceIds;

    } catch (error) {
      console.error('Error getting visible resources:', error);
      return [];
    }
  }

  /**
   * Update visibility for a resource in its table
   */
  private async updateResourceVisibility(
    resourceType: string,
    resourceId: string,
    rule: VisibilityRule
  ): Promise<void> {
    const visibilityRoles = rule.isPublic ? ['public'] : rule.allowedRoles;

    switch (resourceType) {
      case 'form':
        await this.supabase
          .from('forms')
          .update({ visibility_roles: visibilityRoles })
          .eq('id', resourceId);
        break;

      case 'volunteer_application':
        await this.supabase
          .from('volunteers')
          .update({ visibility_roles: visibilityRoles })
          .eq('id', resourceId);
        break;

      case 'school_request':
        await this.supabase
          .from('schools')
          .update({ visibility_roles: visibilityRoles })
          .eq('id', resourceId);
        break;

      case 'presentation':
        await this.supabase
          .from('presentations')
          .update({ visibility_roles: visibilityRoles })
          .eq('id', resourceId);
        break;

      case 'volunteer_hours':
        await this.supabase
          .from('volunteer_hours')
          .update({ visibility_roles: visibilityRoles })
          .eq('id', resourceId);
        break;

      case 'intern_project':
        await this.supabase
          .from('intern_projects')
          .update({ visibility_roles: visibilityRoles })
          .eq('id', resourceId);
        break;

      case 'blog_post':
        await this.supabase
          .from('intern_blog_posts')
          .update({ permitted_roles: visibilityRoles })
          .eq('id', resourceId);
        break;
    }
  }

  /**
   * Get visibility rules from resource table
   */
  private async getResourceVisibility(
    resourceType: string,
    resourceId: string
  ): Promise<VisibilityRule[]> {
    try {
      let visibilityRoles: string[] | null = null;

      switch (resourceType) {
        case 'form':
          const { data: form } = await this.supabase
            .from('forms')
            .select('visibility_roles')
            .eq('id', resourceId)
            .single();
          visibilityRoles = form?.visibility_roles;
          break;

        case 'volunteer_application':
          const { data: volunteer } = await this.supabase
            .from('volunteers')
            .select('visibility_roles')
            .eq('id', resourceId)
            .single();
          visibilityRoles = volunteer?.visibility_roles;
          break;

        case 'school_request':
          const { data: school } = await this.supabase
            .from('schools')
            .select('visibility_roles')
            .eq('id', resourceId)
            .single();
          visibilityRoles = school?.visibility_roles;
          break;

        case 'presentation':
          const { data: presentation } = await this.supabase
            .from('presentations')
            .select('visibility_roles')
            .eq('id', resourceId)
            .single();
          visibilityRoles = presentation?.visibility_roles;
          break;
      }

      if (visibilityRoles) {
        return [{
          resourceType,
          resourceId,
          allowedRoles: visibilityRoles,
          isPublic: visibilityRoles.includes('public')
        }];
      }

      return [];

    } catch (error) {
      console.error('Error getting resource visibility:', error);
      return [];
    }
  }

  /**
   * Evaluate a visibility rule against a user
   */
  private evaluateVisibilityRule(
    rule: VisibilityRule,
    userId: string,
    userRole: string
  ): boolean {
    // Check if public
    if (rule.isPublic) return true;

    // Check excluded roles/users
    if (rule.restrictions?.excludeRoles?.includes(userRole)) return false;
    if (rule.restrictions?.excludeUsers?.includes(userId)) return false;

    // Check allowed roles
    if (rule.allowedRoles?.includes(userRole)) return true;

    // Check allowed users
    if (rule.allowedUsers?.includes(userId)) return true;

    // Check time-based restrictions
    if (rule.restrictions?.timeBased) {
      const now = new Date();
      const startDate = rule.restrictions.timeBased.startDate ?
        new Date(rule.restrictions.timeBased.startDate) : null;
      const endDate = rule.restrictions.timeBased.endDate ?
        new Date(rule.restrictions.timeBased.endDate) : null;

      if (startDate && now < startDate) return false;
      if (endDate && now > endDate) return false;
    }

    return false;
  }

  /**
   * Check visibility roles array
   */
  private checkVisibilityRoles(
    visibilityRoles: string[] | null,
    userRole: string,
    userId: string
  ): boolean {
    if (!visibilityRoles) return false;

    // Public access
    if (visibilityRoles.includes('public')) return true;

    // Role-based access
    if (visibilityRoles.includes(userRole)) return true;

    // Admin/founder access (they can see everything unless explicitly excluded)
    if (['admin', 'founder'].includes(userRole)) return true;

    return false;
  }

  /**
   * Check default visibility based on role and resource type
   */
  private checkDefaultVisibility(userRole: string, resourceType: string): boolean {
    // Default visibility rules
    switch (resourceType) {
      case 'form':
        return ['founder', 'intern', 'volunteer', 'teacher'].includes(userRole);

      case 'volunteer_application':
        return ['founder', 'intern'].includes(userRole);

      case 'school_request':
        return ['founder', 'intern', 'outreach'].includes(userRole);

      case 'presentation':
        return ['founder', 'intern', 'volunteer', 'teacher'].includes(userRole);

      case 'volunteer_hours':
        return ['founder', 'intern'].includes(userRole);

      case 'intern_project':
        return ['founder', 'intern'].includes(userRole);

      case 'blog_post':
        return true; // Blog posts are generally public

      default:
        return ['founder'].includes(userRole); // Founders can see everything by default
    }
  }

  /**
   * Bulk update visibility for multiple resources
   */
  async bulkUpdateVisibility(
    resources: Array<{
      resourceType: string;
      resourceId: string;
      allowedRoles: string[];
      options?: Parameters<typeof this.setVisibility>[3];
    }>
  ): Promise<void> {
    const promises = resources.map(resource =>
      this.setVisibility(
        resource.resourceType,
        resource.resourceId,
        resource.allowedRoles,
        resource.options
      )
    );

    await Promise.all(promises);
  }

  /**
   * Get visibility statistics
   */
  async getVisibilityStats(): Promise<{
    totalResources: number;
    publicResources: number;
    restrictedResources: number;
    resourcesByType: Record<string, number>;
  }> {
    // This would query various tables to get visibility statistics
    // For now, return a placeholder
    return {
      totalResources: 0,
      publicResources: 0,
      restrictedResources: 0,
      resourcesByType: {}
    };
  }

  /**
   * Copy visibility settings from one resource to another
   */
  async copyVisibilitySettings(
    sourceType: string,
    sourceId: string,
    targetType: string,
    targetId: string
  ): Promise<void> {
    const sourceRules = await this.getVisibilityRules(sourceType, sourceId);

    if (sourceRules.length > 0) {
      const rule = sourceRules[0];
      await this.setVisibility(targetType, targetId, rule.allowedRoles, {
        allowedUsers: rule.allowedUsers,
        isPublic: rule.isPublic,
        restrictions: rule.restrictions
      });
    }
  }
}

// Export singleton instance
export const visibilityManager = new VisibilityManager();
