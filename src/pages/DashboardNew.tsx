import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jobsService } from '../services/jobs';
import { applicationsService } from '../services/applications';
import { Job, Application } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { 
  PlusCircle, 
  Users, 
  Briefcase, 
  MessageSquare, 
  Home,
  Settings,
  HelpCircle,
  Phone,
  BarChart3,
  Calendar,
  Filter,
  MoreHorizontal,
  Wifi,
  WifiOff
} from 'lucide-react';

// Sidebar Component
const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  
  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard', active: true },
    { icon: Briefcase, label: 'Jobs', path: '/jobs' },
    { icon: Users, label: 'Applications', path: '/applications' },
    { icon: MessageSquare, label: 'Messages', path: '/messages' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];
  
  const bottomItems = [
    { icon: Phone, label: 'Contact Us', path: '/contact' },
    { icon: HelpCircle, label: 'Need Help', path: '/help' },
  ];

  return (
    <div className="bg-gray-900 w-64 min-h-screen p-6 flex flex-col">
      {/* Logo */}
      <div className="flex items-center space-x-2 mb-8">
        <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
          <Briefcase className="h-6 w-6 text-white" />
        </div>
        <div className="text-white">
          <div className="font-bold text-lg">JobMatch</div>
          <div className="text-xs text-gray-400">Dashboard</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  item.active
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
        
        {/* Bottom Menu */}
        <div className="mt-auto pt-6 space-y-2">
          {bottomItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

// Status Badge Component
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const colors: Record<string, string> = {
    OPEN: 'bg-green-100 text-green-800',
    IN_PROGRESS: 'bg-blue-100 text-blue-800',
    COMPLETED: 'bg-gray-100 text-gray-800',
    PENDING: 'bg-yellow-100 text-yellow-800',
    MATCHED: 'bg-purple-100 text-purple-800',
    REJECTED: 'bg-red-100 text-red-800',
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100'}`}>
      {status.replace('_', ' ')}
    </span>
  );
};

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      if (user?.role === 'CLIENT') {
        const data = await jobsService.getMyJobs();
        setJobs(data);
      } else if (user?.role === 'WORKER') {
        const data = await applicationsService.getMyApplications();
        setApplications(data);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  // Calculate stats
  const stats = user?.role === 'CLIENT' 
    ? {
        open: jobs.filter(j => j.status === 'OPEN').length,
        inProgress: jobs.filter(j => j.status === 'IN_PROGRESS').length, 
        completed: jobs.filter(j => j.status === 'COMPLETED').length,
        total: jobs.length
      }
    : {
        pending: applications.filter(a => a.status === 'PENDING').length,
        matched: applications.filter(a => a.status === 'MATCHED').length,
        inProgress: applications.filter(a => a.status === 'IN_PROGRESS').length,
        total: applications.length
      };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              to={user?.role === 'CLIENT' ? '/create-job' : '/jobs'}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
            >
              <PlusCircle className="h-5 w-5" />
              {user?.role === 'CLIENT' ? 'Create Job' : 'Find Jobs'}
            </Link>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(Date.now() + 7*24*60*60*1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {user?.role === 'CLIENT' ? (
              <>
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-gray-500" />
                      <span className="text-sm text-gray-600">Jobs</span>
                    </div>
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">Posted</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-gray-900">{String(stats.total).padStart(2, '0')}</span>
                    <span className="text-sm text-green-600">Active</span>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-gray-500" />
                      <span className="text-sm text-gray-600">Applications</span>
                    </div>
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">Total</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-gray-900">{String(jobs.reduce((sum, j) => sum + (j._count?.applications || 0), 0)).padStart(2, '0')}</span>
                    <span className="text-sm text-gray-600">Received</span>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-orange-500" />
                      <span className="text-sm text-gray-600">In Progress</span>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-gray-900">{String(stats.inProgress).padStart(2, '0')}</span>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-gray-500" />
                      <span className="text-sm text-gray-600">Completed</span>
                    </div>
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">Success</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-gray-900">{String(stats.completed).padStart(2, '0')}</span>
                    <span className="text-sm text-green-600">Done</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-gray-500" />
                      <span className="text-sm text-gray-600">Applications</span>
                    </div>
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">Total</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-gray-900">{String(stats.total).padStart(2, '0')}</span>
                    <span className="text-sm text-gray-600">Submitted</span>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-yellow-500" />
                      <span className="text-sm text-gray-600">Pending</span>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-gray-900">{String(stats.pending).padStart(2, '0')}</span>
                    <span className="text-sm text-yellow-600">Waiting</span>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-green-500" />
                      <span className="text-sm text-gray-600">Matched</span>
                    </div>
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">Active</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-gray-900">{String(stats.matched).padStart(2, '0')}</span>
                    <span className="text-sm text-green-600">Success</span>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-blue-500" />
                      <span className="text-sm text-gray-600">In Progress</span>
                    </div>
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">Working</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-gray-900">{String(stats.inProgress).padStart(2, '0')}</span>
                    <span className="text-sm text-blue-600">Active</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Jobs/Applications Section */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              {user?.role === 'CLIENT' ? 'Jobs' : 'Recent Applications'}
            </h2>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50">
                <Filter className="h-4 w-4 text-gray-500" />
              </button>
              <button className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50">
                <MoreHorizontal className="h-4 w-4 text-gray-500" />
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {user?.role === 'CLIENT' ? (
              jobs.slice(0, 6).map((job) => (
                <div key={job.id} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{job.title}</h3>
                      <p className="text-sm text-gray-600">Group: Job Post 1</p>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-4">
                    {job.status === 'OPEN' ? (
                      <Wifi className="h-4 w-4 text-green-500" />
                    ) : (
                      <WifiOff className="h-4 w-4 text-gray-400" />
                    )}
                    <span className="text-sm text-gray-600">
                      {job.status === 'OPEN' ? 'Online' : 'Offline'}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Budget</span>
                      <span className="text-sm font-medium">${job.budget}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Applications</span>
                      <span className="text-sm font-medium">{job._count?.applications || 0}</span>
                    </div>
                    
                    {/* Progress bars */}
                    <div className="space-y-2">
                      <div className="h-3 bg-primary-500 rounded"></div>
                      <div className="h-3 bg-blue-400 rounded" style={{ width: '60%' }}></div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              applications.slice(0, 6).map((app) => (
                <div key={app.id} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{app.job?.title}</h3>
                      <p className="text-sm text-gray-600">Group: Application 1</p>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-4">
                    {app.status === 'MATCHED' || app.status === 'IN_PROGRESS' ? (
                      <Wifi className="h-4 w-4 text-green-500" />
                    ) : (
                      <WifiOff className="h-4 w-4 text-gray-400" />
                    )}
                    <span className="text-sm text-gray-600">
                      {app.status === 'MATCHED' || app.status === 'IN_PROGRESS' ? 'Online' : 'Offline'}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Status</span>
                      <StatusBadge status={app.status} />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Budget</span>
                      <span className="text-sm font-medium">${app.job?.budget}</span>
                    </div>
                    
                    {/* Status progress */}
                    <div className="space-y-2">
                      {app.status === 'MATCHED' || app.status === 'IN_PROGRESS' ? (
                        <>
                          <div className="h-3 bg-green-500 rounded"></div>
                          <div className="h-3 bg-blue-400 rounded" style={{ width: '80%' }}></div>
                        </>
                      ) : app.status === 'PENDING' ? (
                        <>
                          <div className="h-3 bg-yellow-400 rounded" style={{ width: '40%' }}></div>
                          <div className="h-3 bg-gray-200 rounded" style={{ width: '30%' }}></div>
                        </>
                      ) : (
                        <>
                          <div className="h-3 bg-gray-300 rounded" style={{ width: '20%' }}></div>
                          <div className="h-3 bg-gray-200 rounded" style={{ width: '10%' }}></div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};