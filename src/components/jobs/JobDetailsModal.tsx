import React, { useEffect, useState } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Building2,
  Clock3,
  DollarSign,
  Share2,
  Tag,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { jobsService } from '../../services/jobs';
import { applicationsService } from '../../services/applications';
import { Application, Job } from '../../types';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface JobDetailsModalProps {
  jobId: string;
  onClose: () => void;
  mode?: 'modal' | 'page';
}

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const colors: Record<string, string> = {
    OPEN: 'bg-green-100 text-green-800',
    IN_PROGRESS: 'bg-blue-100 text-blue-800',
    COMPLETED: 'bg-slate-200 text-slate-700',
    PENDING: 'bg-amber-100 text-amber-700',
    MATCHED: 'bg-violet-100 text-violet-700',
    REJECTED: 'bg-red-100 text-red-700',
  };

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${colors[status] || 'bg-slate-200 text-slate-700'}`}>
      {status.replace('_', ' ')}
    </span>
  );
};

export const JobDetailsModal: React.FC<JobDetailsModalProps> = ({ jobId, onClose, mode = 'modal' }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [myApplication, setMyApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadJob = async () => {
      setLoading(true);
      try {
        const jobData = await jobsService.getJobById(jobId);
        if (!isMounted) {
          return;
        }

        setJob(jobData);

        if (user?.role === 'CLIENT' && jobData.client.id === user.id) {
          const jobApplications = await applicationsService.getJobApplications(jobId);
          if (isMounted) {
            setApplications(jobApplications);
          }
        } else if (isMounted) {
          setApplications([]);
        }

        if (user?.role === 'WORKER' && jobData.applications) {
          const application = jobData.applications.find((item) => item.worker?.id === user.id) || null;
          if (isMounted) {
            setMyApplication(application);
          }
        } else if (isMounted) {
          setMyApplication(null);
        }
      } catch (error) {
        console.error('Failed to load job details:', error);
        toast.error('Job not found');
        if (mode === 'page') {
          navigate('/jobs');
        } else {
          onClose();
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadJob();

    return () => {
      isMounted = false;
    };
  }, [jobId, mode, navigate, onClose, user]);

  useEffect(() => {
    if (mode !== 'modal') {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [mode, onClose]);

  const reloadJob = async () => {
    setLoading(true);
    try {
      const jobData = await jobsService.getJobById(jobId);
      setJob(jobData);

      if (user?.role === 'CLIENT' && jobData.client.id === user.id) {
        const jobApplications = await applicationsService.getJobApplications(jobId);
        setApplications(jobApplications);
      }

      if (user?.role === 'WORKER' && jobData.applications) {
        const application = jobData.applications.find((item) => item.worker?.id === user.id) || null;
        setMyApplication(application);
      }
    } catch (error) {
      console.error('Failed to refresh job details:', error);
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
      const application = await applicationsService.applyForJob(jobId);
      setMyApplication(application);
      toast.success('Application submitted');
      await reloadJob();
    } catch (error) {
      console.error('Failed to apply for job:', error);
    } finally {
      setApplying(false);
    }
  };

  const handleUpdateApplicationStatus = async (applicationId: string, status: Application['status']) => {
    setUpdatingStatus(applicationId);
    try {
      await applicationsService.updateApplicationStatus(applicationId, status);
      toast.success(`Application ${status.toLowerCase().replace('_', ' ')}`);
      await reloadJob();
    } catch (error) {
      console.error('Failed to update application status:', error);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleUpdateJobStatus = async (status: Job['status']) => {
    try {
      await jobsService.updateJobStatus(jobId, status);
      toast.success(`Job marked as ${status.toLowerCase().replace('_', ' ')}`);
      await reloadJob();
    } catch (error) {
      console.error('Failed to update job status:', error);
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/jobs/${jobId}`;

    try {
      if (navigator.share && job) {
        await navigator.share({
          title: job.title,
          text: `Check out this job on JobMatch: ${job.title}`,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Job link copied');
      }
    } catch (error) {
      console.error('Failed to share job:', error);
    }
  };

  const nextStatusButton = (application: Application) => {
    const transitions: Record<string, { label: string; status: Application['status']; color: string }> = {
      PENDING: { label: 'Accept', status: 'MATCHED', color: 'bg-green-600 hover:bg-green-700' },
      MATCHED: { label: 'Start Work', status: 'IN_PROGRESS', color: 'bg-orange-600 hover:bg-orange-700' },
      IN_PROGRESS: { label: 'Complete', status: 'COMPLETED', color: 'bg-slate-900 hover:bg-slate-800' },
    };

    return transitions[application.status];
  };

  const content = loading ? (
    <div className="flex min-h-[24rem] items-center justify-center">
      <LoadingSpinner />
    </div>
  ) : !job ? null : (
    <>
      <div className="px-6 pb-8 pt-10 md:px-10 md:pb-10">
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <h1 className="text-4xl font-extrabold tracking-[-0.05em] text-slate-950 md:text-5xl">
              {job.title}
            </h1>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-600">
              <div className="flex items-center gap-1.5">
                <Building2 className="h-4 w-4 text-[#944a00]" />
                <span className="font-semibold text-slate-900">{job.client.email}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock3 className="h-4 w-4 text-[#944a00]" />
                <span>Posted {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <DollarSign className="h-4 w-4 text-[#944a00]" />
                <span className="font-bold text-[#713700]">${job.budget.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 self-start">
            <button
              type="button"
              onClick={handleShare}
              className="rounded-xl border border-[#dcc1b1]/30 p-3 text-slate-600 transition hover:bg-slate-100"
            >
              <Share2 className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="mb-8 flex flex-wrap gap-2">
          {job.tags.map((tag, index) => (
            <span
              key={tag.id}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
                index === 0
                  ? 'bg-[#dbeafe] text-[#1d4ed8]'
                  : index === 1
                    ? 'bg-[#bae6fd] text-[#075985]'
                    : 'bg-slate-200 text-slate-700'
              }`}
            >
              {tag.tag}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          <div className="space-y-8 md:col-span-2">
            <section>
              <h3 className="mb-4 flex items-center gap-3 text-xl font-bold text-slate-950">
                <span className="h-6 w-1.5 rounded-full bg-[#944a00]" />
                Description
              </h3>
              <p className="text-lg leading-9 text-slate-700">{job.description}</p>
            </section>

            {user?.role === 'CLIENT' && job.client.id === user.id && (
              <section>
                <h3 className="mb-4 flex items-center gap-3 text-xl font-bold text-slate-950">
                  <span className="h-6 w-1.5 rounded-full bg-[#4e6073]" />
                  Applications ({applications.length})
                </h3>

                <div className="space-y-4">
                  {applications.length === 0 ? (
                    <div className="rounded-2xl border border-[#dcc1b1]/20 bg-slate-50 p-5 text-sm text-slate-500">
                      No applications yet.
                    </div>
                  ) : (
                    applications.map((application) => (
                      <div key={application.id} className="rounded-2xl border border-[#dcc1b1]/20 bg-white p-5">
                        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="font-semibold text-slate-950">{application.worker?.email}</p>
                            <p className="text-sm text-slate-500">
                              Applied {format(new Date(application.createdAt), 'MMM d, yyyy')}
                            </p>
                          </div>
                          <StatusBadge status={application.status} />
                        </div>

                        {application.worker?.workerProfile?.skills && (
                          <div className="mb-4 flex flex-wrap gap-2">
                            {application.worker.workerProfile.skills.slice(0, 5).map((skill) => (
                              <span key={skill} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex flex-wrap gap-2">
                          {application.status === 'PENDING' && (
                            <button
                              type="button"
                              onClick={() => handleUpdateApplicationStatus(application.id, 'REJECTED')}
                              disabled={updatingStatus === application.id}
                              className="rounded-xl bg-red-100 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-200 disabled:opacity-50"
                            >
                              Reject
                            </button>
                          )}
                          {nextStatusButton(application) && (
                            <button
                              type="button"
                              onClick={() => handleUpdateApplicationStatus(application.id, nextStatusButton(application)!.status)}
                              disabled={updatingStatus === application.id}
                              className={`rounded-xl px-4 py-2 text-sm font-medium text-white transition disabled:opacity-50 ${nextStatusButton(application)!.color}`}
                            >
                              {updatingStatus === application.id ? 'Updating...' : nextStatusButton(application)!.label}
                            </button>
                          )}
                          {(application.status === 'MATCHED' || application.status === 'IN_PROGRESS') && (
                            <button
                              type="button"
                              onClick={() => navigate('/messages')}
                              className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
                            >
                              Open Chat
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>
            )}
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-[#dcc1b1]/20 p-6">
              <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-700">Quick Info</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Client</span>
                  <span className="text-right font-semibold text-slate-950">{job.client.email}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Budget</span>
                  <span className="text-right font-semibold text-slate-950">${job.budget.toLocaleString()}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Posted</span>
                  <span className="text-right font-semibold text-slate-950">{format(new Date(job.createdAt), 'MMM d, yyyy')}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Status</span>
                  <span className="text-right font-semibold text-slate-950">{job.status.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Applications</span>
                  <span className="text-right font-semibold text-slate-950">{job._count?.applications ?? job.applications?.length ?? 0}</span>
                </div>
              </div>
            </div>

            {job.tags.length > 0 && (
              <div className="rounded-2xl border border-[#dcc1b1]/20 p-6">
                <h4 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-700">
                  <Tag className="h-4 w-4" />
                  Tags
                </h4>
                <div className="flex flex-wrap gap-2">
                  {job.tags.map((tag) => (
                    <span key={tag.id} className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                      {tag.tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-[#dcc1b1]/20 p-6">
              <h4 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-700">
                <Users className="h-4 w-4" />
                Activity
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Posted</span>
                  <span className="text-right font-semibold text-slate-950">
                    {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Applications</span>
                  <span className="text-right font-semibold text-slate-950">{job._count?.applications ?? job.applications?.length ?? 0}</span>
                </div>
              </div>
            </div>

            {user?.role === 'CLIENT' && job.client.id === user.id && (
              <div className="rounded-2xl border border-[#dcc1b1]/20 p-6">
                <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-700">Manage Job</h4>
                <div className="flex flex-wrap gap-2">
                  {job.status !== 'OPEN' && (
                    <button type="button" onClick={() => handleUpdateJobStatus('OPEN')} className="rounded-xl bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700">
                      Mark Open
                    </button>
                  )}
                  {job.status !== 'IN_PROGRESS' && (
                    <button type="button" onClick={() => handleUpdateJobStatus('IN_PROGRESS')} className="rounded-xl bg-orange-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-orange-700">
                      Mark In Progress
                    </button>
                  )}
                  {job.status !== 'COMPLETED' && (
                    <button type="button" onClick={() => handleUpdateJobStatus('COMPLETED')} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800">
                      Mark Completed
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 border-t border-[#dcc1b1]/15 bg-white px-6 py-5 md:flex-row md:items-center md:justify-between md:px-10">
        <div className="hidden md:block">
          <div className="text-xs font-medium text-slate-500">Ready to apply?</div>
          <div className="font-bold text-slate-950">{job.title}</div>
        </div>

        {user?.role === 'WORKER' ? (
          job.status === 'OPEN' ? (
            myApplication ? (
              <div className="flex items-center gap-3 self-stretch md:self-auto">
                <span className="text-sm text-slate-600">Your application:</span>
                <StatusBadge status={myApplication.status} />
              </div>
            ) : (
              <button
                type="button"
                onClick={handleApply}
                disabled={applying}
                className="w-full rounded-xl bg-gradient-to-r from-[#944a00] to-[#e67e22] px-10 py-4 text-lg font-extrabold text-white shadow-lg shadow-orange-500/20 transition hover:scale-[1.01] disabled:opacity-60 md:w-auto"
              >
                {applying ? 'Applying...' : 'Apply for this Job'}
              </button>
            )
          ) : (
            <div className="rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-600">
              This job is not accepting new applications.
            </div>
          )
        ) : (
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-gradient-to-r from-[#944a00] to-[#e67e22] px-10 py-4 text-lg font-extrabold text-white shadow-lg shadow-orange-500/20 transition hover:scale-[1.01] md:w-auto"
          >
            Close Details
          </button>
        )}
      </div>
    </>
  );

  if (mode === 'page') {
    return <div className="mx-auto max-w-5xl px-4 py-8">{content}</div>;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/20 p-4 backdrop-blur-sm md:p-8" onClick={onClose}>
      <div
        className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-[0_12px_32px_-4px_rgba(25,28,30,0.18)]"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 z-10 rounded-full bg-white/90 p-2 text-slate-500 transition hover:bg-white hover:text-slate-800"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="overflow-y-auto">{content}</div>
      </div>
    </div>
  );
};