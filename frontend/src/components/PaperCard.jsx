import React from 'react';
import { Calendar, Download, Eye, FileText } from 'lucide-react';

const PaperCard = ({ paper }) => {
  const { year, exam_type, file_url, subject_code, subject_name, branch_name, stream_name } = paper;

  const isMidSem = exam_type === 'Mid-Semester';
  
  // High fidelity conditional designs
  const badgeColor = isMidSem
    ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    : 'bg-purple-500/10 text-purple-500 border-purple-500/20';

  const hoverEffect = isMidSem 
    ? 'hover:shadow-blue-500/10 hover:border-blue-500/30' 
    : 'hover:shadow-purple-500/10 hover:border-purple-500/30';

  // Format link for static assets
  const getAbsoluteUrl = (url) => {
    if (url.startsWith('/api/')) {
      // When using local proxy, we should point to port 8000 directly or let proxy handle it
      // Let's use the local API proxy or make it absolute. Proxy works great, but direct is absolute proof
      return `http://localhost:8000${url.replace('/api/', '/api/')}`;
    }
    return url;
  };

  const fullUrl = getAbsoluteUrl(file_url);

  return (
    <div className={`glass-card rounded-2xl p-5 border border-slate-200/50 dark:border-slate-800/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${hoverEffect} flex flex-col justify-between h-full`}>
      <div>
        <div className="flex justify-between items-start mb-4 gap-2">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md border tracking-wider uppercase bg-slate-100/50 dark:bg-slate-900 border-slate-200/50 dark:border-slate-800 text-slate-400 dark:text-slate-500">
            {stream_name} • {branch_name}
          </span>
          <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border uppercase tracking-wider shrink-0 ${badgeColor}`}>
            {exam_type === 'Mid-Semester' ? 'Mid-Sem' : 'End-Sem'}
          </span>
        </div>

        <div className="flex items-start gap-3 mb-4">
          <div className={`p-2.5 rounded-xl shrink-0 ${isMidSem ? 'bg-blue-500/10 text-blue-500' : 'bg-purple-500/10 text-purple-500'}`}>
            <FileText size={18} />
          </div>
          <div className="overflow-hidden">
            <span className="text-xs font-mono font-bold text-indigo-500 dark:text-indigo-400 tracking-wide">
              {subject_code}
            </span>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 line-clamp-2 mt-0.5 leading-snug" title={subject_name}>
              {subject_name}
            </h3>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-200/30 dark:border-slate-800/40 mt-auto">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 font-semibold">
          <Calendar size={13} />
          <span>Batch {year}</span>
        </div>
        
        <div className="flex gap-2">
          <a
            href={fullUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-400 transition-colors duration-200 flex items-center justify-center"
            title="View PDF"
          >
            <Eye size={14} />
          </a>
          <a
            href={fullUrl}
            download
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all duration-300 shadow-sm
              ${isMidSem
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/10 border border-blue-600 hover:border-blue-500'
                : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-500/10 border border-purple-600 hover:border-purple-500'
              }`}
            title="Download PDF"
          >
            <Download size={12} />
            Download
          </a>
        </div>
      </div>
    </div>
  );
};

export default PaperCard;
