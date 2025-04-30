import { useState, useEffect } from 'react';
export type ViewMode = 'grid' | 'list';
export function useViewMode(defaultMode: ViewMode = 'grid'): [ViewMode, (mode: ViewMode) => void] {
  const [viewMode, setViewMode] = useState<ViewMode>(defaultMode);
  // Load saved preference from localStorage on initial render
  useEffect(() => {
    const savedMode = localStorage.getItem('albumViewMode') as ViewMode | null;
    if (savedMode && (savedMode === 'grid' || savedMode === 'list')) {
      setViewMode(savedMode);
    }
  }, []);
  // Save preference to localStorage when it changes
  const changeViewMode = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem('albumViewMode', mode);
  };
  return [viewMode, changeViewMode];
}