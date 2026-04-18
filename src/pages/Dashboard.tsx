import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { jobsService } from '../services/jobs';
import { applicationsService } from '../services/applications';
import { messagesService } from '../services/messages';
import { Job, Application } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { NotificationDropdown } from '../components/common/NotificationDropdown';
import {
  PlusCircle,
  Users,
  Briefcase,
  MessageSquare,
  Search,
  Home,
  Settings,
  HelpCircle,
  CheckCircle2,
  Clock3,
  AlertCircle,
  BarChart3,
  Calendar,
  MoreHorizontal,
  X,
  Eye,
  ChevronLeft,
  User,
  LogOut
} from 'lucide-react';
import toast from 'react-hot-toast';

// Messages Modal Component
const MessagesModal: React.FC<{ isOpen: boolean; onClose: () => void; initialApplicationId?: string }> = ({ isOpen, onClose, initialApplicationId }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadConversations();
    } else {
      // Reset state when modal closes
      setSelectedConversation(null);
      setMessages([]);
    }
  }, [isOpen]);

  // Auto-select conversation when initialApplicationId is provided
  useEffect(() => {
    if (initialApplicationId && conversations.length > 0) {
      const target = conversations.find(c => c.application.id === initialApplicationId);
      if (target) {
        setSelectedConversation(target);
        loadMessages(target.application.id);
        setConversations(prev =>
          prev.map(c =>
            c.application.id === target.application.id
              ? { ...c, isUnread: false, unreadCount: 0 }
              : c
          )
        );
      }
    }
  }, [initialApplicationId, conversations]);

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      const data = await messagesService.getConversations();
      setConversations(data);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (applicationId: string) => {
    try {
      setIsLoadingMessages(true);
      const data = await messagesService.getMessages(applicationId);
      setMessages(data);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const message = await messagesService.sendMessage(
        selectedConversation.application.id,
        newMessage.trim()
      );
      setMessages(prev => [...prev, message]);
      setNewMessage('');
      loadConversations();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Error sending message. Please try again.');
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-xl max-w-6xl w-full min-h-[420px] max-h-[90vh] sm:max-h-[80vh] overflow-hidden flex flex-col sm:flex-row">
        {/* Conversations List */}
        <div className={`${selectedConversation ? 'hidden sm:block' : 'block'} w-full sm:w-1/3 border-r sm:border-r border-b sm:border-b-0 bg-gray-50 max-h-[40vh] sm:max-h-full`}>
          <div className="p-4 border-b bg-white">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">Messages</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          <div className="overflow-y-auto h-full">
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center text-gray-500 py-12">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-sm">No conversations yet</p>
              </div>
            ) : (
              conversations.map((conversation) => (
                <div
                  key={conversation.application.id}
                  onClick={() => {
                    setSelectedConversation(conversation);
                    loadMessages(conversation.application.id);
                    // Optimistically clear unread state in local list
                    setConversations(prev =>
                      prev.map(c =>
                        c.application.id === conversation.application.id
                          ? { ...c, isUnread: false, unreadCount: 0 }
                          : c
                      )
                    );
                  }}
                  className={`p-4 border-b cursor-pointer hover:bg-white transition-colors ${
                    selectedConversation?.application.id === conversation.application.id
                      ? 'bg-white border-l-4 border-l-amber-500'
                      : conversation.isUnread
                      ? 'bg-amber-50 border-l-4 border-l-amber-400'
                      : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-orange-600 text-white flex items-center justify-center font-semibold text-sm">
                        {conversation.otherParty.email.charAt(0).toUpperCase()}
                      </div>
                      {conversation.isUnread && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 border-2 border-white rounded-full" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm truncate ${
                          conversation.isUnread ? 'font-bold text-gray-900' : 'font-medium text-gray-900'
                        }`}>
                          {conversation.otherParty.email}
                        </p>
                        <div className="flex items-center space-x-1 flex-shrink-0">
                          {conversation.unreadCount > 0 && (
                            <span className="bg-amber-400 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 font-semibold">
                              {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                            </span>
                          )}
                          <p className="text-xs text-gray-500">
                            {conversation.lastMessage ? formatDate(conversation.lastMessage.createdAt) : ''}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mb-1 truncate">
                        {conversation.application.job.title}
                      </p>
                      <p className={`text-sm truncate ${
                        conversation.isUnread ? 'text-gray-800 font-medium' : 'text-gray-500'
                      }`}>
                        {conversation.lastMessage ? conversation.lastMessage.content : 'No messages yet'}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div className={`${selectedConversation ? 'flex' : 'hidden sm:flex'} flex-1 flex-col min-h-0`}>
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b bg-white">
                <div className="flex items-center space-x-3">
                  {/* Back button for mobile */}
                  <button
                    onClick={() => setSelectedConversation(null)}
                    className="sm:hidden text-gray-600 hover:text-gray-800 mr-2"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <div className="w-10 h-10 rounded-full bg-orange-600 text-white flex items-center justify-center font-semibold">
                    {selectedConversation.otherParty.email.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{selectedConversation.otherParty.email}</p>
                    <p className="text-sm text-gray-600">{selectedConversation.application.job.title}</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {isLoadingMessages ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-gray-500 h-full flex items-center justify-center">
                    <div>
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[85%] sm:max-w-xs lg:max-w-md px-3 sm:px-4 py-2 rounded-lg ${
                        message.senderId === user?.id
                          ? 'bg-orange-600 text-white'
                          : 'bg-gray-200 text-gray-900'
                      }`}>
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.senderId === user?.id ? 'text-orange-100' : 'text-gray-500'
                        }`}>
                          {formatTime(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Message Input */}
              <div className="p-3 sm:p-4 border-t bg-white">
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type your message..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap text-sm sm:text-base"
                  >
                    Send Message
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">Select a conversation</p>
                <p className="text-sm">Choose a conversation from the left to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// My Applications Modal Component
const MyApplicationsModal: React.FC<{ isOpen: boolean; onClose: () => void; applications: Application[]; onOpenChat: (applicationId: string) => void }> = ({ isOpen, onClose, applications, onOpenChat }) => {
  const [filter, setFilter] = useState<string>('all');
  
  if (!isOpen) return null;

  const filteredApplications = applications.filter((app) => {
    if (filter === 'all') return true;
    return app.status === filter;
  });

  const statusCounts = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const stats = {
    total: applications.length,
    active: (statusCounts['MATCHED'] || 0) + (statusCounts['IN_PROGRESS'] || 0),
    completed: statusCounts['COMPLETED'] || 0,
    rejected: statusCounts['REJECTED'] || 0,
  };

  const sortedApplications = [...filteredApplications].sort((firstApplication, secondApplication) => {
    return new Date(secondApplication.createdAt).getTime() - new Date(firstApplication.createdAt).getTime();
  });

  const timelineSteps = ['APPLIED', 'MATCHED', 'IN_PROGRESS', 'COMPLETED'] as const;
  const currentStepIndex = (status: Application['status']) => {
    switch (status) {
      case 'PENDING':
        return 0;
      case 'MATCHED':
        return 1;
      case 'IN_PROGRESS':
        return 2;
      case 'COMPLETED':
        return 3;
      default:
        return -1;
    }
  };

  const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-[#dbe8f7] text-[#4e6073]',
      MATCHED: 'bg-[#c7e7ff] text-[#00658f]',
      IN_PROGRESS: 'bg-[#ffdcc5] text-[#944a00]',
      COMPLETED: 'bg-[#d8f5d0] text-[#2d6a34]',
      REJECTED: 'bg-[#ffd9d6] text-[#ba1a1a]',
    };
    return (
      <span className={`rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] ${colors[status] || 'bg-slate-100 text-slate-600'}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  const StatusTimeline: React.FC<{ status: Application['status'] }> = ({ status }) => {
    const isRejected = status === 'REJECTED';
    const currentIndex = currentStepIndex(status);

    if (isRejected) {
      return (
        <div className="mt-4 flex items-center gap-2 rounded-2xl bg-[#fff1ef] px-4 py-3 text-sm font-semibold text-[#ba1a1a]">
          <AlertCircle className="h-4 w-4" />
          <span>Application Rejected</span>
        </div>
      );
    }

    return (
      <div className="py-4">
        <div className="flex items-center justify-between gap-1 overflow-x-auto px-1">
          {timelineSteps.map((step, idx) => {
            return (
              <React.Fragment key={step}>
                <div className="flex min-w-[70px] flex-col items-center gap-2 text-center">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ring-4 ${
                      idx <= currentIndex
                        ? 'bg-[#e67e22] text-white ring-[#ffdcc5]'
                        : 'bg-[#eceef0] text-slate-500 ring-transparent'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-[0.12em] ${idx <= currentIndex ? 'text-[#944a00]' : 'text-slate-400'}`}>
                    {step.replace('_', ' ')}
                  </span>
                </div>
                {idx < timelineSteps.length - 1 && (
                  <div className={`h-[2px] flex-1 ${idx < currentIndex ? 'bg-[#e67e22]' : 'bg-[#dcc1b1]/35'} -mt-6`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  };

  const statCards = [
    {
      key: 'total',
      label: 'Total',
      value: stats.total,
      icon: BarChart3,
      iconClass: 'text-slate-400',
    },
    {
      key: 'active',
      label: 'Active',
      value: stats.active,
      icon: Clock3,
      iconClass: 'text-[#00658f]',
    },
    {
      key: 'completed',
      label: 'Completed',
      value: stats.completed,
      icon: CheckCircle2,
      iconClass: 'text-[#944a00]',
    },
    {
      key: 'rejected',
      label: 'Rejected',
      value: stats.rejected,
      icon: X,
      iconClass: 'text-[#ba1a1a]',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-sm md:p-8">
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-[28px] border border-[#dcc1b1]/20 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#dcc1b1]/20 px-6 py-5 md:px-8 md:py-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ffdcc5] text-[#944a00]">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-950">My Applications</h2>
              <p className="text-sm font-medium text-slate-500">Manage and track your active job pursuits</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto px-6 py-6 md:px-8 md:py-8">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {statCards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.key} className="rounded-2xl bg-[#f2f4f6] p-4 transition hover:border hover:border-[#e67e22]/20">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">{card.label}</span>
                    <Icon className={`h-5 w-5 ${card.iconClass}`} />
                  </div>
                  <div className="text-3xl font-black text-slate-950">{card.value}</div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 border-b border-[#dcc1b1]/20">
            <div className="flex gap-6 overflow-x-auto no-scrollbar">
            {['all', 'PENDING', 'MATCHED', 'IN_PROGRESS', 'COMPLETED', 'REJECTED'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                  className={`whitespace-nowrap border-b-2 pb-4 text-sm font-bold uppercase tracking-[0.08em] transition ${
                  filter === status
                      ? 'border-[#e67e22] text-[#944a00]'
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                {status === 'all' ? 'All' : status.replace('_', ' ')}
                {status === 'all' ? ` (${applications.length})` : statusCounts[status] ? ` (${statusCounts[status]})` : ''}
              </button>
            ))}
            </div>
          </div>

          <div className="mt-8 space-y-6">
          {sortedApplications.length === 0 ? (
            <div className="rounded-3xl bg-[#f2f4f6] p-10 text-center">
              <Briefcase className="mx-auto mb-4 h-14 w-14 text-slate-300" />
              <p className="text-slate-500 mb-4">
                {applications.length === 0
                  ? "You haven't applied to any jobs yet."
                  : 'No applications match this filter.'}
              </p>
              {applications.length === 0 && (
                <Link
                  to="/jobs"
                  className="inline-flex rounded-xl bg-[#944a00] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#7a3d00]"
                  onClick={onClose}
                >
                  Browse Jobs
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {sortedApplications.map((app) => (
                <div
                  key={app.id}
                  className="group relative overflow-hidden rounded-[28px] border border-[#dcc1b1]/15 bg-white p-6 shadow-sm transition duration-300 hover:shadow-xl"
                >
                  <div className="absolute bottom-6 left-0 top-6 w-1 rounded-r-full bg-[#e67e22]" />
                  <div className="flex flex-col gap-6 md:flex-row">
                    <div className="flex-1 space-y-5 pl-3 md:pl-4">
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div>
                          <h3 className="text-2xl font-bold tracking-tight text-slate-950 transition group-hover:text-[#944a00]">
                            {app.job?.title}
                          </h3>
                          <div className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-500">
                            <User className="h-4 w-4" />
                            <span>{app.job?.client.email}</span>
                          </div>
                        </div>
                        <div className="text-left md:text-right">
                          <div className="text-3xl font-black text-slate-950">${app.job?.budget?.toLocaleString()}</div>
                          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Project Budget</div>
                        </div>
                      </div>

                      <StatusTimeline status={app.status} />

                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-wrap gap-2">
                          {app.job?.tags.slice(0, 5).map((tag) => (
                            <span
                              key={tag.id}
                              className="rounded-full bg-[#eceef0] px-3 py-1 text-[11px] font-black uppercase tracking-[0.1em] text-slate-600"
                            >
                              {tag.tag}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                          <Calendar className="h-4 w-4" />
                          <span>Applied {new Date(app.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-row items-end justify-between gap-4 border-t border-[#dcc1b1]/15 pt-4 md:w-40 md:flex-col md:border-l md:border-t-0 md:pl-6 md:pt-0">
                      <StatusBadge status={app.status} />

                      <div className="flex w-full flex-col gap-3">
                        <Link
                          to={app.job?.id ? `/jobs/${app.job.id}` : '/jobs'}
                          onClick={onClose}
                          className="inline-flex w-full items-center justify-center rounded-xl bg-[#944a00] px-4 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#7a3d00]"
                        >
                          View Job
                        </Link>
                        {(app.status === 'MATCHED' || app.status === 'IN_PROGRESS') && (
                          <button
                            onClick={() => onOpenChat(app.id)}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#f2f4f6] px-4 py-3 text-sm font-bold text-slate-900 transition hover:bg-[#eceef0]"
                          >
                            <MessageSquare className="h-4 w-4" />
                            Open Chat
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          </div>
        </div>

        <div className="flex justify-end bg-[#f2f4f6] px-6 py-4 md:px-8">
          <button
            onClick={onClose}
            className="rounded-xl px-6 py-2.5 text-sm font-bold text-slate-500 transition hover:bg-[#eceef0] hover:text-slate-900"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Profile Modal Component
const ProfileModal: React.FC<{ isOpen: boolean; onClose: () => void; user: any }> = ({ isOpen, onClose, user }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Profile Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-20 h-20 bg-orange-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">{user?.email}</h3>
              <p className="text-sm text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <input
                type="text"
                value={user?.role || ''}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed capitalize"
              />
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Status Badge Component
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const colors: Record<string, string> = {
    OPEN: 'bg-green-100 text-green-800',
    IN_PROGRESS: 'bg-blue-100 text-blue-800',
    COMPLETED: 'bg-gray-100 text-gray-800',
    PENDING: 'bg-yellow-100 text-yellow-800',
    MATCHED: 'bg-purple-100 text-purple-800',
    REJECTED: 'bg-red-100 text-red-800',
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100'}`}>
      {status.replace('_', ' ')}
    </span>
  );
};

// Job Details Modal Component
const JobDetailsModal: React.FC<{ job: Job; applications: Application[]; onClose: () => void; onUpdateStatus: (appId: string, status: Application['status']) => void; loadingUpdate: string | null; onOpenChat: (applicationId: string) => void }> = ({ job, applications, onClose, onUpdateStatus, loadingUpdate, onOpenChat }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">{job.title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Job Details */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Job Details</h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-500">Description:</span>
                <p className="text-gray-900">{job.description}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Budget:</span>
                <p className="text-gray-900">${job.budget}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Status:</span>
                <StatusBadge status={job.status} />
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Created:</span>
                <p className="text-gray-900">{new Date(job.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
          
          {/* Applications */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Applications ({applications.length})</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {applications.length === 0 ? (
                <p className="text-gray-500">No applications yet</p>
              ) : (
                applications.map((app) => (
                  <div key={app.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-gray-900">{app.worker?.email}</p>
                        <p className="text-sm text-gray-500">Applied {new Date(app.createdAt).toLocaleDateString()}</p>
                      </div>
                      <StatusBadge status={app.status} />
                    </div>
                    
                    {app.status === 'PENDING' && (
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => onUpdateStatus(app.id, 'MATCHED')}
                          disabled={loadingUpdate === app.id}
                          className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
                        >
                          {loadingUpdate === app.id ? 'Loading...' : 'Accept'}
                        </button>
                        <button
                          onClick={() => onUpdateStatus(app.id, 'REJECTED')}
                          disabled={loadingUpdate === app.id}
                          className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50"
                        >
                          {loadingUpdate === app.id ? 'Loading...' : 'Reject'}
                        </button>
                      </div>
                    )}
                    
                    {app.status === 'MATCHED' && (
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => onUpdateStatus(app.id, 'IN_PROGRESS')}
                          disabled={loadingUpdate === app.id}
                          className="px-3 py-1 bg-primary-600 text-white rounded text-sm hover:bg-primary-700 disabled:opacity-50"
                        >
                          {loadingUpdate === app.id ? 'Loading...' : 'Start Work'}
                        </button>
                        <button
                          onClick={() => { onClose(); onOpenChat(app.id); }}
                          className="flex items-center gap-1 px-3 py-1 bg-orange-600 text-white rounded text-sm hover:bg-orange-700"
                        >
                          <MessageSquare className="h-3 w-3" />
                          Message
                        </button>
                      </div>
                    )}
                    
                    {app.status === 'IN_PROGRESS' && (
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => onUpdateStatus(app.id, 'COMPLETED')}
                          disabled={loadingUpdate === app.id}
                          className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 disabled:opacity-50"
                        >
                          {loadingUpdate === app.id ? 'Loading...' : 'Complete'}
                        </button>
                        <button
                          onClick={() => { onClose(); onOpenChat(app.id); }}
                          className="flex items-center gap-1 px-3 py-1 bg-orange-600 text-white rounded text-sm hover:bg-orange-700"
                        >
                          <MessageSquare className="h-3 w-3" />
                          Message
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Create Job Modal Component
const CreateJobModal: React.FC<{ onClose: () => void; onJobCreated: () => void }> = ({ onClose, onJobCreated }) => {
  const [loading, setLoading] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: 0,
    tags: [] as string[]
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'budget' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag)) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Description is required');
      return;
    }
    if (formData.budget <= 0) {
      toast.error('Budget must be greater than 0');
      return;
    }

    setLoading(true);
    try {
      await jobsService.createJob(formData);
      toast.success('Job created successfully!');
      onJobCreated();
      onClose();
    } catch (error) {
      console.error('Failed to create job:', error);
      toast.error('Failed to create job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Create New Job</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="e.g., Build a React Dashboard"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Describe the job requirements..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Budget ($)</label>
            <input
              type="number"
              name="budget"
              value={formData.budget || ''}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter your budget"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags / Skills</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., react, typescript"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <span key={tag} className="inline-flex items-center px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm">
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-2 text-primary-600 hover:text-primary-800"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'overview' | 'jobs' | 'messages' | 'profile'>('overview');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [jobApplications, setJobApplications] = useState<Application[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMessagesModal, setShowMessagesModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showApplicationsModal, setShowApplicationsModal] = useState(false);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [initialChatApplicationId, setInitialChatApplicationId] = useState<string | undefined>(undefined);
  const [, setLoadingApplications] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  // Pagination
  const JOBS_PER_PAGE = 10;
  const [jobsPage, setJobsPage] = useState(1);

  useEffect(() => {
    loadData();
  }, [user]);

  // Socket integration for message count
  useEffect(() => {
    if (socket && user) {
      socket.on('newMessage', () => {
        setUnreadMessageCount(prev => prev + 1);
      });

      socket.on('messagesRead', () => {
        setUnreadMessageCount(0);
      });

      socket.emit('getUnreadCount');
      socket.on('unreadCount', (count: number) => {
        setUnreadMessageCount(count);
      });

      return () => {
        socket.off('newMessage');
        socket.off('messagesRead');
        socket.off('unreadCount');
      };
    }
  }, [socket, user]);

  const getInitials = (email: string) => {
    return email.charAt(0).toUpperCase();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const loadData = async () => {
    try {
      if (user?.role === 'CLIENT') {
        const data = await jobsService.getMyJobs();
        setJobs(data);
      } else if (user?.role === 'WORKER') {
        const data = await applicationsService.getMyApplications();
        setApplications(data);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadJobApplications = async (jobId: string) => {
    setLoadingApplications(true);
    try {
      const apps = await applicationsService.getJobApplications(jobId);
      setJobApplications(apps);
    } catch (error) {
      console.error('Failed to load applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoadingApplications(false);
    }
  };

  const handleJobClick = (job: Job) => {
    setSelectedJob(job);
    loadJobApplications(job.id);
  };

  const handleUpdateApplicationStatus = async (applicationId: string, status: Application['status']) => {
    setUpdatingStatus(applicationId);
    try {
      await applicationsService.updateApplicationStatus(applicationId, status);
      toast.success(`Application ${status.toLowerCase().replace('_', ' ')}`);
      if (selectedJob) {
        loadJobApplications(selectedJob.id);
      }
      loadData(); // Refresh main data
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update application status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Handle tab navigation from sidebar
  useEffect(() => {
    if (activeTab === 'messages') {
      setShowMessagesModal(true);
      setActiveTab('overview');
    } else if (activeTab === 'profile') {
      setShowProfileModal(true);
      setActiveTab('overview');
    }
  }, [activeTab]);

  if (loading) return <LoadingSpinner />;

  // Calculate stats
  const stats = user?.role === 'CLIENT' 
    ? {
        open: jobs.filter(j => j.status === 'OPEN').length,
        inProgress: jobs.filter(j => j.status === 'IN_PROGRESS').length, 
        completed: jobs.filter(j => j.status === 'COMPLETED').length,
        total: jobs.length
      }
    : {
        pending: applications.filter(a => a.status === 'PENDING').length,
        matched: applications.filter(a => a.status === 'MATCHED').length,
        inProgress: applications.filter(a => a.status === 'IN_PROGRESS').length,
        total: applications.length
      };

  const workerDisplayName = user?.email
    ? user.email
        .split('@')[0]
        .split(/[._-]/)
        .filter(Boolean)
        .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
        .join(' ')
    : 'there';
  const workerSkillsCount = user?.workerProfile?.skills?.length ?? 0;
  const profileStrength = Math.min(
    100,
    (user?.email ? 40 : 0) +
      (workerSkillsCount > 0 ? Math.min(35, 20 + workerSkillsCount * 5) : 0) +
      (user?.workerProfile?.bio ? 25 : 0)
  );
  const recentWorkerApplications = [...applications]
    .sort((firstApplication, secondApplication) => {
      return new Date(secondApplication.createdAt).getTime() - new Date(firstApplication.createdAt).getTime();
    })
    .slice(0, 3);

  if (user?.role === 'WORKER') {
    return (
      <div className="min-h-screen bg-[#f7f9fb] md:flex">
        <aside className="hidden md:flex md:fixed md:left-0 md:top-0 md:h-screen md:w-64 md:flex-col md:border-r md:border-slate-200/40 md:bg-slate-50 md:px-4 md:py-8">
          <div className="mb-10 flex items-center gap-3 px-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#944a00] to-[#e67e22] text-white">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-orange-900">JobMatch</h1>
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-slate-500">Worker Portal</p>
            </div>
          </div>

          <nav className="flex-1 space-y-1">
            <button className="flex w-full items-center gap-3 rounded-xl border-r-4 border-orange-800 bg-orange-50/60 px-4 py-3 font-bold text-orange-900">
              <Home className="h-5 w-5" />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => navigate('/jobs')}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-slate-500 transition hover:bg-slate-200/50 hover:text-orange-700"
            >
              <Briefcase className="h-5 w-5" />
              <span>Jobs</span>
            </button>
            <button
              onClick={() => setShowApplicationsModal(true)}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-slate-500 transition hover:bg-slate-200/50 hover:text-orange-700"
            >
              <Users className="h-5 w-5" />
              <span>Applications</span>
            </button>
            <button
              onClick={() => setShowProfileModal(true)}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-slate-500 transition hover:bg-slate-200/50 hover:text-orange-700"
            >
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </button>
          </nav>

          <div className="mt-auto space-y-6">
            <Link
              to="/jobs"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-[#944a00] to-[#e67e22] px-4 py-4 font-bold text-white shadow-lg shadow-orange-500/20 transition active:scale-95"
            >
              <Search className="h-4 w-4" />
              Find New Jobs
            </Link>

            <div className="border-t border-slate-200/50 pt-6">
              <button className="flex w-full items-center gap-3 px-4 py-2 text-slate-500 transition hover:text-orange-700">
                <HelpCircle className="h-5 w-5" />
                <span className="text-sm font-medium">Help Center</span>
              </button>
              <button
                onClick={handleLogout}
                className="mt-2 flex w-full items-center gap-3 px-4 py-2 text-slate-500 transition hover:text-red-600"
              >
                <LogOut className="h-5 w-5" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>
        </aside>

        <main className="min-h-screen flex-1 md:ml-64">
          <header className="sticky top-0 z-40 flex items-center justify-between gap-4 bg-white/70 px-4 py-4 shadow-sm backdrop-blur-md sm:px-6 lg:px-8">
            <div className="relative w-full max-w-md flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search tasks or applications..."
                className="w-full rounded-xl border-none bg-slate-200/70 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-500 focus:ring-2 focus:ring-orange-200"
              />
            </div>

            <div className="flex items-center gap-4 sm:gap-6">
              <div className="relative">
                <NotificationDropdown />
              </div>
              <button
                onClick={() => setShowMessagesModal(true)}
                className="text-slate-600 transition hover:text-orange-800"
              >
                <MessageSquare className="h-5 w-5" />
              </button>
              <div className="hidden h-8 w-px bg-slate-200 sm:block" />
              <button
                onClick={() => setShowProfileModal(true)}
                className="flex items-center gap-3"
              >
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-bold text-slate-900">{workerDisplayName}</p>
                  <p className="text-xs font-medium text-slate-500">
                    {workerSkillsCount > 0 ? `${workerSkillsCount} skills listed` : 'Complete your profile'}
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-orange-200 bg-orange-600 text-sm font-semibold text-white">
                  {user?.email ? getInitials(user.email) : 'W'}
                </div>
              </button>
            </div>
          </header>

          <div className="mx-auto max-w-7xl space-y-10 p-4 sm:p-6 lg:p-8">
            <section className="space-y-1">
              <h2 className="text-4xl font-extrabold tracking-tight text-slate-950">
                Welcome back, {workerDisplayName}.
              </h2>
              <p className="text-lg text-slate-500">
                You currently have {stats.matched} matched opportunities and {stats.inProgress} active projects.
              </p>
            </section>

            <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-xl border-l-4 border-[#944a00] bg-white p-6 shadow-sm transition hover:-translate-y-1">
                <div className="mb-4 flex items-start justify-between">
                  <div className="rounded-lg bg-[#ffdcc5] p-2 text-[#944a00]">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-[#ffdcc5] px-2 py-1 text-xs font-bold text-[#944a00]">Total</span>
                </div>
                <p className="text-sm font-medium text-slate-500">Applications Submitted</p>
                <h3 className="mt-1 text-3xl font-black text-slate-950">{String(stats.total).padStart(2, '0')}</h3>
              </div>

              <div className="rounded-xl border-l-4 border-[#4e6073] bg-white p-6 shadow-sm transition hover:-translate-y-1">
                <div className="mb-4 rounded-lg bg-[#d1e4fb] p-2 text-[#4e6073] w-fit">
                  <Calendar className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium text-slate-500">Pending Waiting</p>
                <h3 className="mt-1 text-3xl font-black text-slate-950">{String(stats.pending).padStart(2, '0')}</h3>
              </div>

              <div className="rounded-xl border-l-4 border-[#00658f] bg-white p-6 shadow-sm transition hover:-translate-y-1">
                <div className="mb-4 flex items-start justify-between">
                  <div className="rounded-lg bg-[#c7e7ff] p-2 text-[#00658f]">
                    <Users className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-[#c7e7ff] px-2 py-1 text-xs font-bold text-[#00658f]">New</span>
                </div>
                <p className="text-sm font-medium text-slate-500">Matched Success</p>
                <h3 className="mt-1 text-3xl font-black text-slate-950">{String(stats.matched).padStart(2, '0')}</h3>
              </div>

              <div className="rounded-xl border-l-4 border-[#e67e22] bg-white p-6 shadow-sm transition hover:-translate-y-1">
                <div className="mb-4 rounded-lg bg-orange-100 p-2 text-[#e67e22] w-fit">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium text-slate-500">In Progress Active</p>
                <h3 className="mt-1 text-3xl font-black text-slate-950">{String(stats.inProgress).padStart(2, '0')}</h3>
              </div>
            </section>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
              <section className="space-y-6 lg:col-span-8">
                <div className="flex items-end justify-between gap-4">
                  <h3 className="text-3xl font-bold tracking-tight text-slate-950">My Applications</h3>
                  <button
                    onClick={() => setShowApplicationsModal(true)}
                    className="text-sm font-bold text-[#944a00] transition hover:underline"
                  >
                    View All Applications
                  </button>
                </div>

                <div className="overflow-hidden rounded-xl bg-white shadow-sm">
                  {recentWorkerApplications.length === 0 ? (
                    <div className="p-10 text-center">
                      <Users className="mx-auto mb-4 h-12 w-12 text-slate-300" />
                      <p className="text-slate-500">No applications yet.</p>
                      <Link
                        to="/jobs"
                        className="mt-4 inline-flex items-center rounded-xl bg-[#944a00] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#7a3d00]"
                      >
                        Browse Jobs
                      </Link>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {recentWorkerApplications.map((application) => (
                        <button
                          key={application.id}
                          onClick={() => setShowApplicationsModal(true)}
                          className="flex w-full flex-col gap-4 p-6 text-left transition hover:bg-slate-50 md:flex-row md:items-center md:justify-between"
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-600">
                              {application.job?.title?.charAt(0).toUpperCase() || 'J'}
                            </div>
                            <div>
                              <h4 className="text-lg font-bold leading-tight text-slate-950">{application.job?.title}</h4>
                              <p className="text-xs font-medium text-slate-500">
                                Applied {new Date(application.createdAt).toLocaleDateString()} • {application.job?.client.email}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-6 md:justify-end">
                            <div className="text-right">
                              <p className="text-sm font-bold text-slate-950">
                                ${application.job?.budget?.toLocaleString()}
                              </p>
                              <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400">
                                Budget
                              </p>
                            </div>
                            <StatusBadge status={application.status} />
                            <MoreHorizontal className="h-5 w-5 text-slate-300" />
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              <aside className="space-y-8 lg:col-span-4">
                <div className="relative overflow-hidden rounded-xl bg-[#f2f4f6] p-8">
                  <div className="relative z-10">
                    <h4 className="mb-6 text-lg font-bold text-slate-950">Profile Strength</h4>
                    <div className="mb-6 flex items-center justify-center">
                      <div className="relative h-32 w-32">
                        <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                          <path
                            className="stroke-current text-[#c7e7ff]"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            strokeWidth="3"
                          />
                          <path
                            className="stroke-current text-[#00658f]"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            strokeDasharray={`${profileStrength}, 100`}
                            strokeLinecap="round"
                            strokeWidth="3"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center text-2xl font-black text-slate-950">
                          {profileStrength}%
                        </div>
                      </div>
                    </div>
                    <p className="mb-6 text-center text-sm text-slate-600">
                      Add more profile details and skills to improve your visibility.
                    </p>
                    <button
                      onClick={() => setShowProfileModal(true)}
                      className="w-full rounded-xl border-2 border-[#944a00] py-3 font-bold text-[#944a00] transition hover:bg-[#944a00] hover:text-white"
                    >
                      Complete Profile
                    </button>
                  </div>
                  <div className="absolute -bottom-12 -right-12 h-48 w-48 rounded-full bg-[#944a00]/5 blur-3xl" />
                </div>

                <div className="space-y-4 rounded-xl bg-white p-6 shadow-sm">
                  <h4 className="text-lg font-bold text-slate-950">Application Snapshot</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">Pending Review</span>
                      <span className="text-sm font-bold text-slate-950">{stats.pending}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">Matched</span>
                      <span className="text-sm font-bold text-slate-950">{stats.matched}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">In Progress</span>
                      <span className="text-sm font-bold text-slate-950">{stats.inProgress}</span>
                    </div>
                    <div className="h-px bg-slate-100" />
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-950">Total Applications</span>
                      <span className="text-xl font-black text-[#944a00]">{stats.total}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowApplicationsModal(true)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 py-3 font-bold text-slate-900 transition hover:bg-slate-200"
                  >
                    <Eye className="h-4 w-4" />
                    View Applications
                  </button>
                </div>
              </aside>
            </div>
          </div>

          <MessagesModal 
            isOpen={showMessagesModal} 
            onClose={() => { setShowMessagesModal(false); setInitialChatApplicationId(undefined); }}
            initialApplicationId={initialChatApplicationId}
          />

          <MyApplicationsModal
            isOpen={showApplicationsModal}
            onClose={() => setShowApplicationsModal(false)}
            applications={applications}
            onOpenChat={(appId) => {
              setShowApplicationsModal(false);
              setInitialChatApplicationId(appId);
              setShowMessagesModal(true);
            }}
          />

          <ProfileModal 
            isOpen={showProfileModal} 
            onClose={() => setShowProfileModal(false)} 
            user={user}
          />
        </main>
      </div>
    );
  }

  // CLIENT DASHBOARD — same visual style as Worker Dashboard
  const recentClientJobs = [...jobs]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);
  const totalAppsReceived = jobs.reduce((sum, j) => sum + (j._count?.applications || 0), 0);
  const clientOpenJobs = jobs.filter(j => j.status === 'OPEN').length;
  const clientInProgressJobs = jobs.filter(j => j.status === 'IN_PROGRESS').length;
  const clientCompletedJobs = jobs.filter(j => j.status === 'COMPLETED').length;

  return (
    <div className="min-h-screen bg-[#f7f9fb] md:flex">
      {/* Client Sidebar */}
      <aside className="hidden md:flex md:fixed md:left-0 md:top-0 md:h-screen md:w-64 md:flex-col md:border-r md:border-slate-200/40 md:bg-slate-50 md:px-4 md:py-8">
        <div className="mb-10 flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#944a00] to-[#e67e22] text-white">
            <Briefcase className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-orange-900">JobMatch</h1>
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-slate-500">Client Portal</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          <button className="flex w-full items-center gap-3 rounded-xl border-r-4 border-orange-800 bg-orange-50/60 px-4 py-3 font-bold text-orange-900">
            <Home className="h-5 w-5" />
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-slate-500 transition hover:bg-slate-200/50 hover:text-orange-700"
          >
            <PlusCircle className="h-5 w-5" />
            <span>Post a Job</span>
          </button>
          <button
            onClick={() => setActiveTab('jobs')}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-slate-500 transition hover:bg-slate-200/50 hover:text-orange-700"
          >
            <Briefcase className="h-5 w-5" />
            <span>Jobs & Applications</span>
          </button>
          <button
            onClick={() => setShowMessagesModal(true)}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-slate-500 transition hover:bg-slate-200/50 hover:text-orange-700"
          >
            <MessageSquare className="h-5 w-5" />
            <span className="flex-1">Messages</span>
            {unreadMessageCount > 0 && (
              <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                {unreadMessageCount > 99 ? '99+' : unreadMessageCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setShowProfileModal(true)}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-slate-500 transition hover:bg-slate-200/50 hover:text-orange-700"
          >
            <Settings className="h-5 w-5" />
            <span>Settings</span>
          </button>
        </nav>

        <div className="mt-auto space-y-6">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-[#944a00] to-[#e67e22] px-4 py-4 font-bold text-white shadow-lg shadow-orange-500/20 transition active:scale-95"
          >
            <PlusCircle className="h-4 w-4" />
            Post New Job
          </button>
          <div className="border-t border-slate-200/50 pt-6">
            <button className="flex w-full items-center gap-3 px-4 py-2 text-slate-500 transition hover:text-orange-700">
              <HelpCircle className="h-5 w-5" />
              <span className="text-sm font-medium">Help Center</span>
            </button>
            <button
              onClick={handleLogout}
              className="mt-2 flex w-full items-center gap-3 px-4 py-2 text-slate-500 transition hover:text-red-600"
            >
              <LogOut className="h-5 w-5" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>
      
      {/* Client Main */}
      <main className="min-h-screen flex-1 md:ml-64">
        <header className="sticky top-0 z-40 flex items-center justify-between gap-4 bg-white/70 px-4 py-4 shadow-sm backdrop-blur-md sm:px-6 lg:px-8">
          <div className="relative w-full max-w-md flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search jobs or applications..."
              className="w-full rounded-xl border-none bg-slate-200/70 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-500 focus:ring-2 focus:ring-orange-200"
            />
          </div>
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="relative">
              <NotificationDropdown />
            </div>
            <button
              onClick={() => setShowMessagesModal(true)}
              className="text-slate-600 transition hover:text-orange-800"
            >
              <MessageSquare className="h-5 w-5" />
            </button>
            <div className="hidden h-8 w-px bg-slate-200 sm:block" />
            <button
              onClick={() => setShowProfileModal(true)}
              className="flex items-center gap-3"
            >
              <div className="hidden text-right sm:block">
                <p className="text-sm font-bold text-slate-900">{workerDisplayName}</p>
                <p className="text-xs font-medium text-slate-500">Client Portal</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-orange-200 bg-orange-600 text-sm font-semibold text-white">
                {user?.email ? getInitials(user.email) : 'C'}
              </div>
            </button>
          </div>
        </header>

        <div className="mx-auto max-w-7xl space-y-10 p-4 sm:p-6 lg:p-8">
          {/* Welcome */}
          <section className="space-y-1">
            <h2 className="text-4xl font-extrabold tracking-tight text-slate-950">
              Welcome back, {workerDisplayName}.
            </h2>
            <p className="text-lg text-slate-500">
              You have {clientOpenJobs} open {clientOpenJobs === 1 ? 'job' : 'jobs'} and {totalAppsReceived} total {totalAppsReceived === 1 ? 'application' : 'applications'} received.
            </p>
          </section>

          {/* Stats Cards */}
          <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border-l-4 border-[#944a00] bg-white p-6 shadow-sm transition hover:-translate-y-1">
              <div className="mb-4 flex items-start justify-between">
                <div className="rounded-lg bg-[#ffdcc5] p-2 text-[#944a00]">
                  <Briefcase className="h-5 w-5" />
                </div>
                <span className="rounded-full bg-[#ffdcc5] px-2 py-1 text-xs font-bold text-[#944a00]">Total</span>
              </div>
              <p className="text-sm font-medium text-slate-500">Jobs Posted</p>
              <h3 className="mt-1 text-3xl font-black text-slate-950">{String(jobs.length).padStart(2, '0')}</h3>
            </div>

            <div className="rounded-xl border-l-4 border-[#4e6073] bg-white p-6 shadow-sm transition hover:-translate-y-1">
              <div className="mb-4 rounded-lg bg-[#d1e4fb] p-2 text-[#4e6073] w-fit">
                <Users className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium text-slate-500">Applications Received</p>
              <h3 className="mt-1 text-3xl font-black text-slate-950">{String(totalAppsReceived).padStart(2, '0')}</h3>
            </div>

            <div className="rounded-xl border-l-4 border-[#00658f] bg-white p-6 shadow-sm transition hover:-translate-y-1">
              <div className="mb-4 flex items-start justify-between">
                <div className="rounded-lg bg-[#c7e7ff] p-2 text-[#00658f]">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <span className="rounded-full bg-[#c7e7ff] px-2 py-1 text-xs font-bold text-[#00658f]">Active</span>
              </div>
              <p className="text-sm font-medium text-slate-500">In Progress</p>
              <h3 className="mt-1 text-3xl font-black text-slate-950">{String(clientInProgressJobs).padStart(2, '0')}</h3>
            </div>

            <div className="rounded-xl border-l-4 border-[#e67e22] bg-white p-6 shadow-sm transition hover:-translate-y-1">
              <div className="mb-4 rounded-lg bg-orange-100 p-2 text-[#e67e22] w-fit">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium text-slate-500">Completed Jobs</p>
              <h3 className="mt-1 text-3xl font-black text-slate-950">{String(clientCompletedJobs).padStart(2, '0')}</h3>
            </div>
          </section>

          {/* Main grid */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Recent Jobs */}
            <section className="space-y-6 lg:col-span-8">
              <div className="flex items-end justify-between gap-4">
                <h3 className="text-3xl font-bold tracking-tight text-slate-950">Recent Jobs</h3>
                <button
                  onClick={() => setActiveTab('jobs')}
                  className="text-sm font-bold text-[#944a00] transition hover:underline"
                >
                  View All Jobs
                </button>
              </div>
              <div className="overflow-hidden rounded-xl bg-white shadow-sm">
                {recentClientJobs.length === 0 ? (
                  <div className="p-10 text-center">
                    <Briefcase className="mx-auto mb-4 h-12 w-12 text-slate-300" />
                    <p className="text-slate-500">No jobs posted yet.</p>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="mt-4 inline-flex items-center rounded-xl bg-[#944a00] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#7a3d00]"
                    >
                      Post Your First Job
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {recentClientJobs.map((job) => (
                      <button
                        key={job.id}
                        onClick={() => handleJobClick(job)}
                        className="flex w-full flex-col gap-4 p-6 text-left transition hover:bg-slate-50 md:flex-row md:items-center md:justify-between"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-600">
                            {job.title?.charAt(0).toUpperCase() || 'J'}
                          </div>
                          <div>
                            <h4 className="text-lg font-bold leading-tight text-slate-950">{job.title}</h4>
                            <p className="text-xs font-medium text-slate-500">
                              Posted {new Date(job.createdAt).toLocaleDateString()} • {job._count?.applications || 0} application{(job._count?.applications || 0) !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-6 md:justify-end">
                          <div className="text-right">
                            <p className="text-sm font-bold text-slate-950">${job.budget?.toLocaleString()}</p>
                            <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400">Budget</p>
                          </div>
                          <StatusBadge status={job.status} />
                          <MoreHorizontal className="h-5 w-5 text-slate-300" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Job Snapshot Sidebar */}
            <aside className="space-y-8 lg:col-span-4">
              <div className="space-y-4 rounded-xl bg-white p-6 shadow-sm">
                <h4 className="text-lg font-bold text-slate-950">Job Snapshot</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">Open</span>
                    <span className="text-sm font-bold text-slate-950">{clientOpenJobs}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">In Progress</span>
                    <span className="text-sm font-bold text-slate-950">{clientInProgressJobs}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">Completed</span>
                    <span className="text-sm font-bold text-slate-950">{clientCompletedJobs}</span>
                  </div>
                  <div className="h-px bg-slate-100" />
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-950">Total Jobs</span>
                    <span className="text-xl font-black text-[#944a00]">{jobs.length}</span>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('jobs')}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 py-3 font-bold text-slate-900 transition hover:bg-slate-200"
                >
                  <Eye className="h-4 w-4" />
                  View All Jobs
                </button>
              </div>

              <div className="relative overflow-hidden rounded-xl bg-[#f2f4f6] p-8">
                <div className="relative z-10">
                  <h4 className="mb-4 text-lg font-bold text-slate-950">Applications Received</h4>
                  <div className="mb-2 text-5xl font-black text-[#944a00]">{String(totalAppsReceived).padStart(2, '0')}</div>
                  <p className="mb-6 text-sm text-slate-600">Total across all your posted jobs.</p>
                  <button
                    onClick={() => setActiveTab('jobs')}
                    className="w-full rounded-xl border-2 border-[#944a00] py-3 font-bold text-[#944a00] transition hover:bg-[#944a00] hover:text-white"
                  >
                    Review Applications
                  </button>
                </div>
                <div className="absolute -bottom-12 -right-12 h-48 w-48 rounded-full bg-[#944a00]/5 blur-3xl" />
              </div>
            </aside>
          </div>

          {/* All Jobs Table */}
          {activeTab === 'jobs' && (
            <section className="space-y-6">
              <div className="flex items-end justify-between gap-4">
                <h3 className="text-3xl font-bold tracking-tight text-slate-950">Jobs & Applications</h3>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-br from-[#944a00] to-[#e67e22] px-4 py-2 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition active:scale-95"
                >
                  <PlusCircle className="h-4 w-4" />
                  Post New Job
                </button>
              </div>

              {jobs.length === 0 ? (
                <div className="flex flex-col items-center rounded-xl bg-white p-10 shadow-sm">
                  <Briefcase className="mb-4 h-12 w-12 text-slate-300" />
                  <p className="text-slate-500">No jobs posted yet.</p>
                </div>
              ) : (() => {
                const totalJobPages = Math.ceil(jobs.length / JOBS_PER_PAGE);
                const pagedJobs = jobs.slice((jobsPage - 1) * JOBS_PER_PAGE, jobsPage * JOBS_PER_PAGE);
                return (
                  <>
                    <div className="overflow-hidden rounded-xl bg-white shadow-sm">
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-100">
                          <thead className="bg-slate-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">#</th>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Job Title</th>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tags</th>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Budget</th>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Applications</th>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Created</th>
                              <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-slate-100">
                            {pagedJobs.map((job, index) => (
                              <tr
                                key={job.id}
                                className="hover:bg-orange-50 transition-colors cursor-pointer"
                                onClick={() => handleJobClick(job)}
                              >
                                <td className="px-6 py-4 text-sm text-slate-400">{(jobsPage - 1) * JOBS_PER_PAGE + index + 1}</td>
                                <td className="px-6 py-4">
                                  <p className="text-sm font-bold text-slate-950">{job.title}</p>
                                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{job.description}</p>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex flex-wrap gap-1">
                                    {(job.tags ?? []).slice(0, 3).map((t) => (
                                      <span key={t.id} className="inline-block px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full">
                                        {t.tag}
                                      </span>
                                    ))}
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-sm font-bold text-slate-950">
                                  ${job.budget.toLocaleString()}
                                </td>
                                <td className="px-6 py-4">
                                  <StatusBadge status={job.status} />
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`text-sm font-semibold ${(job._count?.applications || 0) > 0 ? 'text-[#944a00]' : 'text-slate-400'}`}>
                                    {job._count?.applications || 0}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-500">
                                  {new Date(job.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleJobClick(job); }}
                                    className="inline-flex items-center gap-1 text-xs text-[#944a00] hover:text-[#7a3d00] font-bold"
                                  >
                                    <Eye className="h-4 w-4" />
                                    View
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {totalJobPages > 1 && (
                      <div className="flex items-center justify-between mt-4 px-1">
                        <p className="text-sm text-slate-500">
                          Showing {(jobsPage - 1) * JOBS_PER_PAGE + 1}–{Math.min(jobsPage * JOBS_PER_PAGE, jobs.length)} of {jobs.length} jobs
                        </p>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setJobsPage(p => Math.max(1, p - 1))}
                            disabled={jobsPage === 1}
                            className="px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                          >
                            ← Prev
                          </button>
                          {Array.from({ length: totalJobPages }, (_, i) => i + 1)
                            .filter(p => p === 1 || p === totalJobPages || Math.abs(p - jobsPage) <= 1)
                            .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                              if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('...');
                              acc.push(p);
                              return acc;
                            }, [])
                            .map((item, idx) =>
                              item === '...' ? (
                                <span key={`ellipsis-${idx}`} className="px-2 text-slate-400 text-sm">…</span>
                              ) : (
                                <button
                                  key={item}
                                  onClick={() => setJobsPage(item as number)}
                                  className={`w-8 h-8 rounded-lg text-sm font-medium transition ${
                                    jobsPage === item
                                      ? 'bg-[#e67e22] text-white'
                                      : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                                  }`}
                                >
                                  {item}
                                </button>
                              )
                            )}
                          <button
                            onClick={() => setJobsPage(p => Math.min(totalJobPages, p + 1))}
                            disabled={jobsPage === totalJobPages}
                            className="px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                          >
                            Next →
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </section>
          )}
        </div>
      </main>

      {/* Modals */}
      {selectedJob && (
        <JobDetailsModal
          job={selectedJob}
          applications={jobApplications}
          onClose={() => {
            setSelectedJob(null);
            setJobApplications([]);
          }}
          onUpdateStatus={handleUpdateApplicationStatus}
          loadingUpdate={updatingStatus}
          onOpenChat={(appId) => {
            setSelectedJob(null);
            setJobApplications([]);
            setInitialChatApplicationId(appId);
            setShowMessagesModal(true);
          }}
        />
      )}

      {showCreateModal && (
        <CreateJobModal
          onClose={() => setShowCreateModal(false)}
          onJobCreated={() => {
            loadData();
            setShowCreateModal(false);
          }}
        />
      )}

      {/* New Modal Components */}
      <MessagesModal 
        isOpen={showMessagesModal} 
        onClose={() => { setShowMessagesModal(false); setInitialChatApplicationId(undefined); }}
        initialApplicationId={initialChatApplicationId}
      />
      
      <MyApplicationsModal
        isOpen={showApplicationsModal}
        onClose={() => setShowApplicationsModal(false)}
        applications={applications}
        onOpenChat={(appId) => {
          setShowApplicationsModal(false);
          setInitialChatApplicationId(appId);
          setShowMessagesModal(true);
        }}
      />
      
      <ProfileModal 
        isOpen={showProfileModal} 
        onClose={() => setShowProfileModal(false)} 
        user={user}
      />
    </div>
  );
};
