"use client";

import { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react';

// Import the FormField and FormSchema types from FormBuilder
type FormField = {
  id: string;
  type: 'text' | 'email' | 'number' | 'date' | 'select' | 'multiselect' | 'checkbox' | 'textarea' | 'file' | 'radio';
  label: string;
  placeholder?: string;
  helpText?: string;
  required: boolean;
  options?: string[];
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    customMessage?: string;
  };
  conditionalLogic?: {
    dependsOn: string;
    condition: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than';
    value: any;
  };
};

type FormSchema = {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
};

interface DynamicFormRendererProps {
  schema: FormSchema;
  onSubmit: (data: Record<string, any>) => void | Promise<void>;
  onSaveProgress?: (data: Record<string, any>) => void | Promise<void>;
  initialData?: Record<string, any>;
  isSubmitting?: boolean;
  className?: string;
  showSaveProgress?: boolean;
}

// Generate Zod schema from FormSchema
function generateZodSchema(fields: FormField[]): z.ZodObject<any> {
  const schema: Record<string, z.ZodType<any>> = {};

  fields.forEach(field => {
    let fieldSchema: z.ZodType<any>;

    // Base schema based on field type
    switch (field.type) {
      case 'text':
      case 'textarea':
        fieldSchema = z.string();
        break;
      case 'email':
        fieldSchema = z.string().email('Please enter a valid email address');
        break;
      case 'number':
        fieldSchema = z.number();
        break;
      case 'date':
        fieldSchema = z.string();
        break;
      case 'select':
      case 'radio':
        fieldSchema = z.string();
        break;
      case 'multiselect':
        fieldSchema = z.array(z.string());
        break;
      case 'checkbox':
        fieldSchema = z.boolean();
        break;
      case 'file':
        fieldSchema = z.any(); // Files are handled separately
        break;
      default:
        fieldSchema = z.string();
    }

    // Add validation rules
    if (field.validation) {
      if (field.validation.minLength && (fieldSchema as any).min) {
        fieldSchema = (fieldSchema as any).min(field.validation.minLength, `Minimum ${field.validation.minLength} characters required`);
      }
      if (field.validation.maxLength && (fieldSchema as any).max) {
        fieldSchema = (fieldSchema as any).max(field.validation.maxLength, `Maximum ${field.validation.maxLength} characters allowed`);
      }
      if (field.validation.pattern && fieldSchema instanceof z.ZodString) {
        fieldSchema = fieldSchema.regex(new RegExp(field.validation.pattern), field.validation.customMessage || 'Invalid format');
      }
    }

    // Make required if needed
    if (!field.required) {
      if (field.type === 'multiselect') {
        fieldSchema = fieldSchema.optional();
      } else {
        fieldSchema = fieldSchema.optional();
      }
    }

    schema[field.id] = fieldSchema;
  });

  return z.object(schema);
}

