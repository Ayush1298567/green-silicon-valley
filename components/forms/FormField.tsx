"use client";

import { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string | null;
  helpText?: string;
  children: ReactNode;
  className?: string;
}

export default function FormField({
  label,
  required = false,
  error,
  helpText,
  children,
  className = ""
}: FormFieldProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gsv-charcoal">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
      {helpText && !error && (
        <p className="text-xs text-gsv-gray">{helpText}</p>
      )}
    </div>
  );
}

