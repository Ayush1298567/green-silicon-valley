"use client";

import { useState, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Plus,
  Trash2,
  GripVertical,
  Settings,
  Eye,
  Save,
  Type,
  Mail,
  Hash,
  Calendar,
  List,
  CheckSquare,
  Upload,
  ToggleLeft,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

export interface FormField {
  id: string;
  type: 'text' | 'email' | 'number' | 'date' | 'select' | 'multiselect' | 'checkbox' | 'textarea' | 'file' | 'radio';
  label: string;
  placeholder?: string;
  helpText?: string;
  required: boolean;
  options?: string[]; // For select, multiselect, radio
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    customMessage?: string;
  };
  conditionalLogic?: {
    dependsOn: string; // field id
    condition: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than';
    value: any;
  };
}

export interface FormSchema {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
}

interface FormBuilderProps {
  schema: FormSchema;
  onChange: (schema: FormSchema) => void;
  onSave?: () => void;
  className?: string;
}

const FIELD_TYPES = [
  { type: 'text' as const, label: 'Text Input', icon: Type, description: 'Single line text input' },
  { type: 'email' as const, label: 'Email', icon: Mail, description: 'Email address input' },
  { type: 'number' as const, label: 'Number', icon: Hash, description: 'Numeric input' },
  { type: 'date' as const, label: 'Date', icon: Calendar, description: 'Date picker' },
  { type: 'textarea' as const, label: 'Text Area', icon: Type, description: 'Multi-line text input' },
  { type: 'select' as const, label: 'Dropdown', icon: List, description: 'Single selection dropdown' },
  { type: 'multiselect' as const, label: 'Multi-Select', icon: List, description: 'Multiple selection dropdown' },
  { type: 'checkbox' as const, label: 'Checkbox', icon: CheckSquare, description: 'Yes/no checkbox' },
  { type: 'radio' as const, label: 'Radio Buttons', icon: ToggleLeft, description: 'Single choice from options' },
  { type: 'file' as const, label: 'File Upload', icon: Upload, description: 'File attachment' },
];

