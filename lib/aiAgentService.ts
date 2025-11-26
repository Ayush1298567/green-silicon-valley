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
  type: 'form_generation' | 'data_analysis' | 'workflow_creation' | 'response_processing' | 'notification_setup' | 'create_event' | 'create_faq' | 'update_faq' | 'create_leader' | 'update_leader' | 'delete_content';
  description: string;
  parameters: Record<string, any>;
  requiresApproval: boolean;
  approvalReason?: string;
  estimatedImpact: 'low' | 'medium' | 'high';
}

export interface FormSchema {
  id: string;
  title: string;
  description?: string;
  fields: Array<{
    id: string;
    type: 'text' | 'email' | 'number' | 'date' | 'select' | 'multiselect' | 'checkbox' | 'textarea' | 'file' | 'radio';
    label: string;
    placeholder?: string;
    helpText?: string;
    required: boolean;
    options?: string[];
    validation?: {
      minLength?: number;
      maxLength?: number;
      pattern?: string;
      customMessage?: string;
    };
    conditionalLogic?: {
      dependsOn: string;
      condition: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than';
      value: any;
    };
  }>;
}

export interface WorkflowConfig {
  id: string;
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
    // Check for form generation commands
    const formKeywords = ['create a form', 'make a form', 'build a form', 'generate a form', 'new form'];
    const isFormRequest = formKeywords.some(keyword =>
      userInput.toLowerCase().includes(keyword)
    );

    if (isFormRequest) {
      try {
        const formSchema = await this.generateFormFromDescription(userInput, context.userId);

        return {
          response: `I've created a form based on your description: "${formSchema.title}". The form has ${formSchema.fields.length} fields and is ready to use. Would you like me to save it to your forms or make any adjustments?`,
          suggestedActions: [
            {
              id: 'save_generated_form',
              type: 'form_generation',
              description: 'Save this generated form',
              parameters: { formSchema, action: 'save' },
              requiresApproval: false,
              estimatedImpact: 'low'
            },
            {
              id: 'edit_generated_form',
              type: 'form_generation',
              description: 'Edit the form before saving',
              parameters: { formSchema, action: 'edit' },
              requiresApproval: false,
              estimatedImpact: 'low'
            }
          ],
          confidence: 0.95,
          intent: 'form_creation',
          entities: { formSchema }
        };
      } catch (error) {
        return {
          response: 'I encountered an error while generating the form. Please try rephrasing your request or being more specific about what fields you need.',
          suggestedActions: [],
          confidence: 0.5,
          intent: 'form_creation_failed',
          entities: { error: error.message }
        };
      }
    }

    // Check for workflow generation commands
    const workflowKeywords = ['create a workflow', 'set up automation', 'automate', 'workflow', 'schedule'];
    const isWorkflowRequest = workflowKeywords.some(keyword =>
      userInput.toLowerCase().includes(keyword)
    );

    if (isWorkflowRequest) {
      try {
        const workflowConfig = await this.generateWorkflowFromDescription(userInput, context.userId);

        return {
          response: `I've created a workflow automation: "${workflowConfig.name}". This workflow has ${workflowConfig.triggers.length} trigger(s) and ${workflowConfig.actions.length} action(s). Would you like me to activate it or make any changes?`,
          suggestedActions: [
            {
              id: 'activate_generated_workflow',
              type: 'workflow_creation',
              description: 'Activate this workflow automation',
              parameters: { workflowConfig, action: 'activate' },
              requiresApproval: true,
              estimatedImpact: 'medium',
              approvalReason: 'Workflows can automatically perform actions that may affect users or systems'
            },
            {
              id: 'edit_generated_workflow',
              type: 'workflow_creation',
              description: 'Edit the workflow before activation',
              parameters: { workflowConfig, action: 'edit' },
              requiresApproval: false,
              estimatedImpact: 'low'
            }
          ],
          confidence: 0.95,
          intent: 'workflow_creation',
          entities: { workflowConfig }
        };
      } catch (error) {
        return {
          response: 'I encountered an error while creating the workflow. Please try rephrasing your request or being more specific about what should trigger the workflow and what actions it should perform.',
          suggestedActions: [],
          confidence: 0.5,
          intent: 'workflow_creation_failed',
          entities: { error: error.message }
        };
      }
    }

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

