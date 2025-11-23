// AI Workflow Automation System
// Automated execution of AI-defined workflows and scheduled tasks

import { supabase } from './supabase/admin';
import { aiAgentService } from './aiAgentService';
import { generateChatCompletion } from './ai/clients';

export interface WorkflowTrigger {
  type: 'time' | 'event' | 'condition';
  config: Record<string, any>;
}

export interface WorkflowAction {
  type: string;
  config: Record<string, any>;
  delay?: number; // minutes
}

export interface WorkflowExecution {
  workflowId: string;
  triggerType: string;
  executedAt: Date;
  success: boolean;
  results: any;
  errors?: string[];
}

class WorkflowAutomationService {
  private activeWorkflows: Map<string, NodeJS.Timeout> = new Map();
  private eventListeners: Map<string, Function[]> = new Map();

  constructor() {
    this.initializeWorkflows();
    this.setupEventListeners();
  }

  // Initialize all active workflows
  async initializeWorkflows(): Promise<void> {
    const { data: workflows } = await supabase
      .from('ai_workflows')
      .select('*')
      .eq('status', 'active');

    for (const workflow of workflows || []) {
      await this.scheduleWorkflow(workflow);
    }

    console.log(`Initialized ${workflows?.length || 0} active workflows`);
  }

  // Schedule a workflow based on its triggers
  async scheduleWorkflow(workflow: any): Promise<void> {
    const { id, trigger_conditions, actions, created_by } = workflow;

    for (const trigger of trigger_conditions) {
      switch (trigger.type) {
        case 'time':
          this.scheduleTimeBasedWorkflow(id, trigger, actions, created_by);
          break;
        case 'event':
          this.setupEventBasedWorkflow(id, trigger, actions, created_by);
          break;
        case 'condition':
          this.setupConditionalWorkflow(id, trigger, actions, created_by);
          break;
      }
    }
  }

  // Time-based workflow scheduling
  private scheduleTimeBasedWorkflow(
    workflowId: string,
    trigger: WorkflowTrigger,
    actions: WorkflowAction[],
    createdBy: string
  ): void {
    const { config } = trigger;
    const { frequency, time, dayOfWeek, dayOfMonth } = config;

    // Clear any existing schedule
    if (this.activeWorkflows.has(workflowId)) {
      clearTimeout(this.activeWorkflows.get(workflowId)!);
    }

    const scheduleNextRun = () => {
      const nextRun = this.calculateNextRunTime(frequency, time, dayOfWeek, dayOfMonth);
      const delay = nextRun.getTime() - Date.now();

      if (delay > 0) {
        const timeoutId = setTimeout(async () => {
          await this.executeWorkflow(workflowId, actions, createdBy, 'time');
          scheduleNextRun(); // Schedule next run
        }, delay);

        this.activeWorkflows.set(workflowId, timeoutId);
      }
    };

    scheduleNextRun();
  }

  // Event-based workflow setup
  private setupEventBasedWorkflow(
    workflowId: string,
    trigger: WorkflowTrigger,
    actions: WorkflowAction[],
    createdBy: string
  ): void {
    const { config } = trigger;
    const { event } = config;

    // Add event listener
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }

