// src/pages/Messages.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocketMessages } from '../hooks/useSocket';
import { useAuth } from '../context/AuthContext';
import { applicationsService } from '../services/applications';
import { messagesService } from '../services/messages';
import { Application, Message } from '../types';
import { ChatRoom } from '../components/messages/ChatRoom';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ArrowLeft } from 'lucide-react';

export const Messages: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [applicationsLoading, setApplicationsLoading] = useState(true);
  const { messages, sendMessage, loading: messagesLoading } = useSocketMessages(selectedApplication?.id || '');

  useEffect(() => {
    loadApplications();
  }, [user]);

  const loadApplications = async () => {
    try {
      // Use different endpoint based on user role
      const data = user?.role === 'CLIENT' 
        ? await applicationsService.getClientApplications()
        : await applicationsService.getMyApplications();
      
      const activeApplications = data.filter(
        (app) => app.status === 'MATCHED' || app.status === 'IN_PROGRESS'
      );
      setApplications(activeApplications);
      if (activeApplications.length > 0 && !selectedApplication) {
        setSelectedApplication(activeApplications[0]);
      }
    } catch (error) {
      console.error('Failed to load applications:', error);
    } finally {
      setApplicationsLoading(false);
    }
  };

  const handleSendMessage = (content: string) => {
    sendMessage(content);
  };

  // Get the contact info based on role
  const getContactInfo = (app: Application) => {
    if (user?.role === 'CLIENT') {
      return app.worker?.email || 'Worker';
    }
    return app.job?.client.email || 'Client';
  };

  if (applicationsLoading) {
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
            <h2 className="font-semibold text-gray-900">Active Conversations</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {applications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No active conversations
              </div>
            ) : (
              applications.map((app) => (
                <button
                  key={app.id}
                  onClick={() => setSelectedApplication(app)}
                  className={`w-full text-left p-4 hover:bg-gray-50 transition ${
                    selectedApplication?.id === app.id ? 'bg-primary-50' : ''
                  }`}
                >
                  <h3 className="font-medium text-gray-900">{app.job?.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {getContactInfo(app)}
                  </p>
                  <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                    {app.status}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
        
        {/* Chat Room */}
        <div className="lg:col-span-2">
          {selectedApplication ? (
            <ChatRoom
              messages={messages}
              onSendMessage={handleSendMessage}
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