      case 'create_event':
        return await this.createEvent(action.parameters, userId);

      case 'create_faq':
        return await this.createFAQ(action.parameters, userId);

      case 'update_faq':
        return await this.updateFAQ(action.parameters, userId);

      case 'create_leader':
        return await this.createLeader(action.parameters, userId);

      case 'update_leader':
        return await this.updateLeader(action.parameters, userId);

      case 'delete_content':
        return await this.deleteContent(action.parameters, userId);

      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  // Specific Action Implementations
  private async generateForm(params: any, userId: string): Promise<any> {
    const { action, formSchema } = params;

    if (action === 'save' && formSchema) {
      // Save the provided form schema
      const { data: form } = await this.supabase
        .from('forms')
        .insert({
          title: formSchema.title,
          description: formSchema.description,
          schema: formSchema,
          created_by: userId,
          is_active: false,
          ai_generated: true
        })
        .select()
        .single();

      return { formId: form.id, title: form.title, fieldCount: formSchema.fields.length };
    }

    // Fallback to description-based generation
    if (params.description) {
      const generatedSchema = await this.generateFormFromDescription(params.description, userId);

      const { data: form } = await this.supabase
        .from('forms')
        .insert({
          title: generatedSchema.title,
          description: generatedSchema.description,
          schema: generatedSchema,
          created_by: userId,
          is_active: false,
          ai_generated: true
        })
        .select()
        .single();

      return { formId: form.id, title: form.title, fieldCount: generatedSchema.fields.length };
    }

    throw new Error('Invalid form generation parameters');
  }

