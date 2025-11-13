"use client";
import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, Database, FileText, TrendingUp, Loader2 } from "lucide-react";
import { type UserRow } from "@/types/db";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AIAssistantInterfaceProps {
  user: UserRow | null;
}

const ASSISTANT_MODES = [
  {
    id: "knowledge",
    name: "Knowledge Assistant",
    description: "Ask about GSV programs, policies, and procedures",
    icon: <FileText className="w-5 h-5" />,
    color: "blue",
  },
  {
    id: "operations",
    name: "Operations Assistant",
    description: "Get help with scheduling, assignments, and workflows",
    icon: <Database className="w-5 h-5" />,
    color: "purple",
  },
  {
    id: "analytics",
    name: "Analytics Assistant",
    description: "Analyze data and generate insights",
    icon: <TrendingUp className="w-5 h-5" />,
    color: "green",
  },
];

const QUICK_PROMPTS = {
  knowledge: [
    "What are the volunteer requirements?",
    "How do I schedule a presentation?",
    "What training materials are available?",
  ],
  operations: [
    "Show upcoming presentations this week",
    "Who are the top volunteers this month?",
    "Create a reminder for chapter check-in",
  ],
  analytics: [
    "Generate a monthly impact report",
    "Show volunteer growth trends",
    "Compare presentation stats by region",
  ],
};

export default function AIAssistantInterface({ user }: AIAssistantInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<string>("knowledge");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (messageText?: string) => {
    const text = messageText || input;
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          mode,
          history: messages,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.response,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error("Failed to get response");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const currentMode = ASSISTANT_MODES.find((m) => m.id === mode)!;

  return (
    <div className="grid lg:grid-cols-4 gap-6">
      {/* Sidebar */}
      <div className="lg:col-span-1 space-y-4">
        {/* Mode Selector */}
        <div className="card p-4">
          <h3 className="font-semibold text-gsv-charcoal mb-3">Assistant Mode</h3>
          <div className="space-y-2">
            {ASSISTANT_MODES.map((m) => (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={`w-full text-left p-3 rounded-lg transition ${
                  mode === m.id
                    ? `bg-${m.color}-100 border-2 border-${m.color}-500`
                    : "bg-gray-50 border-2 border-transparent hover:border-gray-300"
                }`}
              >
                <div className="flex items-start gap-2">
                  <div className={`text-${m.color}-600 mt-0.5`}>{m.icon}</div>
                  <div>
                    <div className="font-medium text-sm text-gsv-charcoal">{m.name}</div>
                    <div className="text-xs text-gsv-gray mt-1">{m.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Prompts */}
        <div className="card p-4">
          <h3 className="font-semibold text-gsv-charcoal mb-3">Quick Prompts</h3>
          <div className="space-y-2">
            {QUICK_PROMPTS[mode as keyof typeof QUICK_PROMPTS].map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                disabled={loading}
                className="w-full text-left text-sm p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition text-gsv-charcoal disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="card p-4 bg-blue-50 border border-blue-200">
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-800">
              This AI assistant has access to your organization’s data and can help with various tasks.
            </p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="lg:col-span-3">
        <div className="card h-[600px] flex flex-col">
          {/* Header */}
          <div className="border-b p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-${currentMode.color}-100`}>
                <Bot className={`w-5 h-5 text-${currentMode.color}-600`} />
              </div>
              <div>
                <h3 className="font-semibold text-gsv-charcoal">{currentMode.name}</h3>
                <p className="text-xs text-gsv-gray">{currentMode.description}</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-center">
                <div>
                  <Bot className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gsv-gray mb-2">How can I help you today?</p>
                  <p className="text-sm text-gsv-gray">
                    Try selecting a quick prompt or type your question below
                  </p>
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-purple-600" />
                    </div>
                  )}
                  <div
                    className={`max-w-[70%] p-3 rounded-lg ${
                      msg.role === "user"
                        ? "bg-gsv-green text-white"
                        : "bg-gray-100 text-gsv-charcoal"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    <p className={`text-xs mt-1 ${msg.role === "user" ? "text-white/70" : "text-gsv-gray"}`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {msg.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-gsv-green text-white flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))
            )}
            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-purple-600" />
                </div>
                <div className="bg-gray-100 p-3 rounded-lg">
                  <Loader2 className="w-5 h-5 animate-spin text-gsv-gray" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                disabled={loading}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="px-6 py-2 bg-gsv-green text-white rounded-lg hover:bg-gsv-green/90 transition disabled:opacity-50 inline-flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

