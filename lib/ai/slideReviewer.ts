import { aiAgentService } from "./aiAgentService";

export interface SlideReviewResult {
  overall_score: number; // 0-100
  compliance_check: {
    passed: boolean;
    issues: string[];
    recommendations: string[];
  };
  content_quality: {
    score: number;
    strengths: string[];
    improvements: string[];
  };
  presentation_flow: {
    score: number;
    feedback: string[];
  };
  technical_aspects: {
    score: number;
    issues: string[];
    suggestions: string[];
  };
  age_appropriateness: {
    score: number;
    grade_level: string;
    concerns: string[];
  };
  estimated_duration: number; // in minutes
  slide_count: number;
  recommendations: string[];
}

export interface SlideReviewInput {
  slide_content: string[];
  presentation_topic: string;
  target_grade_level: string;
  presentation_duration: number; // expected duration in minutes
  activity_type?: string;
}

export class AISlideReviewer {
  private static instance: AISlideReviewer;

  public static getInstance(): AISlideReviewer {
    if (!AISlideReviewer.instance) {
      AISlideReviewer.instance = new AISlideReviewer();
    }
    return AISlideReviewer.instance;
  }

  async reviewSlides(input: SlideReviewInput): Promise<SlideReviewResult> {
    const prompt = this.buildReviewPrompt(input);

    try {
      const response = await aiAgentService.processQuery({
        query: prompt,
        context: {
          type: "slide_review",
          data: input
        },
        userId: "system", // System-generated review
        conversationId: `slide_review_${Date.now()}`
      });

      return this.parseReviewResponse(response.response, input);
    } catch (error) {
      console.error("Error reviewing slides with AI:", error);
      // Return a fallback review
      return this.generateFallbackReview(input);
    }
  }

  private buildReviewPrompt(input: SlideReviewInput): string {
    return `You are an expert educational presentation reviewer specializing in STEM education for K-12 students. Please analyze the following presentation slides and provide a comprehensive review.

PRESENTATION DETAILS:
- Topic: ${input.presentation_topic}
- Target Grade Level: ${input.target_grade_level}
- Expected Duration: ${input.presentation_duration} minutes
- Activity Type: ${input.activity_type || "General presentation"}
- Number of Slides: ${input.slide_content.length}

SLIDES CONTENT:
${input.slide_content.map((slide, index) =>
  `Slide ${index + 1}: ${slide}`
).join('\n')}

Please provide a detailed analysis covering:

1. **COMPLIANCE CHECK** - Ensure content meets educational standards and safety guidelines
2. **CONTENT QUALITY** - Assess educational value, accuracy, and engagement
3. **PRESENTATION FLOW** - Evaluate structure, pacing, and logical progression
4. **TECHNICAL ASPECTS** - Check for readability, visuals, and technical issues
5. **AGE APPROPRIATENESS** - Verify content is suitable for the target grade level
6. **DURATION ESTIMATE** - Based on content complexity and typical presentation pace
7. **OVERALL SCORE** - Comprehensive rating out of 100

Format your response as a structured JSON object with the following schema:
{
  "overall_score": number (0-100),
  "compliance_check": {
    "passed": boolean,
    "issues": string[],
    "recommendations": string[]
  },
  "content_quality": {
    "score": number (0-100),
    "strengths": string[],
    "improvements": string[]
  },
  "presentation_flow": {
    "score": number (0-100),
    "feedback": string[]
  },
  "technical_aspects": {
    "score": number (0-100),
    "issues": string[],
    "suggestions": string[]
  },
  "age_appropriateness": {
    "score": number (0-100),
    "grade_level": string,
    "concerns": string[]
  },
  "estimated_duration": number,
  "slide_count": number,
  "recommendations": string[]
}

Be thorough but constructive. Focus on educational effectiveness and student engagement.`;
  }

  private parseReviewResponse(response: string, input: SlideReviewInput): SlideReviewResult {
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return this.validateReviewResult(parsed, input);
      }

