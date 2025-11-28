"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Users, User, Send, Search, Plus } from "lucide-react";
import { toast } from "sonner";

interface Conversation {
  id: string;
  type: 'individual' | 'team';
  participants: Array<{
    id: string;
    name: string;
    role: string;
  }>;
  lastMessage?: {
    content: string;
    sender_name: string;
    timestamp: string;
  };
  unreadCount: number;
  teamName?: string;
}

interface Message {
  id: string;
  content: string;
  sender_id: string;
  sender_name: string;
  timestamp: string;
  conversation_id: string;
}

export default function FounderMessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewConversation, setShowNewConversation] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  const fetchConversations = async () => {
    try {
      const res = await fetch("/api/founder/messages/conversations");
      const data = await res.json();
      if (data.ok) {
        setConversations(data.conversations || []);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const res = await fetch(`/api/founder/messages/conversations/${conversationId}`);
      const data = await res.json();
      if (data.ok) {
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const res = await fetch("/api/founder/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: selectedConversation.id,
          content: newMessage.trim()
        }),
      });

      const data = await res.json();
      if (data.ok) {
        setNewMessage("");
        fetchMessages(selectedConversation.id);
        fetchConversations(); // Refresh conversation list
        toast.success("Message sent");
      } else {
        toast.error(data.error || "Failed to send message");
      }
    } catch (error) {
      toast.error("Network error");
    }
  };

  const startNewConversation = async (type: 'individual' | 'team', participantIds: string[]) => {
    try {
      const res = await fetch("/api/founder/messages/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          participantIds
        }),
      });

      const data = await res.json();
      if (data.ok) {
        setShowNewConversation(false);
        fetchConversations();
        toast.success("Conversation started");
      } else {
        toast.error(data.error || "Failed to start conversation");
      }
    } catch (error) {
      toast.error("Network error");
    }
  };

  const filteredConversations = conversations.filter(conv => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    return conv.participants.some(p =>
      p.name.toLowerCase().includes(searchLower)
    ) || (conv.teamName && conv.teamName.toLowerCase().includes(searchLower));
  });

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60);

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${Math.floor(diffInMinutes)}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex">
      {/* Conversations Sidebar */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
            <button
              onClick={() => setShowNewConversation(true)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
            >
              <Plus size={16} />
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">No conversations yet</p>
              <button
                onClick={() => setShowNewConversation(true)}
                className="text-blue-600 hover:underline text-sm mt-2"
              >
                Start a conversation
              </button>
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                  selectedConversation?.id === conversation.id ? 'bg-blue-50 border-blue-200' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    {conversation.type === 'team' ? (
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-green-600" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-gray-900 truncate">
                        {conversation.type === 'team'
                          ? conversation.teamName || 'Team Chat'
                          : conversation.participants.find(p => p.role !== 'founder')?.name || 'Individual Chat'
                        }
                      </h3>
                      {conversation.lastMessage && (
                        <span className="text-xs text-gray-500">
                          {formatTimestamp(conversation.lastMessage.timestamp)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 truncate">
                        {conversation.lastMessage
                          ? conversation.lastMessage.content
                          : conversation.type === 'team'
                            ? `${conversation.participants.length} members`
                            : 'No messages yet'
                        }
                      </p>
                      {conversation.unreadCount > 0 && (
                        <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                          {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500 capitalize">
                        {conversation.type}
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">
                        {conversation.participants.length} participant{conversation.participants.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Conversation Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                {selectedConversation.type === 'team' ? (
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                ) : (
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                )}

                <div>
                  <h3 className="font-medium text-gray-900">
                    {selectedConversation.type === 'team'
                      ? selectedConversation.teamName || 'Team Chat'
                      : selectedConversation.participants.find(p => p.role !== 'founder')?.name || 'Individual Chat'
                    }
                  </h3>
                  <p className="text-sm text-gray-600">
                    {selectedConversation.participants.length} participant{selectedConversation.participants.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-12">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender_id === 'current-user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender_id === 'current-user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender_id === 'current-user' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {formatTimestamp(message.timestamp)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Send size={16} />
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
              <p className="text-sm">Choose a conversation from the sidebar to start messaging</p>
            </div>
          </div>
        )}
      </div>

      {/* New Conversation Modal */}
      {showNewConversation && (
        <NewConversationModal
          onClose={() => setShowNewConversation(false)}
          onStart={startNewConversation}
        />
      )}
    </div>
  );
}

// New Conversation Modal Component
function NewConversationModal({
  onClose,
  onStart
}: {
  onClose: () => void;
  onStart: (type: 'individual' | 'team', participantIds: string[]) => void;
}) {
  const [conversationType, setConversationType] = useState<'individual' | 'team'>('individual');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [availableUsers, setAvailableUsers] = useState<Array<{id: string, name: string, role: string}>>([]);

  useEffect(() => {
    fetchAvailableUsers();
  }, []);

  const fetchAvailableUsers = async () => {
    try {
      const res = await fetch("/api/founder/messages/available-users");
      const data = await res.json();
      if (data.ok) {
        setAvailableUsers(data.users || []);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleSubmit = () => {
    if (selectedParticipants.length === 0) return;
    onStart(conversationType, selectedParticipants);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Start New Conversation</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Conversation Type</label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="individual"
                    checked={conversationType === 'individual'}
                    onChange={(e) => setConversationType(e.target.value as 'individual')}
                    className="mr-2"
                  />
                  Individual
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="team"
                    checked={conversationType === 'team'}
                    onChange={(e) => setConversationType(e.target.value as 'team')}
                    className="mr-2"
                  />
                  Team
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select {conversationType === 'individual' ? 'Volunteer' : 'Team Members'}
              </label>
              <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg">
                {availableUsers.map((user) => (
                  <label key={user.id} className="flex items-center p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0">
                    <input
                      type={conversationType === 'individual' ? 'radio' : 'checkbox'}
                      checked={selectedParticipants.includes(user.id)}
                      onChange={(e) => {
                        if (conversationType === 'individual') {
                          setSelectedParticipants([user.id]);
                        } else {
                          if (e.target.checked) {
                            setSelectedParticipants([...selectedParticipants, user.id]);
                          } else {
                            setSelectedParticipants(selectedParticipants.filter(id => id !== user.id));
                          }
                        }
                      }}
                      className="mr-3"
                    />
                    <div>
                      <div className="font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-600 capitalize">{user.role}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={selectedParticipants.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Start Conversation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