export default function DynamicFormRenderer({
  schema,
  onSubmit,
  onSaveProgress,
  initialData = {},
  isSubmitting = false,
  className = "",
  showSaveProgress = true
}: DynamicFormRendererProps) {
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File[]>>({});
  const [visibleFields, setVisibleFields] = useState<Set<string>>(new Set(schema.fields.map(f => f.id)));
  const [progressSaved, setProgressSaved] = useState(false);

  // Generate Zod schema for validation
  const validationSchema = generateZodSchema(schema.fields);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isDirty },
    reset
  } = useForm({
    resolver: zodResolver(validationSchema),
    defaultValues: initialData,
  });

  const watchedValues = watch();

  // Handle conditional logic
  useEffect(() => {
    const newVisibleFields = new Set<string>();

    schema.fields.forEach(field => {
      if (!field.conditionalLogic) {
        newVisibleFields.add(field.id);
        return;
      }

      const { dependsOn, condition, value } = field.conditionalLogic;
      const dependentValue = watchedValues[dependsOn];

      if (dependentValue === undefined || dependentValue === null) {
        return;
      }

      let showField = false;

      switch (condition) {
        case 'equals':
          showField = dependentValue === value;
          break;
        case 'not_equals':
          showField = dependentValue !== value;
          break;
        case 'contains':
          showField = Array.isArray(dependentValue)
            ? dependentValue.includes(value)
            : String(dependentValue).includes(String(value));
          break;
        case 'not_contains':
          showField = Array.isArray(dependentValue)
            ? !dependentValue.includes(value)
            : !String(dependentValue).includes(String(value));
          break;
        case 'greater_than':
          showField = Number(dependentValue) > Number(value);
          break;
        case 'less_than':
          showField = Number(dependentValue) < Number(value);
          break;
      }

      if (showField) {
        newVisibleFields.add(field.id);
      }
    });

    setVisibleFields(newVisibleFields);
  }, [watchedValues, schema.fields]);

  // Auto-save progress
  useEffect(() => {
    if (isDirty && onSaveProgress && showSaveProgress) {
      const timeoutId = setTimeout(async () => {
        try {
          await onSaveProgress(watchedValues);
          setProgressSaved(true);
          setTimeout(() => setProgressSaved(false), 2000);
        } catch (error) {
          console.error('Failed to save progress:', error);
        }
      }, 2000);

      return () => clearTimeout(timeoutId);
    }
  }, [watchedValues, isDirty, onSaveProgress, showSaveProgress]);

  const handleFileUpload = useCallback((fieldId: string, files: FileList | null) => {
    if (files) {
      const fileArray = Array.from(files);
      setUploadedFiles(prev => ({ ...prev, [fieldId]: fileArray }));
      setValue(fieldId, fileArray);
    }
  }, [setValue]);

  const removeFile = useCallback((fieldId: string, fileIndex: number) => {
    setUploadedFiles(prev => {
      const newFiles = { ...prev };
      if (newFiles[fieldId]) {
        newFiles[fieldId] = newFiles[fieldId].filter((_, index) => index !== fileIndex);
        setValue(fieldId, newFiles[fieldId]);
      }
      return newFiles;
    });
  }, [setValue]);

  const onFormSubmit = async (data: Record<string, any>) => {
    // Include uploaded files in submission
    const submissionData = { ...data, ...uploadedFiles };
    await onSubmit(submissionData);
  };

  const renderField = (field: FormField) => {
    if (!visibleFields.has(field.id)) {
      return null;
    }

    const fieldError = errors[field.id]?.message as string;
    const isRequired = field.required;

    return (
      <div key={field.id} className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {field.label}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </label>

        {/* Text Input */}
        {field.type === 'text' && (
          <input
            {...register(field.id)}
            type="text"
            placeholder={field.placeholder}
            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              fieldError ? 'border-red-300' : 'border-gray-300'
            }`}
          />
        )}

        {/* Email Input */}
        {field.type === 'email' && (
          <input
            {...register(field.id)}
            type="email"
            placeholder={field.placeholder}
            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              fieldError ? 'border-red-300' : 'border-gray-300'
            }`}
          />
        )}

        {/* Number Input */}
        {field.type === 'number' && (
          <input
            {...register(field.id, { valueAsNumber: true })}
            type="number"
            placeholder={field.placeholder}
            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              fieldError ? 'border-red-300' : 'border-gray-300'
            }`}
          />
        )}

        {/* Date Input */}
        {field.type === 'date' && (
          <input
            {...register(field.id)}
            type="date"
            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              fieldError ? 'border-red-300' : 'border-gray-300'
            }`}
          />
        )}

        {/* Textarea */}
        {field.type === 'textarea' && (
          <textarea
            {...register(field.id)}
            rows={4}
            placeholder={field.placeholder}
            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              fieldError ? 'border-red-300' : 'border-gray-300'
            }`}
          />
        )}

        {/* Select Dropdown */}
        {field.type === 'select' && (
          <select
            {...register(field.id)}
            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              fieldError ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value="">Select an option</option>
            {field.options?.map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
        )}

        {/* Multi-Select */}
        {field.type === 'multiselect' && (
          <Controller
            name={field.id}
            control={control}
            render={({ field: controllerField }) => (
              <div className="space-y-2">
                {field.options?.map((option, index) => (
                  <label key={index} className="flex items-center">
                    <input
                      type="checkbox"
                      value={option}
                      checked={controllerField.value?.includes(option) || false}
                      onChange={(e) => {
                        const currentValues = controllerField.value || [];
                        if (e.target.checked) {
                          controllerField.onChange([...currentValues, option]);
                        } else {
                          controllerField.onChange(currentValues.filter((v: string) => v !== option));
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            )}
          />
        )}

        {/* Radio Buttons */}
        {field.type === 'radio' && (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <label key={index} className="flex items-center">
                <input
                  {...register(field.id)}
                  type="radio"
                  value={option}
                  className="border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        )}

        {/* Checkbox */}
        {field.type === 'checkbox' && (
          <div className="flex items-center">
            <input
              {...register(field.id)}
              type="checkbox"
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">{field.label}</span>
          </div>
        )}

        {/* File Upload */}
        {field.type === 'file' && (
          <div className="space-y-3">
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-4 text-gray-500" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
                </div>
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFileUpload(field.id, e.target.files)}
                  accept=".png,.jpg,.jpeg,.pdf,.doc,.docx"
                />
              </label>
            </div>

            {/* Uploaded Files Preview */}
            {uploadedFiles[field.id]?.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  <span className="text-sm text-gray-700">{file.name}</span>
                  <span className="text-xs text-gray-500 ml-2">
                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(field.id, index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Error Message */}
        {fieldError && (
          <div className="flex items-center mt-1">
            <AlertCircle className="w-4 h-4 text-red-500 mr-1" />
            <span className="text-sm text-red-600">{fieldError}</span>
          </div>
        )}

        {/* Help Text */}
        {field.helpText && !fieldError && (
          <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>
        )}
      </div>
    );
  };

  return (
    <div className={`max-w-2xl mx-auto ${className}`}>
      {/* Progress Saved Indicator */}
      {progressSaved && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center">
          <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
          <span className="text-sm text-green-800">Progress saved automatically</span>
        </div>
      )}

      {/* Form Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{schema.title}</h1>
        {schema.description && (
          <p className="text-gray-600">{schema.description}</p>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        {schema.fields.map(renderField)}

        {/* Submit Button */}
        <div className="flex gap-4 pt-6 border-t border-gray-200">
          {showSaveProgress && onSaveProgress && (
            <button
              type="button"
              onClick={() => onSaveProgress(watchedValues)}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Save Progress
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Form'}
          </button>
        </div>
      </form>
    </div>
  );
}
