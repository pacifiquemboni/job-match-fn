// src/services/jobs.ts
import api from './api';
import { Job, CreateJobData, SearchJobsParams, PaginatedResponse, ApiResponse } from '../types';

export const jobsService = {
  async createJob(data: CreateJobData): Promise<Job> {
    const response = await api.post<ApiResponse<Job>>('/jobs', data);
    return response.data.data!;
  },

  async getAllJobs(params: SearchJobsParams = {}, signal?: AbortSignal): Promise<PaginatedResponse<Job>> {
    const response = await api.get<ApiResponse<PaginatedResponse<Job>>>('/jobs', {
      params,
      signal,
    });
    return response.data.data!;
  },

  async getJobById(id: string): Promise<Job> {
    const response = await api.get<ApiResponse<Job>>(`/jobs/${id}`);
    return response.data.data!;
  },

  async updateJobStatus(id: string, status: Job['status']): Promise<Job> {
    const response = await api.patch<ApiResponse<Job>>(`/jobs/${id}/status`, { status });
    return response.data.data!;
  },

  async getMyJobs(): Promise<Job[]> {
    const response = await api.get<ApiResponse<Job[]>>('/jobs/my');
    return response.data.data!;
  },
};