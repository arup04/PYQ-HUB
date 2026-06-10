import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFilters } from '../context/FilterContext';
import { paperService } from '../services/api';
import CascadingFilters from '../components/Sidebar/CascadingFilters';
import PaperGrid from '../components/PaperGrid';
import { 
  Sun, 
  Moon, 
  Search, 
  Upload, 
  LogOut, 
  LogIn, 
  GraduationCap, 
  User, 
  BookOpen, 
  CheckCircle,
  FileSpreadsheet
} from 'lucide-react';

const Home = () => {
  const { user, logout, isContributor } = useAuth();
  const filters = useFilters();

  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Theme state initialization
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Theme effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Fetch papers on filter changes
  useEffect(() => {
    const fetchPapers = async () => {
      setLoading(true);
      try {
        const data = await paperService.filterPapers({
          streamId: filters.selectedStream,
          branchId: filters.selectedBranch,
          subjectId: filters.selectedSubject,
          semester: filters.selectedSemester
        });
        setPapers(data);
      } catch (error) {
        console.error('Failed to retrieve question papers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPapers();
  }, [filters.selectedStream, filters.selectedBranch, filters.selectedSemester, filters.selectedSubject]);

  // Frontend search filter (subject code/name/year/exam_type)
  const filteredPapers = papers.filter((p) => {
    const term = searchQuery.toLowerCase().trim();
    if (!term) return true;
    return (
      p.subject_name?.toLowerCase().includes(term) ||
      p.subject_code?.toLowerCase().includes(term) ||
      p.year?.toString().includes(term) ||
      p.exam_type?.toLowerCase().includes(term)
    );
  });

  const getBreadcrumb = () => {
    const parts = [];
    if (filters.selectedStreamObj) parts.push(filters.selectedStreamObj.name);
    
    if (filters.selectedBranch && filters.branches.length > 0) {
      const bObj = filters.branches.find(b => b.id === parseInt(filters.selectedBranch));
      if (bObj) parts.push(bObj.name);
    }
    
    if (filters.selectedSemester) {
      parts.push(`Semester ${filters.selectedSemester}`);
    }
    
    if (filters.selectedSubject && filters.subjects.length > 0) {
      const sObj = filters.subjects.find(s => s.id === parseInt(filters.selectedSubject));
      if (sObj) parts.push(`${sObj.code}: ${sObj.name}`);
    }

    return parts.length > 0 ? parts.join('  /  ') : 'All Stream Feed';
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      
      {/* Header bar */}
      <header className="sticky top-0 z-40 w-full glass-card border-b border-slate-200/50 dark:border-slate-800/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-brand-indigo to-brand-purple flex items-center justify-center text-white shadow-md shadow-brand-indigo/10">
              <GraduationCap size={22} />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight bg-gradient-to-r from-brand-indigo to-brand-purple bg-clip-text text-transparent">
                PYQ Hub
              </span>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest -mt-1">
                Academic Archive
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            {/* Theme Toggle Button */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl border border-slate-200/60 dark:border-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 dark:text-slate-400 transition-all cursor-pointer"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Auth / Contributor Buttons */}
            {isContributor() ? (
              <>
                <Link
                  to="/upload"
                  className="px-4 py-2 bg-brand-indigo hover:bg-indigo-600 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/10 transition-all hover:scale-[1.02] cursor-pointer"
                >
                  <Upload size={14} />
                  <span>Upload Paper</span>
                </Link>
                <div className="h-6 w-px bg-slate-200 dark:bg-slate-800"></div>
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-800">
                    <User size={16} />
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {user?.username}
                    </p>
                    <p className="text-[9px] font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                      {user?.role}
                    </p>
                  </div>
                  <button
                    onClick={logout}
                    className="p-2 text-slate-400 hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-400 transition-colors cursor-pointer"
                    title="Sign Out"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              </>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 border border-slate-200/60 dark:border-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <LogIn size={14} />
                <span>Admin Login</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Layout Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Filters */}
        <aside className="w-full md:w-80 shrink-0">
          <CascadingFilters />
        </aside>

        {/* Content Section */}
        <section className="flex-grow flex flex-col gap-6">
          
          {/* Controls Bar: Search & Status Info */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
            
            {/* Search Input */}
            <div className="relative flex-grow max-w-md">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                <Search size={16} />
              </div>
              <input
                type="text"
                placeholder="Search subject code, name or year..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 pl-11 pr-4 text-sm outline-none transition-all duration-300 focus:border-brand-indigo focus:ring-2 focus:ring-brand-indigo/10 text-slate-800 dark:text-slate-100 shadow-sm"
              />
            </div>
            
            {/* Quick status counters */}
            <div className="flex items-center gap-3 self-end sm:self-auto text-xs font-bold text-slate-500 dark:text-slate-400">
              <FileSpreadsheet size={15} className="text-brand-indigo" />
              <span>Found: {filteredPapers.length} papers</span>
            </div>
          </div>

          {/* Breadcrumbs label */}
          <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">
            {getBreadcrumb()}
          </div>

          {/* Question Papers List */}
          <div className="flex-grow">
            <PaperGrid papers={filteredPapers} loading={loading} />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-950/40 py-6 text-center text-xs text-slate-400 dark:text-slate-500">
        <div className="max-w-7xl mx-auto px-4">
          <p>© {new Date().getFullYear()} Previous Year Question (PYQ) Hub. Designed for Academic Excellence.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
