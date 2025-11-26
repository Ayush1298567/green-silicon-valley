import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export interface GeneratedTask {
  id: string;
  title: string;
  description: string;
  type: 'presentation' | 'followup' | 'coordination' | 'administrative';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  dueDate?: string;
  relatedEntityId: string; // presentation_id, teacher_id, etc.
  relatedEntityType: 'presentation' | 'teacher_request' | 'intern_task';
  metadata: Record<string, any>;
  createdAt: string;
}

export class TaskGenerationService {
  private supabase = createClientComponentClient();

  /**
   * Generate tasks from teacher presentation requests
   */
  async generateTasksFromTeacherRequest(teacherRequestId: string): Promise<GeneratedTask[]> {
    try {
      // Get teacher request details
      const { data: request, error } = await this.supabase
        .from('teacher_requests')
        .select('*')
        .eq('id', teacherRequestId)
        .single();

      if (error || !request) {
        throw new Error('Teacher request not found');
      }

      const tasks: GeneratedTask[] = [];

      // Task 1: Initial outreach and scheduling
      tasks.push({
        id: `outreach-${teacherRequestId}`,
        title: `Contact ${request.school_name} for presentation scheduling`,
        description: `Reach out to ${request.contact_name} at ${request.contact_email} to discuss presentation options for ${request.school_name}. Review their requested dates and availability.`,
        type: 'coordination',
        priority: 'high',
        assignedTo: this.getOutreachCoordinator(),
        dueDate: this.addDays(new Date(), 2), // 2 days from now
        relatedEntityId: teacherRequestId,
        relatedEntityType: 'teacher_request',
        metadata: {
          schoolName: request.school_name,
          contactName: request.contact_name,
          contactEmail: request.contact_email,
          requestedDates: request.preferred_dates,
          gradeLevel: request.grade_level,
          studentCount: request.student_count
        },
        createdAt: new Date().toISOString()
      });

      // Task 2: Curriculum alignment check
      tasks.push({
        id: `curriculum-${teacherRequestId}`,
        title: `Review curriculum alignment for ${request.school_name}`,
        description: `Ensure presentation content aligns with ${request.grade_level} curriculum standards and school-specific needs.`,
        type: 'administrative',
        priority: 'medium',
        assignedTo: this.getCurriculumCoordinator(),
        dueDate: this.addDays(new Date(), 3),
        relatedEntityId: teacherRequestId,
        relatedEntityType: 'teacher_request',
        metadata: {
          gradeLevel: request.grade_level,
          subject: request.subject,
          specialRequirements: request.special_requirements
        },
        createdAt: new Date().toISOString()
      });

      // Task 3: Team assignment
      tasks.push({
        id: `team-assignment-${teacherRequestId}`,
        title: `Assign presentation team for ${request.school_name}`,
        description: `Select and assign volunteer team based on availability, experience level, and team chemistry.`,
        type: 'coordination',
        priority: 'medium',
        assignedTo: this.getTeamCoordinator(),
        dueDate: this.addDays(new Date(), 5),
        relatedEntityId: teacherRequestId,
        relatedEntityType: 'teacher_request',
        metadata: {
          studentCount: request.student_count,
          gradeLevel: request.grade_level,
          presentationType: request.presentation_type
        },
        createdAt: new Date().toISOString()
      });

      // Store tasks in database
      await this.saveTasks(tasks);

      // Trigger cross-department alerts
      await this.triggerCrossDepartmentAlerts(tasks);

      return tasks;

    } catch (error) {
      console.error('Error generating tasks from teacher request:', error);
      throw error;
    }
  }

  /**
   * Generate tasks from scheduled presentations
   */
  async generateTasksFromPresentation(presentationId: string): Promise<GeneratedTask[]> {
    try {
      // Get presentation details
      const { data: presentation, error } = await this.supabase
        .from('presentations')
        .select('*, teams(*), schools(*)')
        .eq('id', presentationId)
        .single();

      if (error || !presentation) {
        throw new Error('Presentation not found');
      }

      const tasks: GeneratedTask[] = [];
      const presentationDate = new Date(presentation.date);

      // Task 1: Pre-presentation checklist (1 week before)
      const checklistDue = this.addDays(presentationDate, -7);
      tasks.push({
        id: `checklist-${presentationId}`,
        title: `Complete pre-presentation checklist for ${presentation.schools.name}`,
        description: `Ensure all preparation items are completed: materials ready, team briefed, equipment tested, backup plan prepared.`,
        type: 'administrative',
        priority: 'high',
        assignedTo: presentation.team_captain_id,
        dueDate: checklistDue.toISOString(),
        relatedEntityId: presentationId,
        relatedEntityType: 'presentation',
        metadata: {
          schoolName: presentation.schools.name,
          presentationDate: presentation.date,
          teamName: presentation.teams.name
        },
        createdAt: new Date().toISOString()
      });

      // Task 2: Follow-up email (1 day after)
      const followupDue = this.addDays(presentationDate, 1);
      tasks.push({
        id: `followup-${presentationId}`,
        title: `Send follow-up email to ${presentation.schools.name}`,
        description: `Send thank you email, request feedback, and offer additional resources or follow-up presentations.`,
        type: 'followup',
        priority: 'medium',
        assignedTo: presentation.team_captain_id,
        dueDate: followupDue.toISOString(),
        relatedEntityId: presentationId,
        relatedEntityType: 'presentation',
        metadata: {
          schoolName: presentation.schools.name,
          contactEmail: presentation.teacher_email
        },
        createdAt: new Date().toISOString()
      });

      // Task 3: Impact assessment (1 week after)
      const assessmentDue = this.addDays(presentationDate, 7);
      tasks.push({
        id: `assessment-${presentationId}`,
        title: `Complete impact assessment for ${presentation.schools.name}`,
        description: `Gather feedback from teacher, students, and volunteers. Document outcomes and lessons learned.`,
        type: 'followup',
        priority: 'medium',
        assignedTo: presentation.team_captain_id,
        dueDate: assessmentDue.toISOString(),
        relatedEntityId: presentationId,
        relatedEntityType: 'presentation',
        metadata: {
          schoolName: presentation.schools.name,
          expectedOutcomes: presentation.learning_objectives
        },
        createdAt: new Date().toISOString()
      });

      // Store tasks in database
      await this.saveTasks(tasks);

      return tasks;

    } catch (error) {
      console.error('Error generating tasks from presentation:', error);
      throw error;
    }
  }

