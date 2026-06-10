import React from 'react';
import { ChevronDown } from 'lucide-react';

const FilterDropdown = ({ 
  label, 
  id, 
  value, 
  onChange, 
  options = [], 
  disabled = false, 
  loading = false, 
  placeholder = 'Select option' 
}) => {
  return (
    <div className="w-full flex flex-col gap-1.5 text-left">
      <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">
        {label}
      </label>
      <div className="relative w-full">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || loading}
          className={`w-full appearance-none px-4 py-3 rounded-xl text-sm outline-none transition-all duration-300 cursor-pointer
            ${disabled
              ? 'bg-slate-100/50 text-slate-400 dark:bg-slate-900/20 dark:text-slate-600 border border-slate-200/30 dark:border-slate-800/20 cursor-not-allowed'
              : 'bg-white/80 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 text-slate-800 dark:text-slate-200 hover:border-brand-indigo/60 dark:hover:border-brand-indigo/40 focus:border-brand-indigo focus:ring-2 focus:ring-brand-indigo/20 shadow-sm'
            }`}
        >
          <option value="" className="bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500">
            {loading ? 'Loading options...' : placeholder}
          </option>
          {options.map((opt) => (
            <option
              key={opt.id || opt.value}
              value={opt.id || opt.value}
              className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
            >
              {opt.name || opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 dark:text-slate-500">
          <ChevronDown size={16} />
        </div>
      </div>
    </div>
  );
};

export default FilterDropdown;
