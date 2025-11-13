// AI-Powered Founder Assistant Service
// Provides intelligent analysis and recommendations using Ollama

import { runAIQuery } from './aiClient';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export interface StuckGroupAnalysis {
  groupId: string;
  groupName: string;
  riskLevel: 'low' | 'medium' | 'high' | 'urgent';
  issues: string[];
  lastActivity: string;
  daysStuck: number;
  recommendations: string[];
  priority: number;
}

export interface SchedulingRecommendation {
  timeSlot: string;
  date: string;
  school: string;
  confidence: number;
  reasoning: string[];
  expectedAttendance: number;
  alternatives: string[];
}

export interface GroupRecommendation {
  type: 'resource' | 'action' | 'milestone' | 'communication';
  title: string;
  description: string;
  url?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  relevance: number;
}

export interface PerformanceInsight {
  category: 'success_factors' | 'failure_points' | 'best_practices' | 'improvements';
  title: string;
  description: string;
  impact: number; // -1 to 1, where 1 is most positive impact
  confidence: number;
  evidence: string[];
  recommendations: string[];
}

export interface CompletionPrediction {
  estimatedCompletion: string; // ISO date string
  confidence: number;
  riskFactors: string[];
  successProbability: number;
  milestones: {
    name: string;
    estimatedDate: string;
    confidence: number;
  }[];
}

class AIService {
  private supabase = createClientComponentClient();
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  // Cache management
  private getCacheKey(type: string, params: any): string {
    return `${type}:${JSON.stringify(params)}`;
  }

