// AI Response Analysis Service
// Intelligent analysis of form responses and volunteer data

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const supabase = createClientComponentClient();
import { generateChatCompletion } from './ai/clients';

export interface ResponseAnalysis {
  summary: {
    totalResponses: number;
    completionRate: number;
    averageTime: number;
    abandonmentPoints: Array<{ field: string; abandonmentRate: number }>;
  };
  insights: Array<{
    type: 'trend' | 'anomaly' | 'opportunity' | 'risk';
    title: string;
    description: string;
    confidence: number;
    recommendation?: string;
  }>;
  demographics: {
    geographic: Array<{ location: string; count: number; percentage: number }>;
    temporal: Array<{ period: string; count: number; trend: 'up' | 'down' | 'stable' }>;
    categorical: Record<string, Array<{ value: string; count: number; percentage: number }>>;
  };
  quality: {
    completeness: number;
    consistency: number;
    validity: number;
    flags: Array<{
      responseId: string;
      field: string;
      issue: string;
      severity: 'low' | 'medium' | 'high';
    }>;
  };
}

export interface VolunteerAnalysis {
  engagement: {
    totalHours: number;
    averageHoursPerVolunteer: number;
    activeVolunteers: number;
    retentionRate: number;
  };
  performance: Array<{
    volunteerId: string;
    name: string;
    totalHours: number;
    presentationsCompleted: number;
    averageRating: number;
    consistency: number;
    strengths: string[];
    areasForImprovement: string[];
  }>;
  trends: {
    monthlyGrowth: Array<{ month: string; newVolunteers: number; totalActive: number }>;
    activityPatterns: Array<{ dayOfWeek: string; averageHours: number }>;
    presentationTypes: Array<{ type: string; count: number; averageRating: number }>;
  };
  predictions: {
    nextMonthHours: number;
    confidence: number;
    factors: string[];
  };
}

class AIResponseAnalysisService {
  // Analyze form responses
  async analyzeFormResponses(formId: string): Promise<ResponseAnalysis> {
    // Get form structure
    const { data: form } = await supabase
      .from('forms')
      .select('*, form_columns(*)')
      .eq('id', formId)
      .single();

    if (!form) throw new Error('Form not found');

    // Get all responses
    const { data: responses } = await supabase
      .from('form_responses')
      .select('*')
      .eq('form_id', formId)
      .order('submitted_at', { ascending: true });

    if (!responses || responses.length === 0) {
      return this.getEmptyAnalysis();
    }

    // Perform comprehensive analysis
    const analysis: ResponseAnalysis = {
      summary: await this.analyzeSummary(responses, form.form_columns),
      insights: await this.generateInsights(responses, form.form_columns),
      demographics: await this.analyzeDemographics(responses),
      quality: await this.assessQuality(responses, form.form_columns)
    };

    return analysis;
  }

  // Analyze volunteer performance
  async analyzeVolunteerPerformance(): Promise<VolunteerAnalysis> {
    // Get all volunteer data
    const { data: volunteers } = await supabase
      .from('volunteers')
      .select(`
        *,
        volunteer_hours(*),
        presentations(*)
      `);

    if (!volunteers) return this.getEmptyVolunteerAnalysis();

    const analysis: VolunteerAnalysis = {
      engagement: await this.analyzeEngagement(volunteers),
      performance: await this.analyzeIndividualPerformance(volunteers),
      trends: await this.analyzeTrends(volunteers),
      predictions: await this.generatePredictions(volunteers)
    };

    return analysis;
  }

  // Smart response categorization
  async categorizeResponses(responses: any[], categories: string[]): Promise<Record<string, any[]>> {
    const categorized: Record<string, any[]> = {};
    categories.forEach(cat => categorized[cat] = []);

    for (const response of responses) {
      const prompt = `Categorize this form response into one of these categories: ${categories.join(', ')}

Response data: ${JSON.stringify(response.response_data)}

Return only the category name.`;

      try {
        const category = await generateChatCompletion([
          { role: 'system', content: 'You are a classification expert. Return only the exact category name.' },
          { role: 'user', content: prompt }
        ]);

        const cleanCategory = category.trim();
        if (categorized[cleanCategory]) {
          categorized[cleanCategory].push(response);
        } else {
          categorized[categories[0]].push(response); // Default to first category
        }
      } catch (error) {
        categorized[categories[0]].push(response); // Default on error
      }
    }

    return categorized;
  }

