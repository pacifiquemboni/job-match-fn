import React, { useState, useEffect, useRef } from 'react';
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
  Home,
  Settings,
  HelpCircle,
  Phone,
  BarChart3,
  Calendar,
  MoreHorizontal,
  X,
  Eye,
  Menu,
  ChevronLeft,
  User,
  LogOut
} from 'lucide-react';
import toast from 'react-hot-toast';

// Sidebar Component
const Sidebar: React.FC<{ 
  userRole: string; 
  activeTab: string; 
  setActiveTab: (tab: string) => void;
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
  setShowApplicationsModal: (show: boolean) => void;
  setShowMessagesModal: (show: boolean) => void;
  setShowProfileModal: (show: boolean) => void;
}> = ({ userRole, activeTab, setActiveTab, isExpanded, setIsExpanded, setShowApplicationsModal, setShowMessagesModal, setShowProfileModal }) => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  // const [showUserDropdown, setShowUserDropdown] = useState(false);
  
  const clientMenuItems = [
    { icon: Home, label: 'Dashboard', key: 'dashboard', active: true },
    { icon: Briefcase, label: 'Jobs & Applications', key: 'jobs' },
    { icon: MessageSquare, label: 'Messages', key: 'messages' },
    { icon: Settings, label: 'Profile', key: 'profile' },
  ];

  const workerMenuItems = [
    { icon: Home, label: 'Dashboard', key: 'dashboard', active: true },
    { icon: Briefcase, label: 'Find Jobs', key: 'jobs' },
    { icon: Users, label: 'My Applications', key: 'applications' },
    { icon: MessageSquare, label: 'Messages', key: 'messages' },
    { icon: Settings, label: 'Profile', key: 'profile' },
  ];
  
  const menuItems = userRole === 'CLIENT' ? clientMenuItems : workerMenuItems;
  
  const bottomItems = [
    { icon: Phone, label: 'Contact Us', key: 'contact' },
    { icon: HelpCircle, label: 'Need Help', key: 'help' },
  ];

  const handleNavigation = (item: any) => {
    // Close mobile sidebar after navigation
    if (window.innerWidth < 768) {
      setIsExpanded(false);
    }
    
    if (item.key === 'dashboard') {
      setActiveTab('overview');
    } else if (item.key === 'jobs') {
      if (userRole === 'CLIENT') {
        setActiveTab('jobs');
      } else {
        navigate('/jobs');
      }
    } else if (item.key === 'applications') {
      setActiveTab('dashboard');
      setShowApplicationsModal(true);
    } else if (item.key === 'messages') {
      setActiveTab('messages');
      setShowMessagesModal(true);
    } else if (item.key === 'profile') {
      setActiveTab('profile');
      setShowProfileModal(true);
    }
  };

  // Fetch initial unread count from API
  useEffect(() => {
    if (!user) return;
    const fetchUnreadCount = async () => {
      try {
        const conversations = await messagesService.getConversations();
        const total = conversations.reduce((sum, c) => sum + (c.unreadCount ?? 0), 0);
        setUnreadMessageCount(total);
      } catch {}
    };
    fetchUnreadCount();
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



  return (
    <div className={`bg-gray-900 min-h-screen flex flex-col transition-all duration-300 ${
      isExpanded 
        ? 'fixed inset-0 z-50 w-full md:static md:w-64' 
        : 'hidden md:flex md:w-20'
    } md:p-6 p-4`}>
      {/* Mobile Overlay */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" 
          onClick={() => setIsExpanded(false)}
        />
      )}
      
      {/* Logo and Toggle */}
      <div className={`flex items-center ${isExpanded ? 'justify-between' : 'justify-center'} mb-6 md:mb-8`}>
        <div className={`flex items-center space-x-2 ${!isExpanded && 'hidden'}`}>
          <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
            <Briefcase className="h-6 w-6 text-white" />
          </div>
          {isExpanded && (
            <div className="text-white">
              <div className="font-bold text-lg">JobMatch</div>
              <div className="text-xs text-gray-400">Dashboard</div>
            </div>
          )}
        </div>
        
        {/* Toggle Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`transition-all duration-300 rounded-lg ${
            isExpanded 
              ? 'text-gray-400 hover:text-white hover:bg-gray-800 p-2' 
              : 'text-white bg-orange-600 hover:bg-orange-700 p-2 md:p-3 shadow-lg flex items-center justify-center'
          }`}
        >
          {isExpanded ? <ChevronLeft className="h-5 w-5" /> : <Menu className="h-5 w-5 md:h-6 md:w-6" />}
        </button>
        
        {/* Close button for mobile */}
        {isExpanded && (
          <button
            onClick={() => setIsExpanded(false)}
            className="md:hidden text-gray-400 hover:text-white p-2"
          >
            <X className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.key === activeTab || (item.key === 'dashboard' && activeTab === 'overview');
            return (
              <div key={item.key} className="relative group">
                <button
                  onClick={() => handleNavigation(item)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors relative ${
                    isActive
                      ? 'bg-orange-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {isExpanded && <span>{item.label}</span>}
                  {/* Message Counter Badge */}
                  {item.key === 'messages' && unreadMessageCount > 0 && (
                    <div className={`${
                      isExpanded 
                        ? 'ml-auto' 
                        : 'absolute -top-1 -right-1'
                    } bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-semibold`}>
                      {unreadMessageCount > 99 ? '99+' : unreadMessageCount}
                    </div>
                  )}
                </button>
                
                {/* Tooltip for collapsed state */}
                {!isExpanded && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Bottom Menu */}
        <div className="mt-auto pt-6 space-y-2">
          {bottomItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.key} className="relative group">
                <button
                  onClick={() => handleNavigation(item)}
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {isExpanded && <span>{item.label}</span>}
                </button>
                
                {/* Tooltip for collapsed state */}
                {!isExpanded && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

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
                      ? 'bg-white border-l-4 border-l-orange-600'
                      : conversation.isUnread
                      ? 'bg-blue-50 border-l-4 border-l-blue-500'
                      : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-orange-600 text-white flex items-center justify-center font-semibold text-sm">
                        {conversation.otherParty.email.charAt(0).toUpperCase()}
                      </div>
                      {conversation.isUnread && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 border-2 border-white rounded-full" />
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
                            <span className="bg-blue-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 font-semibold">
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

  const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      MATCHED: 'bg-purple-100 text-purple-800',
      IN_PROGRESS: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors[status] || 'bg-gray-100'}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  const StatusTimeline: React.FC<{ status: Application['status'] }> = ({ status }) => {
    const statusFlow = ['PENDING', 'MATCHED', 'IN_PROGRESS', 'COMPLETED'];
    const currentIndex = statusFlow.indexOf(status);
    const isRejected = status === 'REJECTED';

    if (isRejected) {
      return (
        <div className="flex items-center gap-2 mt-3">
          <X className="h-4 w-4 text-red-500" />
          <span className="text-xs text-red-600 font-medium">Application Rejected</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-1 mt-3">
        {statusFlow.map((s, idx) => (
          <React.Fragment key={s}>
            <div
              className={`flex items-center justify-center h-6 w-6 rounded-full text-xs font-semibold ${
                idx <= currentIndex
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {idx < currentIndex ? (
                <Eye className="h-4 w-4" />
              ) : idx === currentIndex ? (
                <MoreHorizontal className="h-4 w-4" />
              ) : (
                idx + 1
              )}
            </div>
            {idx < statusFlow.length - 1 && (
              <div
                className={`h-0.5 w-6 ${
                  idx < currentIndex ? 'bg-orange-600' : 'bg-gray-200'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">My Applications</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-gray-300" />
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Active</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.active}</p>
                </div>
                <MoreHorizontal className="h-8 w-8 text-orange-300" />
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                </div>
                <Eye className="h-8 w-8 text-green-300" />
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Rejected</p>
                  <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                </div>
                <X className="h-8 w-8 text-red-300" />
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {['all', 'PENDING', 'MATCHED', 'IN_PROGRESS', 'COMPLETED', 'REJECTED'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filter === status
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? 'All' : status.replace('_', ' ')}
                {status === 'all' ? ` (${applications.length})` : statusCounts[status] ? ` (${statusCounts[status]})` : ''}
              </button>
            ))}
          </div>

          {/* Applications List */}
          {filteredApplications.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <Briefcase className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 mb-4">
                {applications.length === 0
                  ? "You haven't applied to any jobs yet."
                  : 'No applications match this filter.'}
              </p>
              {applications.length === 0 && (
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
                >
                  Browse Jobs
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredApplications.map((app) => (
                <div
                  key={app.id}
                  className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition"
                >
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {app.job?.title}
                      </h3>
                      <p className="text-gray-500 text-sm mt-1">
                        Client: {app.job?.client.email}
                      </p>
                    </div>
                    <div className="mt-3 md:mt-0">
                      <StatusBadge status={app.status} />
                    </div>
                  </div>

                  {/* Budget and Date */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-3 pb-4 border-b border-gray-200">
                    <span className="text-lg font-bold text-orange-600">
                      💰 ${app.job?.budget.toLocaleString()}
                    </span>
                    <span className="text-gray-400 hidden sm:block">|</span>
                    <span className="text-gray-600 text-sm">
                      📅 Applied {new Date(app.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Status Timeline */}
                  <StatusTimeline status={app.status} />

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 my-4">
                    {app.job?.tags.slice(0, 5).map((t) => (
                      <span key={t.id} className="px-2 py-1 bg-white text-gray-600 rounded text-xs border">
                        {t.tag}
                      </span>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 flex-wrap">
                    <button className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium">
                      View Job
                    </button>
                    {(app.status === 'MATCHED' || app.status === 'IN_PROGRESS') && (
                      <button
                        onClick={() => onOpenChat(app.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition text-sm font-medium"
                      >
                        <MessageSquare className="h-4 w-4" />
                        Open Chat
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
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
                          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
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
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [initialChatApplicationId, setInitialChatApplicationId] = useState<string | undefined>(undefined);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const [, setLoadingApplications] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  
  // Mobile-first: collapsed by default, use effect to set desktop state
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Set desktop state on mount and window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) { // md breakpoint
        setIsExpanded(true);
      } else {
        setIsExpanded(false);
      }
    };
    
    handleResize(); // Set initial state
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      setActiveTab('dashboard');
    } else if (activeTab === 'profile') {
      setShowProfileModal(true);
      setActiveTab('dashboard');
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

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
            <Briefcase className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-lg text-gray-900">JobMatch</div>
            <div className="text-xs text-gray-500">Dashboard</div>
          </div>
        </div>
        
        {/* Mobile Actions */}
        <div className="flex items-center space-x-3">
          {/* Messages */}
          <button 
            onClick={() => setShowMessagesModal(true)}
            className="relative p-2 text-gray-600 hover:text-orange-600 transition"
          >
            <MessageSquare className="h-6 w-6" />
            {unreadMessageCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadMessageCount > 99 ? '99+' : unreadMessageCount}
              </span>
            )}
          </button>
          
          {/* Notifications */}
          <div className="relative">
            <NotificationDropdown />
          </div>
          
          {/* Profile - mobile header */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowUserDropdown(prev => !prev)}
              className="flex items-center"
            >
              <div className="w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center font-semibold text-sm">
                {user ? getInitials(user.email) : 'U'}
              </div>
            </button>

            {/* Dropdown Menu */}
            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900 truncate">{user?.email}</p>
                  <p className="text-xs text-gray-500">{user?.role}</p>
                </div>
                <button
                  onClick={() => { setShowProfileModal(true); setShowUserDropdown(false); }}
                  className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition"
                >
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </button>
                <div className="border-t border-gray-100 mt-1 pt-1">
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-red-50 transition"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsExpanded(true)}
            className="p-2 text-gray-600 hover:text-orange-600 transition"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>
      
      <Sidebar 
        userRole={user?.role || ''} 
        activeTab={activeTab} 
        setActiveTab={(tab: string) => setActiveTab(tab as 'dashboard' | 'overview' | 'jobs' | 'messages' | 'profile')}
        isExpanded={isExpanded}
        setIsExpanded={setIsExpanded}
        setShowApplicationsModal={setShowApplicationsModal}
        setShowMessagesModal={setShowMessagesModal}
        setShowProfileModal={setShowProfileModal}
      />
      
      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 md:mb-8">
          <div className="mb-4 md:mb-0">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">
              {user?.role === 'CLIENT' ? 'Client Dashboard' : 'Worker Dashboard'}
            </h1>
            <p className="text-sm md:text-base text-gray-600">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          {/* Desktop User Actions - Hidden on Mobile */}
          <div className="hidden md:flex items-center gap-4">
            {/* User Actions */}
            <div className="flex items-center gap-3 mr-6">
              {/* Messages */}
              <div className="relative">
                <button
                  onClick={() => setShowMessagesModal(true)}
                  className="relative text-gray-700 hover:text-orange-600 transition p-2 rounded-lg hover:bg-orange-50"
                >
                  <MessageSquare className="h-5 w-5" />
                  {unreadMessageCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadMessageCount > 99 ? '99+' : unreadMessageCount}
                    </span>
                  )}
                </button>
              </div>

              {/* Notifications */}
              <div className="relative">
                <NotificationDropdown />
              </div>

              {/* Profile */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowUserDropdown(prev => !prev)}
                  className="flex items-center"
                >
                  <div className="w-9 h-9 rounded-full bg-orange-600 text-white flex items-center justify-center font-semibold text-sm">
                    {user ? getInitials(user.email) : 'U'}
                  </div>
                </button>

                {/* Dropdown Menu */}
                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900 truncate">{user?.email}</p>
                      <p className="text-xs text-gray-500">{user?.role}</p>
                    </div>
                    <button
                      onClick={() => { setShowProfileModal(true); setShowUserDropdown(false); }}
                      className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition"
                    >
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </button>
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-red-50 transition"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            {user?.role === 'CLIENT' ? (
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
              >
                <PlusCircle className="h-5 w-5" />
                Create Job
              </button>
            ) : (
              <Link 
                to="/jobs"
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
              >
                <PlusCircle className="h-5 w-5" />
                Find Jobs
              </Link>
            )}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(Date.now() + 7*24*60*60*1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
          </div>
        </div>

        {user?.role === 'CLIENT' ? (
          <>
            {/* Client Dashboard */}
            {/* Tabs */}
            <div className="mb-6">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                      activeTab === 'overview'
                        ? 'border-primary-600 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab('jobs')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition ${
                      activeTab === 'jobs'
                        ? 'border-primary-600 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Briefcase className="h-4 w-4" />
                    Jobs & Applications
                    {jobs.reduce((sum, j) => sum + (j._count?.applications || 0), 0) > 0 && (
                      <span className="bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full text-xs">
                        {jobs.reduce((sum, j) => sum + (j._count?.applications || 0), 0)}
                      </span>
                    )}
                  </button>
                </nav>
              </div>
            </div>

            {activeTab === 'overview' && (
              <>
                {/* Statistics Cards */}
                <div className="mb-8">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-5 w-5 text-gray-500" />
                          <span className="text-sm text-gray-600">Jobs Posted</span>
                        </div>
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">Total</span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-gray-900">{String(stats.total).padStart(2, '0')}</span>
                        <span className="text-sm text-green-600">Active</span>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="h-5 w-5 text-gray-500" />
                          <span className="text-sm text-gray-600">Applications</span>
                        </div>
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">Received</span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-gray-900">{String(jobs.reduce((sum, j) => sum + (j._count?.applications || 0), 0)).padStart(2, '0')}</span>
                        <span className="text-sm text-gray-600">Total</span>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Users className="h-5 w-5 text-orange-500" />
                          <span className="text-sm text-gray-600">In Progress</span>
                        </div>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-gray-900">{String(stats.inProgress).padStart(2, '0')}</span>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="h-5 w-5 text-gray-500" />
                          <span className="text-sm text-gray-600">Completed</span>
                        </div>
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">Success</span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-gray-900">{String(stats.completed).padStart(2, '0')}</span>
                        <span className="text-sm text-green-600">Done</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Jobs Overview */}
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">Recent Jobs</h2>
                    <button
                      onClick={() => setActiveTab('jobs')}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      View All →
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {jobs.slice(0, 6).map((job) => (
                      <div key={job.id} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition cursor-pointer" onClick={() => handleJobClick(job)}>
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-1">{job.title}</h3>
                            <p className="text-sm text-gray-600">Created {new Date(job.createdAt).toLocaleDateString()}</p>
                          </div>
                          <StatusBadge status={job.status} />
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Budget</span>
                            <span className="text-sm font-medium">${job.budget}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Applications</span>
                            <span className="text-sm font-medium">{job._count?.applications || 0}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeTab === 'jobs' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Jobs & Applications Management</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {jobs.map((job) => (
                    <div 
                      key={job.id} 
                      className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition cursor-pointer"
                      onClick={() => handleJobClick(job)}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">{job.title}</h3>
                          <p className="text-sm text-gray-600">Created {new Date(job.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={job.status} />
                          <Eye className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{job.description}</p>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Budget</span>
                          <span className="text-sm font-medium">${job.budget}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Applications</span>
                          <span className={`text-sm font-medium ${(job._count?.applications || 0) > 0 ? 'text-blue-600' : 'text-gray-500'}`}>
                            {job._count?.applications || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {jobs.length === 0 && (
                  <div className="text-center py-12">
                    <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No jobs posted yet</p>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                    >
                      Create Your First Job
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <>
            {/* Worker Dashboard - keep existing implementation */}
            {/* Statistics Cards */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-gray-500" />
                      <span className="text-sm text-gray-600">Applications</span>
                    </div>
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">Total</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-gray-900">{String(stats.total).padStart(2, '0')}</span>
                    <span className="text-sm text-gray-600">Submitted</span>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-yellow-500" />
                      <span className="text-sm text-gray-600">Pending</span>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-gray-900">{String(stats.pending).padStart(2, '0')}</span>
                    <span className="text-sm text-yellow-600">Waiting</span>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-green-500" />
                      <span className="text-sm text-gray-600">Matched</span>
                    </div>
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">Active</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-gray-900">{String(stats.matched).padStart(2, '0')}</span>
                    <span className="text-sm text-green-600">Success</span>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-blue-500" />
                      <span className="text-sm text-gray-600">In Progress</span>
                    </div>
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">Working</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-gray-900">{String(stats.inProgress).padStart(2, '0')}</span>
                    <span className="text-sm text-blue-600">Active</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Applications */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Recent Applications</h2>
                <Link to="/applications" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                  View All →
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {applications.slice(0, 6).map((app) => (
                  <div key={app.id} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">{app.job?.title}</h3>
                        <p className="text-sm text-gray-600">Applied {new Date(app.createdAt).toLocaleDateString()}</p>
                      </div>
                      <StatusBadge status={app.status} />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Budget</span>
                        <span className="text-sm font-medium">${app.job?.budget}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {applications.length === 0 && (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No applications yet</p>
                  <Link
                    to="/jobs"
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                  >
                    Browse Jobs
                  </Link>
                </div>
              )}
            </div>
          </>
        )}
      </div>

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
