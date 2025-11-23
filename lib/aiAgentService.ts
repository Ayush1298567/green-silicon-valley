// AI Agent Service - Enhanced AI Capabilities for Agent Mode
// Handles conversation persistence, context management, and advanced AI features

import { generateChatCompletion } from './ai/clients';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export interface ConversationContext {
  userId: string;
  sessionId: string;
  conversationHistory: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
    timestamp: Date;
    metadata?: any;
  }>;
  userPreferences: {
    communicationStyle: 'formal' | 'casual' | 'technical';
    preferredResponseLength: 'brief' | 'detailed' | 'comprehensive';
    expertiseLevel: 'beginner' | 'intermediate' | 'expert';
  };
  learnedPatterns: Array<{
    pattern: string;
    confidence: number;
    category: string;
    lastUsed: Date;
  }>;
}

export interface AIAction {
  id: string;
  type: 'form_generation' | 'data_analysis' | 'workflow_creation' | 'response_processing' | 'notification_setup';
  description: string;
  parameters: Record<string, any>;
  requiresApproval: boolean;
  approvalReason?: string;
  estimatedImpact: 'low' | 'medium' | 'high';
}

export interface WorkflowTemplate {
  name: string;
  description: string;
  triggers: Array<{
    type: 'time' | 'event' | 'condition';
    config: Record<string, any>;
  }>;
  actions: Array<{
    type: string;
    config: Record<string, any>;
  }>;
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    time?: string;
    dayOfWeek?: number;
    dayOfMonth?: number;
  };
}

class AIAgentService {
  private supabase = createClientComponentClient();

