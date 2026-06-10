import React from 'react';
import { useFilters } from '../../context/FilterContext';
import FilterDropdown from './FilterDropdown';
import { Filter, RotateCcw } from 'lucide-react';

const CascadingFilters = () => {
  const {
    streams,
    selectedStream,
    setSelectedStream,
    loadingStreams,

    branches,
    selectedBranch,
    setSelectedBranch,
    loadingBranches,

    selectedSemester,
    setSelectedSemester,
    semesters,

    subjects,
    selectedSubject,
    setSelectedSubject,
    loadingSubjects,

    resetFilters,
  } = useFilters();

  const isStreamSelected = !!selectedStream;
  const isBranchSemesterSelected = !!selectedBranch && !!selectedSemester;

  return (
    <div className="glass-card rounded-2xl p-6 flex flex-col gap-6 w-full sticky top-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 dark:border-slate-800/40">
        <div className="flex items-center gap-2.5 text-slate-800 dark:text-slate-100">
          <Filter size={18} className="text-brand-indigo animate-pulse-slow" />
          <h2 className="text-lg font-bold tracking-wide">Academic Explorer</h2>
        </div>
        <button
          onClick={resetFilters}
          className="text-xs font-bold flex items-center gap-1.5 text-slate-400 hover:text-brand-indigo dark:text-slate-500 dark:hover:text-brand-indigo transition-all duration-300 hover:scale-105 active:scale-95"
          title="Reset Filters"
        >
          <RotateCcw size={12} />
          Reset
        </button>
      </div>

      <div className="flex flex-col gap-5">
        <FilterDropdown
          label="Stream"
          id="stream-select"
          value={selectedStream}
          onChange={setSelectedStream}
          options={streams}
          loading={loadingStreams}
          placeholder="Choose B.Tech / MBA"
        />

        <FilterDropdown
          label="Branch / Discipline"
          id="branch-select"
          value={selectedBranch}
          onChange={setSelectedBranch}
          options={branches}
          disabled={!isStreamSelected}
          loading={loadingBranches}
          placeholder="Choose Discipline"
        />

        <FilterDropdown
          label="Semester"
          id="semester-select"
          value={selectedSemester}
          onChange={setSelectedSemester}
          options={semesters}
          disabled={!isStreamSelected}
          placeholder="Choose Semester"
        />

        <FilterDropdown
          label="Subject"
          id="subject-select"
          value={selectedSubject}
          onChange={setSelectedSubject}
          options={subjects}
          disabled={!isBranchSemesterSelected}
          loading={loadingSubjects}
          placeholder="Choose Subject"
        />
      </div>
      
      {!isStreamSelected && (
        <div className="text-xs text-slate-400 dark:text-slate-500 bg-slate-100/40 dark:bg-slate-900/20 p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center mt-2 font-medium">
          Choose a stream above to discover and filter past papers.
        </div>
      )}
    </div>
  );
};

export default CascadingFilters;
