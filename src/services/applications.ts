// src/services/applications.ts
import api from './api';
import { Application } from '../types';

export const applicationsService = {
  async applyForJob(jobId: string): Promise<Application> {
    const response = await api.post('/applications', { jobId });
    return response.data.data;
  },

  async getMyApplications(): Promise<Application[]> {
    const response = await api.get('/applications/my');
    return response.data.data;
  },

  async getClientApplications(): Promise<Application[]> {
    const response = await api.get('/applications/client');
    return response.data.data;
  },

  async getJobApplications(jobId: string): Promise<Application[]> {
    const response = await api.get(`/applications/job/${jobId}`);
    return response.data.data;
  },

  async updateApplicationStatus(
    applicationId: string,
    status: Application['status']
  ): Promise<Application> {
    const response = await api.patch(`/applications/${applicationId}/status`, { status });
    return response.data.data;
  },
};