  // Conversation Management
  async saveConversation(context: ConversationContext): Promise<void> {
    const { userId, sessionId, conversationHistory, userPreferences, learnedPatterns } = context;

    await this.supabase.from('ai_conversations').upsert({
      user_id: userId,
      session_id: sessionId,
      messages: conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp.toISOString(),
        metadata: msg.metadata
      })),
      context: {
        userPreferences,
        learnedPatterns,
        lastActivity: new Date().toISOString()
      }
    }, {
      onConflict: 'user_id,session_id'
    });
  }

  async loadConversation(userId: string, sessionId: string): Promise<ConversationContext | null> {
    const { data, error } = await this.supabase
      .from('ai_conversations')
      .select('*')
      .eq('user_id', userId)
      .eq('session_id', sessionId)
      .single();

    if (error || !data) return null;

    return {
      userId: data.user_id,
      sessionId: data.session_id,
      conversationHistory: data.messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
        timestamp: new Date(msg.timestamp),
        metadata: msg.metadata
      })),
      userPreferences: data.context?.userPreferences || {
        communicationStyle: 'casual',
        preferredResponseLength: 'detailed',
        expertiseLevel: 'intermediate'
      },
      learnedPatterns: data.context?.learnedPatterns || []
    };
  }

  async createNewSession(userId: string): Promise<string> {
    const sessionId = `session_${Date.now()}_${userId}`;
    return sessionId;
  }

  // Enhanced AI Processing
  async processUserQuery(
    userInput: string,
    context: ConversationContext
  ): Promise<{
    response: string;
    suggestedActions: AIAction[];
    confidence: number;
    intent: string;
    entities: Record<string, any>;
  }> {
    // Build enhanced prompt with context
    const systemPrompt = this.buildSystemPrompt(context);
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...context.conversationHistory.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user' as const, content: userInput }
    ];

    // Get AI response
    const aiResponse = await generateChatCompletion(messages);

    // Analyze response for actions and intent
    const analysis = await this.analyzeResponse(aiResponse, userInput);

    // Update learned patterns
    await this.updateLearnedPatterns(context, userInput, analysis.intent);

    return {
      response: aiResponse,
      suggestedActions: analysis.actions,
      confidence: analysis.confidence,
      intent: analysis.intent,
      entities: analysis.entities
    };
  }

  private buildSystemPrompt(context: ConversationContext): string {
    const { userPreferences, learnedPatterns } = context;

    return `You are an intelligent AI Administrative Assistant for Green Silicon Valley, a nonprofit focused on environmental STEM education.

USER PREFERENCES:
- Communication Style: ${userPreferences.communicationStyle}
- Response Detail Level: ${userPreferences.preferredResponseLength}
- Expertise Level: ${userPreferences.expertiseLevel}

LEARNED PATTERNS:
${learnedPatterns.slice(0, 5).map(p => `- ${p.pattern} (${Math.round(p.confidence * 100)}% confidence)`).join('\n')}

CAPABILITIES:
- Form Creation & Management (Google Sheets-like interface)
- Volunteer & School Management
- Presentation Scheduling
- Email Campaigns & Notifications
- Data Analysis & Reporting
- Workflow Automation
- Response Processing & Analysis

RESPONSE GUIDELINES:
- Be ${userPreferences.communicationStyle} in tone
- Provide ${userPreferences.preferredResponseLength} responses
- Use terminology appropriate for ${userPreferences.expertiseLevel} users
- Always suggest specific, actionable next steps
- Reference learned patterns when relevant
- Offer to perform actions directly when appropriate

AVAILABLE ACTIONS:
- Create forms with natural language descriptions
- Generate reports and analytics
- Send emails and notifications
- Process volunteer applications
- Schedule presentations and events
- Analyze response data
- Set up automated workflows

When suggesting actions, be specific about what you'll do and ask for confirmation when the action has significant impact.`;
  }

  private async analyzeResponse(
    response: string,
    userInput: string
  ): Promise<{
    actions: AIAction[];
    confidence: number;
    intent: string;
    entities: Record<string, any>;
  }> {
    // Simple intent analysis (could be enhanced with more sophisticated NLP)
    const intents = {
      create: ['create', 'make', 'build', 'generate', 'add', 'new'],
      query: ['show', 'list', 'find', 'search', 'get', 'display', 'view'],
      update: ['update', 'change', 'modify', 'edit', 'alter'],
      delete: ['delete', 'remove', 'cancel', 'archive'],
      send: ['send', 'email', 'notify', 'message', 'contact'],
      analyze: ['analyze', 'report', 'stats', 'metrics', 'insights'],
      automate: ['automate', 'schedule', 'workflow', 'repeat']
    };

    const lowerInput = userInput.toLowerCase();
    let bestIntent = 'unknown';
    let maxMatches = 0;

    for (const [intent, keywords] of Object.entries(intents)) {
      const matches = keywords.filter(keyword => lowerInput.includes(keyword)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        bestIntent = intent;
      }
    }

    const confidence = Math.min(maxMatches / 3, 1); // Normalize confidence

    // Extract entities (simplified - could use more advanced NER)
    const entities: Record<string, any> = {};

    // Look for form-related keywords
    if (lowerInput.includes('form') || lowerInput.includes('survey')) {
      entities.formType = lowerInput.includes('registration') ? 'registration' :
                         lowerInput.includes('feedback') ? 'feedback' :
                         lowerInput.includes('application') ? 'application' : 'general';
    }

    // Look for numeric values
    const numbers = userInput.match(/\d+/g);
    if (numbers) {
      entities.numbers = numbers.map(n => parseInt(n));
    }

    // Generate suggested actions based on intent and entities
    const actions: AIAction[] = [];

    switch (bestIntent) {
      case 'create':
        if (entities.formType) {
          actions.push({
            id: `form_${Date.now()}`,
            type: 'form_generation',
            description: `Create a ${entities.formType} form based on your description`,
            parameters: { formType: entities.formType, description: userInput },
            requiresApproval: false,
            estimatedImpact: 'medium'
          });
        }
        break;

      case 'query':
        actions.push({
          id: `query_${Date.now()}`,
          type: 'data_analysis',
          description: 'Run analysis on the requested data',
          parameters: { query: userInput },
          requiresApproval: false,
          estimatedImpact: 'low'
        });
        break;

      case 'send':
        actions.push({
          id: `notify_${Date.now()}`,
          type: 'notification_setup',
          description: 'Set up notifications for the specified recipients',
          parameters: { message: userInput },
          requiresApproval: true,
          approvalReason: 'Sending communications requires approval to prevent spam',
          estimatedImpact: 'medium'
        });
        break;
    }

    return {
      actions,
      confidence,
      intent: bestIntent,
      entities
    };
  }

  private async updateLearnedPatterns(
    context: ConversationContext,
    userInput: string,
    intent: string
  ): Promise<void> {
    // Simple pattern learning - could be enhanced with more sophisticated ML
    const existingPattern = context.learnedPatterns.find(p =>
      p.pattern.toLowerCase() === userInput.toLowerCase()
    );

    if (existingPattern) {
      existingPattern.confidence = Math.min(existingPattern.confidence + 0.1, 1);
      existingPattern.lastUsed = new Date();
    } else {
      context.learnedPatterns.push({
        pattern: userInput,
        confidence: 0.3,
        category: intent,
        lastUsed: new Date()
      });
    }

    // Keep only top patterns
    context.learnedPatterns.sort((a, b) => b.confidence - a.confidence);
    context.learnedPatterns = context.learnedPatterns.slice(0, 20);
  }

  // Action Execution
  async executeAction(action: AIAction, userId: string): Promise<{ success: boolean; result: any; message: string }> {
    let actionRecord = null;

    try {
      // Record the action
      const { data, error } = await this.supabase
        .from('ai_actions')
        .insert({
          user_id: userId,
          action_type: action.type,
          action_data: action.parameters,
          status: action.requiresApproval ? 'pending' : 'approved'
        })
        .select()
        .single();

      if (error) throw error;
      actionRecord = data;

      if (!actionRecord) {
        throw new Error('Failed to create action record');
      }

      if (action.requiresApproval) {
        return {
          success: true,
          result: actionRecord,
          message: `Action submitted for approval: ${action.description}`
        };
      }

      // Execute immediately
      const result = await this.performAction(action, userId);

      // Update action record
      await this.supabase
        .from('ai_actions')
        .update({
          status: 'executed',
          executed_at: new Date().toISOString(),
          results: result
        })
        .eq('id', actionRecord.id);

      return {
        success: true,
        result,
        message: `Action completed: ${action.description}`
      };

    } catch (error: any) {
      // Update action record with failure if it was created
      if (actionRecord?.id) {
        await this.supabase
          .from('ai_actions')
          .update({
            status: 'rejected',
            results: { error: error.message }
          })
          .eq('id', actionRecord.id);
      }

      return {
        success: false,
        result: null,
        message: `Action failed: ${error.message}`
      };
    }
  }

  private async performAction(action: AIAction, userId: string): Promise<any> {
    switch (action.type) {
      case 'form_generation':
        return await this.generateForm(action.parameters, userId);

      case 'data_analysis':
        return await this.runDataAnalysis(action.parameters, userId);

      case 'notification_setup':
        return await this.setupNotifications(action.parameters, userId);

      case 'workflow_creation':
        return await this.createWorkflow(action.parameters, userId);

      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  // Specific Action Implementations
  private async generateForm(params: any, userId: string): Promise<any> {
    // Use AI to generate form structure from description
    const prompt = `Create a detailed form structure based on this description: "${params.description}"

Return a JSON object with:
{
  "title": "Form Title",
  "description": "Form Description",
  "columns": [
    {
      "title": "Question Title",
      "field_type": "text|email|number|date|select|multiselect",
      "required": true/false,
      "validation_rules": {},
      "options": ["option1", "option2"] // for select fields
    }
  ]
}`;

    const formStructure = await generateChatCompletion([
      { role: 'system', content: 'You are a form design expert. Create detailed, well-structured forms.' },
      { role: 'user', content: prompt }
    ]);

    // Parse and create the form
    const parsedForm = JSON.parse(formStructure);

    const { data: form } = await this.supabase
      .from('forms')
      .insert({
        title: parsedForm.title,
        description: parsedForm.description,
        created_by: userId,
        status: 'draft'
      })
      .select()
      .single();

    // Create columns
    for (let i = 0; i < parsedForm.columns.length; i++) {
      const column = parsedForm.columns[i];
      await this.supabase
        .from('form_columns')
        .insert({
          form_id: form.id,
          column_index: i,
          title: column.title,
          field_type: column.field_type,
          required: column.required,
          validation_rules: column.validation_rules || {},
          formatting: { options: column.options || [] }
        });
    }

    return { formId: form.id, title: form.title, columnCount: parsedForm.columns.length };
  }

  private async runDataAnalysis(params: any, userId: string): Promise<any> {
    // Implement data analysis based on query
    const analysisPrompt = `Analyze this data query: "${params.query}"

Provide insights and summary statistics. Focus on volunteer management, presentations, and organizational metrics.`;

    const analysis = await generateChatCompletion([
      { role: 'system', content: 'You are a data analyst specializing in nonprofit organizations.' },
      { role: 'user', content: analysisPrompt }
    ]);

    return { analysis, timestamp: new Date().toISOString() };
  }

  private async setupNotifications(params: any, userId: string): Promise<any> {
    // This would require approval, so just prepare the notification setup
    return {
      notificationType: 'prepared',
      message: params.message,
      requiresApproval: true,
      preparedAt: new Date().toISOString()
    };
  }

  private async createWorkflow(params: any, userId: string): Promise<any> {
    // Create an automated workflow
    const { data: workflow } = await this.supabase
      .from('ai_workflows')
      .insert({
        name: params.name || 'AI Generated Workflow',
        description: params.description || 'Automatically generated workflow',
        trigger_conditions: params.triggers || {},
        actions: params.actions || [],
        created_by: userId
      })
      .select()
      .single();

    return { workflowId: workflow.id, name: workflow.name };
  }

  // Workflow Management
  async getAvailableWorkflowTemplates(): Promise<WorkflowTemplate[]> {
    return [
      {
        name: 'Volunteer Onboarding',
        description: 'Automated welcome emails and check-in reminders for new volunteers',
        triggers: [
          { type: 'event', config: { event: 'volunteer_approved' } }
        ],
        actions: [
          { type: 'send_email', config: { template: 'welcome_volunteer', delay: 0 } },
          { type: 'send_email', config: { template: 'checkin_week1', delay: 7 } },
          { type: 'send_email', config: { template: 'checkin_month1', delay: 30 } }
        ],
        schedule: { frequency: 'daily', time: '09:00' }
      },
      {
        name: 'Form Response Follow-up',
        description: 'Automatic follow-up emails when forms receive responses',
        triggers: [
          { type: 'event', config: { event: 'form_response_received' } }
        ],
        actions: [
          { type: 'send_email', config: { template: 'thank_you_response', delay: 1 } },
          { type: 'create_task', config: { title: 'Review form response', assignee: 'founder' } }
        ]
      },
      {
        name: 'Weekly Analytics Report',
        description: 'Automated weekly summary of platform activity',
        triggers: [
          { type: 'time', config: { dayOfWeek: 1, time: '08:00' } }
        ],
        actions: [
          { type: 'generate_report', config: { type: 'weekly_summary' } },
          { type: 'send_email', config: { template: 'weekly_report', recipients: ['founders'] } }
        ],
        schedule: { frequency: 'weekly', dayOfWeek: 1, time: '08:00' }
      }
    ];
  }

  async createWorkflowFromTemplate(template: WorkflowTemplate, userId: string): Promise<any> {
    const { data: workflow } = await this.supabase
      .from('ai_workflows')
      .insert({
        name: template.name,
        description: template.description,
        trigger_conditions: template.triggers,
        actions: template.actions,
        created_by: userId
      })
      .select()
      .single();

    return { workflowId: workflow.id, name: workflow.name };
  }

  // Learning and Adaptation
  async recordUserFeedback(
    userId: string,
    interaction: { input: string; response: string; rating: number; feedback?: string }
  ): Promise<void> {
    await this.supabase
      .from('ai_learning')
      .insert({
        user_id: userId,
        category: 'user_feedback',
        pattern: JSON.stringify(interaction),
        confidence: interaction.rating / 5, // Convert 1-5 rating to 0-1 confidence
        success_rate: interaction.rating >= 4 ? 1 : 0
      });
  }

  async getPersonalizedSuggestions(userId: string): Promise<string[]> {
    const { data: patterns } = await this.supabase
      .from('ai_learning')
      .select('pattern')
      .eq('user_id', userId)
      .eq('category', 'successful_patterns')
      .order('success_rate', { ascending: false })
      .limit(5);

    return patterns?.map(p => JSON.parse(p.pattern).input) || [];
  }
}

// Export singleton instance
export const aiAgentService = new AIAgentService();
