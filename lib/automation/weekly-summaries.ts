import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export interface WeeklySummary {
  id: string;
  weekOf: string; // Monday of the week
  generatedAt: string;
  sentTo: string[]; // User IDs who received this summary
  sections: {
    presentations: {
      completed: number;
      upcoming: number;
      totalVolunteers: number;
      schoolsReached: number;
    };
    volunteers: {
      newApprovals: number;
      activeVolunteers: number;
      teamsFormed: number;
      onboardingCompleted: number;
    };
    teachers: {
      newRequests: number;
      pendingRequests: number;
      completedPresentations: number;
      satisfactionRating: number;
    };
    interns: {
      activeInterns: number;
      projectsCompleted: number;
      tasksAssigned: number;
      departmentActivity: Record<string, number>;
    };
    operations: {
      alertsGenerated: number;
      tasksCompleted: number;
      remindersSent: number;
      systemHealth: 'good' | 'warning' | 'critical';
    };
  };
  keyHighlights: string[];
  upcomingPriorities: string[];
  generatedBy: 'automation';
}

export class WeeklySummariesService {
  private supabase = createClientComponentClient();

  /**
   * Generate weekly summary for the past week
   */
  async generateWeeklySummary(): Promise<WeeklySummary> {
    try {
      const weekStart = this.getWeekStart(new Date());
      const weekEnd = this.addDays(weekStart, 6);

      console.log(`Generating weekly summary for ${weekStart.toISOString().split('T')[0]} to ${weekEnd.toISOString().split('T')[0]}`);

      // Gather data for each section
      const [
        presentationData,
        volunteerData,
        teacherData,
        internData,
        operationsData
      ] = await Promise.all([
        this.getPresentationData(weekStart, weekEnd),
        this.getVolunteerData(weekStart, weekEnd),
        this.getTeacherData(weekStart, weekEnd),
        this.getInternData(weekStart, weekEnd),
        this.getOperationsData(weekStart, weekEnd)
      ]);

      // Generate key highlights and priorities
      const keyHighlights = await this.generateKeyHighlights(presentationData, volunteerData, teacherData);
      const upcomingPriorities = await this.generateUpcomingPriorities();

      const summary: WeeklySummary = {
        id: `weekly-summary-${weekStart.toISOString().split('T')[0]}`,
        weekOf: weekStart.toISOString(),
        generatedAt: new Date().toISOString(),
        sentTo: [],
        sections: {
          presentations: presentationData,
          volunteers: volunteerData,
          teachers: teacherData,
          interns: internData,
          operations: operationsData
        },
        keyHighlights,
        upcomingPriorities,
        generatedBy: 'automation'
      };

      // Store summary in database
      await this.saveWeeklySummary(summary);

      // Send to stakeholders
      await this.sendToStakeholders(summary);

      return summary;

    } catch (error) {
      console.error('Error generating weekly summary:', error);
      throw error;
    }
  }

  /**
   * Get presentation data for the week
   */
  private async getPresentationData(weekStart: Date, weekEnd: Date): Promise<WeeklySummary['sections']['presentations']> {
    try {
      // Get completed presentations this week
      const { data: completedPresentations, error: completedError } = await this.supabase
        .from('presentations')
        .select('*, schools(*), teams(*)')
        .eq('status', 'completed')
        .gte('date', weekStart.toISOString().split('T')[0])
        .lte('date', weekEnd.toISOString().split('T')[0]);

      if (completedError) throw completedError;

      // Get upcoming presentations (next 2 weeks)
      const upcomingEnd = this.addDays(weekEnd, 14);
      const { data: upcomingPresentations, error: upcomingError } = await this.supabase
        .from('presentations')
        .select('*, schools(*), teams(*)')
        .eq('status', 'scheduled')
        .gte('date', new Date().toISOString().split('T')[0])
        .lte('date', upcomingEnd.toISOString().split('T')[0]);

      if (upcomingError) throw upcomingError;

      // Calculate unique schools and volunteers
      const schoolsReached = new Set(completedPresentations?.map(p => p.school_id)).size;
      const volunteerIds = new Set();

      for (const presentation of completedPresentations || []) {
        const { data: teamMembers } = await this.supabase
          .from('team_members')
          .select('user_id')
          .eq('team_id', presentation.team_id);

        teamMembers?.forEach(tm => volunteerIds.add(tm.user_id));
      }

      return {
        completed: completedPresentations?.length || 0,
        upcoming: upcomingPresentations?.length || 0,
        totalVolunteers: volunteerIds.size,
        schoolsReached
      };

    } catch (error) {
      console.error('Error getting presentation data:', error);
      return { completed: 0, upcoming: 0, totalVolunteers: 0, schoolsReached: 0 };
    }
  }

