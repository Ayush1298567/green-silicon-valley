"use client";

import { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className = ""
}: EmptyStateProps) {
  return (
    <div className={`text-center py-12 ${className}`}>
      {icon && <div className="mb-4 flex justify-center">{icon}</div>}
      <h3 className="text-lg font-semibold text-gsv-charcoal mb-2">{title}</h3>
      {description && <p className="text-gsv-gray mb-4">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

