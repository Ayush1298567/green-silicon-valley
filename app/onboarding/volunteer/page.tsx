"use client";

import { useState, useEffect } from "react";
import { CheckCircle, Circle, ArrowRight, ArrowLeft, BookOpen, Users, Calendar, FileText, Award, Target, MessageSquare } from "lucide-react";
import ProgressBar from "@/components/onboarding/ProgressBar";
import OnboardingStep from "@/components/onboarding/OnboardingStep";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: any;
  content: {
    overview: string;
    steps: string[];
    tips: string[];
    resources?: string[];
  };
  completed: boolean;
  required: boolean;
}

export default function VolunteerOnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [userRole, setUserRole] = useState<"volunteer" | "intern" | null>(null);

  const volunteerSteps: OnboardingStep[] = [
    {
      id: "welcome",
      title: "Welcome to Green Silicon Valley",
      description: "Get started with your volunteer journey",
      icon: Award,
      completed: false,
      required: true,
      content: {
        overview: "Welcome to Green Silicon Valley! You're joining a global community of educators and STEM enthusiasts dedicated to inspiring the next generation of scientists, engineers, and innovators.",
        steps: [
          "Complete your profile information",
          "Review our mission and values",
          "Understand your volunteer commitments",
          "Connect with your local chapter"
        ],
        tips: [
          "Take your time to read through each section",
          "Don't hesitate to reach out if you have questions",
          "Your contribution makes a real difference"
        ],
        resources: ["/about/mission", "/chapters", "/contact"]
      }
    },
    {
      id: "training",
      title: "STEM Presentation Training",
      description: "Learn the fundamentals of effective STEM education",
      icon: BookOpen,
      completed: false,
      required: true,
      content: {
        overview: "Our training program ensures you have the knowledge and skills to deliver engaging, educational STEM presentations that inspire students and meet curriculum standards.",
        steps: [
          "Complete online training modules",
          "Practice presentation delivery",
          "Learn classroom management techniques",
          "Understand age-appropriate content"
        ],
        tips: [
          "Training takes approximately 4-6 hours",
          "Practice presentations with a mentor",
          "Focus on interactive demonstrations",
          "Remember: enthusiasm is contagious!"
        ],
        resources: ["/training/modules", "/training/videos", "/mentors"]
      }
    },
    {
      id: "team",
      title: "Meet Your Team",
      description: "Connect with fellow volunteers and coordinators",
      icon: Users,
      completed: false,
      required: false,
      content: {
        overview: "Building relationships with your fellow volunteers and chapter coordinators creates a supportive community and ensures smooth collaboration on presentations and events.",
        steps: [
          "Join your local chapter meetings",
          "Connect with your department coordinator",
          "Participate in team communication channels",
          "Attend volunteer social events"
        ],
        tips: [
          "Introduce yourself in team chats",
          "Share your background and interests",
          "Ask questions about local schools and needs",
          "Building relationships takes time - be patient"
        ],
        resources: ["/chapters/local", "/team/directory", "/events/social"]
      }
    },
    {
      id: "first-presentation",
      title: "Your First Presentation",
      description: "Prepare for and deliver your inaugural STEM presentation",
      icon: FileText,
      completed: false,
      required: true,
      content: {
        overview: "Your first presentation is an exciting milestone! With proper preparation and support from your team, you'll deliver an engaging STEM experience that students will remember.",
        steps: [
          "Select a presentation topic and school",
          "Review and practice your materials",
          "Coordinate logistics with school staff",
          "Deliver your presentation with confidence",
          "Complete post-presentation feedback"
        ],
        tips: [
          "Start with topics you're passionate about",
          "Arrive early to set up equipment",
          "Engage students with questions and demos",
          "Don't worry about being perfect - be authentic"
        ],
        resources: ["/presentations/topics", "/checklists/preparation", "/feedback/forms"]
      }
    },
    {
      id: "ongoing",
      title: "Ongoing Volunteer Journey",
      description: "Continue your impact with regular volunteering",
      icon: Target,
      completed: false,
      required: false,
      content: {
        overview: "Congratulations on completing your onboarding! Your ongoing commitment to STEM education will create lasting positive change in your community and beyond.",
        steps: [
          "Maintain regular volunteering schedule",
          "Track and log your volunteer hours",
          "Provide feedback and suggestions",
          "Consider leadership opportunities",
          "Mentor new volunteers"
        ],
        tips: [
          "Consistency is key to building relationships",
          "Regular feedback helps us improve",
          "Leadership roles offer new challenges",
          "Your experience becomes invaluable to others"
        ],
        resources: ["/hours/log", "/feedback/survey", "/leadership/opportunities"]
      }
    }
  ];

  const totalSteps = volunteerSteps.length;
  const completedCount = completedSteps.size;
  const progressPercentage = (completedCount / totalSteps) * 100;

  const handleStepComplete = (stepId: string) => {
    setCompletedSteps(prev => new Set([...prev, stepId]));
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentStepData = volunteerSteps[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Volunteer Onboarding Guide
            </h1>
            <p className="text-gray-600">
              Your journey to becoming a STEM education volunteer starts here
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Overview */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Your Progress</h2>
            <span className="text-sm text-gray-600">
              {completedCount} of {totalSteps} steps completed
            </span>
          </div>

          <ProgressBar
            progress={progressPercentage}
            className="mb-4"
          />

          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Getting Started</span>
            <span>Ready to Volunteer!</span>
          </div>
        </div>

        {/* Step Navigation */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Onboarding Steps</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Step {currentStep + 1} of {totalSteps}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            {volunteerSteps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => setCurrentStep(index)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  index === currentStep
                    ? "border-blue-500 bg-blue-50"
                    : completedSteps.has(step.id)
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex flex-col items-center text-center">
                  {completedSteps.has(step.id) ? (
                    <CheckCircle className="w-6 h-6 text-green-600 mb-2" />
                  ) : index === currentStep ? (
                    <step.icon className="w-6 h-6 text-blue-600 mb-2" />
                  ) : (
                    <Circle className="w-6 h-6 text-gray-400 mb-2" />
                  )}
                  <span className={`text-xs font-medium ${
                    index === currentStep ? "text-blue-700" :
                    completedSteps.has(step.id) ? "text-green-700" : "text-gray-600"
                  }`}>
                    {step.title}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Current Step Content */}
        <OnboardingStep
          step={currentStepData}
          onComplete={() => handleStepComplete(currentStepData.id)}
          isCompleted={completedSteps.has(currentStepData.id)}
        />

        {/* Navigation */}
        <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft size={16} />
              Previous Step
            </button>

            <div className="flex items-center gap-4">
              {!completedSteps.has(currentStepData.id) && currentStepData.required && (
                <button
                  onClick={() => handleStepComplete(currentStepData.id)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Mark as Complete
                </button>
              )}

              <button
                onClick={handleNext}
                disabled={currentStep === totalSteps - 1}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next Step
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Completion Celebration */}
        {completedCount === totalSteps && (
          <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-lg p-8 mt-8 text-center text-white">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-white" />
            <h2 className="text-2xl font-bold mb-2">Congratulations!</h2>
            <p className="text-lg mb-4">
              You've completed your volunteer onboarding journey. Welcome to the Green Silicon Valley community!
            </p>
            <div className="flex justify-center gap-4">
              <a
                href="/dashboard/volunteer"
                className="px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 font-medium"
              >
                Go to Dashboard
              </a>
              <a
                href="/dashboard/volunteer/presentations"
                className="px-6 py-3 border border-white text-white rounded-lg hover:bg-white hover:bg-opacity-10 font-medium"
              >
                Find Presentations
              </a>
            </div>
          </div>
        )}

        {/* Support */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mt-8">
          <div className="flex items-start gap-3">
            <MessageSquare className="w-6 h-6 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Need Help?</h3>
              <p className="text-gray-600 mb-3">
                Our onboarding team is here to support you every step of the way.
              </p>
              <div className="flex gap-3">
                <a
                  href="/contact"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Contact Support →
                </a>
                <a
                  href="/mentors"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Find a Mentor →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
