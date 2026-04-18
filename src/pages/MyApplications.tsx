import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { applicationsService } from '../services/applications';
import { Application } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { CheckCircle2, Clock3, AlertCircle, MessageSquare, BarChart3, Calendar, User, X } from 'lucide-react';

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const colors: Record<string, string> = {
    PENDING: 'bg-[#dbe8f7] text-[#4e6073]',
    MATCHED: 'bg-[#c7e7ff] text-[#00658f]',
    IN_PROGRESS: 'bg-[#ffdcc5] text-[#944a00]',
    COMPLETED: 'bg-[#d8f5d0] text-[#2d6a34]',
    REJECTED: 'bg-[#ffd9d6] text-[#ba1a1a]',
  };
  return (
    <span className={`rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] ${colors[status] || 'bg-slate-100 text-slate-600'}`}>
      {status.replace('_', ' ')}
    </span>
  );
};

const StatusTimeline: React.FC<{ status: Application['status'] }> = ({ status }) => {
  const isRejected = status === 'REJECTED';
  const steps = ['APPLIED', 'MATCHED', 'IN_PROGRESS', 'COMPLETED'] as const;
  const currentIndex = (() => {
    switch (status) {
      case 'PENDING':
        return 0;
      case 'MATCHED':
        return 1;
      case 'IN_PROGRESS':
        return 2;
      case 'COMPLETED':
        return 3;
      default:
        return -1;
    }
  })();

  if (isRejected) {
    return (
      <div className="mt-4 flex items-center gap-2 rounded-2xl bg-[#fff1ef] px-4 py-3 text-sm font-semibold text-[#ba1a1a]">
        <AlertCircle className="h-4 w-4" />
        <span>Application Rejected</span>
      </div>
    );
  }

  return (
    <div className="py-4">
      <div className="flex items-center justify-between gap-1 overflow-x-auto px-1">
        {steps.map((step, idx) => (
          <React.Fragment key={step}>
            <div className="flex min-w-[70px] flex-col items-center gap-2 text-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ring-4 ${
                  idx <= currentIndex
                    ? 'bg-[#e67e22] text-white ring-[#ffdcc5]'
                    : 'bg-[#eceef0] text-slate-500 ring-transparent'
                }`}
              >
                {idx + 1}
              </div>
              <span className={`text-[10px] font-black uppercase tracking-[0.12em] ${idx <= currentIndex ? 'text-[#944a00]' : 'text-slate-400'}`}>
                {step.replace('_', ' ')}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div className={`h-[2px] flex-1 ${idx < currentIndex ? 'bg-[#e67e22]' : 'bg-[#dcc1b1]/35'} -mt-6`} />
            )}
          </React.Fragment>
        ))}
      </div>
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

  const sortedApplications = [...filteredApplications].sort((firstApplication, secondApplication) => {
    return new Date(secondApplication.createdAt).getTime() - new Date(firstApplication.createdAt).getTime();
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

  const statCards = [
    { key: 'total', label: 'Total', value: stats.total, icon: BarChart3, iconClass: 'text-slate-400' },
    { key: 'active', label: 'Active', value: stats.active, icon: Clock3, iconClass: 'text-[#00658f]' },
    { key: 'completed', label: 'Completed', value: stats.completed, icon: CheckCircle2, iconClass: 'text-[#944a00]' },
    { key: 'rejected', label: 'Rejected', value: stats.rejected, icon: X, iconClass: 'text-[#ba1a1a]' },
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-[#f7f9fb] px-4 py-8 md:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-[28px] border border-[#dcc1b1]/20 bg-white shadow-xl">
        <div className="border-b border-[#dcc1b1]/20 px-6 py-5 md:px-8 md:py-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ffdcc5] text-[#944a00]">
              <BriefcaseIcon />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">My Applications</h1>
              <p className="text-sm font-medium text-slate-500">Manage and track your active job pursuits</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-6 md:px-8 md:py-8">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {statCards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.key} className="rounded-2xl bg-[#f2f4f6] p-4 transition hover:border hover:border-[#e67e22]/20">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">{card.label}</span>
                    <Icon className={`h-5 w-5 ${card.iconClass}`} />
                  </div>
                  <div className="text-3xl font-black text-slate-950">{card.value}</div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 border-b border-[#dcc1b1]/20">
            <div className="flex gap-6 overflow-x-auto no-scrollbar">
              {['all', 'PENDING', 'MATCHED', 'IN_PROGRESS', 'COMPLETED', 'REJECTED'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`whitespace-nowrap border-b-2 pb-4 text-sm font-bold uppercase tracking-[0.08em] transition ${
                    filter === status
                      ? 'border-[#e67e22] text-[#944a00]'
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {status === 'all' ? 'All' : status.replace('_', ' ')}
                  {status === 'all' ? ` (${applications.length})` : statusCounts[status] ? ` (${statusCounts[status]})` : ''}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 space-y-6">
            {sortedApplications.length === 0 ? (
              <div className="rounded-3xl bg-[#f2f4f6] p-10 text-center">
                <AlertCircle className="mx-auto mb-4 h-14 w-14 text-slate-300" />
                <p className="text-slate-500">
                  {applications.length === 0
                    ? "You haven't applied to any jobs yet."
                    : 'No applications match this filter.'}
                </p>
                {applications.length === 0 && (
                  <Link
                    to="/jobs"
                    className="mt-4 inline-flex rounded-xl bg-[#944a00] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#7a3d00]"
                  >
                    Browse Jobs
                  </Link>
                )}
              </div>
            ) : (
              sortedApplications.map((app) => (
                <div
                  key={app.id}
                  className="group relative overflow-hidden rounded-[28px] border border-[#dcc1b1]/15 bg-white p-6 shadow-sm transition duration-300 hover:shadow-xl"
                >
                  <div className="absolute bottom-6 left-0 top-6 w-1 rounded-r-full bg-[#e67e22]" />
                  <div className="flex flex-col gap-6 md:flex-row">
                    <div className="flex-1 space-y-5 pl-3 md:pl-4">
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div>
                          <Link
                            to={app.job?.id ? `/jobs/${app.job.id}` : '/jobs'}
                            className="text-2xl font-bold tracking-tight text-slate-950 transition group-hover:text-[#944a00]"
                          >
                            {app.job?.title}
                          </Link>
                          <div className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-500">
                            <User className="h-4 w-4" />
                            <span>{app.job?.client.email}</span>
                          </div>
                        </div>
                        <div className="text-left md:text-right">
                          <div className="text-3xl font-black text-slate-950">${app.job?.budget.toLocaleString()}</div>
                          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Project Budget</div>
                        </div>
                      </div>

                      <StatusTimeline status={app.status} />

                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-wrap gap-2">
                          {app.job?.tags.slice(0, 5).map((tag) => (
                            <span
                              key={tag.id}
                              className="rounded-full bg-[#eceef0] px-3 py-1 text-[11px] font-black uppercase tracking-[0.1em] text-slate-600"
                            >
                              {tag.tag}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                          <Calendar className="h-4 w-4" />
                          <span>Applied {new Date(app.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-row items-end justify-between gap-4 border-t border-[#dcc1b1]/15 pt-4 md:w-40 md:flex-col md:border-l md:border-t-0 md:pl-6 md:pt-0">
                      <StatusBadge status={app.status} />

                      <div className="flex w-full flex-col gap-3">
                        <Link
                          to={app.job?.id ? `/jobs/${app.job.id}` : '/jobs'}
                          className="inline-flex w-full items-center justify-center rounded-xl bg-[#944a00] px-4 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#7a3d00]"
                        >
                          View Job
                        </Link>
                        {(app.status === 'MATCHED' || app.status === 'IN_PROGRESS') && (
                          <Link
                            to="/messages"
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#f2f4f6] px-4 py-3 text-sm font-bold text-slate-900 transition hover:bg-[#eceef0]"
                          >
                            <MessageSquare className="h-4 w-4" />
                            Open Chat
                          </Link>
                        )}
                      </div>
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

const BriefcaseIcon = () => <BarChart3 className="h-5 w-5" />;
