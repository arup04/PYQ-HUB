import React from 'react';
import PaperCard from './PaperCard';
import { FileQuestion } from 'lucide-react';

const PaperGrid = ({ papers = [], loading = false }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div 
            key={idx} 
            className="glass-card rounded-2xl p-5 animate-pulse border border-slate-200/40 dark:border-slate-800/30 flex flex-col justify-between h-48"
          >
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
                <div className="h-4 w-12 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
              </div>
              <div className="flex items-start gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 h-10 w-10 shrink-0"></div>
                <div className="w-full flex flex-col gap-2">
                  <div className="h-3.5 w-16 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
                  <div className="h-4.5 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800/50 mt-auto">
              <div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
              <div className="flex gap-2">
                <div className="h-8 w-8 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
                <div className="h-8 w-20 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (papers.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-12 flex flex-col items-center justify-center text-center max-w-md mx-auto mt-8 border border-dashed border-slate-200/60 dark:border-slate-800/40">
        <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-500 mb-4 animate-pulse-slow">
          <FileQuestion size={36} />
        </div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1.5">No Question Papers Found</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
          There are no uploaded papers matching this subject or branch. Adjust your filters or check back later.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {papers.map((paper) => (
        <PaperCard key={paper.id} paper={paper} />
      ))}
    </div>
  );
};

export default PaperGrid;
