import React, { useState } from 'react';
import { ChevronDownIcon } from 'lucide-react';
export function SearchFilters() {
  const [expandedSections, setExpandedSections] = useState<string[]>(['year', 'genre', 'rating']);
  const toggleSection = (section: string) => {
    setExpandedSections(current => current.includes(section) ? current.filter(s => s !== section) : [...current, section]);
  };
  const genres = ['Classic', 'Jazz', 'Electronic', 'Rock', 'Hip-Hop', 'Pop', 'Alternative', 'Metal', 'Folk', 'R&B'];
  const years = ['2024', '2023', '2022', '2021', '2020', 'Before 2020'];
  const ratings = ['9+ Only', '8+ Only', '7+ Only', '6+ Only'];
  return <div className="space-y-6">
      {/* Release Year */}
      <div>
        <button onClick={() => toggleSection('year')} className="flex items-center justify-between w-full mb-2">
          <h3 className="font-bold">Release Year</h3>
          <ChevronDownIcon size={20} className={`transform transition-transform ${expandedSections.includes('year') ? 'rotate-180' : ''}`} />
        </button>
        {expandedSections.includes('year') && <div className="space-y-2">
            {years.map(year => <label key={year} className="flex items-center gap-2">
                <input type="checkbox" className="rounded text-black" />
                <span>{year}</span>
              </label>)}
          </div>}
      </div>
      {/* Genre */}
      <div>
        <button onClick={() => toggleSection('genre')} className="flex items-center justify-between w-full mb-2">
          <h3 className="font-bold">Genre</h3>
          <ChevronDownIcon size={20} className={`transform transition-transform ${expandedSections.includes('genre') ? 'rotate-180' : ''}`} />
        </button>
        {expandedSections.includes('genre') && <div className="space-y-2">
            {genres.map(genre => <label key={genre} className="flex items-center gap-2">
                <input type="checkbox" className="rounded text-black" />
                <span>{genre}</span>
              </label>)}
          </div>}
      </div>
      {/* Rating */}
      <div>
        <button onClick={() => toggleSection('rating')} className="flex items-center justify-between w-full mb-2">
          <h3 className="font-bold">Rating</h3>
          <ChevronDownIcon size={20} className={`transform transition-transform ${expandedSections.includes('rating') ? 'rotate-180' : ''}`} />
        </button>
        {expandedSections.includes('rating') && <div className="space-y-2">
            {ratings.map(rating => <label key={rating} className="flex items-center gap-2">
                <input type="checkbox" className="rounded text-black" />
                <span>{rating}</span>
              </label>)}
          </div>}
      </div>
      {/* Reset Filters */}
      <button className="w-full px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors text-sm">
        Reset Filters
      </button>
    </div>;
}