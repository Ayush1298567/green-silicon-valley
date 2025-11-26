import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export interface DepartmentAlert {
  id: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  department: string;
  triggeredBy: string;
  relatedEntityId: string;
  relatedEntityType: string;
  actionRequired: string;
  deadline?: string;
  status: 'active' | 'acknowledged' | 'resolved';
  createdAt: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
}

export class CrossDepartmentAlertsService {
  private supabase = createClientComponentClient();

  /**
   * Create alert for cross-department coordination
   */
  async createAlert(alert: Omit<DepartmentAlert, 'id' | 'status' | 'createdAt'>): Promise<DepartmentAlert> {
    try {
      const newAlert: DepartmentAlert = {
        ...alert,
        id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        status: 'active',
        createdAt: new Date().toISOString()
      };

      // Store alert in database
      const { error } = await this.supabase
        .from('department_alerts')
        .insert({
          id: newAlert.id,
          title: newAlert.title,
          message: newAlert.message,
          priority: newAlert.priority,
          department: newAlert.department,
          triggered_by: newAlert.triggeredBy,
          related_entity_id: newAlert.relatedEntityId,
          related_entity_type: newAlert.relatedEntityType,
          action_required: newAlert.actionRequired,
          deadline: newAlert.deadline,
          status: newAlert.status,
          created_at: newAlert.createdAt
        });

      if (error) {
        throw error;
      }

      // Send notifications to department members
      await this.notifyDepartmentMembers(newAlert);

      return newAlert;

    } catch (error) {
      console.error('Error creating department alert:', error);
      throw error;
    }
  }

  /**
   * Trigger alerts for tasks that require cross-department coordination
   */
  async triggerAlertsForTasks(tasks: any[]): Promise<void> {
    try {
      const coordinationTasks = tasks.filter(task => task.type === 'coordination');

      for (const task of coordinationTasks) {
        const alert = await this.createAlert({
          title: `Coordination Required: ${task.title}`,
          message: task.description,
          priority: task.priority === 'high' ? 'high' : 'medium',
          department: this.extractDepartmentFromTask(task),
          triggeredBy: 'task-generation-system',
          relatedEntityId: task.relatedEntityId,
          relatedEntityType: task.relatedEntityType,
          actionRequired: `Coordinate with ${this.extractDepartmentFromTask(task)} department and assign responsible team member.`,
          deadline: task.dueDate
        });

        console.log('Created coordination alert:', alert.id);
      }

    } catch (error) {
      console.error('Error triggering alerts for tasks:', error);
      throw error;
    }
  }

  /**
   * Alert when volunteer approval requires team coordination
   */
  async alertVolunteerApproval(volunteerId: string, teamId?: string): Promise<void> {
    try {
      const { data: volunteer } = await this.supabase
        .from('users')
        .select('name, email')
        .eq('id', volunteerId)
        .single();

      if (volunteer) {
        const alert = await this.createAlert({
          title: `New Volunteer Approved: ${volunteer.name}`,
          message: `${volunteer.name} has been approved and needs team assignment. ${teamId ? 'Preferred team indicated.' : 'No team preference specified.'}`,
          priority: 'medium',
          department: 'Volunteer Development',
          triggeredBy: 'volunteer-approval-system',
          relatedEntityId: volunteerId,
          relatedEntityType: 'volunteer',
          actionRequired: 'Assign volunteer to appropriate team and send onboarding packet.',
          deadline: this.addDays(new Date(), 2)
        });

        // Also alert Operations for onboarding packet generation
        await this.createAlert({
          title: `Generate Onboarding Packet: ${volunteer.name}`,
          message: `Create and send automated onboarding packet for newly approved volunteer.`,
          priority: 'medium',
          department: 'Operations',
          triggeredBy: 'volunteer-approval-system',
          relatedEntityId: volunteerId,
          relatedEntityType: 'volunteer',
          actionRequired: 'Generate onboarding packet using automation system.',
          deadline: this.addDays(new Date(), 1)
        });

        console.log('Created volunteer approval alerts');
      }

    } catch (error) {
      console.error('Error creating volunteer approval alerts:', error);
      throw error;
    }
  }

  /**
   * Alert when presentation scheduling conflicts arise
   */
  async alertSchedulingConflict(presentationId: string, conflicts: string[]): Promise<void> {
    try {
      const alert = await this.createAlert({
        title: 'Presentation Scheduling Conflict Detected',
        message: `Scheduling conflict detected for presentation ${presentationId}. Conflicts: ${conflicts.join(', ')}`,
        priority: 'urgent',
        department: 'Operations',
        triggeredBy: 'scheduling-system',
        relatedEntityId: presentationId,
        relatedEntityType: 'presentation',
        actionRequired: 'Review and resolve scheduling conflicts immediately.',
        deadline: this.addHours(new Date(), 4)
      });

      console.log('Created scheduling conflict alert:', alert.id);

    } catch (error) {
      console.error('Error creating scheduling conflict alert:', error);
      throw error;
    }
  }

