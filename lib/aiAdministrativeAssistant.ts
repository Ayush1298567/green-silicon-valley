// AI Administrative Assistant - Natural Language Command Processing
// Handles conversational management of the volunteer platform

import { runAIQuery } from './aiClient';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export interface AICommand {
  intent: 'create' | 'update' | 'delete' | 'query' | 'send' | 'report' | 'approve' | 'reject' | 'unknown';
  entity: 'school' | 'volunteer' | 'presentation' | 'user' | 'email' | 'application' | 'report' | 'unknown';
  confidence: number;
  parameters: {
    // School parameters
    schoolName?: string;
    schoolLocation?: string;
    schoolCity?: string;
    schoolState?: string;
    schoolDistrict?: string;
    teacherName?: string;
    teacherEmail?: string;

    // Volunteer parameters
    volunteerName?: string;
    volunteerEmail?: string;
    teamName?: string;
    applicationId?: string;
    volunteerIds?: string[];

    // Presentation parameters
    presentationTitle?: string;
    presentationDate?: string;
    schoolId?: string;
    presentationId?: string;
    status?: string;

    // Email parameters
    recipientEmail?: string;
    recipientName?: string;
    emailSubject?: string;
    emailType?: 'welcome' | 'followup' | 'approval' | 'rejection' | 'reminder';

    // Query parameters
    queryType?: 'count' | 'list' | 'details' | 'summary';
    filters?: Record<string, any>;
    dateRange?: { start: string; end: string };

    // Bulk operations
    bulkAction?: 'approve' | 'reject' | 'update' | 'notify';
    bulkIds?: string[];
  };
  requiresConfirmation: boolean;
  confirmationReason?: string;
  naturalLanguage: string;
}

export interface AIResponse {
  success: boolean;
  message: string;
  data?: any;
  requiresConfirmation?: boolean;
  confirmationCommand?: AICommand;
  suggestions?: string[];
}

class AICommandParser {
  private supabase = createClientComponentClient();

  async parseCommand(userInput: string, userId: string): Promise<AICommand> {
    // Use AI to parse the natural language command
    const prompt = `
You are an AI assistant for a volunteer management platform called Green Silicon Valley.
Parse this user command and extract structured information.

User said: "${userInput}"

Available actions:
- CREATE: Add new schools, volunteers, presentations
- UPDATE: Modify existing records
- DELETE: Remove records (rare, requires confirmation)
- QUERY: Get information, counts, lists, reports
- SEND: Send emails, notifications, messages
- APPROVE/REJECT: Handle applications and requests
- REPORT: Generate summaries and analytics

Available entities:
- school: Educational institutions
- volunteer: Student volunteer teams
- presentation: Environmental STEM presentations
- user: Platform users (founders, interns, volunteers)
- email: Email communications
- application: Volunteer applications

Return a JSON object with this exact structure:
{
  "intent": "create|update|delete|query|send|approve|reject|report|unknown",
  "entity": "school|volunteer|presentation|user|email|application|report|unknown",
  "confidence": 0.0-1.0,
  "parameters": {
    // Fill in relevant parameters based on the command
  },
  "requiresConfirmation": true/false,
  "confirmationReason": "optional explanation why confirmation is needed",
  "naturalLanguage": "${userInput}"
}

Examples:
"Add Lincoln Elementary in Palo Alto" → {intent: "create", entity: "school", parameters: {schoolName: "Lincoln Elementary", schoolCity: "Palo Alto"}}
"Send welcome email to john@school.edu" → {intent: "send", entity: "email", parameters: {recipientEmail: "john@school.edu", emailType: "welcome"}}
"Show me all active volunteers" → {intent: "query", entity: "volunteer", parameters: {queryType: "list", filters: {status: "active"}}}
"Approve application from Sarah Johnson" → {intent: "approve", entity: "application", parameters: {volunteerName: "Sarah Johnson"}}
`;

    try {
      const aiResponse = await runAIQuery(prompt, { temperature: 0.1, maxTokens: 800 });
      const parsed = JSON.parse(aiResponse);

      // Validate and enhance the parsed command
      return this.validateAndEnhanceCommand(parsed, userId);
    } catch (error) {
      console.error('AI command parsing failed:', error);
      return this.createFallbackCommand(userInput);
    }
  }

