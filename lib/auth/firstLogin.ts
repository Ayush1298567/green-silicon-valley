import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export interface FirstLoginStatus {
  isFirstLogin: boolean;
  needsRoleAssignment: boolean;
  needsApproval: boolean;
  isPendingApproval: boolean;
  hasCompletedOnboarding: boolean;
  redirectPath?: string;
}

/**
 * Service for detecting first login status and determining user routing
 */
export class FirstLoginDetector {
  private supabase = createClientComponentClient();

  /**
   * Check if this is the user's first login and determine appropriate routing
   */
  async checkFirstLoginStatus(userId: string): Promise<FirstLoginStatus> {
    try {
      // Get user details
      const { data: user, error } = await this.supabase
        .from('users')
        .select(`
          id,
          role,
          status,
          needs_approval,
          created_at,
          user_routing_preferences (
            onboarding_completed,
            login_count,
            first_login_at
          )
        `)
        .eq('id', userId)
        .single();

      if (error || !user) {
        throw new Error('User not found');
      }

      const routingPrefs = user.user_routing_preferences?.[0] || {};
      const loginCount = routingPrefs.login_count || 0;

      // Determine first login status
      const isFirstLogin = loginCount === 0;

      // Check if user needs role assignment
      const needsRoleAssignment = this.needsRoleAssignment(user);

      // Check approval status
      const needsApproval = user.needs_approval;
      const isPendingApproval = user.status === 'pending_approval';

      // Check onboarding status
      const hasCompletedOnboarding = routingPrefs.onboarding_completed || false;

      // Determine redirect path
      let redirectPath: string | undefined;

      if (isPendingApproval) {
        redirectPath = '/auth/pending-approval';
      } else if (needsRoleAssignment) {
        redirectPath = '/auth/role-assignment';
      } else if (isFirstLogin && !hasCompletedOnboarding) {
        redirectPath = this.getFirstLoginRedirectPath(user.role);
      }

      // Update login tracking
      await this.updateLoginTracking(userId, isFirstLogin);

      return {
        isFirstLogin,
        needsRoleAssignment,
        needsApproval,
        isPendingApproval,
        hasCompletedOnboarding,
        redirectPath
      };

    } catch (error) {
      console.error('Error checking first login status:', error);
      return {
        isFirstLogin: false,
        needsRoleAssignment: false,
        needsApproval: false,
        isPendingApproval: false,
        hasCompletedOnboarding: false
      };
    }
  }

  /**
   * Check if user needs role assignment
   */
  private needsRoleAssignment(user: any): boolean {
    // If user has no role or has a generic role that needs specification
    if (!user.role || user.role === 'guest') {
      return true;
    }

    // If user is an intern but needs department assignment
    if (user.role === 'intern' && !user.subrole) {
      return true;
    }

    return false;
  }

  /**
   * Get appropriate redirect path for first login
   */
  private getFirstLoginRedirectPath(role: string): string {
    switch (role) {
      case 'founder':
        return '/dashboard/founder';
      case 'intern':
        return '/dashboard/intern/onboarding';
      case 'volunteer':
        return '/dashboard/volunteer/onboarding';
      case 'teacher':
        return '/dashboard/teacher';
      default:
        return '/dashboard';
    }
  }

  /**
   * Update login tracking information
   */
  private async updateLoginTracking(userId: string, isFirstLogin: boolean): Promise<void> {
    try {
      const now = new Date().toISOString();

      if (isFirstLogin) {
        // First login - set first_login_at
        await this.supabase
          .from('user_routing_preferences')
          .upsert({
            user_id: userId,
            first_login_at: now,
            login_count: 1,
            last_login_at: now,
            updated_at: now
          }, {
            onConflict: 'user_id'
          });
      } else {
        // Subsequent login - increment count
        await this.supabase.rpc('increment_login_count', {
          user_id: userId,
          login_time: now
        });
      }
    } catch (error) {
      console.error('Error updating login tracking:', error);
    }
  }

  /**
   * Mark onboarding as completed
   */
  async completeOnboarding(userId: string): Promise<void> {
    try {
      await this.supabase
        .from('user_routing_preferences')
        .upsert({
          user_id: userId,
          onboarding_completed: true,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });
    } catch (error) {
      console.error('Error marking onboarding complete:', error);
      throw error;
    }
  }

