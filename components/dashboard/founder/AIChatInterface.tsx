"use client";
import { useState, useEffect, useRef } from "react";
import { Send, Bot, User, Loader2, AlertTriangle, CheckCircle, Lightbulb } from "lucide-react";

interface ChatMessage {
  id: string;
  type: 'user' | 'ai' | 'system' | 'error';
  content: string;
  timestamp: Date;
  command?: any;
  suggestions?: string[];
  requiresConfirmation?: boolean;
  confirmationCommand?: any;
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Initialize with welcome message
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        type: 'ai',
        content: "👋 Hi! I'm your AI Administrative Assistant. I can help you manage schools, volunteers, presentations, and more. Try asking me to:\n\n• Add a new school\n• Show pending applications\n• Send welcome emails\n• Generate reports\n• Approve volunteers",
        timestamp: new Date(),
        suggestions: [
          "Show me pending volunteer applications",
          "Add a new school",
          "Generate a platform report"
        ]
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen]);

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
    }

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message.trim(),
          sessionId: sessionId,
          confirmed: !!confirmedCommand,
          commandToConfirm: confirmedCommand
        })
      });

      const data = await response.json();

      if (data.ok) {
        setSessionId(data.sessionId);

        // Add AI response to chat
        const aiMessage: ChatMessage = {
          id: `ai_${Date.now()}`,
          type: 'ai',
          content: data.response,
          timestamp: new Date(),
          suggestions: data.suggestions,
          requiresConfirmation: data.requiresConfirmation,
          confirmationCommand: data.confirmationCommand
        };

        setMessages(prev => [...prev, aiMessage]);
      } else {
        // Add error message
        const errorMessage: ChatMessage = {
          id: `error_${Date.now()}`,
          type: 'error',
          content: data.error || "Sorry, I encountered an error. Please try again.",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">AI Administrative Assistant</h3>
              <p className="text-sm text-gray-500">Conversational management</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
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
  );
}