  /**
   * Get volunteer data for the week
   */
  private async getVolunteerData(weekStart: Date, weekEnd: Date): Promise<WeeklySummary['sections']['volunteers']> {
    try {
      // New volunteer approvals this week
      const { data: newApprovals, error: approvalError } = await this.supabase
        .from('users')
        .select('*')
        .eq('role', 'volunteer')
        .gte('approved_at', weekStart.toISOString())
        .lte('approved_at', weekEnd.toISOString());

      if (approvalError) throw approvalError;

      // Active volunteers (approved and not deactivated)
      const { data: activeVolunteers, error: activeError } = await this.supabase
        .from('users')
        .select('*')
        .eq('role', 'volunteer')
        .eq('status', 'active');

      if (activeError) throw activeError;

      // Teams formed this week
      const { data: teamsFormed, error: teamsError } = await this.supabase
        .from('teams')
        .select('*')
        .gte('created_at', weekStart.toISOString())
        .lte('created_at', weekEnd.toISOString());

      if (teamsError) throw teamsError;

      // Onboarding packets completed this week
      const { data: onboardingCompleted, error: onboardingError } = await this.supabase
        .from('onboarding_packets')
        .select('*')
        .eq('status', 'sent')
        .gte('created_at', weekStart.toISOString())
        .lte('created_at', weekEnd.toISOString());

      if (onboardingError) throw onboardingError;

      return {
        newApprovals: newApprovals?.length || 0,
        activeVolunteers: activeVolunteers?.length || 0,
        teamsFormed: teamsFormed?.length || 0,
        onboardingCompleted: onboardingCompleted?.length || 0
      };

    } catch (error) {
      console.error('Error getting volunteer data:', error);
      return { newApprovals: 0, activeVolunteers: 0, teamsFormed: 0, onboardingCompleted: 0 };
    }
  }

  /**
   * Get teacher data for the week
   */
  private async getTeacherData(weekStart: Date, weekEnd: Date): Promise<WeeklySummary['sections']['teachers']> {
    try {
      // New teacher requests this week
      const { data: newRequests, error: newError } = await this.supabase
        .from('teacher_requests')
        .select('*')
        .gte('created_at', weekStart.toISOString())
        .lte('created_at', weekEnd.toISOString());

      if (newError) throw newError;

      // Pending requests
      const { data: pendingRequests, error: pendingError } = await this.supabase
        .from('teacher_requests')
        .select('*')
        .eq('status', 'pending');

      if (pendingError) throw pendingError;

      // Presentations completed this week
      const { data: completedPresentations, error: completedError } = await this.supabase
        .from('presentations')
        .select('*')
        .eq('status', 'completed')
        .gte('date', weekStart.toISOString().split('T')[0])
        .lte('date', weekEnd.toISOString().split('T')[0]);

      if (completedError) throw completedError;

      // Average satisfaction rating (mock for now)
      const satisfactionRating = 96; // Would calculate from actual feedback

      return {
        newRequests: newRequests?.length || 0,
        pendingRequests: pendingRequests?.length || 0,
        completedPresentations: completedPresentations?.length || 0,
        satisfactionRating
      };

    } catch (error) {
      console.error('Error getting teacher data:', error);
      return { newRequests: 0, pendingRequests: 0, completedPresentations: 0, satisfactionRating: 0 };
    }
  }

