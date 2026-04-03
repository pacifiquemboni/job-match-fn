import React from 'react';
import { Job } from '../../types';
import { JobCard } from './JobCard';

interface JobListProps {
	jobs: Job[];
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
}

export const JobList: React.FC<JobListProps> = ({
	jobs,
	currentPage,
	totalPages,
	onPageChange,
}) => {
	if (jobs.length === 0) {
		return <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">No jobs found.</div>;
	}

	return (
		<div className="space-y-6">
			<div className="grid grid-cols-1 gap-4">
				{jobs.map((job) => (
					<JobCard key={job.id} job={job} />
				))}
			</div>
			<div className="flex items-center justify-center gap-2">
				<button
					className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
					onClick={() => onPageChange(currentPage - 1)}
					disabled={currentPage <= 1}
				>
					Previous
				</button>
				<span className="text-sm text-gray-600">
					Page {currentPage} of {totalPages}
				</span>
				<button
					className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
					onClick={() => onPageChange(currentPage + 1)}
					disabled={currentPage >= totalPages}
				>
					Next
				</button>
			</div>
		</div>
	);
};
