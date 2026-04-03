// src/components/messages/ChatRoom.tsx
import React, { useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import { Message } from '../../types';
import { MessageInput } from './MessageInput';

interface ChatRoomProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
}

export const ChatRoom: React.FC<ChatRoomProps> = ({ messages, onSendMessage }) => {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-lg shadow-md">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-4 flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-lg px-4 py-2 ${
                message.senderId === user?.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <p
                className={`text-xs mt-1 ${
                  message.senderId === user?.id ? 'text-primary-100' : 'text-gray-500'
                }`}
              >
                {format(new Date(message.createdAt), 'HH:mm')}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <MessageInput onSend={onSendMessage} />
    </div>
  );
};