  private async createWorkflow(params: any, userId: string): Promise<any> {
    const { action, workflowConfig } = params;

    if (action === 'activate' && workflowConfig) {
      // Create and activate the workflow
      const { data: workflow } = await this.supabase
        .from('ai_workflows')
        .insert({
          name: workflowConfig.name,
          description: workflowConfig.description,
          trigger_conditions: workflowConfig.triggers,
          actions: workflowConfig.actions,
          created_by: userId,
          is_active: true,
          ai_generated: true
        })
        .select()
        .single();

      return { workflowId: workflow.id, name: workflow.name, triggerCount: workflowConfig.triggers.length, actionCount: workflowConfig.actions.length };
    }

    throw new Error('Invalid workflow creation parameters');
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

  private async createEvent(params: any, userId: string): Promise<any> {
    const { data: event, error } = await this.supabase
      .from('events_deadlines')
      .insert({
        title: params.title,
        type: params.type || 'meeting',
        description: params.description,
        date: params.date,
        end_date: params.endDate || null,
        location: params.location || null,
        is_virtual: params.isVirtual || false,
        capacity: params.capacity || null,
        created_by: userId
      })
      .select()
      .single();

    if (error) throw error;

    return {
      eventId: event.id,
      title: event.title,
      type: event.type,
      date: event.date
    };
  }

  private async createFAQ(params: any, userId: string): Promise<any> {
    // Get the next order index for this category
    const { data: maxOrder } = await this.supabase
      .from('faq_items')
      .select('order_index')
      .eq('category', params.category)
      .order('order_index', { ascending: false })
      .limit(1);

    const nextOrder = (maxOrder?.[0]?.order_index || 0) + 1;

    const { data: faq, error } = await this.supabase
      .from('faq_items')
      .insert({
        question: params.question,
        answer: params.answer,
        category: params.category,
        is_published: params.isPublished !== false,
        order_index: nextOrder,
        created_by: userId
      })
      .select()
      .single();

    if (error) throw error;

    return {
      faqId: faq.id,
      question: faq.question,
      category: faq.category,
      isPublished: faq.is_published
    };
  }

  private async updateFAQ(params: any, userId: string): Promise<any> {
    const { data: faq, error } = await this.supabase
      .from('faq_items')
      .update({
        question: params.question,
        answer: params.answer,
        category: params.category,
        is_published: params.isPublished !== false,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.faqId)
      .select()
      .single();

    if (error) throw error;

    return {
      faqId: faq.id,
      question: faq.question,
      updated: true
    };
  }

  private async createLeader(params: any, userId: string): Promise<any> {
    // Get the next order index
    const { data: maxOrder } = await this.supabase
      .from('leadership_profiles')
      .select('order_index')
      .order('order_index', { ascending: false })
      .limit(1);

    const nextOrder = (maxOrder?.[0]?.order_index || 0) + 1;

    const { data: leader, error } = await this.supabase
      .from('leadership_profiles')
      .insert({
        name: params.name,
        title: params.title,
        department: params.department,
        bio: params.bio,
        photo_url: params.photoUrl,
        email: params.email || null,
        linkedin_url: params.linkedinUrl || null,
        twitter_url: params.twitterUrl || null,
        website_url: params.websiteUrl || null,
        is_active: params.isActive !== false,
        order_index: nextOrder,
        created_by: userId
      })
      .select()
      .single();

    if (error) throw error;

    return {
      leaderId: leader.id,
      name: leader.name,
      title: leader.title,
      department: leader.department
    };
  }

  private async updateLeader(params: any, userId: string): Promise<any> {
    const { data: leader, error } = await this.supabase
      .from('leadership_profiles')
      .update({
        name: params.name,
        title: params.title,
        department: params.department,
        bio: params.bio,
        photo_url: params.photoUrl,
        email: params.email || null,
        linkedin_url: params.linkedinUrl || null,
        twitter_url: params.twitterUrl || null,
        website_url: params.websiteUrl || null,
        is_active: params.isActive !== false,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.leaderId)
      .select()
      .single();

    if (error) throw error;

    return {
      leaderId: leader.id,
      name: leader.name,
      updated: true
    };
  }

  private async deleteContent(params: any, userId: string): Promise<any> {
    const { contentType, contentId } = params;

    let tableName: string;
    let idField: string;

    switch (contentType) {
      case 'event':
        tableName = 'events_deadlines';
        idField = 'id';
        break;
      case 'faq':
        tableName = 'faq_items';
        idField = 'id';
        break;
      case 'leader':
        tableName = 'leadership_profiles';
        idField = 'id';
        break;
      default:
        throw new Error(`Unknown content type: ${contentType}`);
    }

    const { error } = await this.supabase
      .from(tableName)
      .delete()
      .eq(idField, contentId);

    if (error) throw error;

    return {
      contentType,
      contentId,
      deleted: true
    };
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

  // Form Generation Methods
  async generateFormFromDescription(description: string, userId: string): Promise<FormSchema> {
    const prompt = `Create a detailed form schema based on this description: "${description}"

Please return a JSON object with the following structure:
{
  "title": "Form Title",
  "description": "Brief description of the form",
  "fields": [
    {
      "id": "unique_field_id",
      "type": "text|email|number|date|select|multiselect|checkbox|textarea|file|radio",
      "label": "Field Label",
      "placeholder": "Placeholder text (optional)",
      "helpText": "Help text for users (optional)",
      "required": true/false,
      "options": ["option1", "option2"] // only for select/multiselect/radio
    }
  ]
}

Make the form logical and user-friendly. Use appropriate field types and make required fields actually required.`;

    const aiResponse = await generateChatCompletion([
      { role: 'system', content: 'You are a form design expert. Create well-structured, user-friendly forms from descriptions.' },
      { role: 'user', content: prompt }
    ]);

    try {
      const parsedSchema = JSON.parse(aiResponse);
      return {
        id: `form_${Date.now()}`,
        ...parsedSchema,
        ai_generated: true
      };
    } catch (error) {
      throw new Error('Failed to generate valid form schema from AI response');
    }
  }

  async generateWorkflowFromDescription(description: string, userId: string): Promise<WorkflowConfig> {
    const prompt = `Create a workflow configuration based on this description: "${description}"

Please return a JSON object with the following structure:
{
  "name": "Workflow Name",
  "description": "Brief description of what this workflow does",
  "triggers": [
    {
      "type": "time|event|condition",
      "config": {
        // trigger-specific configuration
        "event": "event_name" // for event triggers
        "dayOfWeek": 1, "time": "09:00" // for time triggers
        "field": "field_name", "operator": "equals", "value": "expected_value" // for condition triggers
      }
    }
  ],
  "actions": [
    {
      "type": "send_email|create_task|update_record|send_notification",
      "config": {
        // action-specific configuration
        "template": "email_template_name",
        "delay": 0, // hours
        "title": "Task title",
        "assignee": "user_role"
      }
    }
  ]
}

Make the workflow practical and efficient. Include appropriate triggers and actions based on the description.`;

    const aiResponse = await generateChatCompletion([
      { role: 'system', content: 'You are a workflow automation expert. Create efficient, practical workflows from descriptions.' },
      { role: 'user', content: prompt }
    ]);

    try {
      const parsedConfig = JSON.parse(aiResponse);
      return {
        id: `workflow_${Date.now()}`,
        ...parsedConfig,
        created_by: userId,
        ai_generated: true
      };
    } catch (error) {
      throw new Error('Failed to generate valid workflow configuration from AI response');
    }
  }

  async enhanceFormWithAI(formSchema: FormSchema, improvements: string[]): Promise<FormSchema> {
    const prompt = `Enhance this form schema with the following improvements: ${improvements.join(', ')}

Current form:
${JSON.stringify(formSchema, null, 2)}

Return an enhanced version of the form schema with the requested improvements. Keep the same structure but make the improvements you requested.`;

    const aiResponse = await generateChatCompletion([
      { role: 'system', content: 'You are a UX expert specializing in form optimization. Enhance forms to be more user-friendly and effective.' },
      { role: 'user', content: prompt }
    ]);

    try {
      const enhancedSchema = JSON.parse(aiResponse);
      return {
        ...formSchema,
        ...enhancedSchema,
        id: formSchema.id // Preserve original ID
      };
    } catch (error) {
      throw new Error('Failed to enhance form schema');
    }
  }

  async validateFormLogic(formSchema: FormSchema): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for duplicate field IDs
    const fieldIds = formSchema.fields.map(f => f.id);
    const duplicateIds = fieldIds.filter((id, index) => fieldIds.indexOf(id) !== index);
    if (duplicateIds.length > 0) {
      errors.push(`Duplicate field IDs found: ${duplicateIds.join(', ')}`);
    }

    // Check conditional logic references
    formSchema.fields.forEach(field => {
      if (field.conditionalLogic) {
        const dependsOnField = formSchema.fields.find(f => f.id === field.conditionalLogic?.dependsOn);
        if (!dependsOnField) {
          errors.push(`Field "${field.label}" references non-existent field "${field.conditionalLogic.dependsOn}" in conditional logic`);
        }
      }
    });

    // Check required fields have appropriate validation
    formSchema.fields.forEach(field => {
      if (field.required && field.type === 'select' && (!field.options || field.options.length === 0)) {
        warnings.push(`Required select field "${field.label}" has no options`);
      }
    });

    // Check for logical field ordering
    const hasConditionalFields = formSchema.fields.some(f => f.conditionalLogic);
    if (hasConditionalFields) {
      warnings.push('Form contains conditional logic - consider field ordering for better UX');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
}

// Export singleton instance
export const aiAgentService = new AIAgentService();
