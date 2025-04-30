import React from 'react';
interface GenreTagProps {
  name: string;
  active?: boolean;
  onClick?: () => void;
}
export function GenreTag({
  name,
  active = false,
  onClick
}: GenreTagProps) {
  return <button onClick={onClick} className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap
      ${active ? 'bg-black text-white' : 'bg-gray-100 text-black hover:bg-gray-200'} 
      transition-colors`}>
      {name}
    </button>;
}