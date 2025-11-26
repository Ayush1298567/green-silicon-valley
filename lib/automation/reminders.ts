import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export interface Reminder {
  id: string;
  title: string;
  message: string;
  recipientId: string;
  recipientType: 'volunteer' | 'teacher' | 'intern' | 'team';
  reminderType: 'presentation' | 'meeting' | 'deadline' | 'followup' | 'training';
  scheduledFor: string;
  sentAt?: string;
  status: 'scheduled' | 'sent' | 'cancelled';
  relatedEntityId: string;
  relatedEntityType: string;
  priority: 'low' | 'medium' | 'high';
  metadata: Record<string, any>;
  createdAt: string;
}

export class RemindersService {
  private supabase = createClientComponentClient();

  /**
   * Schedule reminders for upcoming presentations
   */
  async schedulePresentationReminders(presentationId: string): Promise<Reminder[]> {
    try {
      const { data: presentation, error } = await this.supabase
        .from('presentations')
        .select('*, teams(*), schools(*)')
        .eq('id', presentationId)
        .single();

      if (error || !presentation) {
        throw new Error('Presentation not found');
      }

      const presentationDate = new Date(presentation.date);
      const reminders: Reminder[] = [];

      // Get team members
      const { data: teamMembers } = await this.supabase
        .from('team_members')
        .select('user_id')
        .eq('team_id', presentation.team_id);

      const teamMemberIds = teamMembers?.map(tm => tm.user_id) || [];

      // 1 week reminder
      const oneWeekBefore = this.addDays(presentationDate, -7);
      for (const memberId of teamMemberIds) {
        reminders.push({
          id: `reminder-${presentationId}-${memberId}-1week`,
          title: 'Presentation Reminder: 1 Week Until Presentation',
          message: `Your presentation at ${presentation.schools.name} is scheduled for ${presentationDate.toLocaleDateString()}. Please review materials and confirm attendance.`,
          recipientId: memberId,
          recipientType: 'volunteer',
          reminderType: 'presentation',
          scheduledFor: oneWeekBefore.toISOString(),
          status: 'scheduled',
          relatedEntityId: presentationId,
          relatedEntityType: 'presentation',
          priority: 'medium',
          metadata: {
            schoolName: presentation.schools.name,
            presentationDate: presentation.date,
            daysUntil: 7
          },
          createdAt: new Date().toISOString()
        });
      }

      // 3 days reminder
      const threeDaysBefore = this.addDays(presentationDate, -3);
      for (const memberId of teamMemberIds) {
        reminders.push({
          id: `reminder-${presentationId}-${memberId}-3days`,
          title: 'Presentation Reminder: 3 Days Until Presentation',
          message: `Your presentation at ${presentation.schools.name} is coming up on ${presentationDate.toLocaleDateString()}. Final preparations and equipment check.`,
          recipientId: memberId,
          recipientType: 'volunteer',
          reminderType: 'presentation',
          scheduledFor: threeDaysBefore.toISOString(),
          status: 'scheduled',
          relatedEntityId: presentationId,
          relatedEntityType: 'presentation',
          priority: 'high',
          metadata: {
            schoolName: presentation.schools.name,
            presentationDate: presentation.date,
            daysUntil: 3
          },
          createdAt: new Date().toISOString()
        });
      }

      // 1 day reminder
      const oneDayBefore = this.addDays(presentationDate, -1);
      for (const memberId of teamMemberIds) {
        reminders.push({
          id: `reminder-${presentationId}-${memberId}-1day`,
          title: 'Presentation Reminder: Tomorrow!',
          message: `Your presentation at ${presentation.schools.name} is tomorrow (${presentationDate.toLocaleDateString()}). Please confirm all preparations are complete.`,
          recipientId: memberId,
          recipientType: 'volunteer',
          reminderType: 'presentation',
          scheduledFor: oneDayBefore.toISOString(),
          status: 'scheduled',
          relatedEntityId: presentationId,
          relatedEntityType: 'presentation',
          priority: 'urgent',
          metadata: {
            schoolName: presentation.schools.name,
            presentationDate: presentation.date,
            daysUntil: 1
          },
          createdAt: new Date().toISOString()
        });
      }

      // Also remind the teacher 1 week before
      if (presentation.teacher_email) {
        const teacherReminder: Reminder = {
          id: `reminder-${presentationId}-teacher-1week`,
          title: 'Presentation Reminder: 1 Week Until Your Environmental STEM Presentation',
          message: `Your Green Silicon Valley presentation is scheduled for ${presentationDate.toLocaleDateString()}. The ${presentation.teams.name} team will be visiting your class.`,
          recipientId: presentation.teacher_email, // Using email as ID for non-registered users
          recipientType: 'teacher',
          reminderType: 'presentation',
          scheduledFor: oneWeekBefore.toISOString(),
          status: 'scheduled',
          relatedEntityId: presentationId,
          relatedEntityType: 'presentation',
          priority: 'medium',
          metadata: {
            schoolName: presentation.schools.name,
            teamName: presentation.teams.name,
            presentationDate: presentation.date,
            daysUntil: 7
          },
          createdAt: new Date().toISOString()
        };
        reminders.push(teacherReminder);
      }

      // Store reminders in database
      await this.saveReminders(reminders);

      return reminders;

    } catch (error) {
      console.error('Error scheduling presentation reminders:', error);
      throw error;
    }
  }

