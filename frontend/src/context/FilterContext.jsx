import React, { createContext, useState, useEffect, useContext } from 'react';
import { streamService, branchService, subjectService } from '../services/api';

const FilterContext = createContext(null);

export const FilterProvider = ({ children }) => {
  const [streams, setStreams] = useState([]);
  const [selectedStream, setSelectedStream] = useState('');
  
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  
  const [selectedSemester, setSelectedSemester] = useState('');
  
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');

  const [loadingStreams, setLoadingStreams] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  // Load initial streams
  useEffect(() => {
    const fetchStreams = async () => {
      setLoadingStreams(true);
      try {
        const data = await streamService.getStreams();
        setStreams(data);
      } catch (error) {
        console.error('Failed to load academic streams:', error);
      } finally {
        setLoadingStreams(false);
      }
    };
    fetchStreams();
  }, []);

  // Cascading effect: when selectedStream changes
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
        // Reset subsequent filters
        setSelectedBranch('');
        setSelectedSemester('');
        setSubjects([]);
        setSelectedSubject('');
      } catch (error) {
        console.error('Failed to load branches:', error);
      } finally {
        setLoadingBranches(false);
      }
    };
    fetchBranches();
  }, [selectedStream]);

  // Cascading effect: when branch or semester changes
  useEffect(() => {
    const fetchSubjects = async () => {
      // Both branch and semester must be selected to fetch subjects
      if (!selectedBranch || !selectedSemester) {
        setSubjects([]);
        setSelectedSubject('');
        return;
      }
      setLoadingSubjects(true);
      try {
        const data = await subjectService.getSubjects(selectedBranch, selectedSemester);
        setSubjects(data);
        setSelectedSubject(''); // reset selected subject
      } catch (error) {
        console.error('Failed to load subjects:', error);
      } finally {
        setLoadingSubjects(false);
      }
    };
    fetchSubjects();
  }, [selectedBranch, selectedSemester]);

  const resetFilters = () => {
    setSelectedStream('');
    setBranches([]);
    setSelectedBranch('');
    setSelectedSemester('');
    setSubjects([]);
    setSelectedSubject('');
  };

  // Helper to get selected stream object for name checks, e.g. B.Tech vs MBA
  const getSelectedStreamObj = () => {
    return streams.find(s => s.id === parseInt(selectedStream));
  };

  // Semesters list helper: B.Tech usually has 8, MBA has 4
  const getSemestersList = () => {
    const streamObj = getSelectedStreamObj();
    if (!streamObj) return [];
    
    // Check stream name (case-insensitive check)
    const isMBA = streamObj.name.toLowerCase().includes('mba');
    const count = isMBA ? 4 : 8;
    
    return Array.from({ length: count }, (_, i) => ({
      value: i + 1,
      label: `Semester ${i + 1}`
    }));
  };

  return (
    <FilterContext.Provider value={{
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
      semesters: getSemestersList(),
      
      subjects,
      selectedSubject,
      setSelectedSubject,
      loadingSubjects,
      
      resetFilters,
      selectedStreamObj: getSelectedStreamObj()
    }}>
      {children}
    </FilterContext.Provider>
  );
};

export const useFilters = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
};
export default FilterContext;