  /**
   * Get intern data for the week
   */
  private async getInternData(weekStart: Date, weekEnd: Date): Promise<WeeklySummary['sections']['interns']> {
    try {
      // Active interns
      const { data: activeInterns, error: activeError } = await this.supabase
        .from('users')
        .select('*')
        .eq('role', 'intern')
        .eq('status', 'active');

      if (activeError) throw activeError;

      // Projects completed this week
      const { data: projectsCompleted, error: projectsError } = await this.supabase
        .from('intern_projects_showcase')
        .select('*')
        .gte('completed_date', weekStart.toISOString().split('T')[0])
        .lte('completed_date', weekEnd.toISOString().split('T')[0]);

      if (projectsError) throw projectsError;

      // Tasks assigned this week
      const { data: tasksAssigned, error: tasksError } = await this.supabase
        .from('intern_tasks')
        .select('*')
        .gte('created_at', weekStart.toISOString())
        .lte('created_at', weekEnd.toISOString());

      if (tasksError) throw tasksError;

      // Department activity (mock data)
      const departmentActivity = {
        'Technology': 5,
        'Outreach': 3,
        'Media': 4,
        'Volunteer Development': 2,
        'Communications': 3,
        'Operations': 2
      };

      return {
        activeInterns: activeInterns?.length || 0,
        projectsCompleted: projectsCompleted?.length || 0,
        tasksAssigned: tasksAssigned?.length || 0,
        departmentActivity
      };

    } catch (error) {
      console.error('Error getting intern data:', error);
      return { activeInterns: 0, projectsCompleted: 0, tasksAssigned: 0, departmentActivity: {} };
    }
  }

  /**
   * Get operations data for the week
   */
  private async getOperationsData(weekStart: Date, weekEnd: Date): Promise<WeeklySummary['sections']['operations']> {
    try {
      // Alerts generated this week
      const { data: alertsGenerated, error: alertsError } = await this.supabase
        .from('department_alerts')
        .select('*')
        .gte('created_at', weekStart.toISOString())
        .lte('created_at', weekEnd.toISOString());

      if (alertsError) throw alertsError;

      // Tasks completed this week
      const { data: tasksCompleted, error: tasksError } = await this.supabase
        .from('generated_tasks')
        .select('*')
        .eq('status', 'completed')
        .gte('updated_at', weekStart.toISOString())
        .lte('updated_at', weekEnd.toISOString());

      if (tasksError) throw tasksError;

      // Reminders sent this week
      const { data: remindersSent, error: remindersError } = await this.supabase
        .from('scheduled_reminders')
        .select('*')
        .eq('status', 'sent')
        .gte('sent_at', weekStart.toISOString())
        .lte('sent_at', weekEnd.toISOString());

      if (remindersError) throw remindersError;

      // System health (simple check)
      const systemHealth = this.determineSystemHealth(alertsGenerated?.length || 0);

      return {
        alertsGenerated: alertsGenerated?.length || 0,
        tasksCompleted: tasksCompleted?.length || 0,
        remindersSent: remindersSent?.length || 0,
        systemHealth
      };

    } catch (error) {
      console.error('Error getting operations data:', error);
      return { alertsGenerated: 0, tasksCompleted: 0, remindersSent: 0, systemHealth: 'warning' };
    }
  }

  /**
   * Generate key highlights for the week
   */
  private async generateKeyHighlights(
    presentations: any,
    volunteers: any,
    teachers: any
  ): Promise<string[]> {
    const highlights = [];

    if (presentations.completed > 0) {
      highlights.push(`${presentations.completed} environmental STEM presentations delivered, reaching ${presentations.schoolsReached} schools`);
    }

    if (volunteers.newApprovals > 0) {
      highlights.push(`${volunteers.newApprovals} new volunteers approved and onboarded`);
    }

    if (teachers.newRequests > 0) {
      highlights.push(`${teachers.newRequests} new teacher presentation requests received`);
    }

    if (volunteers.teamsFormed > 0) {
      highlights.push(`${volunteers.teamsFormed} new volunteer teams formed and activated`);
    }

    // Add some default highlights if none generated
    if (highlights.length === 0) {
      highlights.push('Steady progress on environmental STEM education initiatives');
      highlights.push('Volunteer program maintaining strong engagement levels');
      highlights.push('Teacher partnerships continuing to grow');
    }

    return highlights.slice(0, 5); // Limit to 5 highlights
  }