export default function FormBuilder({ schema, onChange, onSave, className = "" }: FormBuilderProps) {
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const addField = useCallback((type: FormField['type']) => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      type,
      label: `New ${type} field`,
      placeholder: '',
      helpText: '',
      required: false,
      options: type === 'select' || type === 'multiselect' || type === 'radio' ? ['Option 1', 'Option 2'] : undefined,
    };

    const updatedSchema = {
      ...schema,
      fields: [...schema.fields, newField],
    };

    onChange(updatedSchema);
    setSelectedFieldId(newField.id);
  }, [schema, onChange]);

  const updateField = useCallback((fieldId: string, updates: Partial<FormField>) => {
    const updatedSchema = {
      ...schema,
      fields: schema.fields.map(field =>
        field.id === fieldId ? { ...field, ...updates } : field
      ),
    };
    onChange(updatedSchema);
  }, [schema, onChange]);

  const deleteField = useCallback((fieldId: string) => {
    const updatedSchema = {
      ...schema,
      fields: schema.fields.filter(field => field.id !== fieldId),
    };
    onChange(updatedSchema);
    if (selectedFieldId === fieldId) {
      setSelectedFieldId(null);
    }
  }, [schema, onChange, selectedFieldId]);

  const moveField = useCallback((fromIndex: number, toIndex: number) => {
    const updatedSchema = {
      ...schema,
      fields: arrayMove(schema.fields, fromIndex, toIndex),
    };
    onChange(updatedSchema);
  }, [schema, onChange]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = schema.fields.findIndex(field => field.id === active.id);
      const newIndex = schema.fields.findIndex(field => field.id === over.id);

      moveField(oldIndex, newIndex);
    }
  };

  const selectedField = selectedFieldId ? schema.fields.find(f => f.id === selectedFieldId) : null;

  return (
    <div className={`flex h-full ${className}`}>
      {/* Form Builder Canvas */}
      <div className="flex-1 bg-white border-r border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-200 p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{schema.title}</h2>
              {schema.description && (
                <p className="text-sm text-gray-600">{schema.description}</p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isPreviewMode
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Eye className="w-4 h-4 inline mr-1" />
                {isPreviewMode ? 'Edit' : 'Preview'}
              </button>
              {onSave && (
                <button
                  onClick={onSave}
                  className="px-3 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
                >
                  <Save className="w-4 h-4 inline mr-1" />
                  Save Form
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="p-6 overflow-y-auto h-full">
          {isPreviewMode ? (
            <FormPreview schema={schema} />
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={schema.fields.map(f => f.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-4">
                  {schema.fields.map((field, index) => (
                    <SortableField
                      key={field.id}
                      field={field}
                      index={index}
                      isSelected={selectedFieldId === field.id}
                      onSelect={() => setSelectedFieldId(field.id)}
                      onDelete={() => deleteField(field.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}

          {!isPreviewMode && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => addField('text')}
                className="w-full py-3 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-800 transition-colors"
              >
                <Plus className="w-5 h-5 inline mr-2" />
                Add New Field
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Field Configuration Panel */}
      {!isPreviewMode && (
        <div className="w-80 bg-gray-50 border-l border-gray-200 overflow-y-auto">
          {selectedField ? (
            <FieldConfigurationPanel
              field={selectedField}
              allFields={schema.fields}
              onUpdate={(updates) => updateField(selectedField.id, updates)}
            />
          ) : (
            <div className="p-6 text-center text-gray-500">
              <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Select a field to configure its properties</p>
            </div>
          )}

          {/* Field Type Palette */}
          <div className="p-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Field Types</h3>
            <div className="grid grid-cols-2 gap-2">
              {FIELD_TYPES.map(({ type, label, icon: Icon }) => (
                <button
                  key={type}
                  onClick={() => addField(type)}
                  className="p-3 text-left bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  <Icon className="w-4 h-4 mb-1 text-gray-600" />
                  <div className="text-xs font-medium text-gray-900">{label}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Sortable Field Component
interface SortableFieldProps {
  field: FormField;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

function SortableField({ field, isSelected, onSelect, onDelete }: SortableFieldProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border rounded-lg p-4 cursor-pointer transition-all ${
        isSelected
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 hover:border-gray-300 bg-white'
      } ${isDragging ? 'opacity-50' : ''}`}
      onClick={onSelect}
    >
      <div className="flex items-center gap-3">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab hover:bg-gray-100 p-1 rounded"
        >
          <GripVertical className="w-4 h-4 text-gray-400" />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900">{field.label}</span>
            {field.required && <span className="text-red-500">*</span>}
          </div>
          <div className="text-sm text-gray-600">
            {FIELD_TYPES.find(t => t.type === field.type)?.label}
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// Field Configuration Panel
interface FieldConfigurationPanelProps {
  field: FormField;
  allFields: FormField[];
  onUpdate: (updates: Partial<FormField>) => void;
}

function FieldConfigurationPanel({ field, allFields, onUpdate }: FieldConfigurationPanelProps) {
  const addOption = () => {
    const newOptions = [...(field.options || []), `Option ${(field.options?.length || 0) + 1}`];
    onUpdate({ options: newOptions });
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...(field.options || [])];
    newOptions[index] = value;
    onUpdate({ options: newOptions });
  };

  const removeOption = (index: number) => {
    const newOptions = (field.options || []).filter((_, i) => i !== index);
    onUpdate({ options: newOptions });
  };

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Field Settings</h3>

      <div className="space-y-6">
        {/* Basic Settings */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Label</label>
          <input
            type="text"
            value={field.label}
            onChange={(e) => onUpdate({ label: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {(field.type === 'text' || field.type === 'email' || field.type === 'number' || field.type === 'textarea') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Placeholder</label>
            <input
              type="text"
              value={field.placeholder || ''}
              onChange={(e) => onUpdate({ placeholder: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Help Text</label>
          <input
            type="text"
            value={field.helpText || ''}
            onChange={(e) => onUpdate({ helpText: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Optional help text for users"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="required"
            checked={field.required}
            onChange={(e) => onUpdate({ required: e.target.checked })}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="required" className="ml-2 text-sm font-medium text-gray-700">
            Required field
          </label>
        </div>

        {/* Options for select/multiselect/radio */}
        {(field.type === 'select' || field.type === 'multiselect' || field.type === 'radio') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
            <div className="space-y-2">
              {field.options?.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => removeOption(index)}
                    className="p-2 text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={addOption}
                className="w-full py-2 px-3 border border-dashed border-gray-300 rounded-md text-gray-600 hover:border-gray-400 hover:text-gray-800"
              >
                <Plus className="w-4 h-4 inline mr-1" />
                Add Option
              </button>
            </div>
          </div>
        )}

        {/* Validation Rules */}
        {(field.type === 'text' || field.type === 'email' || field.type === 'textarea') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Validation</label>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-600">Min Length</label>
                  <input
                    type="number"
                    value={field.validation?.minLength || ''}
                    onChange={(e) => onUpdate({
                      validation: { ...field.validation, minLength: parseInt(e.target.value) || undefined }
                    })}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600">Max Length</label>
                  <input
                    type="number"
                    value={field.validation?.maxLength || ''}
                    onChange={(e) => onUpdate({
                      validation: { ...field.validation, maxLength: parseInt(e.target.value) || undefined }
                    })}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
              </div>
              {field.type === 'text' && (
                <div>
                  <label className="block text-xs text-gray-600">Pattern (regex)</label>
                  <input
                    type="text"
                    value={field.validation?.pattern || ''}
                    onChange={(e) => onUpdate({
                      validation: { ...field.validation, pattern: e.target.value || undefined }
                    })}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    placeholder="e.g., ^[A-Z]{2}\d{6}$"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Conditional Logic */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Conditional Logic</label>
          <div className="space-y-2">
            <select
              value={field.conditionalLogic?.dependsOn || ''}
              onChange={(e) => onUpdate({
                conditionalLogic: {
                  ...field.conditionalLogic,
                  dependsOn: e.target.value || undefined
                }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">No condition</option>
              {allFields
                .filter(f => f.id !== field.id)
                .map(f => (
                  <option key={f.id} value={f.id}>{f.label}</option>
                ))}
            </select>

            {field.conditionalLogic?.dependsOn && (
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={field.conditionalLogic.condition}
                  onChange={(e) => onUpdate({
                    conditionalLogic: {
                      ...field.conditionalLogic,
                      condition: e.target.value as any
                    }
                  })}
                  className="px-2 py-1 border border-gray-300 rounded text-sm"
                >
                  <option value="equals">Equals</option>
                  <option value="not_equals">Not Equals</option>
                  <option value="contains">Contains</option>
                  <option value="not_contains">Doesn't Contain</option>
                  <option value="greater_than">Greater Than</option>
                  <option value="less_than">Less Than</option>
                </select>
                <input
                  type="text"
                  value={field.conditionalLogic.value || ''}
                  onChange={(e) => onUpdate({
                    conditionalLogic: {
                      ...field.conditionalLogic,
                      value: e.target.value
                    }
                  })}
                  className="px-2 py-1 border border-gray-300 rounded text-sm"
                  placeholder="Value"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Form Preview Component
function FormPreview({ schema }: { schema: FormSchema }) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{schema.title}</h1>
        {schema.description && (
          <p className="text-gray-600 mb-6">{schema.description}</p>
        )}

        <div className="space-y-6">
          {schema.fields.map((field) => (
            <div key={field.id}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>

              {field.type === 'text' && (
                <input
                  type="text"
                  placeholder={field.placeholder}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled
                />
              )}

              {field.type === 'email' && (
                <input
                  type="email"
                  placeholder={field.placeholder}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled
                />
              )}

              {field.type === 'number' && (
                <input
                  type="number"
                  placeholder={field.placeholder}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled
                />
              )}

              {field.type === 'date' && (
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled
                />
              )}

              {field.type === 'textarea' && (
                <textarea
                  placeholder={field.placeholder}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled
                />
              )}

              {field.type === 'select' && (
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled
                >
                  <option>Select an option</option>
                  {field.options?.map((option, index) => (
                    <option key={index} value={option}>{option}</option>
                  ))}
                </select>
              )}

              {field.type === 'checkbox' && (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    disabled
                  />
                  <span className="ml-2 text-sm text-gray-700">{field.label}</span>
                </div>
              )}

              {field.helpText && (
                <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
