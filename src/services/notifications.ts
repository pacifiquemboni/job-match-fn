// src/services/notifications.ts
import api from './api';

export interface NotificationResponse {
  notifications: Array<{
    id: string;
    type: string;
    title: string;
    message: string;
    data?: any;
    read: boolean;
    createdAt: string;
  }>;
}

export interface UnreadCountResponse {
  count: number;
}

export const notificationsApi = {
  getNotifications: async (limit = 50): Promise<NotificationResponse> => {
    const response = await api.get(`/notifications?limit=${limit}`);
    return response.data;
  },

  getUnreadCount: async (): Promise<UnreadCountResponse> => {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  },

  markAsRead: async (notificationId: string): Promise<{ success: boolean }> => {
    const response = await api.patch(`/notifications/${notificationId}/read`);
    return response.data;
  },

  markAllAsRead: async (): Promise<{ success: boolean }> => {
    const response = await api.patch('/notifications/mark-all-read');
    return response.data;
  },

  cleanOld: async (days = 30): Promise<{ success: boolean; deletedCount: number }> => {
    const response = await api.delete(`/notifications/clean-old?days=${days}`);
    return response.data;
  },
};