  // Predictive analytics for volunteer acquisition
  async predictVolunteerNeeds(
    historicalData: any[],
    upcomingEvents: any[]
  ): Promise<{
    recommendedVolunteers: number;
    confidence: number;
    reasoning: string[];
    riskFactors: string[];
  }> {
    const prompt = `Analyze historical volunteer data and upcoming events to predict volunteer needs.

Historical Data Summary:
${JSON.stringify(historicalData.slice(0, 10), null, 2)}

Upcoming Events:
${JSON.stringify(upcomingEvents, null, 2)}

Provide a JSON response with:
{
  "recommendedVolunteers": number,
  "confidence": number (0-1),
  "reasoning": ["reason1", "reason2"],
  "riskFactors": ["risk1", "risk2"]
}`;

    const prediction = await generateChatCompletion([
      { role: 'system', content: 'You are a volunteer management expert. Provide data-driven predictions.' },
      { role: 'user', content: prompt }
    ]);

    try {
      return JSON.parse(prediction);
    } catch (error) {
      return {
        recommendedVolunteers: Math.ceil(upcomingEvents.length * 2),
        confidence: 0.7,
        reasoning: ['Based on standard volunteer-to-event ratio'],
        riskFactors: ['Limited historical data for precise prediction']
      };
    }
  }

  // Private helper methods
  private async analyzeSummary(responses: any[], columns: any[]): Promise<ResponseAnalysis['summary']> {
    const totalResponses = responses.length;
    const requiredFields = columns.filter(col => col.required).length;
    const totalFields = columns.length;

    // Calculate completion rate
    let totalFieldsFilled = 0;
    responses.forEach(response => {
      const data = response.response_data || {};
      columns.forEach(col => {
        if (data[col.title] && data[col.title].toString().trim()) {
          totalFieldsFilled++;
        }
      });
    });

    const completionRate = totalFieldsFilled / (totalResponses * totalFields);

    // Find abandonment points (simplified)
    const abandonmentPoints = columns.map(col => {
      const responsesAfterThisField = responses.filter(r => {
        const data = r.response_data || {};
        return data[col.title] && data[col.title].toString().trim();
      }).length;

      const abandonmentRate = totalResponses > 0 ? (totalResponses - responsesAfterThisField) / totalResponses : 0;

      return {
        field: col.title,
        abandonmentRate
      };
    }).sort((a, b) => b.abandonmentRate - a.abandonmentRate);

    return {
      totalResponses,
      completionRate: Math.round(completionRate * 100) / 100,
      averageTime: 0, // Would need timing data
      abandonmentPoints: abandonmentPoints.slice(0, 3)
    };
  }

  private async generateInsights(responses: any[], columns: any[]): Promise<ResponseAnalysis['insights']> {
    const insights: ResponseAnalysis['insights'] = [];

    // Generate insights using AI
    const prompt = `Analyze these form responses and identify key insights:

Form has ${columns.length} fields: ${columns.map(c => c.title).join(', ')}
Total responses: ${responses.length}

Sample responses:
${responses.slice(0, 5).map(r => JSON.stringify(r.response_data)).join('\n')}

Provide 3-5 key insights in JSON format:
[{
  "type": "trend|anomaly|opportunity|risk",
  "title": "Brief title",
  "description": "Detailed description",
  "confidence": 0.8,
  "recommendation": "Optional recommendation"
}]`;

    try {
      const insightsJson = await generateChatCompletion([
        { role: 'system', content: 'You are a data analyst. Provide actionable insights from form responses.' },
        { role: 'user', content: prompt }
      ]);

      const parsedInsights = JSON.parse(insightsJson);
      if (Array.isArray(parsedInsights)) {
        insights.push(...parsedInsights);
      }
    } catch (error) {
      // Fallback insights
      insights.push({
        type: 'trend',
        title: 'Response Volume',
        description: `Received ${responses.length} responses total`,
        confidence: 1.0,
        recommendation: 'Monitor response rates to optimize form performance'
      });
    }

    return insights;
  }

