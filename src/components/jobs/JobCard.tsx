// src/components/jobs/JobCard.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { DollarSign, Calendar, Users } from 'lucide-react';
import { Job } from '../../types';

interface JobCardProps {
  job: Job;
}

export const JobCard: React.FC<JobCardProps> = ({ job }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Link to={`/jobs/${job.id}`}>
      <div className="card p-6 hover:transform hover:scale-[1.02] transition-all duration-200">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
            {job.status}
          </span>
        </div>
        
        <p className="text-gray-600 mb-4 line-clamp-2">{job.description}</p>
        
        <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-1">
            <DollarSign className="h-4 w-4" />
            <span>${job.budget.toLocaleString()}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <span>{formatDistanceToNow(new Date(job.createdAt))} ago</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="h-4 w-4" />
            <span>{job._count?.applications || 0} applications</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {job.tags.slice(0, 5).map((tag) => (
            <span
              key={tag.id}
              className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs"
            >
              {tag.tag}
            </span>
          ))}
          {job.tags.length > 5 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs">
              +{job.tags.length - 5} more
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};