  /**
   * Generate upcoming priorities
   */
  private async generateUpcomingPriorities(): Promise<string[]> {
    const priorities = [];

    // Check for upcoming presentations
    const nextWeek = this.addDays(new Date(), 7);
    const { data: upcomingPresentations } = await this.supabase
      .from('presentations')
      .select('*')
      .eq('status', 'scheduled')
      .lte('date', nextWeek.toISOString().split('T')[0]);

    if (upcomingPresentations && upcomingPresentations.length > 0) {
      priorities.push(`${upcomingPresentations.length} presentations scheduled for next week`);
    }

    // Check pending teacher requests
    const { data: pendingRequests } = await this.supabase
      .from('teacher_requests')
      .select('*')
      .eq('status', 'pending');

    if (pendingRequests && pendingRequests.length > 0) {
      priorities.push(`${pendingRequests.length} teacher presentation requests pending scheduling`);
    }

    // Check pending volunteer approvals
    const { data: pendingVolunteers } = await this.supabase
      .from('users')
      .select('*')
      .eq('role', 'volunteer')
      .is('approved_at', null);

    if (pendingVolunteers && pendingVolunteers.length > 0) {
      priorities.push(`${pendingVolunteers.length} volunteer applications awaiting approval`);
    }

    // Add default priorities
    priorities.push('Continue volunteer recruitment and onboarding efforts');
    priorities.push('Expand teacher outreach to new school districts');
    priorities.push('Monitor and maintain presentation quality standards');

    return priorities.slice(0, 5);
  }

  /**
   * Save weekly summary to database
   */
  private async saveWeeklySummary(summary: WeeklySummary): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('weekly_summaries')
        .insert({
          id: summary.id,
          week_of: summary.weekOf,
          generated_at: summary.generatedAt,
          sent_to: summary.sentTo,
          sections: summary.sections,
          key_highlights: summary.keyHighlights,
          upcoming_priorities: summary.upcomingPriorities,
          generated_by: summary.generatedBy
        });

      if (error) {
        throw error;
      }

    } catch (error) {
      console.error('Error saving weekly summary:', error);
      throw error;
    }
  }

  /**
   * Send summary to stakeholders
   */
  private async sendToStakeholders(summary: WeeklySummary): Promise<void> {
    try {
      // Get admin and founder users
      const { data: stakeholders, error } = await this.supabase
        .from('users')
        .select('id, email, name')
        .in('role', ['admin', 'founder']);

      if (error) throw error;

      const stakeholderIds = stakeholders?.map(s => s.id) || [];

      // Create notifications for each stakeholder
      for (const stakeholderId of stakeholderIds) {
        await this.supabase
          .from('notifications')
          .insert({
            user_id: stakeholderId,
            type: 'weekly_summary',
            title: 'Weekly Operations Summary',
            message: `View the automated weekly summary for ${new Date(summary.weekOf).toLocaleDateString()}`,
            priority: 'medium',
            related_entity_id: summary.id,
            related_entity_type: 'weekly_summary',
            created_at: summary.generatedAt
          });
      }

      // Update summary with sent recipients
      await this.supabase
        .from('weekly_summaries')
        .update({ sent_to: stakeholderIds })
        .eq('id', summary.id);

      console.log(`Weekly summary sent to ${stakeholderIds.length} stakeholders`);

    } catch (error) {
      console.error('Error sending summary to stakeholders:', error);
      // Don't throw - notification failure shouldn't break the summary generation
    }
  }

  /**
   * Get the Monday of the current week
   */
  private getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(d.setDate(diff));
  }

  private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  private determineSystemHealth(alertCount: number): 'good' | 'warning' | 'critical' {
    if (alertCount === 0) return 'good';
    if (alertCount <= 5) return 'warning';
    return 'critical';
  }
}

export const weeklySummaries = new WeeklySummariesService();