  /**
   * Get user onboarding progress
   */
  async getOnboardingProgress(userId: string): Promise<{
    completed: boolean;
    steps: Array<{ id: string; name: string; completed: boolean }>;
    currentStep?: string;
  }> {
    try {
      const { data: user } = await this.supabase
        .from('users')
        .select('role, user_routing_preferences(*)')
        .eq('id', userId)
        .single();

      if (!user) {
        throw new Error('User not found');
      }

      const prefs = user.user_routing_preferences?.[0] || {};

      // Define onboarding steps based on role
      const steps = this.getOnboardingSteps(user.role);

      return {
        completed: prefs.onboarding_completed || false,
        steps: steps.map(step => ({
          ...step,
          completed: this.isStepCompleted(step.id, prefs)
        })),
        currentStep: prefs.onboarding_step
      };

    } catch (error) {
      console.error('Error getting onboarding progress:', error);
      return {
        completed: false,
        steps: []
      };
    }
  }

  /**
   * Get onboarding steps for a role
   */
  private getOnboardingSteps(role: string): Array<{ id: string; name: string }> {
    switch (role) {
      case 'intern':
        return [
          { id: 'welcome', name: 'Welcome & Introduction' },
          { id: 'profile_setup', name: 'Profile Setup' },
          { id: 'department_selection', name: 'Department Selection' },
          { id: 'first_task', name: 'Complete First Task' },
          { id: 'team_introduction', name: 'Meet Your Team' }
        ];

      case 'volunteer':
        return [
          { id: 'welcome', name: 'Welcome to GSV' },
          { id: 'interest_survey', name: 'Interest Survey' },
          { id: 'availability', name: 'Set Availability' },
          { id: 'first_project', name: 'Join First Project' }
        ];

      case 'teacher':
        return [
          { id: 'welcome', name: 'Welcome' },
          { id: 'school_setup', name: 'School Information' },
          { id: 'presentation_request', name: 'Request Presentation' }
        ];

      default:
        return [
          { id: 'welcome', name: 'Welcome' },
          { id: 'getting_started', name: 'Getting Started' }
        ];
    }
  }

  /**
   * Check if an onboarding step is completed
   */
  private isStepCompleted(stepId: string, preferences: any): boolean {
    // This would check specific completion criteria for each step
    // For now, return false - implement based on specific requirements
    return preferences.completed_steps?.includes(stepId) || false;
  }

  /**
   * Update current onboarding step
   */
  async updateOnboardingStep(userId: string, stepId: string): Promise<void> {
    try {
      await this.supabase
        .from('user_routing_preferences')
        .upsert({
          user_id: userId,
          onboarding_step: stepId,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });
    } catch (error) {
      console.error('Error updating onboarding step:', error);
      throw error;
    }
  }

  /**
   * Get pending approval status
   */
  async getPendingApprovalStatus(userId: string): Promise<{
    needsApproval: boolean;
    isPendingApproval: boolean;
    status: string;
  }> {
    try {
      const { data: user } = await this.supabase
        .from('users')
        .select('needs_approval, status')
        .eq('id', userId)
        .single();

      return {
        needsApproval: user?.needs_approval || false,
        isPendingApproval: user?.status === 'pending_approval',
        status: user?.status || 'unknown'
      };
    } catch (error) {
      console.error('Error getting approval status:', error);
      return {
        needsApproval: false,
        isPendingApproval: false,
        status: 'unknown'
      };
    }
  }

  /**
   * Get role assignment status
   */
  async getRoleAssignmentStatus(userId: string): Promise<{
    needsAssignment: boolean;
    currentRole?: string;
    suggestedRole?: string;
  }> {
    try {
      const { data: user } = await this.supabase
        .from('users')
        .select('role, subrole, user_signup_sources(*)')
        .eq('id', userId)
        .single();

      if (!user) {
        return { needsAssignment: true };
      }

      const needsAssignment = this.needsRoleAssignment(user);

      // Suggest role based on signup sources
      let suggestedRole: string | undefined;
      if (user.user_signup_sources?.length > 0) {
        const source = user.user_signup_sources[0];
        if (source.source_type?.includes('volunteer')) {
          suggestedRole = 'volunteer';
        } else if (source.source_type?.includes('intern')) {
          suggestedRole = 'intern';
        } else if (source.source_type?.includes('teacher')) {
          suggestedRole = 'teacher';
        }
      }

      return {
        needsAssignment,
        currentRole: user.role,
        suggestedRole
      };

    } catch (error) {
      console.error('Error getting role assignment status:', error);
      return { needsAssignment: false };
    }
  }
}

// Export singleton instance
export const firstLoginDetector = new FirstLoginDetector();
