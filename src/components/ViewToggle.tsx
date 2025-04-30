import React from 'react';
import { GridIcon, ListIcon } from 'lucide-react';
export type ViewMode = 'grid' | 'list';
interface ViewToggleProps {
  viewMode: ViewMode;
  onViewChange: (mode: ViewMode) => void;
}
export function ViewToggle({
  viewMode,
  onViewChange
}: ViewToggleProps) {
  return <div className="flex bg-gray-100 rounded-lg p-1">
      <button onClick={() => onViewChange('grid')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-black text-white' : 'hover:bg-gray-200'}`} aria-label="Grid view" title="Grid view">
        <GridIcon size={18} />
      </button>
      <button onClick={() => onViewChange('list')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-black text-white' : 'hover:bg-gray-200'}`} aria-label="List view" title="List view">
        <ListIcon size={18} />
      </button>
    </div>;
}