  private async validateAndEnhanceCommand(parsed: any, userId: string): Promise<AICommand> {
    // Enhance with database lookups where needed
    if (parsed.intent === 'create' && parsed.entity === 'school') {
      // Could validate school name uniqueness here
    }

    if (parsed.intent === 'send' && parsed.entity === 'email') {
      // Could validate email addresses here
    }

    if ((parsed.intent === 'approve' || parsed.intent === 'reject') && parsed.entity === 'application') {
      // Try to find matching applications
      if (parsed.parameters.volunteerName) {
        const applications = await this.findApplicationsByName(parsed.parameters.volunteerName);
        if (applications.length === 1) {
          parsed.parameters.applicationId = applications[0].id;
        } else if (applications.length > 1) {
          parsed.requiresConfirmation = true;
          parsed.confirmationReason = `Found ${applications.length} applications matching "${parsed.parameters.volunteerName}". Please be more specific.`;
        }
      }
    }

    return {
      intent: parsed.intent || 'unknown',
      entity: parsed.entity || 'unknown',
      confidence: parsed.confidence || 0,
      parameters: parsed.parameters || {},
      requiresConfirmation: parsed.requiresConfirmation || false,
      confirmationReason: parsed.confirmationReason,
      naturalLanguage: parsed.naturalLanguage
    };
  }

  private createFallbackCommand(userInput: string): AICommand {
    return {
      intent: 'unknown',
      entity: 'unknown',
      confidence: 0,
      parameters: {},
      requiresConfirmation: false,
      naturalLanguage: userInput
    };
  }

  private async findApplicationsByName(name: string) {
    const { data } = await this.supabase
      .from('volunteers')
      .select('id, team_name, application_status')
      .ilike('team_name', `%${name}%`)
      .eq('application_status', 'pending');

    return data || [];
  }
}

class AICommandExecutor {
  private supabase = createClientComponentClient();

  async executeCommand(command: AICommand, userId: string, confirmed: boolean = false): Promise<AIResponse> {
    // Check if confirmation is required but not provided
    if (command.requiresConfirmation && !confirmed) {
      return {
        success: false,
        message: `This action requires confirmation: ${command.confirmationReason || 'Please confirm this destructive action.'}`,
        requiresConfirmation: true,
        confirmationCommand: command
      };
    }

    try {
      switch (command.intent) {
        case 'create':
          return await this.executeCreate(command, userId);
        case 'update':
          return await this.executeUpdate(command, userId);
        case 'delete':
          return await this.executeDelete(command, userId);
        case 'query':
          return await this.executeQuery(command, userId);
        case 'send':
          return await this.executeSend(command, userId);
        case 'approve':
          return await this.executeApprove(command, userId);
        case 'reject':
          return await this.executeReject(command, userId);
        case 'report':
          return await this.executeReport(command, userId);
        default:
          return {
            success: false,
            message: "I don't understand that command. Try: 'Add a school', 'Send an email', 'Show me volunteers', or 'Generate a report'."
          };
      }
    } catch (error: any) {
      console.error('Command execution failed:', error);
      return {
        success: false,
        message: `Failed to execute command: ${error.message}`
      };
    }
  }

  private async executeCreate(command: AICommand, userId: string): Promise<AIResponse> {
    switch (command.entity) {
      case 'school':
        return await this.createSchool(command.parameters, userId);

      case 'volunteer':
        return await this.createVolunteer(command.parameters, userId);

      case 'presentation':
        return await this.createPresentation(command.parameters, userId);

      default:
        return { success: false, message: "I can create schools, volunteers, and presentations. What would you like to create?" };
    }
  }