  private getCached<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setCache<T>(key: string, data: T, ttlMinutes: number = 30): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMinutes * 60 * 1000
    });
  }

  // Stuck Groups Analysis
  async analyzeStuckGroups(): Promise<StuckGroupAnalysis[]> {
    const cacheKey = this.getCacheKey('stuck_groups', {});
    const cached = this.getCached<StuckGroupAnalysis[]>(cacheKey);
    if (cached) return cached;

    try {
      // Fetch group data with progress metrics
      const { data: groups } = await this.supabase
        .from('volunteers')
        .select(`
          id,
          team_name,
          status,
          created_at,
          group_milestones(
            milestone_name,
            milestone_type,
            is_completed,
            completed_at,
            updated_at,
            due_date,
            progress_percentage
          ),
          group_checklist_items(
            item_name,
            is_completed,
            updated_at,
            due_date
          )
        `)
        .eq('status', 'active');

      if (!groups) return [];

      const analysis = await Promise.all(
        groups.map(async (group) => {
          const milestones = group.group_milestones || [];
          const checklistItems = group.group_checklist_items || [];

          const completedMilestones = milestones.filter((m: any) => m.is_completed).length;
          const totalMilestones = milestones.length;
          const progressPercentage = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

          const lastActivity = Math.max(
            ...milestones.map((m: any) => new Date(m.updated_at || m.completed_at || 0).getTime()),
            ...checklistItems.map((c: any) => new Date(c.updated_at || 0).getTime()),
            new Date(group.created_at).getTime()
          );

          const daysSinceActivity = Math.floor((Date.now() - lastActivity) / (1000 * 60 * 60 * 24));
          const daysStuck = daysSinceActivity;

          // AI analysis for this group
          const prompt = `
Analyze this volunteer group and determine if they need attention:

Group: ${group.team_name || `Team ${group.id.substring(0, 8)}`}
Progress: ${progressPercentage.toFixed(1)}% (${completedMilestones}/${totalMilestones} milestones)
Days since last activity: ${daysSinceActivity}
Status: ${group.status}

Recent milestones:
${milestones.slice(-3).map((m: any) => `- ${m.milestone_name}: ${m.is_completed ? 'Completed' : 'Pending'}${m.due_date ? ` (Due: ${new Date(m.due_date).toLocaleDateString()})` : ''}`).join('\n')}

Return a JSON object with:
{
  "needsAttention": boolean,
  "riskLevel": "low|medium|high|urgent",
  "issues": ["list of specific issues"],
  "recommendations": ["specific actions to take"],
  "priority": number (1-10, 10 being highest)
}
`;

          try {
            const aiResponse = await runAIQuery(prompt, { temperature: 0.1, maxTokens: 500 });
            const aiData = JSON.parse(aiResponse);

            if (aiData.needsAttention) {
              return {
                groupId: group.id,
                groupName: group.team_name || `Team ${group.id.substring(0, 8)}`,
                riskLevel: aiData.riskLevel,
                issues: aiData.issues,
                lastActivity: new Date(lastActivity).toISOString(),
                daysStuck,
                recommendations: aiData.recommendations,
                priority: aiData.priority
              };
            }
          } catch (error) {
            console.error('AI analysis failed for group:', group.id, error);
          }

          return null;
        })
      );

      const result = analysis.filter(Boolean).sort((a, b) => (b?.priority || 0) - (a?.priority || 0));
      this.setCache(cacheKey, result, 15); // Cache for 15 minutes
      return result;

    } catch (error) {
      console.error('Error analyzing stuck groups:', error);
      return [];
    }
  }

  // Smart Scheduling Recommendations
  async generateSchedulingRecommendations(groupId?: string): Promise<SchedulingRecommendation[]> {
    const cacheKey = this.getCacheKey('scheduling', { groupId });
    const cached = this.getCached<SchedulingRecommendation[]>(cacheKey);
    if (cached) return cached;

    try {
      // Fetch scheduling data
      const { data: schools } = await this.supabase
        .from('schools')
        .select('*');

      const { data: presentations } = await this.supabase
        .from('presentations')
        .select('scheduled_date, school_id')
        .not('scheduled_date', 'is', null);

      const { data: group } = groupId ? await this.supabase
        .from('volunteers')
        .select('id, team_name')
        .eq('id', groupId)
        .single() : { data: null };

      const prompt = `
Based on historical presentation data, recommend optimal scheduling times:

Available schools:
${schools?.map(s => `- ${s.name}: ${s.location || 'Location TBD'}`).join('\n') || 'No schools available'}

Recent presentations (last 30 days):
${presentations?.slice(-10).map(p => `- ${new Date(p.scheduled_date).toLocaleDateString()}`).join('\n') || 'No recent presentations'}

${group ? `Scheduling for group: ${group.team_name || 'Team ' + group.id.substring(0, 8)}` : 'General scheduling recommendations'}

Consider:
- Avoid scheduling conflicts with existing presentations
- Consider school availability and optimal presentation times
- Account for volunteer preferences and travel time
- Balance load across schools and time slots

Return 3 recommended time slots in JSON format:
[{
  "timeSlot": "9:00 AM - 11:00 AM",
  "date": "2025-01-15",
  "school": "School Name",
  "confidence": 0.85,
  "reasoning": ["Reason 1", "Reason 2"],
  "expectedAttendance": 45,
  "alternatives": ["Alternative 1", "Alternative 2"]
}]
`;

      const aiResponse = await runAIQuery(prompt, { temperature: 0.2, maxTokens: 800 });
      const recommendations = JSON.parse(aiResponse);

      this.setCache(cacheKey, recommendations, 60); // Cache for 1 hour
      return recommendations;

    } catch (error) {
      console.error('Error generating scheduling recommendations:', error);
      return [];
    }
  }

  // Group-Specific Recommendations
  async createGroupRecommendations(groupId: string): Promise<GroupRecommendation[]> {
    const cacheKey = this.getCacheKey('recommendations', { groupId });
    const cached = this.getCached<GroupRecommendation[]>(cacheKey);
    if (cached) return cached;

    try {
      // Fetch group data
      const { data: group } = await this.supabase
        .from('volunteers')
        .select(`
          id,
          team_name,
          status,
          group_milestones(
            milestone_name,
            milestone_type,
            is_completed,
            description,
            due_date
          ),
          group_checklist_items(
            item_name,
            item_category,
            is_completed,
            due_date,
            help_resources
          )
        `)
        .eq('id', groupId)
        .single();

      if (!group) return [];

      const incompleteMilestones = group.group_milestones?.filter((m: any) => !m.is_completed) || [];
      const incompleteItems = group.group_checklist_items?.filter((i: any) => !i.is_completed) || [];

      const prompt = `
Analyze this volunteer group and provide personalized recommendations:

Group: ${group.team_name || `Team ${group.id.substring(0, 8)}`}
Status: ${group.status}

Incomplete Milestones:
${incompleteMilestones.map((m: any) => `- ${m.milestone_name}: ${m.description || 'No description'}`).join('\n')}

Incomplete Checklist Items:
${incompleteItems.map((i: any) => `- ${i.item_name} (${i.item_category})`).join('\n')}

Available Resources:
- Presentation templates
- Activity guides
- Founder office hours
- Peer examples
- Video tutorials

Based on their current status and incomplete items, recommend 3-5 specific actions they should take next.

Return in JSON format:
[{
  "type": "resource|action|milestone|communication",
  "title": "Brief title",
  "description": "Detailed explanation",
  "url": "optional link",
  "priority": "low|medium|high|urgent",
  "relevance": 0.9
}]
`;

      const aiResponse = await runAIQuery(prompt, { temperature: 0.3, maxTokens: 600 });
      const recommendations = JSON.parse(aiResponse);

      this.setCache(cacheKey, recommendations, 30); // Cache for 30 minutes
      return recommendations;

    } catch (error) {
      console.error('Error creating group recommendations:', error);
      return [];
    }
  }

  // Performance Insights Analysis
  async analyzePerformance(): Promise<PerformanceInsight[]> {
    const cacheKey = this.getCacheKey('performance', {});
    const cached = this.getCached<PerformanceInsight[]>(cacheKey);
    if (cached) return cached;

    try {
      // Fetch performance data
      const { data: successfulGroups } = await this.supabase
        .from('volunteers')
        .select(`
          id,
          team_name,
          hours_total,
          presentations_completed,
          group_milestones(
            milestone_name,
            milestone_type,
            is_completed,
            completed_at,
            created_at
          )
        `)
        .eq('status', 'completed')
        .limit(10);

      const { data: strugglingGroups } = await this.supabase
        .from('volunteers')
        .select(`
          id,
          team_name,
          hours_total,
          presentations_completed,
          group_milestones(
            milestone_name,
            milestone_type,
            is_completed,
            completed_at,
            created_at
          )
        `)
        .in('status', ['stuck', 'onboarding'])
        .limit(10);

      const prompt = `
Analyze successful vs. struggling volunteer groups to identify performance insights:

Successful Groups (${successfulGroups?.length || 0}):
${successfulGroups?.map(g => `- ${g.team_name}: ${g.presentations_completed} presentations, ${g.hours_total || 0} hours, ${g.group_milestones?.filter((m: any) => m.is_completed).length}/${g.group_milestones?.length} milestones`).join('\n') || 'No data'}

Struggling Groups (${strugglingGroups?.length || 0}):
${strugglingGroups?.map(g => `- ${g.team_name}: ${g.presentations_completed} presentations, ${g.hours_total || 0} hours, ${g.group_milestones?.filter((m: any) => m.is_completed).length}/${g.group_milestones?.length} milestones`).join('\n') || 'No data'}

Identify patterns and provide insights about:
1. What successful groups do differently
2. Common failure points to avoid
3. Best practices that lead to success
4. Specific improvements to implement

Return 4-6 key insights in JSON format:
[{
  "category": "success_factors|failure_points|best_practices|improvements",
  "title": "Insight title",
  "description": "Detailed explanation",
  "impact": 0.8,
  "confidence": 0.9,
  "evidence": ["Evidence point 1", "Evidence point 2"],
  "recommendations": ["Action 1", "Action 2"]
}]
`;

      const aiResponse = await runAIQuery(prompt, { temperature: 0.1, maxTokens: 1000 });
      const insights = JSON.parse(aiResponse);

      this.setCache(cacheKey, insights, 120); // Cache for 2 hours
      return insights;

    } catch (error) {
      console.error('Error analyzing performance:', error);
      return [];
    }
  }

  // Predictive Analytics for Completion
  async predictCompletion(groupId: string): Promise<CompletionPrediction> {
    const cacheKey = this.getCacheKey('prediction', { groupId });
    const cached = this.getCached<CompletionPrediction>(cacheKey);
    if (cached) return cached;

    try {
      // Fetch group progress data
      const { data: group } = await this.supabase
        .from('volunteers')
        .select(`
          id,
          team_name,
          status,
          created_at,
          hours_total,
          presentations_completed,
          group_milestones(
            milestone_name,
            milestone_type,
            is_completed,
            completed_at,
            created_at,
            due_date,
            progress_percentage
          ),
          group_checklist_items(
            item_name,
            is_completed,
            completed_at,
            created_at
          )
        `)
        .eq('id', groupId)
        .single();

      if (!group) throw new Error('Group not found');

      // Fetch historical completion data for comparison
      const { data: similarGroups } = await this.supabase
        .from('volunteers')
        .select(`
          id,
          hours_total,
          presentations_completed,
          group_milestones(is_completed, completed_at, created_at)
        `)
        .eq('status', 'completed')
        .limit(20);

      const currentMilestones = group.group_milestones || [];
      const completedCount = currentMilestones.filter((m: any) => m.is_completed).length;
      const totalCount = currentMilestones.length;
      const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

      const daysActive = Math.floor((Date.now() - new Date(group.created_at).getTime()) / (1000 * 60 * 60 * 24));

      const prompt = `
Predict completion time for this volunteer group:

Group: ${group.team_name || `Team ${group.id.substring(0, 8)}`}
Progress: ${progressPercentage.toFixed(1)}% (${completedCount}/${totalCount} milestones completed)
Days active: ${daysActive}
Presentations completed: ${group.presentations_completed || 0}
Hours logged: ${group.hours_total || 0}

Historical completion data from similar groups:
${similarGroups?.map(g => {
  const milestones = g.group_milestones || [];
  const completed = milestones.filter((m: any) => m.is_completed).length;
  const total = milestones.length;
  const progress = total > 0 ? (completed / total) * 100 : 0;
  return `${progress.toFixed(0)}% progress took ~${Math.floor((new Date(g.group_milestones?.[g.group_milestones?.length - 1]?.completed_at || Date.now()).getTime() - new Date(g.created_at).getTime()) / (1000 * 60 * 60 * 24))} days`;
}).join(', ') || 'Limited historical data'}

Analyze patterns and predict:
1. Estimated completion date
2. Confidence level (0-1)
3. Risk factors that could delay completion
4. Success probability
5. Timeline for remaining milestones

Return prediction in JSON format:
{
  "estimatedCompletion": "2025-02-15T00:00:00Z",
  "confidence": 0.75,
  "riskFactors": ["Risk 1", "Risk 2"],
  "successProbability": 0.8,
  "milestones": [
    {
      "name": "Milestone name",
      "estimatedDate": "2025-01-20T00:00:00Z",
      "confidence": 0.8
    }
  ]
}
`;

      const aiResponse = await runAIQuery(prompt, { temperature: 0.1, maxTokens: 800 });
      const prediction = JSON.parse(aiResponse);

      this.setCache(cacheKey, prediction, 60); // Cache for 1 hour
      return prediction;

    } catch (error) {
      console.error('Error predicting completion:', error);
      return {
        estimatedCompletion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        confidence: 0.5,
        riskFactors: ['Unable to analyze group progress'],
        successProbability: 0.5,
        milestones: []
      };
    }
  }
}

// Export singleton instance
export const aiService = new AIService();
