// src/pages/Messages.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocketMessages } from '../hooks/useSocket';
import { useAuth } from '../context/AuthContext';
import { messagesService, Conversation } from '../services/messages';
import { ChatRoom } from '../components/messages/ChatRoom';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ArrowLeft } from 'lucide-react';

export const Messages: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const { messages, sendMessage } = useSocketMessages(selectedConversation?.application.id || '');

  useEffect(() => {
    if (user) loadConversations();
  }, [user]);

  const loadConversations = async () => {
    try {
      const data = await messagesService.getConversations();
      setConversations(data);
      if (data.length > 0 && !selectedConversation) {
        setSelectedConversation(data[0]);
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setConversationsLoading(false);
    }
  };

  if (conversationsLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            title="Back to Dashboard"
          >
            <ArrowLeft className="h-6 w-6 text-gray-700" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversation List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Conversations</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {conversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No conversations yet.<br />
                <span className="text-xs">
                  Conversations appear once an application is accepted.
                </span>
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.application.id}
                  onClick={() => setSelectedConversation(conv)}
                  className={`w-full text-left p-4 hover:bg-gray-50 transition ${
                    selectedConversation?.application.id === conv.application.id
                      ? 'bg-primary-50'
                      : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-medium text-gray-900 truncate">
                      {conv.application.job.title}
                    </h3>
                    {conv.isUnread && (
                      <span className="flex-shrink-0 w-2 h-2 mt-1.5 rounded-full bg-amber-400" />
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {conv.otherParty?.email || 'Unknown'}
                  </p>
                  {conv.lastMessage && (
                    <p className="text-xs text-gray-400 mt-1 truncate">
                      {conv.lastMessage.content}
                    </p>
                  )}
                  <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                    {conv.application.status}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Room */}
        <div className="lg:col-span-2">
          {selectedConversation ? (
            <ChatRoom
              messages={messages}
              onSendMessage={sendMessage}
            />
          ) : (
            <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
              Select a conversation to start messaging
            </div>
          )}
        </div>
      </div>
    </div>
  );
};