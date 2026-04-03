import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const Login: React.FC = () => {
	const { login } = useAuth();
	const navigate = useNavigate();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [submitting, setSubmitting] = useState(false);

	const onSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		setSubmitting(true);
		try {
			await login(email, password);
			navigate('/');
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<form onSubmit={onSubmit} className="space-y-4">
			<div>
				<label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
				<input
					type="email"
					value={email}
					onChange={(event) => setEmail(event.target.value)}
					className="input-field"
					required
				/>
			</div>
			<div>
				<label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
				<input
					type="password"
					value={password}
					onChange={(event) => setPassword(event.target.value)}
					className="input-field"
					required
				/>
			</div>
			<button type="submit" className="btn-primary w-full" disabled={submitting}>
				{submitting ? 'Signing in...' : 'Login'}
			</button>
		</form>
	);
};
