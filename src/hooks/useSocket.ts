// src/hooks/useSocket.ts
import { useEffect, useState, useCallback } from 'react';
import { useSocket as useSocketContext } from '../context/SocketContext';
import { Message } from '../types';
import { messagesService } from '../services/messages';

export const useSocketMessages = (applicationId: string) => {
  const { socket, isConnected } = useSocketContext();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  // Load initial messages from API
  useEffect(() => {
    if (!applicationId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    const loadInitialMessages = async () => {
      try {
        setLoading(true);
        const initialMessages = await messagesService.getMessages(applicationId);
        setMessages(initialMessages);
      } catch (error) {
        console.error('Failed to load messages:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialMessages();
  }, [applicationId]);

  // Join socket room and listen for new messages
  useEffect(() => {
    if (!socket || !isConnected || !applicationId) return;

    socket.emit('join-room', applicationId);

    const handleNewMessage = (message: Message) => {
      setMessages((prev) => [...prev, message]);
    };

    socket.on('new-message', handleNewMessage);

    return () => {
      socket.off('new-message', handleNewMessage);
    };
  }, [socket, isConnected, applicationId]);

  const sendMessage = useCallback((content: string) => {
    if (socket && isConnected && applicationId) {
      socket.emit('send-message', { applicationId, content });
    }
  }, [socket, isConnected, applicationId]);

  return { messages, sendMessage, isConnected, loading };
};