  /**
   * Schedule reminders for team meetings
   */
  async scheduleMeetingReminders(meetingId: string): Promise<Reminder[]> {
    try {
      const { data: meeting, error } = await this.supabase
        .from('team_meetings')
        .select('*, teams(*)')
        .eq('id', meetingId)
        .single();

      if (error || !meeting) {
        throw new Error('Meeting not found');
      }

      const meetingDate = new Date(meeting.date);
      const reminders: Reminder[] = [];

      // Get team members
      const { data: teamMembers } = await this.supabase
        .from('team_members')
        .select('user_id')
        .eq('team_id', meeting.team_id);

      const teamMemberIds = teamMembers?.map(tm => tm.user_id) || [];

      // 24 hours reminder
      const oneDayBefore = this.addHours(meetingDate, -24);
      for (const memberId of teamMemberIds) {
        reminders.push({
          id: `meeting-reminder-${meetingId}-${memberId}-24h`,
          title: `Team Meeting Tomorrow: ${meeting.title}`,
          message: `Your ${meeting.teams.name} team meeting is scheduled for tomorrow at ${meeting.time}. Location: ${meeting.location || 'TBD'}`,
          recipientId: memberId,
          recipientType: 'volunteer',
          reminderType: 'meeting',
          scheduledFor: oneDayBefore.toISOString(),
          status: 'scheduled',
          relatedEntityId: meetingId,
          relatedEntityType: 'meeting',
          priority: 'medium',
          metadata: {
            teamName: meeting.teams.name,
            meetingTitle: meeting.title,
            meetingDate: meeting.date,
            meetingTime: meeting.time,
            location: meeting.location
          },
          createdAt: new Date().toISOString()
        });
      }

      // 1 hour reminder
      const oneHourBefore = this.addHours(meetingDate, -1);
      for (const memberId of teamMemberIds) {
        reminders.push({
          id: `meeting-reminder-${meetingId}-${memberId}-1h`,
          title: `Team Meeting Starting Soon: ${meeting.title}`,
          message: `Your ${meeting.teams.name} team meeting starts in 1 hour at ${meeting.location || 'TBD'}.`,
          recipientId: memberId,
          recipientType: 'volunteer',
          reminderType: 'meeting',
          scheduledFor: oneHourBefore.toISOString(),
          status: 'scheduled',
          relatedEntityId: meetingId,
          relatedEntityType: 'meeting',
          priority: 'high',
          metadata: {
            teamName: meeting.teams.name,
            meetingTitle: meeting.title,
            meetingDate: meeting.date,
            meetingTime: meeting.time,
            location: meeting.location
          },
          createdAt: new Date().toISOString()
        });
      }

      // Store reminders in database
      await this.saveReminders(reminders);

      return reminders;

    } catch (error) {
      console.error('Error scheduling meeting reminders:', error);
      throw error;
    }
  }

