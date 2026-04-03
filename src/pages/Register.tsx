import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RegisterData } from '../types';
import { Briefcase } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 flex">
      {/* Left Side - Sign Up Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="flex items-center space-x-2 mb-8">
            <Briefcase className="h-8 w-8 text-orange-600" />
            <span className="font-bold text-xl text-gray-900">JobMatch</span>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign Up</h2>
          <p className="text-gray-600 mb-8">Join Us & Unlock Seamless Job Matching</p>
          
          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="example@mail.com"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as RegisterData['role'] })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="WORKER">Worker - Looking for jobs</option>
                <option value="CLIENT">Client - Posting jobs</option>
              </select>
            </div>
            
            <div className="flex items-start space-x-2">
              <input
                type="checkbox"
                id="terms"
                className="mt-1 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                required
              />
              <label htmlFor="terms" className="text-sm text-gray-600">
                Accept the{' '}
                <Link to="/terms" className="text-orange-600 hover:text-orange-700">
                  terms and conditions
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-orange-600 hover:text-orange-700">
                  privacy policy
                </Link>
              </label>
            </div>
            
            <button
              type="submit"
              disabled={submitting}
                className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition duration-200"
            >
              {submitting ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>
          
          <p className="text-center text-gray-600 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-orange-600 hover:text-orange-700 font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
      
      {/* Right Side - Welcome Message */}
      <div className="flex-1 hidden lg:flex items-center justify-center p-8">
        <div className="bg-gray-900 rounded-2xl p-8 w-full max-w-lg text-center">
          <h3 className="text-white text-2xl font-bold mb-4">
            Welcome back! Please sign in to your{' '}
            <span className="text-orange-400 underline">JobMatch</span> account
          </h3>
          <p className="text-gray-400 mb-8">
            Connect with top professionals and find the perfect job opportunities tailored to your skills and career goals.
          </p>
          
          {/* Stats mockup */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-2xl font-bold text-white mb-1">1000+</div>
              <div className="text-gray-400 text-sm">Active Jobs</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-2xl font-bold text-white mb-1">500+</div>
              <div className="text-gray-400 text-sm">Companies</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
