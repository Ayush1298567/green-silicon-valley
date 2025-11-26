"use client";
import { useState, useEffect, useRef } from "react";
import { Send, Bot, User, Loader2, AlertTriangle, CheckCircle, Lightbulb, MessageCircle, X, Sparkles } from "lucide-react";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { aiAgentService } from "@/lib/aiAgentService";

interface ChatMessage {
  id: string;
  type: 'user' | 'ai' | 'system' | 'error';
  content: string;
  timestamp: Date;
  command?: any;
  suggestions?: string[];
  requiresConfirmation?: boolean;
  confirmationCommand?: any;
  actions?: Array<{
    id: string;
    type: string;
    description: string;
    requiresApproval: boolean;
  }>;
}

interface AIChatInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AIChatInterface({ isOpen, onClose }: AIChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [conversationContext, setConversationContext] = useState<any>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    // Get current authenticated user
    const getCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        setCurrentUserId(session.user.id);
      }
    };

    getCurrentUser();
  }, []);

  useEffect(() => {
    if (isOpen && messages.length === 0 && currentUserId) {
      initializeChat();
    }
  }, [isOpen, currentUserId]);

  const initializeChat = async () => {
    if (!currentUserId) return;

    // Create or load conversation context
    const context = {
      userId: currentUserId,
      sessionId: sessionId || await aiAgentService.createNewSession(currentUserId),
      conversationHistory: [],
      userPreferences: {
        communicationStyle: 'casual',
        preferredResponseLength: 'detailed',
        expertiseLevel: 'intermediate'
      },
      learnedPatterns: []
    };

    setSessionId(context.sessionId);
    setConversationContext(context);

    // Initialize with enhanced welcome message
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      type: 'ai',
      content: `🤖 **AI Agent Mode Active**\n\nI'm your intelligent administrative assistant with advanced capabilities:\n\n✨ **Smart Actions**\n• Create forms from natural language descriptions\n• Generate detailed analytics and insights\n• Set up automated workflows\n• Process volunteer applications intelligently\n\n🎯 **Quick Commands**\n• "Create a volunteer registration form"\n• "Show me analytics for this month"\n• "Set up weekly progress reports"\n• "Analyze volunteer engagement"\n\n💡 **Pro Tips**\n• Be specific about what you need\n• I can create workflows and automations\n• Ask for analytics in natural language\n• I learn from your preferences over time`,
      timestamp: new Date(),
      suggestions: [
        "Create a volunteer registration form for our environmental program",
        "Show me this month's volunteer analytics",
        "Set up automated weekly progress reports",
        "Analyze our form completion rates"
      ]
    };
    setMessages([welcomeMessage]);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (message: string, confirmedCommand?: any) => {
    if (!message.trim() && !confirmedCommand) return;

    setIsLoading(true);

    // Add user message to chat
    if (message.trim()) {
      const userMessage: ChatMessage = {
        id: `user_${Date.now()}`,
        type: 'user',
        content: message,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userMessage]);

      // Update conversation context
      if (conversationContext) {
        conversationContext.conversationHistory.push({
          role: 'user',
          content: message,
          timestamp: new Date()
        });
      }
    }

    try {
      let aiResponse;

      if (confirmedCommand) {
        // Handle confirmed action
        aiResponse = await aiAgentService.executeAction(confirmedCommand, currentUserId!);
      } else {
        // Use AI Agent Service for processing
        if (!conversationContext) {
          throw new Error('Conversation context not initialized');
        }

        const result = await aiAgentService.processUserQuery(message, conversationContext);

        // Update conversation context with AI response
        conversationContext.conversationHistory.push({
          role: 'assistant',
          content: result.response,
          timestamp: new Date()
        });

        // Save updated context
        await aiAgentService.saveConversation(conversationContext);

        aiResponse = {
          success: true,
          message: result.response,
          actions: result.suggestedActions,
          confidence: result.confidence
        };
      }

      // Add AI response to chat
      const aiMessage: ChatMessage = {
        id: `ai_${Date.now()}`,
        type: 'ai',
        content: aiResponse.message,
        timestamp: new Date(),
        actions: aiResponse.actions,
        requiresConfirmation: aiResponse.requiresConfirmation,
        confirmationCommand: aiResponse.confirmationCommand
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error: any) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        type: 'error',
        content: "Network error. Please check your connection and try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setInputMessage("");
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputMessage);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
    handleSendMessage(suggestion);
  };

  const handleConfirmation = (confirmed: boolean, command: any) => {
    if (confirmed) {
      handleSendMessage("", command);
    } else {
      const cancelMessage: ChatMessage = {
        id: `system_${Date.now()}`,
        type: 'system',
        content: "Command cancelled.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, cancelMessage]);
    }
  };

  // Don't render anything if component should be closed
  if (!isOpen) return null;

  return (
    <>
      {/* Persistent Chat Bubble */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsMinimized(!isMinimized)}
          className={`w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group ${
            isMinimized
              ? 'bg-gradient-to-r from-green-500 to-blue-500'
              : 'bg-gray-600 hover:bg-gray-700'
          }`}
        >
          {isMinimized ? (
            <MessageCircle className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
          ) : (
            <X className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
          )}
        </button>
      </div>

      {/* Main Chat Interface */}
      <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
        isMinimized
          ? 'w-96 h-[600px] opacity-100'
          : 'w-0 h-0 opacity-0 pointer-events-none'
      }`}>
        <div className="bg-white rounded-lg shadow-2xl w-full h-full flex flex-col border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">AI Agent Mode</h3>
              <p className="text-sm text-gray-500">Intelligent administrative assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMinimized(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              title="Minimize"
            >
              <div className="w-4 h-4 border-2 border-current rounded-sm"></div>
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              title="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              {message.type !== 'user' && (
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  {message.type === 'ai' ? (
                    <Bot className="w-4 h-4 text-blue-600" />
                  ) : message.type === 'error' ? (
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                  ) : (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  )}
                </div>
              )}

              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : message.type === 'error'
                  ? 'bg-red-100 text-red-800'
                  : message.type === 'system'
                  ? 'bg-gray-100 text-gray-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>

                {/* Suggestions */}
                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {message.suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="block w-full text-left text-xs bg-white bg-opacity-50 hover:bg-opacity-75 rounded px-2 py-1 transition-colors"
                      >
                        💡 {suggestion}
                      </button>
                    ))}
                  </div>
                )}

                {/* AI Actions */}
                {message.actions && message.actions.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs font-medium text-gray-600">Suggested Actions:</p>
                    {message.actions.map((action, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage('', action)}
                        className={`block w-full text-left text-xs px-3 py-2 rounded border transition-colors ${
                          action.requiresApproval
                            ? 'border-orange-200 bg-orange-50 hover:bg-orange-100 text-orange-800'
                            : 'border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-800'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{action.description}</span>
                          {action.requiresApproval && (
                            <span className="text-orange-600 font-medium">Approval Required</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Confirmation */}
                {message.requiresConfirmation && message.confirmationCommand && (
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => handleConfirmation(true, message.confirmationCommand)}
                      className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => handleConfirmation(false, message.confirmationCommand)}
                      className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {message.type === 'user' && (
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
              </div>
              <div className="bg-gray-100 px-4 py-2 rounded-lg">
                <p className="text-sm text-gray-600">Thinking...</p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        <div className="border-t border-gray-200 p-3 bg-gray-50">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleSendMessage("Create a volunteer registration form")}
              className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full hover:bg-blue-200 transition-colors"
              type="button"
            >
              📝 Create Form
            </button>
            <button
              onClick={() => handleSendMessage("Set up automated email workflow for new volunteers")}
              className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full hover:bg-indigo-200 transition-colors"
              type="button"
            >
              ⚡ Create Workflow
            </button>
            <button
              onClick={() => handleSendMessage("Show me this month's analytics")}
              className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full hover:bg-green-200 transition-colors"
              type="button"
            >
              📊 Analytics
            </button>
            <button
              onClick={() => handleSendMessage("Set up automated weekly reports")}
              className="px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full hover:bg-purple-200 transition-colors"
              type="button"
            >
              🤖 Automation
            </button>
            <button
              onClick={() => handleSendMessage("Show pending volunteer applications")}
              className="px-3 py-1 bg-orange-100 text-orange-700 text-xs rounded-full hover:bg-orange-200 transition-colors"
              type="button"
            >
              👥 Applications
            </button>
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask me to manage schools, volunteers, presentations..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Send
            </button>
          </form>

          {/* Quick Commands */}
          <div className="mt-3 flex flex-wrap gap-2">
            {[
              "Show pending applications",
              "Add a new school",
              "Generate report",
              "Send welcome email"
            ].map((command, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestionClick(command)}
                disabled={isLoading}
                className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full hover:bg-gray-200 disabled:opacity-50 transition-colors"
              >
                {command}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
