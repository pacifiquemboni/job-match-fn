import React from 'react';
import { Message } from '../../types';

interface MessageListProps {
	messages: Message[];
}

export const MessageList: React.FC<MessageListProps> = ({ messages }) => {
	return (
		<ul className="space-y-2">
			{messages.map((message) => (
				<li key={message.id} className="text-sm text-gray-700">
					{message.content}
				</li>
			))}
		</ul>
	);
};
