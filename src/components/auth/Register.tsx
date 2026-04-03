import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { RegisterData } from '../../types';

export const Register: React.FC = () => {
	const { register } = useAuth();
	const navigate = useNavigate();
	const [form, setForm] = useState<RegisterData>({
		email: '',
		password: '',
		role: 'WORKER',
	});
	const [submitting, setSubmitting] = useState(false);

	const onSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		setSubmitting(true);
		try {
			await register(form);
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
					value={form.email}
					onChange={(event) => setForm({ ...form, email: event.target.value })}
					className="input-field"
					required
				/>
			</div>
			<div>
				<label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
				<input
					type="password"
					value={form.password}
					onChange={(event) => setForm({ ...form, password: event.target.value })}
					className="input-field"
					required
				/>
			</div>
			<div>
				<label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
				<select
					value={form.role}
					onChange={(event) =>
						setForm({ ...form, role: event.target.value as RegisterData['role'] })
					}
					className="input-field"
				>
					<option value="WORKER">Worker</option>
					<option value="CLIENT">Client</option>
				</select>
			</div>
			<button type="submit" className="btn-primary w-full" disabled={submitting}>
				{submitting ? 'Creating account...' : 'Register'}
			</button>
		</form>
	);
};
