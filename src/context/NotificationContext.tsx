// src/context/NotificationContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';
import { notificationsApi } from '../services/notifications';
import toast from 'react-hot-toast';

export interface Notification {
  id: string;
  type: 'application_created' | 'application_status_changed' | 'job_status_changed' | 'new_message';
  title: string;
  message: string;
  data?: any;
  createdAt: string;
  read?: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearNotifications: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { socket, isConnected } = useSocket();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [, setIsLoading] = useState(false);

  // Fetch notifications from database when user logs in
  const refreshNotifications = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const response = await notificationsApi.getNotifications(50);
      setNotifications(response.notifications as Notification[]);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize notifications when user is available
  useEffect(() => {
    if (user) {
      refreshNotifications();
    } else {
      // Clear notifications when user logs out
      setNotifications([]);
    }
  }, [user]);

  // Handle real-time notifications via socket
  useEffect(() => {
    if (!socket || !isConnected || !user) return;

    const handleNotification = (notification: Notification) => {
      console.log('Received real-time notification:', notification);
      
      // Add to notifications list (it's already saved in DB by backend)
      setNotifications((prev) => [notification, ...prev]);
      
      // Show toast notification
      const getToastIcon = (type: string) => {
        switch (type) {
          case 'application_created': return '🎯';
          case 'application_status_changed': return '📬';
          case 'job_status_changed': return '📋';
          case 'new_message': return '💬';
          default: return '🔔';
        }
      };

      toast(`${getToastIcon(notification.type)} ${notification.title}`, {
        duration: 4000,
        style: {
          background: '#f3f4f6',
          color: '#1f2937',
          borderLeft: '4px solid #3b82f6',
        },
      });
    };

    socket.on('notification', handleNotification);

    return () => {
      socket.off('notification', handleNotification);
    };
  }, [socket, isConnected, user]);

  const markAsRead = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const clearNotifications = async () => {
    try {
      await notificationsApi.cleanOld();
      setNotifications((prev) => prev.filter(n => !n.read));
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        clearNotifications,
        refreshNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};