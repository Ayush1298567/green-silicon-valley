"use client";

import { CheckCircle2, Circle, Clock } from "lucide-react";

interface ProgressCardProps {
  currentStep: string;
  steps: Array<{ id: string; name: string }>;
}

export default function ProgressCard({ currentStep, steps }: ProgressCardProps) {
  const getStepStatus = (stepId: string) => {
    const currentIndex = steps.findIndex(s => s.id === currentStep);
    const stepIndex = steps.findIndex(s => s.id === stepId);
    
    if (stepIndex < currentIndex) return "completed";
    if (stepIndex === currentIndex) return "current";
    return "pending";
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case "current":
        return <Clock className="w-5 h-5 text-blue-600" />;
      default:
        return <Circle className="w-5 h-5 text-gray-300" />;
    }
  };

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-gsv-charcoal mb-4">Onboarding Progress</h3>
      <div className="space-y-3">
        {steps.map((step, index) => {
          const status = getStepStatus(step.id);
          return (
            <div
              key={step.id}
              className={`flex items-center gap-3 p-3 rounded-lg ${
                status === "current" ? "bg-blue-50 border border-blue-200" : ""
              }`}
            >
              {getStepIcon(status)}
              <div className="flex-1">
                <div className={`text-sm font-medium ${
                  status === "completed" ? "text-green-700" :
                  status === "current" ? "text-blue-700" :
                  "text-gray-500"
                }`}>
                  {step.name}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

