"use client";

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Loader2, CheckCircle, AlertCircle, Play, Settings } from 'lucide-react';
import { aiAgentService, WorkflowConfig } from '@/lib/aiAgentService';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    workflowConfig?: WorkflowConfig;
    generating?: boolean;
    error?: string;
  };
}

interface AIWorkflowGeneratorProps {
  onWorkflowCreated?: (workflowConfig: WorkflowConfig) => void;
  className?: string;
}

export default function AIWorkflowGenerator({ onWorkflowCreated, className = "" }: AIWorkflowGeneratorProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hi! I'm your AI Workflow Assistant. Describe the workflow you want to create, and I'll generate it for you. For example:\n\n• 'Send welcome emails to new volunteers'\n• 'Create tasks when forms are submitted'\n• 'Send reminders before events'\n• 'Generate weekly reports every Monday'",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowConfig | null>(null);
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
      content: 'Creating your workflow...',
      timestamp: new Date(),
      metadata: { generating: true }
    };

    setMessages(prev => [...prev, generatingMessage]);

    try {
      // Generate workflow using AI
      const workflowConfig = await aiAgentService.generateWorkflowFromDescription(input.trim(), 'current-user');

      // Remove generating message and add success message
      setMessages(prev => prev.filter(m => !m.metadata?.generating));

      const successMessage: Message = {
        id: `success-${Date.now()}`,
        role: 'assistant',
        content: `I've created a workflow based on your description! It has ${workflowConfig.triggers.length} trigger(s) and ${workflowConfig.actions.length} action(s).`,
        timestamp: new Date(),
        metadata: { workflowConfig }
      };

      setMessages(prev => [...prev, successMessage]);
      setSelectedWorkflow(workflowConfig);

    } catch (error: any) {
      // Remove generating message and add error message
      setMessages(prev => prev.filter(m => !m.metadata?.generating));

      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `Sorry, I couldn't create a workflow from that description. Please try rephrasing or being more specific about what should happen when.`,
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

  const handleUseWorkflow = () => {
    if (selectedWorkflow && onWorkflowCreated) {
      onWorkflowCreated(selectedWorkflow);
      setSelectedWorkflow(null);
    }
  };

  const renderWorkflowPreview = (workflow: WorkflowConfig) => {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-600" />
          <h4 className="font-semibold text-gray-900">{workflow.name}</h4>
        </div>

        <p className="text-sm text-gray-600">{workflow.description}</p>

        {/* Triggers */}
        <div>
          <h5 className="text-sm font-medium text-gray-700 mb-2">Triggers</h5>
          <div className="space-y-2">
            {workflow.triggers.map((trigger, index) => (
              <div key={index} className="flex items-center gap-2 text-sm bg-gray-50 p-2 rounded">
                <Play className="w-4 h-4 text-green-600" />
                <span className="capitalize">{trigger.type}:</span>
                <span className="text-gray-600">
                  {trigger.type === 'time' && trigger.config.time && (
                    `Every ${trigger.config.dayOfWeek ? 'week' : 'day'} at ${trigger.config.time}`
                  )}
                  {trigger.type === 'event' && trigger.config.event && (
                    `When "${trigger.config.event}" happens`
                  )}
                  {trigger.type === 'condition' && (
                    `When ${trigger.config.field} ${trigger.config.operator} ${trigger.config.value}`
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div>
          <h5 className="text-sm font-medium text-gray-700 mb-2">Actions</h5>
          <div className="space-y-2">
            {workflow.actions.map((action, index) => (
              <div key={index} className="flex items-center gap-2 text-sm bg-blue-50 p-2 rounded">
                <CheckCircle className="w-4 h-4 text-blue-600" />
                <span className="capitalize">{action.type.replace('_', ' ')}:</span>
                <span className="text-gray-600">
                  {action.type === 'send_email' && `Send "${action.config.template}" email`}
                  {action.type === 'create_task' && `Create task "${action.config.title}"`}
                  {action.type === 'send_notification' && `Send notification to ${action.config.recipient}`}
                  {action.type === 'update_record' && `Update ${action.config.table} record`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`flex h-full bg-gray-50 ${className}`}>
      {/* Chat Interface */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">AI Workflow Generator</h2>
              <p className="text-sm text-gray-600">Describe your workflow and let AI automate it</p>
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
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-purple-600" />
                </div>
              )}

              <div
                className={`max-w-lg rounded-lg px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-purple-600 text-white'
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

                {message.metadata?.workflowConfig && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <Sparkles className="w-4 h-4" />
                      <span>Generated Workflow: {message.metadata.workflowConfig.name}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {message.metadata.workflowConfig.triggers.length} trigger{message.metadata.workflowConfig.triggers.length !== 1 ? 's' : ''} • {message.metadata.workflowConfig.actions.length} action{message.metadata.workflowConfig.actions.length !== 1 ? 's' : ''}
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
                placeholder="Describe the workflow you want to create..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                rows={1}
                disabled={isGenerating}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!input.trim() || isGenerating}
              className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

      {/* Workflow Preview Panel */}
      {selectedWorkflow && (
        <div className="w-1/2 border-l border-gray-200 bg-white flex flex-col">
          {/* Panel Header */}
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{selectedWorkflow.name}</h3>
                <p className="text-sm text-gray-600">AI Generated Workflow</p>
              </div>
            </div>
          </div>

          {/* Workflow Preview */}
          <div className="flex-1 overflow-y-auto p-6">
            {renderWorkflowPreview(selectedWorkflow)}
          </div>

          {/* Action Buttons */}
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedWorkflow(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Discard
              </button>
              <button
                onClick={handleUseWorkflow}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <CheckCircle className="w-4 h-4 inline mr-1" />
                Use This Workflow
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
