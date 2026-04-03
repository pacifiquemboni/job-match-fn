// src/services/messages.ts
import api from './api';
import { Message } from '../types';

export interface Conversation {
  application: {
    id: string;
    status: string;
    job: {
      id: string;
      title: string;
      client: {
        id: string;
        email: string;
        role: string;
      };
    };
    worker: {
      id: string;
      email: string;
      role: string;
      workerProfile?: {
        skills: string[];
        bio?: string;
      };
    };
  };
  lastMessage: Message | null;
  messageCount: number;
  unreadCount: number;
  isUnread: boolean;
  otherParty: {
    id: string;
    email: string;
    role: string;
    workerProfile?: {
      skills: string[];
      bio?: string;
    };
  };
}

export const messagesService = {
  async sendMessage(applicationId: string, content: string): Promise<Message> {
    const response = await api.post('/messages', { applicationId, content });
    return response.data.data;
  },

  async getMessages(applicationId: string): Promise<Message[]> {
    const response = await api.get(`/messages/${applicationId}`);
    return response.data.data;
  },

  async getConversations(): Promise<Conversation[]> {
    const response = await api.get('/messages/conversations/list');
    return response.data.data;
  },
};