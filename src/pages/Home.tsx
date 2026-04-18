// src/pages/Home.tsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Search,
  Users,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { jobsService } from '../services/jobs';
import { Job } from '../types';

export const Home: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [latestJobs, setLatestJobs] = useState<Job[]>([]);
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadLatestJobs = async () => {
      try {
        const response = await jobsService.getAllJobs({ page: 1, limit: 3 });
        if (isMounted) {
          setLatestJobs(response.data);
        }
      } catch (error) {
        console.error('Failed to load latest jobs:', error);
      }
    };

    loadLatestJobs();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSearch = () => {
    navigate('/jobs');
  };

  const primaryAction = !user
    ? { label: 'Get Started Now', to: '/register' }
    : user.role === 'CLIENT'
      ? { label: 'Post a Job', to: '/create-job' }
      : { label: 'Find Jobs', to: '/jobs' };

  const secondaryAction = !user
    ? { label: 'Browse Jobs', to: '/jobs' }
    : user.role === 'CLIENT'
      ? { label: 'Open Dashboard', to: '/dashboard' }
      : { label: 'View Applications', to: '/applications' };

  const stats = [
    { value: '50,000+', label: 'Professionals' },
    { value: '10,000+', label: 'Monthly Jobs' },
    { value: '98%', label: 'Match Rate' },
    { value: '24h', label: 'Hiring Time' },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f7f8fb] text-slate-950">
      <section className="relative overflow-hidden px-4 pb-16 pt-10 sm:px-6 lg:px-8 lg:pb-24 lg:pt-16">
        <div className="absolute left-[-10rem] top-16 h-72 w-72 rounded-full bg-orange-200/35 blur-3xl" />
        <div className="absolute right-[-14rem] top-0 h-[32rem] w-[32rem] rounded-full bg-slate-200/50 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div>
            <div className="mb-6 inline-flex items-center rounded-full bg-sky-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
              Intelligence-powered matching
            </div>

            <h1 className="max-w-2xl text-5xl font-black leading-[0.95] tracking-[-0.05em] text-slate-950 sm:text-6xl lg:text-7xl">
              Connect Talent
              <br />
              with <span className="italic text-[#b35a07]">Opportunity</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600 sm:text-xl">
              Find the perfect match for your projects or discover exciting job opportunities with
              our intelligent job matching platform.
            </p>

            <div className="mt-10 flex max-w-xl flex-col gap-3 rounded-[1.35rem] border border-white/60 bg-white/90 p-2 shadow-[0_16px_40px_-20px_rgba(15,23,42,0.35)] backdrop-blur sm:flex-row sm:items-center">
              <div className="flex flex-1 items-center gap-3 px-4 py-2">
                <Search className="h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      handleSearch();
                    }
                  }}
                  placeholder="Search for jobs or skills"
                  className="w-full border-none bg-transparent p-0 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0"
                />
              </div>
              <button
                type="button"
                onClick={handleSearch}
                className="rounded-xl bg-[#b35a07] px-7 py-4 text-sm font-bold text-white transition hover:bg-[#944a00]"
              >
                Find Jobs
              </button>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to={primaryAction.to}
                className="inline-flex items-center justify-center rounded-xl bg-[#b35a07] px-7 py-4 text-sm font-bold text-white shadow-[0_14px_30px_-18px_rgba(179,90,7,0.9)] transition hover:translate-y-[1px] hover:bg-[#944a00]"
              >
                {primaryAction.label}
              </Link>
              <Link
                to={secondaryAction.to}
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-7 py-4 text-sm font-bold text-slate-700 transition hover:border-slate-400 hover:bg-white"
              >
                {secondaryAction.label}
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[28rem] lg:max-w-none">
            <div className="overflow-hidden rounded-[2rem] border border-slate-900/10 bg-slate-900 shadow-[0_24px_80px_-30px_rgba(15,23,42,0.8)]">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDQY7O4_CB6GWCVdamOrd9CFKkRu9XNr6lXgQaWvhtk2iJRwEXkh054LCJniFNr9YdTlObW93GegmY2JrhjJQQW7q7MVue6BahdtvnTEDtL2sDxx5HrSCgqK8acNJ_PpZ9bY3gTs_V2PspLEiDk_izM7uoYr6Xj_Fm6NWUxxIzzsPLKS2yacFcxBIcuwOSArACkvknO54ODdOLbzJbOi6HwzUKE6dXvlBHdUH9fBtOVoXzNB2Zoo39keUCVlU_FOl-neUpTrI3uLAU"
                alt="Professional using a laptop"
                className="h-full w-full object-cover"
              />
            </div>

            <div className="absolute -bottom-8 left-4 max-w-[15rem] rounded-2xl border-l-4 border-[#b35a07] bg-white p-5 shadow-[0_20px_40px_-20px_rgba(15,23,42,0.45)] sm:left-[-1.5rem]">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-500 text-white">
                  <BadgeCheck className="h-5 w-5" />
                </div>
                <div className="text-sm font-bold text-slate-900">Verified Expert</div>
              </div>
              <p className="text-xs leading-5 text-slate-500">
                Matching you with the top 1% of global talent through AI.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200/70 bg-slate-100/70 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-10 text-center md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl font-extrabold tracking-[-0.04em] text-slate-950">{stat.value}</div>
              <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-4xl font-extrabold tracking-[-0.04em] text-slate-950">Latest Jobs</h2>
              <p className="mt-2 text-base text-slate-500">Showing recent opportunities curated for you.</p>
            </div>
            <Link
              to="/jobs"
              className="inline-flex items-center gap-1 text-sm font-bold text-[#b35a07] transition hover:text-[#944a00]"
            >
              View all jobs
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="space-y-4">
            {latestJobs.length === 0 ? (
              <div className="rounded-[1.5rem] border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
                No jobs available yet.
              </div>
            ) : (
              latestJobs.map((job) => (
                <Link
                  key={job.id}
                  to={`/jobs/${job.id}`}
                  className="block rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-2xl font-bold tracking-[-0.03em] text-slate-950">{job.title}</h3>
                      <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                        {job.description}
                      </p>
                    </div>
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700">
                      {job.status.toLowerCase().replace('_', ' ')}
                    </span>
                  </div>

                  <div className="mb-4 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-500">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-900">$</span>
                      <span className="font-semibold text-slate-900">{job.budget.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-slate-400" />
                      <span>{formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-slate-400" />
                      <span>{job._count?.applications ?? job.applications?.length ?? 0} applications</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {job.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag.id}
                        className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                      >
                        {tag.tag}
                      </span>
                    ))}
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6 lg:px-8 lg:pb-24">
        <div className="mx-auto max-w-7xl">
          <div className="relative overflow-hidden rounded-[2.25rem] bg-[linear-gradient(90deg,#0f1720_0%,#151d23_40%,#3d2a16_100%)] px-6 py-16 text-center shadow-[0_30px_70px_-35px_rgba(15,23,42,0.7)] sm:px-10 lg:px-16 lg:py-20">
            <div className="absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl" />
            <div className="absolute -right-20 top-0 h-64 w-64 rounded-full bg-orange-500/15 blur-3xl" />

            <div className="relative mx-auto max-w-3xl">
              <h2 className="text-4xl font-extrabold leading-tight tracking-[-0.05em] text-white sm:text-5xl lg:text-6xl">
                Ready to find your <span className="italic text-orange-400">perfect match?</span>
              </h2>

              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  to={primaryAction.to}
                  className="inline-flex min-w-[12rem] items-center justify-center rounded-xl bg-[#b35a07] px-8 py-4 text-sm font-bold text-white transition hover:bg-[#944a00]"
                >
                  {primaryAction.label}
                </Link>
                <Link
                  to={secondaryAction.to}
                  className="inline-flex min-w-[12rem] items-center justify-center rounded-xl border border-white/20 px-8 py-4 text-sm font-bold text-white transition hover:bg-white/10"
                >
                  {secondaryAction.label}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};