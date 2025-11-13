"use client";

import { CheckCircle2, Circle, Clock } from "lucide-react";

interface Step {
  id: string;
  name: string;
  status: "completed" | "current" | "pending";
}

interface OnboardingProgressBarProps {
  steps: Step[];
  currentStep: string;
}

export default function OnboardingProgressBar({
  steps,
  currentStep,
}: OnboardingProgressBarProps) {
  const getStepStatus = (stepId: string, index: number) => {
    const currentIndex = steps.findIndex((s) => s.id === currentStep);
    if (index < currentIndex) return "completed";
    if (index === currentIndex) return "current";
    return "pending";
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        {steps.map((step, index) => {
          const status = getStepStatus(step.id, index);
          const isLast = index === steps.length - 1;

          return (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                    status === "completed"
                      ? "bg-gsv-green border-gsv-green text-white"
                      : status === "current"
                      ? "bg-gsv-green/20 border-gsv-green text-gsv-green"
                      : "bg-gray-100 border-gray-300 text-gray-400"
                  }`}
                >
                  {status === "completed" ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : status === "current" ? (
                    <Clock className="w-5 h-5" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </div>
                <div className="mt-2 text-center">
                  <div
                    className={`text-xs font-medium ${
                      status === "completed"
                        ? "text-gsv-green"
                        : status === "current"
                        ? "text-gsv-green"
                        : "text-gray-400"
                    }`}
                  >
                    {step.name}
                  </div>
                </div>
              </div>
              {!isLast && (
                <div
                  className={`h-1 flex-1 mx-2 -mt-5 ${
                    status === "completed" ? "bg-gsv-green" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

