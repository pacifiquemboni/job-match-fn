import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { jobsService } from '../services/jobs';
import { applicationsService } from '../services/applications';
import { Job, Application } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

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
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors[status] || 'bg-gray-100'}`}>
      {status.replace('_', ' ')}
    </span>
  );
};

export const JobDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [myApplication, setMyApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const isOwner = user?.role === 'CLIENT' && job?.client.id === user?.id;
  const isWorker = user?.role === 'WORKER';

  useEffect(() => {
    if (id) loadJob();
  }, [id]);

  const loadJob = async () => {
    try {
      const jobData = await jobsService.getJobById(id!);
      setJob(jobData);

      // If client and owns the job, load applications
      if (user?.role === 'CLIENT' && jobData.client.id === user.id) {
        const apps = await applicationsService.getJobApplications(id!);
        setApplications(apps);
      }

      // If worker, check if already applied
      if (user?.role === 'WORKER' && jobData.applications) {
        const app = jobData.applications.find((a) => a.worker?.id === user.id);
        setMyApplication(app || null);
      }
    } catch (error) {
      console.error('Failed to load job:', error);
      toast.error('Job not found');
      navigate('/jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setApplying(true);
    try {
      const application = await applicationsService.applyForJob(id!);
      setMyApplication(application);
      toast.success('Application submitted!');
    } catch (error) {
      console.error('Failed to apply:', error);
    } finally {
      setApplying(false);
    }
  };

  const handleUpdateApplicationStatus = async (applicationId: string, status: Application['status']) => {
    setUpdatingStatus(applicationId);
    try {
      await applicationsService.updateApplicationStatus(applicationId, status);
      toast.success(`Application ${status.toLowerCase().replace('_', ' ')}`);
      loadJob(); // Reload to get updated data
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleUpdateJobStatus = async (status: Job['status']) => {
    try {
      await jobsService.updateJobStatus(id!, status);
      toast.success(`Job marked as ${status.toLowerCase().replace('_', ' ')}`);
      loadJob();
    } catch (error) {
      console.error('Failed to update job status:', error);
    }
  };

  const getNextStatusButton = (app: Application) => {
    const transitions: Record<string, { label: string; status: Application['status']; color: string }> = {
      PENDING: { label: 'Accept', status: 'MATCHED', color: 'bg-green-600 hover:bg-green-700' },
      MATCHED: { label: 'Start Work', status: 'IN_PROGRESS', color: 'bg-primary-600 hover:bg-primary-700' },
      IN_PROGRESS: { label: 'Complete', status: 'COMPLETED', color: 'bg-purple-600 hover:bg-purple-700' },
    };
    return transitions[app.status];
  };

  if (loading) return <LoadingSpinner />;
  if (!job) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Job Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
            <p className="text-gray-500 mt-1">Posted by {job.client.email}</p>
          </div>
          <StatusBadge status={job.status} />
        </div>

        <div className="flex items-center gap-4 mb-4">
          <span className="text-2xl font-bold text-primary-600">${job.budget.toLocaleString()}</span>
          <span className="text-gray-400">|</span>
          <span className="text-gray-600">
            {new Date(job.createdAt).toLocaleDateString()}
          </span>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {job.tags.map((t) => (
            <span key={t.id} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
              {t.tag}
            </span>
          ))}
        </div>

        <div className="prose max-w-none">
          <h3 className="text-lg font-semibold mb-2">Description</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
        </div>

        {/* Worker Actions */}
        {isWorker && (
          <div className="mt-6 pt-6 border-t">
            {job.status === 'OPEN' ? (
              myApplication ? (
                <div className="flex items-center gap-3">
                  <span className="text-gray-600">Your application:</span>
                  <StatusBadge status={myApplication.status} />
                </div>
              ) : (
                <button
                  onClick={handleApply}
                  disabled={applying}
                  className="px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
                >
                  {applying ? 'Applying...' : 'Apply for this Job'}
                </button>
              )
            ) : (
              <div className="p-4 bg-gray-100 rounded-lg">
                <p className="text-gray-600 text-sm">
                  {job.status === 'IN_PROGRESS' && 'This job is currently in progress and not accepting new applications.'}
                  {job.status === 'COMPLETED' && 'This job has been completed and is no longer accepting applications.'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Job Owner Actions - Manual Job Status Management */}
        {isOwner && (
          <div className="mt-6 pt-6 border-t">
            <h3 className="text-lg font-semibold mb-4">Manage Job Status</h3>
            <div className="flex flex-wrap gap-3">
              {job.status !== 'OPEN' && (
                <button
                  onClick={() => handleUpdateJobStatus('OPEN')}
                  className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition"
                >
                  🟢 Mark as Open
                </button>
              )}
              {job.status !== 'IN_PROGRESS' && (
                <button
                  onClick={() => handleUpdateJobStatus('IN_PROGRESS')}
                  className="px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition"
                >
                  🔵 Mark as In Progress
                </button>
              )}
              {job.status !== 'COMPLETED' && (
                <button
                  onClick={() => handleUpdateJobStatus('COMPLETED')}
                  className="px-4 py-2 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition"
                >
                  ⚫ Mark as Completed
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Job status affects who can apply and how it appears in search results
            </p>
          </div>
        )}
      </div>

      {/* Applications Section (for job owner) */}
      {isOwner && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Applications ({applications.length})
          </h2>

          {applications.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No applications yet</p>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="border border-gray-200 rounded-lg p-4 flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-medium text-gray-900">
                        {app.worker?.email}
                      </span>
                      <StatusBadge status={app.status} />
                    </div>
                    {app.worker?.workerProfile && (
                      <div className="flex flex-wrap gap-1">
                        {app.worker.workerProfile.skills.slice(0, 5).map((skill) => (
                          <span
                            key={skill}
                            className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {app.status === 'PENDING' && (
                      <button
                        onClick={() => handleUpdateApplicationStatus(app.id, 'REJECTED')}
                        disabled={updatingStatus === app.id}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition disabled:opacity-50"
                      >
                        Reject
                      </button>
                    )}
                    {getNextStatusButton(app) && (
                      <button
                        onClick={() => handleUpdateApplicationStatus(app.id, getNextStatusButton(app)!.status)}
                        disabled={updatingStatus === app.id}
                        className={`px-4 py-2 text-white rounded-lg transition disabled:opacity-50 ${getNextStatusButton(app)!.color}`}
                      >
                        {updatingStatus === app.id ? '...' : getNextStatusButton(app)!.label}
                      </button>
                    )}
                    {(app.status === 'MATCHED' || app.status === 'IN_PROGRESS') && (
                      <button
                        onClick={() => navigate('/messages')}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                      >
                        Chat
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
