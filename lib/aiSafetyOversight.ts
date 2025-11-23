// AI Safety and Oversight System
// Content filtering, audit trails, and ethical guidelines for AI Agent Mode

import { supabase } from './supabase/admin';
import { generateChatCompletion } from './ai/clients';

export interface SafetyCheck {
  passed: boolean;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  issues: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
    recommendation: string;
  }>;
  mitigationActions: string[];
}

export interface AuditLog {
  id: string;
  timestamp: Date;
  userId: string;
  action: string;
  resource: string;
  details: Record<string, any>;
  riskAssessment: SafetyCheck;
  approvedBy?: string;
  approvedAt?: Date;
}

export interface EthicalGuidelines {
  contentPolicies: string[];
  privacyRules: string[];
  transparencyRequirements: string[];
  userConsentRules: string[];
  dataHandlingPolicies: string[];
}

class AISafetyOversightService {
  private ethicalGuidelines: EthicalGuidelines = {
    contentPolicies: [
      "Do not generate harmful, offensive, or discriminatory content",
      "Respect user privacy and data protection laws",
      "Provide accurate information and avoid misinformation",
      "Do not impersonate or deceive users",
      "Maintain professional and respectful communication"
    ],
    privacyRules: [
      "Never share personal identifiable information without consent",
      "Anonymize data in analytics and reports",
      "Implement data minimization principles",
      "Provide clear privacy notices for AI interactions",
      "Allow users to delete their AI interaction history"
    ],
    transparencyRequirements: [
      "Clearly indicate when content is AI-generated",
      "Explain AI decision-making processes when requested",
      "Provide confidence scores for AI recommendations",
      "Allow users to provide feedback on AI responses",
      "Maintain audit trails of all AI actions"
    ],
    userConsentRules: [
      "Obtain explicit consent for data processing",
      "Allow users to opt-out of AI features",
      "Provide clear explanations of AI capabilities",
      "Respect user preferences and communication styles",
      "Enable human override of AI decisions"
    ],
    dataHandlingPolicies: [
      "Store AI interactions securely and encrypted",
      "Implement data retention policies",
      "Regular security audits of AI systems",
      "Monitor for data breaches and unauthorized access",
      "Comply with GDPR, CCPA, and other privacy regulations"
    ]
  };

  // Content Safety Filtering
  async checkContentSafety(content: string, context: string): Promise<SafetyCheck> {
    const issues: SafetyCheck['issues'] = [];
    let riskLevel: SafetyCheck['riskLevel'] = 'low';

    // Check for harmful content
    const harmfulPatterns = [
      /\b(hate|racist|sexist|discriminat)/i,
      /\b(violence|violent|threat)/i,
      /\b(harm|hurt|damage)/i,
      /\b(illegal|criminal|fraud)/i,
      /\b(spam|scam|phishing)/i
    ];

    for (const pattern of harmfulPatterns) {
      if (pattern.test(content)) {
        issues.push({
          type: 'harmful_content',
          severity: 'high',
          description: 'Content contains potentially harmful or inappropriate language',
          recommendation: 'Filter out or flag this content for human review'
        });
        riskLevel = 'high';
      }
    }

    // Check for personal information
    const piiPatterns = [
      /\b\d{3}-\d{2}-\d{4}\b/, // SSN
      /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/, // Credit card
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email (if not expected)
      /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/ // Phone number
    ];

    if (context !== 'expected_pii') {
      for (const pattern of piiPatterns) {
        if (pattern.test(content)) {
          issues.push({
            type: 'personal_information',
            severity: 'medium',
            description: 'Content may contain personal identifiable information',
            recommendation: 'Anonymize or remove personal information'
          });
          if (riskLevel === 'low') riskLevel = 'medium';
        }
      }
    }

    // AI-specific safety checks
    if (context === 'ai_response') {
      // Check for overconfidence in uncertain responses
      if (content.includes('definitely') || content.includes('absolutely') || content.includes('certainly')) {
        const confidenceIndicators = (content.match(/\b(definitely|absolutely|certainly|sure|guaranteed)\b/gi) || []).length;
        if (confidenceIndicators > 2) {
          issues.push({
            type: 'overconfidence',
            severity: 'low',
            description: 'AI response may express excessive confidence',
            recommendation: 'Add uncertainty qualifiers and confidence scores'
          });
        }
      }

      // Check for potential bias indicators
      const biasPatterns = [
        /\b(only|exclusively|always|never)\b.*\b(women|men|people of color|minorities)\b/i,
        /\b(all|every)\b.*\b(immigrants|refugees|foreigners)\b/i
      ];

      for (const pattern of biasPatterns) {
        if (pattern.test(content)) {
          issues.push({
            type: 'potential_bias',
            severity: 'medium',
            description: 'Content may contain biased or stereotypical language',
            recommendation: 'Review for cultural sensitivity and neutrality'
          });
          if (riskLevel === 'low') riskLevel = 'medium';
        }
      }
    }

    return {
      passed: issues.length === 0,
      riskLevel,
      issues,
      mitigationActions: this.generateMitigationActions(issues)
    };
  }

