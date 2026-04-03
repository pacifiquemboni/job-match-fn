// src/pages/Home.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Users, DollarSign, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Home: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Connect Talent with Opportunity
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Find the perfect match for your projects or discover exciting job opportunities
            with our intelligent job matching platform.
          </p>
          {!user && (
            <div className="space-x-4">
              <Link to="/register" className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
                Get Started
              </Link>
              <Link to="/jobs" className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition">
                Browse Jobs
              </Link>
            </div>
          )}
          {user && user.role === 'WORKER' && (
            <Link to="/jobs" className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
              Find Jobs
            </Link>
          )}
          {user && user.role === 'CLIENT' && (
            <Link to="/create-job" className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
              Post a Job
            </Link>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose JobMatch?
            </h2>
            <p className="text-lg text-gray-600">
              We make freelancing and hiring simple, secure, and efficient.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Briefcase className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Find Jobs</h3>
              <p className="text-gray-600">
                Browse thousands of opportunities matching your skills
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Hire Talent</h3>
              <p className="text-gray-600">
                Connect with skilled professionals for your projects
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <DollarSign className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Fair Payments</h3>
              <p className="text-gray-600">
                Secure payment system ensuring fair compensation
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Safe & Secure</h3>
              <p className="text-gray-600">
                Verified users and secure communication
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};