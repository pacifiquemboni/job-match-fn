// src/types/index.ts
export interface User {
  id: string;
  email: string;
  role: 'WORKER' | 'CLIENT';
  createdAt: string;
  workerProfile?: WorkerProfile;
}

export interface WorkerProfile {
  id: string;
  skills: string[];
  bio?: string;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  budget: number;
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED';
  createdAt: string;
  client: {
    id: string;
    email: string;
  };
  tags: JobTag[];
  _count?: {
    applications: number;
  };
  applications?: Application[];
}

export interface JobTag {
  id: string;
  tag: string;
}

export interface Application {
  id: string;
  jobId: string;
  workerId: string;
  status: 'PENDING' | 'MATCHED' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
  job?: Job;
  worker?: User & { workerProfile?: WorkerProfile };
}

export interface Message {
  id: string;
  applicationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  sender: {
    id: string;
    email: string;
    role: string;
  };
}

export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
  errors?: any;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  role: 'WORKER' | 'CLIENT';
  skills?: string[];
  bio?: string;
}

export interface CreateJobData {
  title: string;
  description: string;
  budget: number;
  tags: string[];
}

export interface SearchJobsParams {
  page?: number;
  limit?: number;
  tags?: string[];
  status?: Job['status'];
  minBudget?: number;
  maxBudget?: number;
}