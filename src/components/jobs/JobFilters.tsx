// src/components/jobs/JobFilters.tsx
import React, { useMemo, useState } from 'react';
import { BadgeDollarSign, Briefcase, Search, Wrench, X } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';

interface JobFiltersProps {
  onFilterChange: (filters: { 
    tags: string[]; 
    minBudget?: number;
    maxBudget?: number;
  }) => void;
}

export const JobFilters: React.FC<JobFiltersProps> = ({ onFilterChange }) => {
  const [tagInput, setTagInput] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [jobTypes, setJobTypes] = useState<string[]>(['Remote']);
  const [minBudget, setMinBudget] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const combinedTags = useMemo(() => [...skills, ...jobTypes], [skills, jobTypes]);
  
  const debouncedTags = useDebounce(combinedTags, 500);
  const debouncedMinBudget = useDebounce(minBudget, 500);
  const debouncedMaxBudget = useDebounce(maxBudget, 500);

  React.useEffect(() => {
    onFilterChange({ 
      tags: debouncedTags, 
      minBudget: debouncedMinBudget ? parseFloat(debouncedMinBudget) : undefined,
      maxBudget: debouncedMaxBudget ? parseFloat(debouncedMaxBudget) : undefined,
    });
  }, [debouncedTags, debouncedMinBudget, debouncedMaxBudget, onFilterChange]);

  const addSkill = () => {
    if (tagInput.trim() && !skills.includes(tagInput.trim())) {
      setSkills([...skills, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeSkill = (tagToRemove: string) => {
    setSkills(skills.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  const toggleJobType = (jobType: string) => {
    setJobTypes((currentTypes) =>
      currentTypes.includes(jobType)
        ? currentTypes.filter((currentType) => currentType !== jobType)
        : [...currentTypes, jobType]
    );
  };

  const hasActiveFilters = skills.length > 0 || jobTypes.length > 0 || minBudget || maxBudget;

  const clearFilters = () => {
    setSkills([]);
    setJobTypes([]);
    setMinBudget('');
    setMaxBudget('');
  };

  const skillSuggestions = ['React', 'Node.js', 'Python'];
  const jobTypeOptions = ['Remote', 'Full-time', 'Contract'];

  return (
    <div className="rounded-[1.75rem] bg-[#f2f4f6] p-6 text-sm text-slate-700 lg:sticky lg:top-24 lg:min-h-[calc(100vh-8rem)] lg:flex lg:flex-col">
      <div className="mb-8 space-y-1">
        <h2 className="text-xl font-bold tracking-[-0.03em] text-slate-950">Filters</h2>
        <p className="text-xs text-slate-500">Refine your search</p>
      </div>

      <div className="space-y-7">
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <BadgeDollarSign className="h-4 w-4 text-[#944a00]" />
            Budget Range
          </label>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              value={minBudget}
              onChange={(e) => setMinBudget(e.target.value)}
              placeholder="Min"
              min="0"
              className="rounded-xl border-none bg-[#dfe4e8] px-4 py-3 text-sm text-slate-900 placeholder:text-slate-500 focus:ring-2 focus:ring-[#944a00]"
            />
            <input
              type="number"
              value={maxBudget}
              onChange={(e) => setMaxBudget(e.target.value)}
              placeholder="Max"
              min="0"
              className="rounded-xl border-none bg-[#dfe4e8] px-4 py-3 text-sm text-slate-900 placeholder:text-slate-500 focus:ring-2 focus:ring-[#944a00]"
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Wrench className="h-4 w-4 text-[#944a00]" />
            Skills
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search skills..."
              className="w-full rounded-xl border-none bg-[#dfe4e8] py-3 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-500 focus:ring-2 focus:ring-[#944a00]"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {skillSuggestions.map((tag) => (
              <button
                key={tag}
                onClick={() => {
                  if (!skills.includes(tag)) {
                    setSkills([...skills, tag]);
                  }
                }}
                className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm transition hover:-translate-y-0.5"
              >
                {tag}
              </button>
            ))}
          </div>
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {skills.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#ffe3cf] px-3 py-1 text-xs font-semibold text-[#713700]"
                >
                  {tag}
                  <button
                    onClick={() => removeSkill(tag)}
                    className="flex-shrink-0 text-[#713700] hover:text-[#502600]"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Briefcase className="h-4 w-4 text-[#944a00]" />
            Job Type
          </label>
          <div className="space-y-2.5">
            {jobTypeOptions.map((jobType) => (
              <label key={jobType} className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={jobTypes.includes(jobType)}
                  onChange={() => toggleJobType(jobType)}
                  className="h-4 w-4 rounded border-[#dcc1b1] text-[#944a00] focus:ring-[#944a00]"
                />
                <span className="text-sm text-slate-600 transition hover:translate-x-0.5">{jobType}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="mt-8 w-full rounded-xl border border-[#dcc1b1]/50 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.28em] text-[#944a00] transition hover:bg-white lg:mt-auto"
        >
          Reset All
        </button>
      )}
    </div>
  );
};