    const listeners = this.eventListeners.get(event)!;
    listeners.push(async (eventData: any) => {
      // Check if event conditions match
      if (this.checkEventConditions(trigger, eventData)) {
        await this.executeWorkflow(workflowId, actions, createdBy, 'event', eventData);
      }
    });
  }

  // Conditional workflow setup
  private setupConditionalWorkflow(
    workflowId: string,
    trigger: WorkflowTrigger,
    actions: WorkflowAction[],
    createdBy: string
  ): void {
    // For now, check conditions periodically
    const intervalId = setInterval(async () => {
      if (await this.checkConditionalTrigger(trigger)) {
        await this.executeWorkflow(workflowId, actions, createdBy, 'condition');
      }
    }, 5 * 60 * 1000); // Check every 5 minutes

    this.activeWorkflows.set(`conditional_${workflowId}`, intervalId);
  }

  // Execute workflow actions
  private async executeWorkflow(
    workflowId: string,
    actions: WorkflowAction[],
    createdBy: string,
    triggerType: string,
    eventData?: any
  ): Promise<void> {
    const execution: WorkflowExecution = {
      workflowId,
      triggerType,
      executedAt: new Date(),
      success: true,
      results: [],
      errors: []
    };

    console.log(`Executing workflow ${workflowId} triggered by ${triggerType}`);

    for (const action of actions) {
      try {
        const result = await this.executeAction(action, createdBy, eventData);

        if (action.delay) {
          await new Promise(resolve => setTimeout(resolve, action.delay * 60 * 1000));
        }

        execution.results.push({
          action: action.type,
          success: true,
          result
        });

      } catch (error: any) {
        console.error(`Workflow action failed: ${action.type}`, error);
        execution.results.push({
          action: action.type,
          success: false,
          error: error.message
        });
        execution.errors!.push(`${action.type}: ${error.message}`);
        execution.success = false;
      }
    }

    // Update workflow execution count
    // First get current count, then increment
    const { data: currentWorkflow } = await supabase
      .from('ai_workflows')
      .select('execution_count')
      .eq('id', workflowId)
      .single();

    const newCount = (currentWorkflow?.execution_count || 0) + 1;

    await supabase
      .from('ai_workflows')
      .update({
        last_executed: execution.executedAt.toISOString(),
        execution_count: newCount
      })
      .eq('id', workflowId);

    // Log execution
    await supabase
      .from('system_logs')
      .insert({
        event_type: 'workflow_execution',
        description: JSON.stringify({
          workflowId,
          triggerType,
          success: execution.success,
          actionsExecuted: execution.results.length,
          errors: execution.errors
        }),
        actor_id: createdBy
      });

    console.log(`Workflow ${workflowId} execution ${execution.success ? 'completed' : 'failed'}`);
  }

  // Execute individual workflow actions
  private async executeAction(action: WorkflowAction, createdBy: string, eventData?: any): Promise<any> {
    switch (action.type) {
      case 'send_email':
        return await this.sendEmailAction(action.config, eventData);

      case 'generate_report':
        return await this.generateReportAction(action.config, createdBy);

      case 'create_task':
        return await this.createTaskAction(action.config, createdBy);

      case 'update_records':
        return await this.updateRecordsAction(action.config, eventData);

      case 'send_notification':
        return await this.sendNotificationAction(action.config, createdBy, eventData);

      case 'ai_analysis':
        return await this.aiAnalysisAction(action.config, eventData);

      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  // Action implementations
  private async sendEmailAction(config: any, eventData?: any): Promise<any> {
    const { template, recipients, subject, customMessage } = config;

    // This would integrate with your email system
    console.log(`Sending email to ${recipients} with template ${template}`);

    // Placeholder implementation
    return {
      recipients,
      template,
      sent: true,
      timestamp: new Date().toISOString()
    };
  }

  private async generateReportAction(config: any, createdBy: string): Promise<any> {
    const { type, format, recipients } = config;

    // Generate report based on type
    let reportData;
    switch (type) {
      case 'volunteer_activity':
        reportData = await this.generateVolunteerActivityReport();
        break;
      case 'form_responses':
        reportData = await this.generateFormResponseReport();
        break;
      case 'monthly_summary':
        reportData = await this.generateMonthlySummaryReport();
        break;
      default:
        reportData = { message: 'Report generated', type };
    }

    return {
      reportType: type,
      format,
      data: reportData,
      generatedAt: new Date().toISOString()
    };
  }

  private async createTaskAction(config: any, createdBy: string): Promise<any> {
    const { title, description, assignee, priority = 'medium', dueDate } = config;

    // Create task in your task system
    const { data: task } = await supabase
      .from('tasks')
      .insert({
        title,
        description,
        assigned_to: assignee,
        priority,
        due_date: dueDate,
        created_by: createdBy,
        status: 'pending'
      })
      .select()
      .single();

    return {
      taskId: task.id,
      title: task.title,
      assignee,
      created: true
    };
  }

  private async updateRecordsAction(config: any, eventData?: any): Promise<any> {
    const { table, updates, conditions } = config;

    const query = supabase.from(table).update(updates);

    // Apply conditions
    if (conditions) {
      Object.entries(conditions).forEach(([key, value]) => {
        query.eq(key, value);
      });
    }

    // Use event data if available
    if (eventData && eventData.recordId) {
      query.eq('id', eventData.recordId);
    }

    const { data, error } = await query.select();

    if (error) throw error;

    return {
      table,
      updatedRecords: data?.length || 0,
      updates
    };
  }

  private async sendNotificationAction(config: any, createdBy: string, eventData?: any): Promise<any> {
    const { message, recipients, type = 'info', actionUrl } = config;

    // Send notifications to users
    for (const userId of recipients) {
      await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          notification_type: type,
          title: 'Automated Notification',
          message,
          action_url: actionUrl,
          metadata: eventData
        });
    }

    return {
      recipients: recipients.length,
      message,
      type,
      sent: true
    };
  }

  private async aiAnalysisAction(config: any, eventData?: any): Promise<any> {
    const { analysisType, parameters } = config;

    // Trigger AI analysis
    const prompt = `Perform ${analysisType} analysis with parameters: ${JSON.stringify(parameters)}
Event data: ${JSON.stringify(eventData || {})}`;

    const analysis = await generateChatCompletion([
      { role: 'system', content: 'You are an AI analyst performing automated analysis for workflow triggers.' },
      { role: 'user', content: prompt }
    ]);

    return {
      analysisType,
      result: analysis,
      timestamp: new Date().toISOString()
    };
  }

  // Event handling
  async triggerEvent(eventType: string, eventData: any): Promise<void> {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      for (const listener of listeners) {
        try {
          await listener(eventData);
        } catch (error) {
          console.error(`Event listener error for ${eventType}:`, error);
        }
      }
    }
  }

  // Helper methods
  private calculateNextRunTime(
    frequency: string,
    time?: string,
    dayOfWeek?: number,
    dayOfMonth?: number
  ): Date {
    const now = new Date();
    let nextRun = new Date(now);

    switch (frequency) {
      case 'daily':
        if (time) {
          const [hours, minutes] = time.split(':').map(Number);
          nextRun.setHours(hours, minutes, 0, 0);
          if (nextRun <= now) {
            nextRun.setDate(nextRun.getDate() + 1);
          }
        }
        break;

      case 'weekly':
        if (dayOfWeek !== undefined && time) {
          const [hours, minutes] = time.split(':').map(Number);
          const daysUntilTarget = (dayOfWeek - now.getDay() + 7) % 7;
          nextRun.setDate(now.getDate() + daysUntilTarget);
          nextRun.setHours(hours, minutes, 0, 0);
          if (nextRun <= now) {
            nextRun.setDate(nextRun.getDate() + 7);
          }
        }
        break;

      case 'monthly':
        if (dayOfMonth && time) {
          const [hours, minutes] = time.split(':').map(Number);
          nextRun.setDate(dayOfMonth);
          nextRun.setHours(hours, minutes, 0, 0);
          if (nextRun <= now) {
            nextRun.setMonth(nextRun.getMonth() + 1);
            nextRun.setDate(dayOfMonth);
          }
        }
        break;
    }

    return nextRun;
  }

  private checkEventConditions(trigger: WorkflowTrigger, eventData: any): boolean {
    const { config } = trigger;

    // Check conditions in config
    if (config.conditions) {
      for (const [key, expectedValue] of Object.entries(config.conditions)) {
        if (eventData[key] !== expectedValue) {
          return false;
        }
      }
    }

    return true;
  }

  private async checkConditionalTrigger(trigger: WorkflowTrigger): Promise<boolean> {
    const { config } = trigger;

    // Implement conditional checks based on config
    // This could check database state, API responses, etc.

    if (config.query) {
      // Database condition check
      const { table, conditions } = config.query;
      const query = supabase.from(table).select('*', { count: 'exact', head: true });

      if (conditions) {
        Object.entries(conditions).forEach(([key, value]) => {
          query.eq(key, value);
        });
      }

      const { count } = await query;
      return (count || 0) > 0;
    }

    return false;
  }

  // Report generation helpers
  private async generateVolunteerActivityReport(): Promise<any> {
    const { data: volunteers } = await supabase
      .from('volunteers')
      .select('team_name, volunteer_hours(hours_logged)');

    const totalHours = volunteers?.reduce((sum, v) => {
      return sum + (v.volunteer_hours?.reduce((hSum: number, h: any) => hSum + (h.hours_logged || 0), 0) || 0);
    }, 0) || 0;

    return {
      totalVolunteers: volunteers?.length || 0,
      totalHours,
      averageHoursPerVolunteer: volunteers?.length ? totalHours / volunteers.length : 0,
      generatedAt: new Date().toISOString()
    };
  }

  private async generateFormResponseReport(): Promise<any> {
    const { data: forms } = await supabase
      .from('forms')
      .select('title, form_responses(count)');

    return {
      forms: forms?.map(f => ({
        title: f.title,
        responses: f.form_responses?.[0]?.count || 0
      })) || [],
      generatedAt: new Date().toISOString()
    };
  }

  private async generateMonthlySummaryReport(): Promise<any> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: presentations } = await supabase
      .from('presentations')
      .select('*')
      .gte('scheduled_date', startOfMonth.toISOString());

    const { data: volunteers } = await supabase
      .from('volunteers')
      .select('volunteer_hours(hours_logged)')
      .gte('created_at', startOfMonth.toISOString());

    return {
      month: startOfMonth.toISOString().slice(0, 7),
      presentationsScheduled: presentations?.length || 0,
      newVolunteers: volunteers?.length || 0,
      totalVolunteerHours: volunteers?.reduce((sum, v) => {
        return sum + (v.volunteer_hours?.reduce((hSum: number, h: any) => hSum + (h.hours_logged || 0), 0) || 0);
      }, 0) || 0,
      generatedAt: new Date().toISOString()
    };
  }

  // Cleanup
  async shutdown(): Promise<void> {
    for (const timeoutId of this.activeWorkflows.values()) {
      clearTimeout(timeoutId);
    }
    this.activeWorkflows.clear();
    this.eventListeners.clear();
  }
}

// Export singleton instance
export const workflowAutomation = new WorkflowAutomationService();

// Set up event listeners for common events
function setupEventListeners() {
  // Listen for form response events
  supabase
    .channel('form_responses')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'form_responses'
    }, async (payload) => {
      await workflowAutomation.triggerEvent('form_response_received', payload.new);
    })
    .subscribe();

  // Listen for volunteer approval events
  supabase
    .channel('volunteers')
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'volunteers',
      filter: 'application_status=eq.approved'
    }, async (payload) => {
      await workflowAutomation.triggerEvent('volunteer_approved', payload.new);
    })
    .subscribe();

  // Listen for presentation creation events
  supabase
    .channel('presentations')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'presentations'
    }, async (payload) => {
      await workflowAutomation.triggerEvent('presentation_created', payload.new);
    })
    .subscribe();
}

setupEventListeners();