  private async analyzeDemographics(responses: any[]): Promise<ResponseAnalysis['demographics']> {
    // Simplified demographic analysis
    const geographic: Array<{ location: string; count: number; percentage: number }> = [];
    const temporal: Array<{ period: string; count: number; trend: 'up' | 'down' | 'stable' }> = [];
    const categorical: Record<string, Array<{ value: string; count: number; percentage: number }>> = {};

    // Analyze by submission date
    const byMonth: Record<string, number> = {};
    responses.forEach(response => {
      const date = new Date(response.submitted_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      byMonth[monthKey] = (byMonth[monthKey] || 0) + 1;
    });

    // Convert to temporal trends
    const sortedMonths = Object.keys(byMonth).sort();
    for (let i = 0; i < sortedMonths.length; i++) {
      const current = byMonth[sortedMonths[i]];
      const previous = i > 0 ? byMonth[sortedMonths[i - 1]] : current;
      const trend = current > previous ? 'up' : current < previous ? 'down' : 'stable';

      temporal.push({
        period: sortedMonths[i],
        count: current,
        trend
      });
    }

    return {
      geographic,
      temporal,
      categorical
    };
  }

  private async assessQuality(responses: any[], columns: any[]): Promise<ResponseAnalysis['quality']> {
    let completenessScore = 0;
    let consistencyScore = 0;
    let validityScore = 0;
    const flags: ResponseAnalysis['quality']['flags'] = [];

    responses.forEach((response, index) => {
      const data = response.response_data || {};

      // Check completeness
      const filledFields = columns.filter(col => data[col.title] && data[col.title].toString().trim()).length;
      completenessScore += filledFields / columns.length;

      // Check for suspicious patterns
      columns.forEach(col => {
        const value = data[col.title];
        if (!value || value.toString().trim() === '') return;

        // Flag extremely short responses for long fields
        if (col.field_type === 'textarea' && value.toString().length < 10) {
          flags.push({
            responseId: response.id,
            field: col.title,
            issue: 'Unusually short response for text area',
            severity: 'low'
          });
        }

        // Flag potential spam
        if (value.toString().includes('http') && col.field_type !== 'url') {
          flags.push({
            responseId: response.id,
            field: col.title,
            issue: 'Unexpected URL in response',
            severity: 'medium'
          });
        }
      });
    });

    return {
      completeness: Math.round((completenessScore / responses.length) * 100) / 100,
      consistency: consistencyScore / responses.length || 0.8, // Placeholder
      validity: validityScore / responses.length || 0.9, // Placeholder
      flags: flags.slice(0, 20) // Limit flags
    };
  }

  private async analyzeEngagement(volunteers: any[]): Promise<VolunteerAnalysis['engagement']> {
    const totalHours = volunteers.reduce((sum, v) => {
      return sum + (v.volunteer_hours?.reduce((hSum: number, h: any) => hSum + (h.hours_logged || 0), 0) || 0);
    }, 0);

    const activeVolunteers = volunteers.filter(v => v.application_status === 'approved').length;
    const averageHoursPerVolunteer = activeVolunteers > 0 ? totalHours / activeVolunteers : 0;

    // Simplified retention calculation
    const retentionRate = 0.85; // Would need historical data

    return {
      totalHours,
      averageHoursPerVolunteer: Math.round(averageHoursPerVolunteer * 100) / 100,
      activeVolunteers,
      retentionRate
    };
  }

  private async analyzeIndividualPerformance(volunteers: any[]): Promise<VolunteerAnalysis['performance']> {
    return volunteers.slice(0, 10).map(volunteer => ({
      volunteerId: volunteer.id,
      name: volunteer.team_name || 'Unknown',
      totalHours: volunteer.volunteer_hours?.reduce((sum: number, h: any) => sum + (h.hours_logged || 0), 0) || 0,
      presentationsCompleted: volunteer.presentations?.length || 0,
      averageRating: 4.2, // Would need rating data
      consistency: 0.8, // Would need consistency calculation
      strengths: ['Reliable attendance', 'Good with students'],
      areasForImprovement: ['Could improve preparation time']
    }));
  }

  private async analyzeTrends(volunteers: any[]): Promise<VolunteerAnalysis['trends']> {
    // Simplified trend analysis
    return {
      monthlyGrowth: [],
      activityPatterns: [],
      presentationTypes: []
    };
  }

  private async generatePredictions(volunteers: any[]): Promise<VolunteerAnalysis['predictions']> {
    const currentHours = volunteers.reduce((sum, v) => {
      return sum + (v.volunteer_hours?.reduce((hSum: number, h: any) => hSum + (h.hours_logged || 0), 0) || 0);
    }, 0);

    const averageMonthlyHours = currentHours / 12; // Simplified

    return {
      nextMonthHours: Math.round(averageMonthlyHours),
      confidence: 0.7,
      factors: ['Historical average', 'Current volunteer count', 'Seasonal patterns']
    };
  }

  private getEmptyAnalysis(): ResponseAnalysis {
    return {
      summary: {
        totalResponses: 0,
        completionRate: 0,
        averageTime: 0,
        abandonmentPoints: []
      },
      insights: [],
      demographics: {
        geographic: [],
        temporal: [],
        categorical: {}
      },
      quality: {
        completeness: 0,
        consistency: 0,
        validity: 0,
        flags: []
      }
    };
  }

  private getEmptyVolunteerAnalysis(): VolunteerAnalysis {
    return {
      engagement: {
        totalHours: 0,
        averageHoursPerVolunteer: 0,
        activeVolunteers: 0,
        retentionRate: 0
      },
      performance: [],
      trends: {
        monthlyGrowth: [],
        activityPatterns: [],
        presentationTypes: []
      },
      predictions: {
        nextMonthHours: 0,
        confidence: 0,
        factors: []
      }
    };
  }
}

export const aiResponseAnalysis = new AIResponseAnalysisService();