  /**
   * Alert when grant reporting deadlines approach
   */
  async alertGrantDeadline(grantId: string, daysUntilDeadline: number): Promise<void> {
    try {
      const { data: grant } = await this.supabase
        .from('grants_transparency')
        .select('name, funder')
        .eq('id', grantId)
        .single();

      if (grant) {
        const priority = daysUntilDeadline <= 7 ? 'urgent' : daysUntilDeadline <= 14 ? 'high' : 'medium';

        const alert = await this.createAlert({
          title: `Grant Reporting Deadline: ${grant.name}`,
          message: `Grant reporting due in ${daysUntilDeadline} days for ${grant.name} from ${grant.funder}.`,
          priority,
          department: 'Operations',
          triggeredBy: 'grant-monitoring-system',
          relatedEntityId: grantId,
          relatedEntityType: 'grant',
          actionRequired: 'Prepare and submit grant progress report.',
          deadline: this.addDays(new Date(), daysUntilDeadline)
        });

        console.log('Created grant deadline alert:', alert.id);
      }

    } catch (error) {
      console.error('Error creating grant deadline alert:', error);
      throw error;
    }
  }

  /**
   * Acknowledge an alert
   */
  async acknowledgeAlert(alertId: string, userId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('department_alerts')
        .update({
          status: 'acknowledged',
          acknowledged_at: new Date().toISOString(),
          acknowledged_by: userId
        })
        .eq('id', alertId);

      if (error) {
        throw error;
      }

      console.log('Alert acknowledged:', alertId);

    } catch (error) {
      console.error('Error acknowledging alert:', error);
      throw error;
    }
  }

  /**
   * Get active alerts for a department
   */
  async getDepartmentAlerts(department: string): Promise<DepartmentAlert[]> {
    try {
      const { data: alerts, error } = await this.supabase
        .from('department_alerts')
        .select('*')
        .eq('department', department)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return alerts?.map(alert => ({
        id: alert.id,
        title: alert.title,
        message: alert.message,
        priority: alert.priority,
        department: alert.department,
        triggeredBy: alert.triggered_by,
        relatedEntityId: alert.related_entity_id,
        relatedEntityType: alert.related_entity_type,
        actionRequired: alert.action_required,
        deadline: alert.deadline,
        status: alert.status,
        createdAt: alert.created_at,
        acknowledgedAt: alert.acknowledged_at,
        acknowledgedBy: alert.acknowledged_by
      })) || [];

    } catch (error) {
      console.error('Error getting department alerts:', error);
      return [];
    }
  }

  /**
   * Notify department members of new alerts
   */
  private async notifyDepartmentMembers(alert: DepartmentAlert): Promise<void> {
    try {
      // Get users in the target department
      const departmentUsers = await this.getDepartmentUsers(alert.department);

      // In production, this would send notifications via email, Slack, etc.
      console.log(`Notifying ${departmentUsers.length} users in ${alert.department} department about alert: ${alert.title}`);

      // For now, create in-app notifications
      for (const userId of departmentUsers) {
        await this.supabase
          .from('notifications')
          .insert({
            user_id: userId,
            type: 'department_alert',
            title: alert.title,
            message: alert.message,
            priority: alert.priority,
            related_entity_id: alert.relatedEntityId,
            related_entity_type: alert.relatedEntityType,
            action_required: alert.actionRequired,
            created_at: alert.createdAt
          });
      }

    } catch (error) {
      console.error('Error notifying department members:', error);
      // Don't throw - notification failure shouldn't break the alert creation
    }
  }

  /**
   * Get users in a specific department
   */
  private async getDepartmentUsers(department: string): Promise<string[]> {
    try {
      // This would need to be implemented based on how departments are stored
      // For now, return mock data
      const departmentUserMap: { [key: string]: string[] } = {
        'Operations': ['ops-coordinator-1', 'ops-coordinator-2'],
        'Volunteer Development': ['volunteer-coordinator-1'],
        'Outreach': ['outreach-coordinator-1'],
        'Technology': ['tech-coordinator-1'],
        'Media': ['media-coordinator-1'],
        'Communications': ['comm-coordinator-1']
      };

      return departmentUserMap[department] || [];

    } catch (error) {
      console.error('Error getting department users:', error);
      return [];
    }
  }

  /**
   * Extract department from task metadata
   */
  private extractDepartmentFromTask(task: any): string {
    // Logic to determine which department should handle the coordination
    if (task.metadata?.coordinatingDepartment) {
      return task.metadata.coordinatingDepartment;
    }

    // Default fallback based on task type
    switch (task.type) {
      case 'presentation':
        return 'Operations';
      case 'followup':
        return 'Volunteer Development';
      case 'coordination':
        return 'Operations';
      default:
        return 'Operations';
    }
  }

  private addDays(date: Date, days: number): string {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result.toISOString();
  }

  private addHours(date: Date, hours: number): string {
    const result = new Date(date);
    result.setHours(result.getHours() + hours);
    return result.toISOString();
  }
}

export const crossDepartmentAlerts = new CrossDepartmentAlertsService();
