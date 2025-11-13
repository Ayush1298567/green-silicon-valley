"use client";
import { useState } from "react";
import { AlertCircle, CheckCircle } from "lucide-react";

interface FormInputProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  success?: string;
  helpText?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  multiline?: boolean;
  rows?: number;
  disabled?: boolean;
}

export default function FormInput({
  label,
  name,
  type = "text",
  placeholder,
  required = false,
  error,
  success,
  helpText,
  value,
  onChange,
  multiline = false,
  rows = 4,
  disabled = false
}: FormInputProps) {
  const [focused, setFocused] = useState(false);

  const inputClasses = `input ${error ? "border-red-500 focus:ring-red-500" : success ? "border-green-500 focus:ring-green-500" : ""} ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}`;

  return (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-sm font-medium text-gsv-charcoal">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {multiline ? (
        <textarea
          id={name}
          name={name}
          placeholder={placeholder}
          required={required}
          value={value}
          onChange={onChange}
          rows={rows}
          disabled={disabled}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`${inputClasses} resize-none`}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          required={required}
          value={value}
          onChange={onChange}
          disabled={disabled}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={inputClasses}
        />
      )}

      {/* Help Text */}
      {helpText && !error && !success && (
        <p className="text-xs text-gsv-gray">{helpText}</p>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-2 text-red-600 text-sm fade-in">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="flex items-start gap-2 text-green-600 text-sm fade-in">
          <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}
    </div>
  );
}

