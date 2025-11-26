"use client";

import { CheckCircle, Clock, AlertTriangle, ExternalLink, Play, Book, Users } from "lucide-react";

interface OnboardingStepProps {
  step: {
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
  };
  onComplete: () => void;
  isCompleted: boolean;
}

export default function OnboardingStep({ step, onComplete, isCompleted }: OnboardingStepProps) {
  const IconComponent = step.icon;

  return (
    <div className="bg-white rounded-lg shadow-sm p-8">
      {/* Step Header */}
      <div className="flex items-start gap-4 mb-6">
        <div className={`p-3 rounded-lg ${isCompleted ? "bg-green-100" : "bg-blue-100"}`}>
          {isCompleted ? (
            <CheckCircle className="w-8 h-8 text-green-600" />
          ) : (
            <IconComponent className="w-8 h-8 text-blue-600" />
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold text-gray-900">{step.title}</h2>
            {step.required && (
              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">
                Required
              </span>
            )}
          </div>

          <p className="text-gray-600 text-lg">{step.description}</p>

          {isCompleted && (
            <div className="flex items-center gap-2 mt-3 text-green-700">
              <CheckCircle size={16} />
              <span className="text-sm font-medium">Completed</span>
            </div>
          )}
        </div>
      </div>

      {/* Step Content */}
      <div className="space-y-6">
        {/* Overview */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Overview</h3>
          <p className="text-gray-700 leading-relaxed">{step.content.overview}</p>
        </div>

        {/* Steps */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">What You'll Do</h3>
          <div className="space-y-3">
            {step.content.steps.map((stepText, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-xs font-semibold text-blue-600">{index + 1}</span>
                </div>
                <p className="text-gray-700">{stepText}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-blue-900">Pro Tips</h3>
          </div>
          <ul className="space-y-2">
            {step.content.tips.map((tip, index) => (
              <li key={index} className="flex items-start gap-2 text-blue-800">
                <span className="text-blue-600 mt-1">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Resources */}
        {step.content.resources && step.content.resources.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Helpful Resources</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {step.content.resources.map((resource, index) => (
                <a
                  key={index}
                  href={resource}
                  className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ExternalLink className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-700">{resource.replace("/", "").replace("-", " ")}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {!isCompleted && (
          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <button
              onClick={onComplete}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
            >
              <CheckCircle size={16} />
              Mark as Complete
            </button>

            {step.id === "training" && (
              <a
                href="/training"
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                <Play size={16} />
                Start Training
              </a>
            )}

            {step.id === "team" && (
              <a
                href="/team"
                className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
              >
                <Users size={16} />
                Meet the Team
              </a>
            )}
          </div>
        )}

        {/* Completion Message */}
        {isCompleted && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <h4 className="font-medium text-green-900">Step Completed!</h4>
                <p className="text-green-700 text-sm">Great job! You've successfully completed this onboarding step.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