  private async createSchool(params: any, userId: string): Promise<AIResponse> {
    if (!params.schoolName) {
      return { success: false, message: "Please specify the school name." };
    }

    const { data, error } = await this.supabase
      .from('schools')
      .insert({
        name: params.schoolName,
        city: params.schoolCity,
        state: params.schoolState,
        district: params.schoolDistrict,
        teacher_name: params.teacherName,
        email: params.teacherEmail
      })
      .select()
      .single();

    if (error) throw error;

    // Update search index
    await this.updateSearchIndex('school', data.id, `${data.name} ${data.city || ''} ${data.state || ''}`);

    return {
      success: true,
      message: `✅ Added ${params.schoolName} to the schools database.`,
      data: data
    };
  }

  private async createVolunteer(params: any, userId: string): Promise<AIResponse> {
    // This would typically be done through the application process
    return {
      success: false,
      message: "Volunteer creation is handled through the application process. Would you like me to show you pending applications?"
    };
  }

  private async createPresentation(params: any, userId: string): Promise<AIResponse> {
    if (!params.presentationTitle || !params.schoolId) {
      return { success: false, message: "Please specify the presentation title and school." };
    }

    const { data, error } = await this.supabase
      .from('presentations')
      .insert({
        title: params.presentationTitle,
        school_id: params.schoolId,
        scheduled_date: params.presentationDate,
        status: 'scheduled'
      })
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      message: `✅ Scheduled presentation "${params.presentationTitle}" for ${params.presentationDate || 'TBD'}.`,
      data: data
    };
  }

  private async executeQuery(command: AICommand, userId: string): Promise<AIResponse> {
    switch (command.entity) {
      case 'volunteer':
        return await this.queryVolunteers(command.parameters);
      case 'school':
        return await this.querySchools(command.parameters);
      case 'presentation':
        return await this.queryPresentations(command.parameters);
      case 'application':
        return await this.queryApplications(command.parameters);
      default:
        return { success: false, message: "I can query volunteers, schools, presentations, and applications. What would you like to know?" };
    }
  }

  private async queryVolunteers(params: any): Promise<AIResponse> {
    let query = this.supabase.from('volunteers').select('id, team_name, status, application_status, created_at');

    if (params.filters?.status) {
      query = query.eq('status', params.filters.status);
    }
    if (params.filters?.application_status) {
      query = query.eq('application_status', params.filters.application_status);
    }

    const { data, error } = await query.limit(10);

    if (error) throw error;

    const message = data?.length === 0
      ? "No volunteers found matching your criteria."
      : `Found ${data.length} volunteer${data.length === 1 ? '' : 's'}:${data.map(v => `\n• ${v.team_name || 'Unnamed Team'} (${v.status})`).join('')}`;

    return {
      success: true,
      message,
      data: data
    };
  }

  private async querySchools(params: any): Promise<AIResponse> {
    const { data, error } = await this.supabase
      .from('schools')
      .select('id, name, city, state, teacher_name')
      .limit(10);

    if (error) throw error;

    const message = data?.length === 0
      ? "No schools in the database yet."
      : `Found ${data.length} school${data.length === 1 ? '' : 's'}:${data.map(s => `\n• ${s.name} (${s.city}, ${s.state})`).join('')}`;

    return {
      success: true,
      message,
      data: data
    };
  }

  private async queryPresentations(params: any): Promise<AIResponse> {
    let query = this.supabase.from('presentations').select('id, title, status, scheduled_date');

    if (params.dateRange) {
      query = query.gte('scheduled_date', params.dateRange.start).lte('scheduled_date', params.dateRange.end);
    }

    const { data, error } = await query.limit(10);

    if (error) throw error;

    const message = data?.length === 0
      ? "No presentations found."
      : `Found ${data.length} presentation${data.length === 1 ? '' : 's'}:${data.map(p => `\n• ${p.title} (${p.status}) - ${p.scheduled_date ? new Date(p.scheduled_date).toLocaleDateString() : 'Date TBD'}`).join('')}`;

    return {
      success: true,
      message,
      data: data
    };
  }

  private async queryApplications(params: any): Promise<AIResponse> {
    const { data, error } = await this.supabase
      .from('volunteers')
      .select('id, team_name, application_status, created_at')
      .eq('application_status', 'pending')
      .limit(10);

    if (error) throw error;

    const message = data?.length === 0
      ? "No pending applications."
      : `Found ${data.length} pending application${data.length === 1 ? '' : 's'}:${data.map(v => `\n• ${v.team_name || 'Unnamed Team'} (applied ${new Date(v.created_at).toLocaleDateString()})`).join('')}`;

    return {
      success: true,
      message,
      data: data
    };
  }

  private async executeSend(command: AICommand, userId: string): Promise<AIResponse> {
    // This would integrate with your email service
    if (!command.parameters.recipientEmail) {
      return { success: false, message: "Please specify who to send the email to." };
    }

    // For now, just acknowledge the request
    const emailType = command.parameters.emailType || 'general';
    const recipient = command.parameters.recipientName || command.parameters.recipientEmail;

    return {
      success: true,
      message: `✅ Would send ${emailType} email to ${recipient}. (Email integration needs to be configured)`
    };
  }

  private async executeApprove(command: AICommand, userId: string): Promise<AIResponse> {
    if (!command.parameters.applicationId && !command.parameters.volunteerIds) {
      return { success: false, message: "Please specify which application(s) to approve." };
    }

    const idsToApprove = command.parameters.applicationId
      ? [command.parameters.applicationId]
      : command.parameters.volunteerIds || [];

    if (idsToApprove.length === 0) {
      return { success: false, message: "No applications found to approve." };
    }

    const { data, error } = await this.supabase
      .from('volunteers')
      .update({
        application_status: 'approved',
        approved_at: new Date().toISOString()
      })
      .in('id', idsToApprove)
      .select('team_name');

    if (error) throw error;

    return {
      success: true,
      message: `✅ Approved ${data?.length || 0} application${(data?.length || 0) === 1 ? '' : 's'}:${data?.map(v => `\n• ${v.team_name || 'Team'}`).join('') || ''}`
    };
  }

  private async executeReject(command: AICommand, userId: string): Promise<AIResponse> {
    if (!command.parameters.applicationId && !command.parameters.volunteerIds) {
      return { success: false, message: "Please specify which application(s) to reject." };
    }

    const idsToReject = command.parameters.applicationId
      ? [command.parameters.applicationId]
      : command.parameters.volunteerIds || [];

    if (idsToReject.length === 0) {
      return { success: false, message: "No applications found to reject." };
    }

    const { data, error } = await this.supabase
      .from('volunteers')
      .update({
        application_status: 'rejected'
      })
      .in('id', idsToReject)
      .select('team_name');

    if (error) throw error;

    return {
      success: true,
      message: `✅ Rejected ${data?.length || 0} application${(data?.length || 0) === 1 ? '' : 's'}:${data?.map(v => `\n• ${v.team_name || 'Team'}`).join('') || ''}`
    };
  }

  private async executeReport(command: AICommand, userId: string): Promise<AIResponse> {
    // Generate a summary report
    const [
      { count: volunteerCount },
      { count: schoolCount },
      { count: presentationCount }
    ] = await Promise.all([
      this.supabase.from('volunteers').select('*', { count: 'exact', head: true }),
      this.supabase.from('schools').select('*', { count: 'exact', head: true }),
      this.supabase.from('presentations').select('*', { count: 'exact', head: true })
    ]);

    const message = `📊 Platform Summary Report:

🏫 Schools: ${schoolCount || 0}
👥 Volunteer Teams: ${volunteerCount || 0}
📊 Presentations: ${presentationCount || 0}

Recent Activity: Check the dashboard for detailed analytics.`;

    return {
      success: true,
      message,
      data: {
        schools: schoolCount,
        volunteers: volunteerCount,
        presentations: presentationCount
      }
    };
  }

  private async updateSearchIndex(entityType: string, entityId: string, searchText: string) {
    await this.supabase.from('search_index').upsert({
      entity_type: entityType,
      entity_id: entityId,
      search_text: searchText,
      metadata: { table: entityType === 'group' ? 'volunteers' : entityType + 's' },
      updated_at: new Date().toISOString()
    });
  }
}

// Export singleton instances
export const aiCommandParser = new AICommandParser();
export const aiCommandExecutor = new AICommandExecutor();