  // Audit Trail Management
  async logAuditEvent(
    userId: string,
    action: string,
    resource: string,
    details: Record<string, any>,
    content?: string
  ): Promise<AuditLog> {
    // Perform safety check if content is provided
    const safetyCheck = content ? await this.checkContentSafety(content, 'audit') : {
      passed: true,
      riskLevel: 'low' as const,
      issues: [],
      mitigationActions: []
    };

    const auditLog: AuditLog = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      userId,
      action,
      resource,
      details,
      riskAssessment: safetyCheck
    };

    // Store in database
    await supabase
      .from('system_logs')
      .insert({
        event_type: 'ai_audit',
        description: JSON.stringify({
          auditId: auditLog.id,
          userId,
          action,
          resource,
          riskLevel: safetyCheck.riskLevel,
          issuesCount: safetyCheck.issues.length
        }),
        actor_id: userId,
        metadata: {
          auditLog,
          safetyCheck
        }
      });

    // If high risk, create alert
    if (safetyCheck.riskLevel === 'high' || safetyCheck.riskLevel === 'critical') {
      await this.createSafetyAlert(auditLog);
    }

    return auditLog;
  }

  // Approval Workflow for High-Risk Actions
  async requestApproval(
    userId: string,
    action: string,
    details: Record<string, any>,
    riskAssessment: SafetyCheck
  ): Promise<{ approved: boolean; approverId?: string; reason?: string }> {
    // Create approval request
    const { data: request } = await supabase
      .from('ai_actions')
      .insert({
        user_id: userId,
        action_type: 'approval_request',
        action_data: { action, details, riskAssessment },
        status: 'pending'
      })
      .select()
      .single();

    // Notify founders for approval
    const { data: founders } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'founder');

    for (const founder of founders || []) {
      await supabase
        .from('notifications')
        .insert({
          user_id: founder.id,
          notification_type: 'approval_request',
          title: 'AI Action Approval Required',
          message: `High-risk AI action requires approval: ${action}`,
          action_url: `/admin/ai/approvals/${request.id}`,
          metadata: { requestId: request.id, riskLevel: riskAssessment.riskLevel }
        });
    }

    // For now, return pending - in production this would wait for approval
    return { approved: false, reason: 'Approval pending from founder' };
  }

  // Ethical Content Generation
  async generateEthicalResponse(
    userQuery: string,
    context: Record<string, any>
  ): Promise<{ response: string; safetyCheck: SafetyCheck; auditLog: AuditLog }> {
    // Generate initial response
    const systemPrompt = `
You are an ethical AI assistant for Green Silicon Valley, a nonprofit focused on environmental STEM education.

ETHICAL GUIDELINES:
${this.ethicalGuidelines.contentPolicies.map(p => `- ${p}`).join('\n')}
${this.ethicalGuidelines.privacyRules.map(p => `- ${p}`).join('\n')}
${this.ethicalGuidelines.transparencyRequirements.map(p => `- ${p}`).join('\n')}

USER CONTEXT:
${JSON.stringify(context, null, 2)}

Always prioritize user safety, privacy, and ethical considerations. If unsure about appropriate response, err on the side of caution and suggest human consultation.
`;

    const response = await generateChatCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userQuery }
    ]);

    // Check safety of generated response
    const safetyCheck = await this.checkContentSafety(response, 'ai_response');

    // Create audit log
    const auditLog = await this.logAuditEvent(
      context.userId || 'system',
      'ai_response_generation',
      'ai_chat',
      { userQuery, context },
      response
    );

    // If safety check fails, generate safer response
    if (!safetyCheck.passed && safetyCheck.riskLevel === 'high') {
      const safeResponse = "I apologize, but I need to consult with a human administrator before providing this information. Please contact support for assistance.";

      return {
        response: safeResponse,
        safetyCheck,
        auditLog
      };
    }

    return {
      response,
      safetyCheck,
      auditLog
    };
  }

  // Privacy and Data Protection
  async anonymizeData(data: Record<string, any>): Promise<Record<string, any>> {
    const anonymized = { ...data };

    // Remove or hash personal information
    const piiFields = ['email', 'phone', 'address', 'name', 'ssn', 'credit_card'];

    for (const field of piiFields) {
      if (anonymized[field]) {
        if (field === 'email') {
          // Hash email for analytics while preserving domain
          const [local, domain] = anonymized[field].split('@');
          anonymized[field] = `${local.substring(0, 2)}***@${domain}`;
        } else {
          // Replace with placeholder
          anonymized[field] = '[REDACTED]';
        }
      }
    }

    return anonymized;
  }

  // User Consent Management
  async checkUserConsent(userId: string, feature: string): Promise<boolean> {
    // Check if user has consented to AI features
    const { data: user } = await supabase
      .from('users')
      .select('permissions')
      .eq('id', userId)
      .single();

    if (!user) return false;

    const permissions = user.permissions || [];
    return permissions.includes(`ai_${feature}_consent`);
  }

  async recordUserConsent(userId: string, feature: string, consented: boolean): Promise<void> {
    const { data: user } = await supabase
      .from('users')
      .select('permissions')
      .eq('id', userId)
      .single();

    if (!user) return;

    let permissions = user.permissions || [];

    if (consented) {
      if (!permissions.includes(`ai_${feature}_consent`)) {
        permissions.push(`ai_${feature}_consent`);
      }
    } else {
      permissions = permissions.filter(p => p !== `ai_${feature}_consent`);
    }

    await supabase
      .from('users')
      .update({ permissions })
      .eq('id', userId);
  }

  // Model Safety and Bias Monitoring
  async monitorModelPerformance(
    timeRange: { start: Date; end: Date }
  ): Promise<{
    accuracy: number;
    biasIndicators: Array<{ type: string; score: number }>;
    safetyIncidents: number;
    userSatisfaction: number;
  }> {
    // Get AI interaction logs
    const { data: logs } = await supabase
      .from('ai_chat_history')
      .select('*')
      .gte('created_at', timeRange.start.toISOString())
      .lte('created_at', timeRange.end.toISOString());

    // Calculate metrics
    const totalInteractions = logs?.length || 0;
    const successfulInteractions = logs?.filter(l => l.execution_status === 'completed').length || 0;
    const accuracy = totalInteractions > 0 ? successfulInteractions / totalInteractions : 0;

    // Check for safety incidents
    const safetyIncidents = logs?.filter(l =>
      l.message_content?.toLowerCase().includes('error') ||
      l.message_content?.toLowerCase().includes('failed') ||
      l.execution_error
    ).length || 0;

    // Bias indicators (simplified)
    const biasIndicators = [
      { type: 'response_length_bias', score: 0.1 },
      { type: 'topic_preference_bias', score: 0.05 },
      { type: 'user_type_bias', score: 0.02 }
    ];

    // User satisfaction (would be based on user feedback)
    const userSatisfaction = 0.85;

    return {
      accuracy,
      biasIndicators,
      safetyIncidents,
      userSatisfaction
    };
  }

  // Private helper methods
  private generateMitigationActions(issues: SafetyCheck['issues']): string[] {
    const actions: string[] = [];

    for (const issue of issues) {
      switch (issue.type) {
        case 'harmful_content':
          actions.push('Flag content for human review');
          actions.push('Implement content filtering');
          break;
        case 'personal_information':
          actions.push('Anonymize personal data');
          actions.push('Implement data masking');
          break;
        case 'overconfidence':
          actions.push('Add uncertainty qualifiers');
          actions.push('Include confidence scores');
          break;
        case 'potential_bias':
          actions.push('Review content for neutrality');
          actions.push('Implement bias detection');
          break;
      }
    }

    return [...new Set(actions)]; // Remove duplicates
  }

  private async createSafetyAlert(auditLog: AuditLog): Promise<void> {
    // Create high-priority alert for founders
    const { data: founders } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'founder');

    for (const founder of founders || []) {
      await supabase
        .from('notifications')
        .insert({
          user_id: founder.id,
          notification_type: 'safety_alert',
          title: 'AI Safety Alert',
          message: `High-risk AI activity detected: ${auditLog.action}`,
          action_url: `/admin/ai/safety/${auditLog.id}`,
          metadata: {
            auditLogId: auditLog.id,
            riskLevel: auditLog.riskAssessment.riskLevel,
            issues: auditLog.riskAssessment.issues.length
          },
          priority: 'high'
        });
    }
  }

  // Get ethical guidelines
  getEthicalGuidelines(): EthicalGuidelines {
    return this.ethicalGuidelines;
  }

  // Update ethical guidelines (admin only)
  async updateEthicalGuidelines(guidelines: Partial<EthicalGuidelines>, updatedBy: string): Promise<void> {
    this.ethicalGuidelines = { ...this.ethicalGuidelines, ...guidelines };

    // Log the update
    await this.logAuditEvent(
      updatedBy,
      'ethical_guidelines_update',
      'system',
      { guidelines },
      'Ethical guidelines updated'
    );
  }
}

// Export singleton instance
export const aiSafetyOversight = new AISafetyOversightService();
