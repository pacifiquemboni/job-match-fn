import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { JobDetailsModal } from '../components/jobs/JobDetailsModal';

export const JobDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  if (!id) {
    return null;
  }

  return <JobDetailsModal jobId={id} mode="page" onClose={() => navigate('/jobs')} />;
};
