// src/pages/Jobs.tsx
import React, { useState, useEffect, useCallback } from 'react';
import axios, { AxiosError } from 'axios';
import { JobList } from '../components/jobs/JobList';
import { JobFilters } from '../components/jobs/JobFilters';
import { jobsService } from '../services/jobs';
import { Job, SearchJobsParams } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Filter } from 'lucide-react';

export const Jobs: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<SearchJobsParams>({ page: 1, limit: 10 });
  const [totalPages, setTotalPages] = useState(1);

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
        setJobs(response.data);
        setTotalPages(response.meta.totalPages);
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

  const handleFilterChange = useCallback((newFilters: { tags: string[]; status?: Job['status']; minBudget?: number; maxBudget?: number }) => {
    setFilters((prev) => {
      const next = { ...prev, ...newFilters, page: 1 };

      const sameStatus = prev.status === next.status;
      const prevTags = prev.tags || [];
      const nextTags = next.tags || [];
      const sameTags =
        prevTags.length === nextTags.length &&
        prevTags.every((tag, index) => tag === nextTags[index]);
      const sameBudgetRange = prev.minBudget === next.minBudget && prev.maxBudget === next.maxBudget;

      if (sameStatus && sameTags && sameBudgetRange && prev.page === next.page && prev.limit === next.limit) {
        return prev;
      }

      return next;
    });
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-8">
              <div className="flex items-center gap-2 mb-6">
                <Filter className="h-5 w-5 text-orange-600" />
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
              </div>
              <JobFilters onFilterChange={handleFilterChange} />
            </div>
          </div>
          
          {/* Job Results */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <LoadingSpinner />
              </div>
            ) : (
              <div>
                {/* Results Header */}
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-4">
                    <span className="text-gray-600">
                      Showing {jobs.length} of {totalPages * (filters.limit || 10)} jobs
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Sort by:</span>
                    <select className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                      <option>Most Recent</option>
                      <option>Highest Budget</option>
                      <option>Most Relevant</option>
                    </select>
                  </div>
                </div>

                <JobList
                  jobs={jobs}
                  currentPage={filters.page || 1}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};