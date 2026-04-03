import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { applicationsService } from '../services/applications';
import { Application } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { CheckCircle2, Clock, AlertCircle, MessageSquare, TrendingUp } from 'lucide-react';

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const colors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    MATCHED: 'bg-purple-100 text-purple-800',
    IN_PROGRESS: 'bg-blue-100 text-blue-800',
    COMPLETED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors[status] || 'bg-gray-100'}`}>
      {status.replace('_', ' ')}
    </span>
  );
};

const StatusTimeline: React.FC<{ status: Application['status'] }> = ({ status }) => {
  const statusFlow = ['PENDING', 'MATCHED', 'IN_PROGRESS', 'COMPLETED'];
  const currentIndex = statusFlow.indexOf(status);
  const isRejected = status === 'REJECTED';

  if (isRejected) {
    return (
      <div className="flex items-center gap-2 mt-3">
        <AlertCircle className="h-4 w-4 text-red-500" />
        <span className="text-xs text-red-600 font-medium">Application Rejected</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 mt-3">
      {statusFlow.map((s, idx) => (
        <React.Fragment key={s}>
          <div
            className={`flex items-center justify-center h-6 w-6 rounded-full text-xs font-semibold ${
              idx <= currentIndex
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-500'
            }`}
          >
            {idx < currentIndex ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : idx === currentIndex ? (
              <Clock className="h-4 w-4" />
            ) : (
              idx + 1
            )}
          </div>
          {idx < statusFlow.length - 1 && (
            <div
              className={`h-0.5 w-6 ${
                idx < currentIndex ? 'bg-primary-600' : 'bg-gray-200'
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export const MyApplications: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const data = await applicationsService.getMyApplications();
      setApplications(data);
    } catch (error) {
      console.error('Failed to load applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredApplications = applications.filter((app) => {
    if (filter === 'all') return true;
    return app.status === filter;
  });

  const statusCounts = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const stats = {
    total: applications.length,
    active: statusCounts['MATCHED'] + statusCounts['IN_PROGRESS'],
    completed: statusCounts['COMPLETED'],
    rejected: statusCounts['REJECTED'],
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Applications</h1>
        <p className="text-gray-600">Track your job applications and their status</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-gray-300" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Active</p>
              <p className="text-2xl font-bold text-primary-600">{stats.active}</p>
            </div>
            <Clock className="h-8 w-8 text-primary-300" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Completed</p>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-green-300" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Rejected</p>
              <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-300" />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['all', 'PENDING', 'MATCHED', 'IN_PROGRESS', 'COMPLETED', 'REJECTED'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === status
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status === 'all' ? 'All' : status.replace('_', ' ')}
            {status === 'all' ? ` (${applications.length})` : statusCounts[status] ? ` (${statusCounts[status]})` : ''}
          </button>
        ))}
      </div>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500">
            {applications.length === 0
              ? "You haven't applied to any jobs yet."
              : 'No applications match this filter.'}
          </p>
          {applications.length === 0 && (
            <Link
              to="/jobs"
              className="inline-block mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
            >
              Browse Jobs
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((app) => (
            <div
              key={app.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
            >
              <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
                <div className="flex-1">
                  <Link
                    to={`/jobs/${app.job?.id}`}
                    className="text-xl font-semibold text-gray-900 hover:text-primary-600 inline-block"
                  >
                    {app.job?.title}
                  </Link>
                  <p className="text-gray-500 text-sm mt-1">
                    Client: {app.job?.client.email}
                  </p>
                </div>
                <div className="mt-3 md:mt-0">
                  <StatusBadge status={app.status} />
                </div>
              </div>

              {/* Budget and Date */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-3 pb-4 border-b border-gray-100">
                <span className="text-lg font-bold text-primary-600">
                  💰 ${app.job?.budget.toLocaleString()}
                </span>
                <span className="text-gray-400 hidden sm:block">|</span>
                <span className="text-gray-600 text-sm">
                  📅 Applied {new Date(app.createdAt).toLocaleDateString()}
                </span>
              </div>

              {/* Status Timeline */}
              <StatusTimeline status={app.status} />

              {/* Tags */}
              <div className="flex flex-wrap gap-2 my-4">
                {app.job?.tags.slice(0, 5).map((t) => (
                  <span key={t.id} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                    {t.tag}
                  </span>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 flex-wrap">
                <Link
                  to={`/jobs/${app.job?.id}`}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
                >
                  View Job
                </Link>
                {(app.status === 'MATCHED' || app.status === 'IN_PROGRESS') && (
                  <Link
                    to="/messages"
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm font-medium"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Open Chat
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
