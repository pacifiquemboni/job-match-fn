// src/components/jobs/JobFilters.tsx
import React, { useState } from 'react';
import { X, Sliders } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';
import { Job } from '../../types';

interface JobFiltersProps {
  onFilterChange: (filters: { 
    tags: string[]; 
    status?: Job['status'];
    minBudget?: number;
    maxBudget?: number;
  }) => void;
}

export const JobFilters: React.FC<JobFiltersProps> = ({ onFilterChange }) => {
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [status, setStatus] = useState<Job['status'] | ''>('');
  const [minBudget, setMinBudget] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const debouncedTags = useDebounce(tags, 500);
  const debouncedMinBudget = useDebounce(minBudget, 500);
  const debouncedMaxBudget = useDebounce(maxBudget, 500);

  React.useEffect(() => {
    onFilterChange({ 
      tags: debouncedTags, 
      status: status || undefined,
      minBudget: debouncedMinBudget ? parseFloat(debouncedMinBudget) : undefined,
      maxBudget: debouncedMaxBudget ? parseFloat(debouncedMaxBudget) : undefined,
    });
  }, [debouncedTags, status, debouncedMinBudget, debouncedMaxBudget, onFilterChange]);

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTag();
    }
  };

  const hasActiveFilters = tags.length > 0 || status || minBudget || maxBudget;

  const clearFilters = () => {
    setTags([]);
    setStatus('');
    setMinBudget('');
    setMaxBudget('');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sliders className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold">Filters</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-orange-600 hover:text-orange-700 font-medium"
          >
            Clear all
          </button>
        )}
      </div>
      
      <div className="space-y-4">
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Job Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as Job['status'] | '')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="">All Statuses</option>
            <option value="OPEN">🟢 Open</option>
            <option value="IN_PROGRESS">🔵 In Progress</option>
            <option value="COMPLETED">⚫ Completed</option>
          </select>
        </div>
        
        {/* Budget Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Budget Range ($)
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={minBudget}
              onChange={(e) => setMinBudget(e.target.value)}
              placeholder="Min"
              min="0"
              className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <input
              type="number"
              value={maxBudget}
              onChange={(e) => setMaxBudget(e.target.value)}
              placeholder="Max"
              min="0"
              className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>
        
        {/* Tags Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Skills / Tags
          </label>
          <div className="flex space-x-2 mb-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="e.g., React, Node.js"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <button 
              onClick={addTag}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition text-sm font-medium"
            >
              Add
            </button>
          </div>
          
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium"
                >
                  {tag}
                  <button 
                    onClick={() => removeTag(tag)} 
                    className="hover:text-orange-900 flex-shrink-0"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Popular Tags Suggestions */}
        <div>
          <p className="text-xs font-medium text-gray-500 mb-2">Popular Skills</p>
          <div className="flex flex-wrap gap-1">
            {['React', 'Node.js', 'Python', 'TypeScript', 'UI/UX', 'DevOps'].map((tag) => (
              <button
                key={tag}
                onClick={() => {
                  if (!tags.includes(tag)) {
                    setTags([...tags, tag]);
                  }
                }}
                className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs hover:bg-gray-200 transition"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};