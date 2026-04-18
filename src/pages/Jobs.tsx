// src/pages/Jobs.tsx
import React, { useState, useEffect, useCallback } from 'react';
import axios, { AxiosError } from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { JobFilters } from '../components/jobs/JobFilters';
import { JobDetailsModal } from '../components/jobs/JobDetailsModal';
import { jobsService } from '../services/jobs';
import { Job, SearchJobsParams } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Briefcase, ChevronDown, Clock3, Globe, MonitorSmartphone, Users } from 'lucide-react';

type SortOption = 'newest' | 'highest-budget' | 'most-applications';

export const Jobs: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<SearchJobsParams>({ page: 1, limit: 10 });
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const isRequestAborted = (error: unknown) => {
    if (axios.isCancel(error)) return true;

    const axiosError = error as AxiosError;
    return (
      axiosError?.code === 'ERR_CANCELED' ||
      axiosError?.code === 'ECONNABORTED' ||
      (typeof axiosError?.message === 'string' && axiosError.message.toLowerCase().includes('aborted'))
    );
  };

  useEffect(() => {
    const controller = new AbortController();

    const loadJobs = async () => {
      setLoading(true);
      try {
        const response = await jobsService.getAllJobs(filters, controller.signal);
        setJobs((currentJobs) => {
          if ((filters.page || 1) === 1) {
            return response.data;
          }

          const seenIds = new Set(currentJobs.map((job) => job.id));
          const nextJobs = response.data.filter((job) => !seenIds.has(job.id));
          return [...currentJobs, ...nextJobs];
        });
        setTotalPages(response.meta.totalPages);
        setTotalJobs(response.meta.total);
      } catch (error) {
        if (!isRequestAborted(error)) {
          console.error('Failed to load jobs:', error);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadJobs();

    return () => {
      controller.abort();
    };
  }, [filters]);

  const handleFilterChange = useCallback((newFilters: { tags: string[]; minBudget?: number; maxBudget?: number }) => {
    setFilters((prev) => {
      const next = { ...prev, ...newFilters, page: 1 };

      const prevTags = prev.tags || [];
      const nextTags = next.tags || [];
      const sameTags =
        prevTags.length === nextTags.length &&
        prevTags.every((tag, index) => tag === nextTags[index]);
      const sameBudgetRange = prev.minBudget === next.minBudget && prev.maxBudget === next.maxBudget;

      if (sameTags && sameBudgetRange && prev.page === next.page && prev.limit === next.limit) {
        return prev;
      }

      return next;
    });
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const sortedJobs = [...jobs].sort((firstJob, secondJob) => {
    if (sortBy === 'highest-budget') {
      return secondJob.budget - firstJob.budget;
    }

    if (sortBy === 'most-applications') {
      return (secondJob._count?.applications ?? 0) - (firstJob._count?.applications ?? 0);
    }

    return new Date(secondJob.createdAt).getTime() - new Date(firstJob.createdAt).getTime();
  });

  const featuredJob = sortedJobs[0];
  const sidebarJob = sortedJobs[1];
  const compactJob = sortedJobs[2];
  const wideJob = sortedJobs[3];
  const remainingJobs = sortedJobs.slice(4);

  const formatBudget = (job: Job) => {
    if (job.budget >= 1000) {
      return `$${job.budget.toLocaleString()}`;
    }

    return `$${job.budget}/hr`;
  };

  const getPrimaryTag = (job: Job) => job.tags[0]?.tag || 'Remote';
  const getSecondaryTag = (job: Job) => job.tags[1]?.tag || 'Full-time';

  const renderMeta = (job: Job) => (
    <>
      <span className="flex items-center gap-1.5">
        <Clock3 className="h-4 w-4" />
        {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
      </span>
      <span className="flex items-center gap-1.5">
        <Users className="h-4 w-4" />
        {job._count?.applications ?? 0} Applications
      </span>
    </>
  );

  return (
    <div className="min-h-screen bg-[#f7f9fb]">
      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[18rem_minmax(0,1fr)] lg:items-start">
          <aside>
            <JobFilters onFilterChange={handleFilterChange} />
          </aside>

          <main className="rounded-[2rem] bg-[#f7f9fb]">
            {loading && jobs.length === 0 ? (
              <div className="flex h-64 items-center justify-center">
                <LoadingSpinner />
              </div>
            ) : (
              <div>
                <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                  <div>
                    <h1 className="text-4xl font-extrabold tracking-[-0.04em] text-slate-950">
                      Available Opportunities
                    </h1>
                    <p className="mt-2 text-base font-medium text-slate-500">
                      Showing <span className="font-bold text-[#944a00]">{sortedJobs.length}</span> of{' '}
                      <span className="font-semibold text-slate-950">{totalJobs}</span> jobs
                    </p>
                  </div>

                  <div className="inline-flex items-center gap-3 rounded-2xl bg-[#eceef0] p-2 pl-4 text-sm">
                    <span className="font-semibold text-slate-500">Sort by:</span>
                    <div className="relative">
                      <select
                        value={sortBy}
                        onChange={(event) => setSortBy(event.target.value as SortOption)}
                        className="appearance-none rounded-xl border-none bg-transparent py-2 pl-2 pr-9 font-bold text-slate-900 focus:ring-0"
                      >
                        <option value="newest">Newest First</option>
                        <option value="highest-budget">Highest Budget</option>
                        <option value="most-applications">Most Applications</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    </div>
                  </div>
                </div>

                {sortedJobs.length === 0 ? (
                  <div className="rounded-[1.5rem] bg-white p-10 text-center text-slate-500 shadow-sm">
                    No jobs found for the selected filters.
                  </div>
                ) : (
                  <div className="grid grid-cols-12 gap-6 lg:gap-8">
                    {featuredJob && (
                      <button
                        type="button"
                        onClick={() => setSelectedJobId(featuredJob.id)}
                        className="group relative col-span-12 overflow-hidden rounded-2xl bg-white p-8 shadow-[0_12px_32px_-4px_rgba(25,28,30,0.06)] transition hover:-translate-y-0.5 lg:col-span-8"
                      >
                        <div className="absolute left-0 top-0 h-full w-1.5 bg-[#944a00]" />
                        <div className="mb-4 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                          <div className="flex gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#eef3f8] text-[#944a00]">
                              <Briefcase className="h-6 w-6" />
                            </div>
                            <div>
                              <div className="mb-1 flex flex-wrap items-center gap-3">
                                <h3 className="text-3xl font-bold tracking-[-0.04em] text-slate-950">
                                  {featuredJob.title}
                                </h3>
                                <span className="rounded-full bg-[#ffdcc5] px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-[#713700]">
                                  {featuredJob.status}
                                </span>
                              </div>
                              <p className="text-sm font-medium text-slate-500">
                                {featuredJob.client.email} • {getPrimaryTag(featuredJob)}
                              </p>
                            </div>
                          </div>

                          <div className="text-left xl:text-right">
                            <span className="block text-3xl font-black tracking-[-0.04em] text-[#944a00]">
                              {formatBudget(featuredJob)}
                            </span>
                            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                              Budget Range
                            </span>
                          </div>
                        </div>

                        <p className="mb-6 max-w-3xl text-base leading-8 text-slate-600">
                          {featuredJob.description}
                        </p>

                        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                          <div className="flex flex-wrap gap-2">
                            {featuredJob.tags.slice(0, 3).map((tag, index) => (
                              <span
                                key={tag.id}
                                className="rounded-full bg-[#eceef0] px-4 py-2 text-xs font-semibold text-slate-600"
                              >
                                {index === 2 && featuredJob.tags.length > 3 ? `+${featuredJob.tags.length - 2} more` : tag.tag}
                              </span>
                            ))}
                          </div>
                          <div className="flex flex-wrap items-center gap-5 text-sm font-medium text-slate-500">
                            {renderMeta(featuredJob)}
                          </div>
                        </div>
                      </button>
                    )}

                    {sidebarJob && (
                      <button
                        type="button"
                        onClick={() => setSelectedJobId(sidebarJob.id)}
                        className="group relative col-span-12 rounded-2xl bg-white p-6 shadow-[0_12px_32px_-4px_rgba(25,28,30,0.06)] transition hover:-translate-y-0.5 lg:col-span-4"
                      >
                        <div className="absolute left-0 top-0 h-full w-1 bg-[#00658f]" />
                        <div className="mb-4 flex items-start justify-between gap-3">
                          <span className="rounded-md bg-[#00a3e4] px-2 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-white">
                            Featured
                          </span>
                          <span className="text-xs text-slate-500">
                            {formatDistanceToNow(new Date(sidebarJob.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <h3 className="text-2xl font-bold tracking-[-0.03em] text-slate-950">{sidebarJob.title}</h3>
                        <p className="mt-1 text-sm text-slate-500">{sidebarJob.client.email}</p>
                        <div className="my-5 text-3xl font-black tracking-[-0.04em] text-slate-950">
                          {formatBudget(sidebarJob)}
                        </div>
                        <p className="mb-6 line-clamp-3 text-sm leading-7 text-slate-600">
                          {sidebarJob.description}
                        </p>
                        <div className="flex items-center justify-between gap-3 text-sm">
                          <span className="flex items-center gap-1.5 font-bold text-slate-500">
                            <Users className="h-4 w-4" />
                            {sidebarJob._count?.applications ?? 0} applied
                          </span>
                          <span className="font-bold text-[#944a00]">View Details</span>
                        </div>
                      </button>
                    )}

                    {compactJob && (
                      <button
                        type="button"
                        onClick={() => setSelectedJobId(compactJob.id)}
                        className="col-span-12 rounded-2xl border border-[#dcc1b1]/15 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 lg:col-span-4"
                      >
                        <div className="mb-4 flex items-center justify-between">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#d1e4fb] text-[#36485b]">
                            <MonitorSmartphone className="h-5 w-5" />
                          </div>
                          <span className="rounded-full bg-[#ffdcc5] px-3 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-[#713700]">
                            {compactJob.status}
                          </span>
                        </div>
                        <h3 className="text-2xl font-bold tracking-[-0.03em] text-slate-950">{compactJob.title}</h3>
                        <p className="mt-1 text-sm text-slate-500">{compactJob.client.email}</p>
                        <p className="my-4 text-2xl font-black tracking-[-0.03em] text-[#944a00]">
                          {formatBudget(compactJob)}
                        </p>
                        <div className="mb-6 flex flex-wrap gap-2">
                          {compactJob.tags.slice(0, 2).map((tag) => (
                            <span key={tag.id} className="rounded-md bg-[#eceef0] px-2 py-1 text-[10px] font-medium text-slate-500">
                              {tag.tag}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center justify-between border-t border-[#dcc1b1]/15 pt-4 text-xs text-slate-500">
                          <span>{formatDistanceToNow(new Date(compactJob.createdAt), { addSuffix: true })}</span>
                          <span>{compactJob._count?.applications ?? 0} applicants</span>
                        </div>
                      </button>
                    )}

                    {wideJob && (
                      <button
                        type="button"
                        onClick={() => setSelectedJobId(wideJob.id)}
                        className="col-span-12 flex flex-col gap-6 rounded-2xl border border-[#dcc1b1]/15 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 md:flex-row lg:col-span-8 lg:p-8"
                      >
                        <div className="hidden w-32 shrink-0 overflow-hidden rounded-2xl bg-[#dfe4e8] md:block">
                          <div className="flex h-full min-h-[12rem] items-center justify-center bg-[linear-gradient(180deg,#eceef0_0%,#cbd5df_100%)] text-slate-500">
                            <Globe className="h-8 w-8" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="mb-2 flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                            <h3 className="text-3xl font-bold tracking-[-0.04em] text-slate-950">{wideJob.title}</h3>
                            <span className="text-3xl font-black tracking-[-0.04em] text-slate-950">
                              {formatBudget(wideJob)}
                            </span>
                          </div>
                          <p className="mb-4 text-sm font-medium text-slate-500">
                            {wideJob.client.email} • {getSecondaryTag(wideJob)}
                          </p>
                          <p className="mb-6 text-sm leading-7 text-slate-600">{wideJob.description}</p>
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eceef0] px-3 py-2 text-xs font-semibold text-slate-600">
                              <Globe className="h-3.5 w-3.5" />
                              {getPrimaryTag(wideJob)}
                            </span>
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eceef0] px-3 py-2 text-xs font-semibold text-slate-600">
                              <Clock3 className="h-3.5 w-3.5" />
                              Flexible Hours
                            </span>
                          </div>
                        </div>
                      </button>
                    )}

                    {remainingJobs.map((job) => (
                      <button
                        key={job.id}
                        type="button"
                        onClick={() => setSelectedJobId(job.id)}
                        className="col-span-12 rounded-2xl border border-[#dcc1b1]/15 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 xl:col-span-6"
                      >
                        <div className="mb-3 flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-2xl font-bold tracking-[-0.03em] text-slate-950">{job.title}</h3>
                            <p className="mt-1 text-sm text-slate-500">{job.client.email}</p>
                          </div>
                          <span className="text-xl font-black tracking-[-0.03em] text-[#944a00]">
                            {formatBudget(job)}
                          </span>
                        </div>
                        <p className="mb-5 text-sm leading-7 text-slate-600">{job.description}</p>
                        <div className="mb-4 flex flex-wrap gap-2">
                          {job.tags.slice(0, 3).map((tag) => (
                            <span key={tag.id} className="rounded-full bg-[#eceef0] px-3 py-1.5 text-xs font-semibold text-slate-600">
                              {tag.tag}
                            </span>
                          ))}
                        </div>
                        <div className="flex flex-wrap items-center gap-5 text-xs font-medium text-slate-500">
                          {renderMeta(job)}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {filters.page !== totalPages && totalPages > 0 && (
                  <div className="mt-12 flex justify-center">
                    <button
                      onClick={() => handlePageChange((filters.page || 1) + 1)}
                      disabled={loading}
                      className="rounded-2xl border border-[#dcc1b1]/35 bg-white px-8 py-3 font-bold text-slate-900 shadow-sm transition hover:bg-[#f2f4f6] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading ? 'Loading...' : 'Load More Opportunities'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>

      {selectedJobId && (
        <JobDetailsModal jobId={selectedJobId} onClose={() => setSelectedJobId(null)} />
      )}
    </div>
  );
};