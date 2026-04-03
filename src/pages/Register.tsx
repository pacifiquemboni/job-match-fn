import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RegisterData } from '../types';

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
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      {/* Brand icon */}
      <div className="w-16 h-16 bg-amber-400 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
        <span className="text-2xl font-bold text-white select-none">J</span>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-1">Create account</h1>
      <p className="text-gray-500 mb-8 text-sm">Join us & unlock seamless job matching</p>

      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-4 py-3 bg-amber-50 border border-amber-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent text-gray-900 placeholder-gray-400"
            placeholder="example@mail.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full px-4 py-3 bg-amber-50 border border-amber-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent text-gray-900"
            placeholder="••••••••"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">I am a</label>
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value as RegisterData['role'] })}
            className="w-full px-4 py-3 bg-amber-50 border border-amber-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent text-gray-900"
          >
            <option value="WORKER">Worker — Looking for jobs</option>
            <option value="CLIENT">Client — Posting jobs</option>
          </select>
        </div>

        <div className="flex items-start space-x-2">
          <input
            type="checkbox"
            id="terms"
            className="mt-0.5 h-4 w-4 accent-amber-400"
            required
          />
          <label htmlFor="terms" className="text-sm text-gray-500">
            I agree to the{' '}
            <Link to="/terms" className="text-amber-500 hover:text-amber-600">terms</Link>
            {' '}and{' '}
            <Link to="/privacy" className="text-amber-500 hover:text-amber-600">privacy policy</Link>
          </label>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-amber-400 hover:bg-amber-500 text-white py-3 rounded-xl font-semibold transition duration-200 disabled:opacity-60"
        >
          {submitting ? 'Creating account...' : 'Sign Up'}
        </button>
      </form>

      <p className="text-gray-500 mt-6 text-sm">
        Already have an account?{' '}
        <Link to="/login" className="text-amber-500 hover:text-amber-600 font-semibold">
          Sign in
        </Link>
      </p>
    </div>
  );
};
