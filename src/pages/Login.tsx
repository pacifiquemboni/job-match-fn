import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Briefcase } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 flex">
      {/* Left Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="flex items-center space-x-2 mb-8">
            <Briefcase className="h-8 w-8 text-orange-600" />
            <span className="font-bold text-xl text-gray-900">JobMatch</span>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back!</h2>
          <p className="text-gray-600 mb-8">Please sign in to your JobMatch account</p>
          
          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="example@mail.com"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition duration-200"
            >
              {submitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          
          <p className="text-center text-gray-600 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-orange-600 hover:text-orange-700 font-semibold">
              Sign up
            </Link>
          </p>
        </div>
      </div>
      
      {/* Right Side - Dashboard Preview */}
      <div className="flex-1 hidden lg:flex items-center justify-center p-8">
        <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-lg h-96 relative overflow-hidden">
          <h3 className="text-white text-lg font-semibold mb-4">Dashboard Preview</h3>
          <div className="space-y-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400 text-sm">Total Jobs</span>
                <span className="text-white font-bold">24</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-orange-500 h-2 rounded-full w-3/4"></div>
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400 text-sm">Applications</span>
                <span className="text-white font-bold">12</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full w-1/2"></div>
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400 text-sm">Success Rate</span>
                <span className="text-white font-bold">86%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-orange-500 h-2 rounded-full w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