  /**
   * Schedule reminders for deadlines
   */
  async scheduleDeadlineReminders(taskId: string): Promise<Reminder[]> {
    try {
      const { data: task, error } = await this.supabase
        .from('generated_tasks')
        .select('*')
        .eq('id', taskId)
        .single();

      if (error || !task) {
        throw new Error('Task not found');
      }

      if (!task.due_date || !task.assigned_to) {
        return []; // No deadline or assignee
      }

      const deadline = new Date(task.due_date);
      const reminders: Reminder[] = [];

      // 1 week reminder
      const oneWeekBefore = this.addDays(deadline, -7);
      if (oneWeekBefore > new Date()) {
        reminders.push({
          id: `deadline-reminder-${taskId}-1week`,
          title: `Task Due Soon: ${task.title}`,
          message: `Your task "${task.title}" is due in 1 week (${deadline.toLocaleDateString()}). Please ensure progress is on track.`,
          recipientId: task.assigned_to,
          recipientType: 'volunteer',
          reminderType: 'deadline',
          scheduledFor: oneWeekBefore.toISOString(),
          status: 'scheduled',
          relatedEntityId: taskId,
          relatedEntityType: 'task',
          priority: task.priority === 'urgent' ? 'high' : 'medium',
          metadata: {
            taskTitle: task.title,
            dueDate: task.due_date,
            daysUntil: 7,
            priority: task.priority
          },
          createdAt: new Date().toISOString()
        });
      }

      // 1 day reminder
      const oneDayBefore = this.addDays(deadline, -1);
      if (oneDayBefore > new Date()) {
        reminders.push({
          id: `deadline-reminder-${taskId}-1day`,
          title: `Task Due Tomorrow: ${task.title}`,
          message: `Your task "${task.title}" is due tomorrow. Please complete and mark as finished.`,
          recipientId: task.assigned_to,
          recipientType: 'volunteer',
          reminderType: 'deadline',
          scheduledFor: oneDayBefore.toISOString(),
          status: 'scheduled',
          relatedEntityId: taskId,
          relatedEntityType: 'task',
          priority: 'urgent',
          metadata: {
            taskTitle: task.title,
            dueDate: task.due_date,
            daysUntil: 1,
            priority: task.priority
          },
          createdAt: new Date().toISOString()
        });
      }

      // Store reminders in database
      await this.saveReminders(reminders);

      return reminders;

    } catch (error) {
      console.error('Error scheduling deadline reminders:', error);
      throw error;
    }
  }

  /**
   * Process and send scheduled reminders
   */
  async processScheduledReminders(): Promise<number> {
    try {
      const now = new Date();
      const cutoffTime = this.addMinutes(now, 5); // Process reminders due within next 5 minutes

      const { data: dueReminders, error } = await this.supabase
        .from('scheduled_reminders')
        .select('*')
        .eq('status', 'scheduled')
        .lte('scheduled_for', cutoffTime.toISOString());

      if (error) {
        throw error;
      }

      let sentCount = 0;

      for (const reminder of dueReminders || []) {
        try {
          await this.sendReminder(reminder);
          await this.markReminderSent(reminder.id);
          sentCount++;
        } catch (sendError) {
          console.error('Error sending reminder:', reminder.id, sendError);
        }
      }

      return sentCount;

    } catch (error) {
      console.error('Error processing scheduled reminders:', error);
      throw error;
    }
  }

  /**
   * Send a reminder notification
   */
  private async sendReminder(reminder: any): Promise<void> {
    // Create in-app notification
    await this.supabase
      .from('notifications')
      .insert({
        user_id: reminder.recipient_id,
        type: 'reminder',
        title: reminder.title,
        message: reminder.message,
        priority: reminder.priority,
        related_entity_id: reminder.related_entity_id,
        related_entity_type: reminder.related_entity_type,
        created_at: new Date().toISOString()
      });

    // In production, also send email/SMS notifications
    console.log('Sending reminder notification:', reminder.title);
  }

  /**
   * Mark reminder as sent
   */
  private async markReminderSent(reminderId: string): Promise<void> {
    await this.supabase
      .from('scheduled_reminders')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString()
      })
      .eq('id', reminderId);
  }

  /**
   * Save reminders to database
   */
  private async saveReminders(reminders: Reminder[]): Promise<void> {
    try {
      const remindersToInsert = reminders.map(reminder => ({
        id: reminder.id,
        title: reminder.title,
        message: reminder.message,
        recipient_id: reminder.recipientId,
        recipient_type: reminder.recipientType,
        reminder_type: reminder.reminderType,
        scheduled_for: reminder.scheduledFor,
        status: reminder.status,
        related_entity_id: reminder.relatedEntityId,
        related_entity_type: reminder.relatedEntityType,
        priority: reminder.priority,
        metadata: reminder.metadata,
        created_at: reminder.createdAt
      }));

      const { error } = await this.supabase
        .from('scheduled_reminders')
        .insert(remindersToInsert);

      if (error) {
        throw error;
      }

    } catch (error) {
      console.error('Error saving reminders:', error);
      throw error;
    }
  }

  private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  private addHours(date: Date, hours: number): Date {
    const result = new Date(date);
    result.setHours(result.getHours() + hours);
    return result;
  }

  private addMinutes(date: Date, minutes: number): Date {
    const result = new Date(date);
    result.setMinutes(result.getMinutes() + minutes);
    return result;
  }
}

export const reminders = new RemindersService();
