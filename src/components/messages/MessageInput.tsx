import React, { useState } from 'react';

interface MessageInputProps {
	onSend: (content: string) => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({ onSend }) => {
	const [content, setContent] = useState('');

	const handleSend = () => {
		const trimmed = content.trim();
		if (!trimmed) return;
		onSend(trimmed);
		setContent('');
	};

	return (
		<div className="border-t border-gray-200 p-4 flex gap-2">
			<input
				value={content}
				onChange={(event) => setContent(event.target.value)}
				onKeyDown={(event) => {
					if (event.key === 'Enter') {
						event.preventDefault();
						handleSend();
					}
				}}
				className="input-field"
				placeholder="Type a message..."
			/>
			<button className="btn-primary" onClick={handleSend}>
				Send
			</button>
		</div>
	);
};