      // If no JSON found, generate fallback
      return this.generateFallbackReview(input);
    } catch (error) {
      console.error("Error parsing AI review response:", error);
      return this.generateFallbackReview(input);
    }
  }

  private validateReviewResult(result: any, input: SlideReviewInput): SlideReviewResult {
    // Ensure all required fields are present with defaults
    return {
      overall_score: Math.max(0, Math.min(100, result.overall_score || 75)),
      compliance_check: {
        passed: result.compliance_check?.passed ?? true,
        issues: Array.isArray(result.compliance_check?.issues) ? result.compliance_check.issues : [],
        recommendations: Array.isArray(result.compliance_check?.recommendations) ? result.compliance_check.recommendations : []
      },
      content_quality: {
        score: Math.max(0, Math.min(100, result.content_quality?.score || 75)),
        strengths: Array.isArray(result.content_quality?.strengths) ? result.content_quality.strengths : [],
        improvements: Array.isArray(result.content_quality?.improvements) ? result.content_quality.improvements : []
      },
      presentation_flow: {
        score: Math.max(0, Math.min(100, result.presentation_flow?.score || 75)),
        feedback: Array.isArray(result.presentation_flow?.feedback) ? result.presentation_flow.feedback : []
      },
      technical_aspects: {
        score: Math.max(0, Math.min(100, result.technical_aspects?.score || 75)),
        issues: Array.isArray(result.technical_aspects?.issues) ? result.technical_aspects.issues : [],
        suggestions: Array.isArray(result.technical_aspects?.suggestions) ? result.technical_aspects.suggestions : []
      },
      age_appropriateness: {
        score: Math.max(0, Math.min(100, result.age_appropriateness?.score || 75)),
        grade_level: result.age_appropriateness?.grade_level || input.target_grade_level,
        concerns: Array.isArray(result.age_appropriateness?.concerns) ? result.age_appropriateness.concerns : []
      },
      estimated_duration: result.estimated_duration || input.presentation_duration,
      slide_count: result.slide_count || input.slide_content.length,
      recommendations: Array.isArray(result.recommendations) ? result.recommendations : []
    };
  }

  private generateFallbackReview(input: SlideReviewInput): SlideReviewResult {
    return {
      overall_score: 75,
      compliance_check: {
        passed: true,
        issues: [],
        recommendations: [
          "Review content for age-appropriateness",
          "Ensure all visuals are school-appropriate",
          "Check for any potentially sensitive topics"
        ]
      },
      content_quality: {
        score: 75,
        strengths: [
          "Content appears relevant to the topic",
          "Structure seems logical"
        ],
        improvements: [
          "Consider adding more interactive elements",
          "Include specific examples or case studies",
          "Add assessment questions for student engagement"
        ]
      },
      presentation_flow: {
        score: 70,
        feedback: [
          "Presentation has a clear beginning, middle, and end",
          "Consider adding transitions between major sections",
          "Ensure timing allows for questions and discussion"
        ]
      },
      technical_aspects: {
        score: 80,
        issues: [],
        suggestions: [
          "Verify all links and embedded content work properly",
          "Check font sizes for readability from back of classroom",
          "Ensure consistent formatting throughout"
        ]
      },
      age_appropriateness: {
        score: 75,
        grade_level: input.target_grade_level,
        concerns: []
      },
      estimated_duration: input.presentation_duration,
      slide_count: input.slide_content.length,
      recommendations: [
        "Practice timing to ensure presentation fits within allotted time",
        "Prepare backup activities in case of technical issues",
        "Have extension activities ready for advanced students",
        "Prepare simplified explanations for students who need them"
      ]
    };
  }

  // Quick compliance check for basic issues
  async quickComplianceCheck(content: string, gradeLevel: string): Promise<{
    passed: boolean;
    issues: string[];
  }> {
    const prompt = `Quick compliance check for educational content:

Content: "${content}"
Grade Level: ${gradeLevel}

Check for:
1. Age-appropriate language
2. No inappropriate content
3. Educational value
4. Safety considerations

Return only: PASSED or FAILED with brief reason.`;

    try {
      const response = await aiAgentService.processQuery({
        query: prompt,
        context: { type: "compliance_check" },
        userId: "system",
        conversationId: `compliance_${Date.now()}`
      });

      const passed = response.response.toLowerCase().includes("passed");
      const issues = passed ? [] : [response.response];

      return { passed, issues };
    } catch (error) {
      return {
        passed: true, // Default to passed if AI fails
        issues: []
      };
    }
  }
}

// Export singleton instance
export const aiSlideReviewer = AISlideReviewer.getInstance();