  /**
   * Generate tasks from intern project assignments
   */
  async generateTasksFromInternTask(taskId: string): Promise<GeneratedTask[]> {
    try {
      const { data: task, error } = await this.supabase
        .from('intern_tasks')
        .select('*, interns(*)')
        .eq('id', taskId)
        .single();

      if (error || !task) {
        throw new Error('Intern task not found');
      }

      const tasks: GeneratedTask[] = [];

      // Check if task requires cross-department coordination
      if (task.requires_coordination) {
        tasks.push({
          id: `coordination-${taskId}`,
          title: `Coordinate ${task.title} with ${task.coordinating_department}`,
          description: `This intern task requires coordination with the ${task.coordinating_department} department. Schedule meeting and align on deliverables.`,
          type: 'coordination',
          priority: 'high',
          assignedTo: this.getDepartmentCoordinator(task.coordinating_department),
          dueDate: this.addDays(new Date(task.created_at), 3),
          relatedEntityId: taskId,
          relatedEntityType: 'intern_task',
          metadata: {
            internName: task.interns.name,
            department: task.coordinating_department,
            complexity: task.complexity_level
          },
          createdAt: new Date().toISOString()
        });
      }

      // Task review and approval
      tasks.push({
        id: `review-${taskId}`,
        title: `Review ${task.title} completion`,
        description: `Review intern work, provide feedback, and approve completion.`,
        type: 'administrative',
        priority: 'medium',
        assignedTo: task.supervisor_id,
        dueDate: task.deadline,
        relatedEntityId: taskId,
        relatedEntityType: 'intern_task',
        metadata: {
          internName: task.interns.name,
          taskType: task.task_type,
          deliverableType: task.deliverable_type
        },
        createdAt: new Date().toISOString()
      });

      // Store tasks in database
      await this.saveTasks(tasks);

      // Trigger cross-department alerts if needed
      if (task.requires_coordination) {
        await this.triggerCrossDepartmentAlerts(tasks);
      }

      return tasks;

    } catch (error) {
      console.error('Error generating tasks from intern task:', error);
      throw error;
    }
  }

  /**
   * Save generated tasks to database
   */
  private async saveTasks(tasks: GeneratedTask[]): Promise<void> {
    try {
      const tasksToInsert = tasks.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        type: task.type,
        priority: task.priority,
        assigned_to: task.assignedTo,
        due_date: task.dueDate,
        related_entity_id: task.relatedEntityId,
        related_entity_type: task.relatedEntityType,
        metadata: task.metadata,
        status: 'pending',
        created_at: task.createdAt
      }));

      const { error } = await this.supabase
        .from('generated_tasks')
        .insert(tasksToInsert);

      if (error) {
        throw error;
      }

    } catch (error) {
      console.error('Error saving tasks:', error);
      throw error;
    }
  }

  /**
   * Trigger cross-department alerts
   */
  private async triggerCrossDepartmentAlerts(tasks: GeneratedTask[]): Promise<void> {
    // Implementation will be in cross-department-alerts.ts
    console.log('Triggering cross-department alerts for tasks:', tasks.length);
  }

  /**
   * Helper functions for coordinator assignment
   */
  private getOutreachCoordinator(): string {
    // In production, this would look up actual coordinator assignments
    return 'outreach-coordinator-id';
  }

  private getCurriculumCoordinator(): string {
    return 'curriculum-coordinator-id';
  }

  private getTeamCoordinator(): string {
    return 'team-coordinator-id';
  }

  private getDepartmentCoordinator(department: string): string {
    // Map departments to coordinator IDs
    const coordinators: { [key: string]: string } = {
      'Outreach': 'outreach-coordinator-id',
      'Technology': 'tech-coordinator-id',
      'Media': 'media-coordinator-id',
      'Volunteer Development': 'volunteer-coordinator-id',
      'Communications': 'communications-coordinator-id',
      'Operations': 'operations-coordinator-id'
    };
    return coordinators[department] || 'admin-coordinator-id';
  }

  private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }
}

export const taskGeneration = new TaskGenerationService();
