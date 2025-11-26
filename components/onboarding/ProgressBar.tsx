"use client";

interface ProgressBarProps {
  progress: number; // 0-100
  className?: string;
  showPercentage?: boolean;
  color?: "blue" | "green" | "purple" | "orange";
  animated?: boolean;
}

export default function ProgressBar({
  progress,
  className = "",
  showPercentage = true,
  color = "blue",
  animated = true
}: ProgressBarProps) {
  const colorClasses = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    purple: "bg-purple-500",
    orange: "bg-orange-500"
  };

  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">Progress</span>
        {showPercentage && (
          <span className="text-sm text-gray-600">{Math.round(clampedProgress)}%</span>
        )}
      </div>

      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full ${colorClasses[color]} transition-all duration-500 ease-out rounded-full ${
            animated ? "animate-pulse" : ""
          }`}
          style={{
            width: `${clampedProgress}%`,
            transition: animated ? "width 0.5s ease-out" : "none"
          }}
        />
      </div>

      {/* Milestones */}
      <div className="flex justify-between mt-2">
        {[0, 25, 50, 75, 100].map((milestone) => (
          <div key={milestone} className="flex flex-col items-center">
            <div
              className={`w-2 h-2 rounded-full ${
                clampedProgress >= milestone ? colorClasses[color] : "bg-gray-300"
              }`}
            />
            <span className="text-xs text-gray-500 mt-1">{milestone}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
