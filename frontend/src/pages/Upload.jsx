import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { streamService, branchService, subjectService, paperService } from '../services/api';
import { 
  Upload, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  ChevronLeft, 
  X, 
  HelpCircle,
  FileUp,
  Calendar,
  Layers
} from 'lucide-react';

const UploadPage = () => {
  const navigate = useNavigate();

  // Cascading dropdown states (local to avoid clashing with sidebar filter state)
  const [streams, setStreams] = useState([]);
  const [selectedStream, setSelectedStream] = useState('');
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');

  // Form states
  const [year, setYear] = useState(new Date().getFullYear());
  const [examType, setExamType] = useState('End-Semester');
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  // Status states
  const [loadingStreams, setLoadingStreams] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fileInputRef = useRef(null);

  // 1. Fetch initial streams
  useEffect(() => {
    const fetchStreams = async () => {
      setLoadingStreams(true);
      try {
        const data = await streamService.getStreams();
        setStreams(data);
      } catch (err) {
        console.error('Failed to load streams:', err);
        setErrorMsg('Could not fetch academic streams.');
      } finally {
        setLoadingStreams(false);
      }
    };
    fetchStreams();
  }, []);

  // 2. Fetch branches when stream changes
  useEffect(() => {
    const fetchBranches = async () => {
      if (!selectedStream) {
        setBranches([]);
        setSelectedBranch('');
        return;
      }
      setLoadingBranches(true);
      try {
        const data = await branchService.getBranches(selectedStream);
        setBranches(data);
        setSelectedBranch('');
        setSelectedSemester('');
        setSubjects([]);
        setSelectedSubject('');
      } catch (err) {
        console.error('Failed to load branches:', err);
      } finally {
        setLoadingBranches(false);
      }
    };
    fetchBranches();
  }, [selectedStream]);

  // 3. Fetch subjects when branch or semester changes
  useEffect(() => {
    const fetchSubjects = async () => {
      if (!selectedBranch || !selectedSemester) {
        setSubjects([]);
        setSelectedSubject('');
        return;
      }
      setLoadingSubjects(true);
      try {
        const data = await subjectService.getSubjects(selectedBranch, selectedSemester);
        setSubjects(data);
        setSelectedSubject('');
      } catch (err) {
        console.error('Failed to load subjects:', err);
      } finally {
        setLoadingSubjects(false);
      }
    };
    fetchSubjects();
  }, [selectedBranch, selectedSemester]);

  // Get Semesters count (B.Tech: 8, MBA: 4)
  const getSemesters = () => {
    const streamObj = streams.find(s => s.id === parseInt(selectedStream));
    if (!streamObj) return [];
    const count = streamObj.name.toLowerCase().includes('mba') ? 4 : 8;
    return Array.from({ length: count }, (_, i) => i + 1);
  };

  // Drag and Drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    setErrorMsg('');
    setSuccessMsg('');
    
    if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
      setErrorMsg('Only PDF files are supported.');
      return;
    }

    // Cap at 10MB
    if (selectedFile.size > 10 * 1024 * 1024) {
      setErrorMsg('File size must not exceed 10 MB.');
      return;
    }

    setFile(selectedFile);
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!selectedSubject) {
      setErrorMsg('Please select a subject.');
      return;
    }

    if (!file) {
      setErrorMsg('Please select or drop a PDF question paper file.');
      return;
    }

    const currentYear = new Date().getFullYear();
    if (year < 1990 || year > currentYear + 1) {
      setErrorMsg(`Please specify a valid year (between 1990 and ${currentYear + 1}).`);
      return;
    }

    setUploading(true);
    
    // Build multipart Form Data
    const formData = new FormData();
    formData.append('subject_id', selectedSubject);
    formData.append('year', year);
    formData.append('exam_type', examType);
    formData.append('file', file);

    try {
      await paperService.uploadPaper(formData);
      setSuccessMsg('Question paper uploaded successfully!');
      
      // Reset parts of the form
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      // Navigate home after short delay to show success
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err) {
      console.error('Upload failed:', err);
      const detail = err.response?.data?.detail || 'Failed to upload paper. Please try again.';
      setErrorMsg(detail);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto flex flex-col gap-6">
        
        {/* Navigation back */}
        <div className="flex items-center justify-between">
          <Link 
            to="/" 
            className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-brand-indigo dark:text-slate-500 dark:hover:text-slate-300 transition-colors uppercase tracking-widest"
          >
            <ChevronLeft size={16} />
            Back to Hub
          </Link>
          <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-600 uppercase">
            Admin Portal
          </span>
        </div>

        {/* Upload Card */}
        <div className="glass-card rounded-3xl p-8 border border-slate-200/50 dark:border-slate-800/40 shadow-2xl relative overflow-hidden">
          
          {/* Header */}
          <div className="pb-6 border-b border-slate-200/50 dark:border-slate-800/40 mb-8 text-left">
            <div className="inline-flex p-3 rounded-2xl bg-brand-indigo/10 text-brand-indigo mb-3.5">
              <FileUp size={24} />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">
              Upload Question Paper
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Add past year examination papers to the public catalog database
            </p>
          </div>

          {/* Feedback alerts */}
          {errorMsg && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl text-sm flex items-start gap-3 text-left">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span className="font-semibold leading-normal">{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl text-sm flex items-start gap-3 text-left">
              <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
              <span className="font-semibold leading-normal">{successMsg}</span>
            </div>
          )}

          {/* Upload Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-6 text-left">
            
            {/* Grid for selectors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Stream */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">
                  Stream
                </label>
                <select
                  value={selectedStream}
                  onChange={(e) => setSelectedStream(e.target.value)}
                  className="w-full bg-white/60 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800/80 rounded-xl py-3 px-4 text-sm outline-none transition-all duration-300 focus:border-brand-indigo focus:ring-2 focus:ring-brand-indigo/10 text-slate-800 dark:text-slate-200 cursor-pointer"
                >
                  <option value="">Choose Stream</option>
                  {streams.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              {/* Branch */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">
                  Branch / Discipline
                </label>
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  disabled={!selectedStream}
                  className="w-full bg-white/60 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800/80 rounded-xl py-3 px-4 text-sm outline-none transition-all duration-300 focus:border-brand-indigo focus:ring-2 focus:ring-brand-indigo/10 text-slate-800 dark:text-slate-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Choose Branch</option>
                  {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>

              {/* Semester */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">
                  Semester
                </label>
                <select
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                  disabled={!selectedStream}
                  className="w-full bg-white/60 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800/80 rounded-xl py-3 px-4 text-sm outline-none transition-all duration-300 focus:border-brand-indigo focus:ring-2 focus:ring-brand-indigo/10 text-slate-800 dark:text-slate-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Choose Semester</option>
                  {getSemesters().map(sem => (
                    <option key={sem} value={sem}>Semester {sem}</option>
                  ))}
                </select>
              </div>

              {/* Subject */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">
                  Subject
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  disabled={!selectedBranch || !selectedSemester}
                  className="w-full bg-white/60 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800/80 rounded-xl py-3 px-4 text-sm outline-none transition-all duration-300 focus:border-brand-indigo focus:ring-2 focus:ring-brand-indigo/10 text-slate-800 dark:text-slate-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Choose Subject</option>
                  {subjects.map(sub => (
                    <option key={sub.id} value={sub.id}>{sub.code}: {sub.name}</option>
                  ))}
                </select>
              </div>

              {/* Year */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">
                  Exam Year
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <Calendar size={15} />
                  </div>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(parseInt(e.target.value))}
                    min="1990"
                    max={new Date().getFullYear() + 1}
                    className="w-full bg-white/60 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800/80 rounded-xl py-3 pl-11 pr-4 text-sm outline-none transition-all duration-300 focus:border-brand-indigo focus:ring-2 focus:ring-brand-indigo/10 text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              {/* Exam Type */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">
                  Exam Type
                </label>
                <div className="flex gap-4 h-full items-center mt-1 pl-1">
                  <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      name="examType"
                      value="Mid-Semester"
                      checked={examType === 'Mid-Semester'}
                      onChange={() => setExamType('Mid-Semester')}
                      className="accent-brand-indigo h-4 w-4"
                    />
                    <span>Mid-Semester</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      name="examType"
                      value="End-Semester"
                      checked={examType === 'End-Semester'}
                      onChange={() => setExamType('End-Semester')}
                      className="accent-brand-indigo h-4 w-4"
                    />
                    <span>End-Semester</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Drag and Drop Zone */}
            <div className="flex flex-col gap-1.5 mt-2">
              <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">
                Document File (PDF format)
              </label>
              
              {!file ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 min-h-48
                    ${dragOver 
                      ? 'border-brand-indigo bg-brand-indigo/5 scale-[0.99]' 
                      : 'border-slate-200 dark:border-slate-800 hover:border-brand-indigo/60 dark:hover:border-brand-indigo/40 bg-white/20 dark:bg-slate-900/10'
                    }`}
                >
                  <FileUp size={36} className="text-slate-400 dark:text-slate-500 mb-3 animate-pulse-slow" />
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    Drag and drop your PDF here, or <span className="text-brand-indigo">browse</span>
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    Supports PDF file format up to 10 MB in size
                  </p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    onClick={(e) => e.stopPropagation()}
                    accept=".pdf"
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="border border-slate-200 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/35 rounded-2xl p-5 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="p-3 bg-rose-500/10 text-rose-500 rounded-xl">
                      <FileText size={22} />
                    </div>
                    <div className="min-w-0 text-left">
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate pr-4">
                        {file.name}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="p-2 text-slate-400 hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-400 transition-colors"
                    title="Remove file"
                  >
                    <X size={18} />
                  </button>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={uploading || !selectedSubject || !file}
              className="w-full bg-gradient-to-r from-brand-indigo to-brand-purple hover:from-indigo-600 hover:to-purple-600 text-white font-extrabold py-3.5 px-6 rounded-2xl shadow-lg shadow-indigo-500/10 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none mt-4 flex items-center justify-center cursor-pointer"
            >
              {uploading ? (
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Uploading to archive...</span>
                </div>
              ) : (
                'Publish Paper'
              )}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};

export default UploadPage;
