"use client";

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Loader2, CheckCircle, AlertCircle, Edit3, Save } from 'lucide-react';
import { aiAgentService, FormSchema } from '@/lib/aiAgentService';
import FormBuilder from './forms/FormBuilder';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    formSchema?: FormSchema;
    generating?: boolean;
    error?: string;
  };
}

interface AIFormGeneratorProps {
  onFormCreated?: (formSchema: FormSchema) => void;
  className?: string;
}

export default function AIFormGenerator({ onFormCreated, className = "" }: AIFormGeneratorProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hi! I'm your AI Form Assistant. Describe the form you want to create, and I'll generate it for you. For example:\n\n• 'Create a volunteer registration form with name, email, and availability'\n• 'Make a feedback survey for event attendees'\n• 'Build a contact form with message field'",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedForm, setSelectedForm] = useState<FormSchema | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isGenerating) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsGenerating(true);

    // Add generating message
    const generatingMessage: Message = {
      id: `generating-${Date.now()}`,
      role: 'assistant',
      content: 'Generating your form...',
      timestamp: new Date(),
      metadata: { generating: true }
    };

    setMessages(prev => [...prev, generatingMessage]);

    try {
      // Generate form using AI
      const formSchema = await aiAgentService.generateFormFromDescription(input.trim(), 'current-user');

      // Validate the generated form
      const validation = await aiAgentService.validateFormLogic(formSchema);

      // Remove generating message and add success message
      setMessages(prev => prev.filter(m => !m.metadata?.generating));

      const successMessage: Message = {
        id: `success-${Date.now()}`,
        role: 'assistant',
        content: `I've created a form based on your description! ${validation.warnings.length > 0 ? `(${validation.warnings.length} suggestions)` : ''}`,
        timestamp: new Date(),
        metadata: { formSchema }
      };

      setMessages(prev => [...prev, successMessage]);
      setSelectedForm(formSchema);

    } catch (error: any) {
      // Remove generating message and add error message
      setMessages(prev => prev.filter(m => !m.metadata?.generating));

      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `Sorry, I couldn't generate a form from that description. Please try rephrasing or being more specific.`,
        timestamp: new Date(),
        metadata: { error: error.message }
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleUseForm = () => {
    if (selectedForm && onFormCreated) {
      onFormCreated(selectedForm);
      setSelectedForm(null);
      setIsEditing(false);
    }
  };

  const handleEditForm = (updatedSchema: FormSchema) => {
    setSelectedForm(updatedSchema);
  };

  const handleSaveForm = () => {
    setIsEditing(false);
  };

  return (
    <div className={`flex h-full bg-gray-50 ${className}`}>
      {/* Chat Interface */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">AI Form Generator</h2>
              <p className="text-sm text-gray-600">Describe your form and let AI create it</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-blue-600" />
                </div>
              )}

              <div
                className={`max-w-lg rounded-lg px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : message.metadata?.error
                    ? 'bg-red-50 border border-red-200 text-red-900'
                    : message.metadata?.generating
                    ? 'bg-gray-100 text-gray-600'
                    : 'bg-white border border-gray-200 text-gray-900'
                }`}
              >
                {message.metadata?.generating ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{message.content}</span>
                  </div>
                ) : message.metadata?.error ? (
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span>{message.content}</span>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap">{message.content}</div>
                )}

                {message.metadata?.formSchema && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <Sparkles className="w-4 h-4" />
                      <span>Generated Form: {message.metadata.formSchema.title}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {message.metadata.formSchema.fields.length} fields • {message.metadata.formSchema.fields.filter(f => f.required).length} required
                    </div>
                  </div>
                )}
              </div>

              {message.role === 'user' && (
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-gray-600" />
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 bg-white p-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Describe the form you want to create..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={1}
                disabled={isGenerating}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!input.trim() || isGenerating}
              className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isGenerating ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Form Preview/Edit Panel */}
      {selectedForm && (
        <div className="w-1/2 border-l border-gray-200 bg-white flex flex-col">
          {/* Panel Header */}
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{selectedForm.title}</h3>
                <p className="text-sm text-gray-600">AI Generated Form</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium ${
                    isEditing
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Edit3 className="w-4 h-4 inline mr-1" />
                  {isEditing ? 'Preview' : 'Edit'}
                </button>
                {isEditing && (
                  <button
                    onClick={handleSaveForm}
                    className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                  >
                    <Save className="w-4 h-4 inline mr-1" />
                    Save Changes
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-hidden">
            <FormBuilder
              schema={selectedForm}
              onChange={handleEditForm}
              className="h-full"
            />
          </div>

          {/* Action Buttons */}
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedForm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Discard
              </button>
              <button
                onClick={handleUseForm}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <CheckCircle className="w-4 h-4 inline mr-1" />
                Use This Form
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
