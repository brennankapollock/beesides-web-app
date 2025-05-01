import React from 'react';
import { CheckIcon, SearchIcon } from 'lucide-react';
interface ArtistSelectionProps {
  selectedGenres: string[];
  selectedArtists: string[];
  onUpdate: (artists: string[]) => void;
}
export function ArtistSelection({
  selectedGenres,
  selectedArtists,
  onUpdate
}: ArtistSelectionProps) {
  // Mock artists data - in a real app, this would be filtered based on selectedGenres
  const suggestedArtists = [{
    name: 'Emily Bryan',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1964&auto=format&fit=crop',
    genres: ['Alternative', 'Indie'],
    monthlyListeners: '2.5M'
  }, {
    name: 'Ryan Parker',
    image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=1974&auto=format&fit=crop',
    genres: ['Electronic', 'Techno'],
    monthlyListeners: '1.8M'
  }, {
    name: 'Sarah Johnson',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1974&auto=format&fit=crop',
    genres: ['Jazz', 'Contemporary'],
    monthlyListeners: '900K'
  }, {
    name: 'Alex Wong',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop',
    genres: ['Hip Hop', 'Rap'],
    monthlyListeners: '3.2M'
  }, {
    name: 'Maria Garcia',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=2070&auto=format&fit=crop',
    genres: ['Classical', 'Contemporary'],
    monthlyListeners: '1.2M'
  }];
  const toggleArtist = (artistName: string) => {
    if (selectedArtists.includes(artistName)) {
      onUpdate(selectedArtists.filter(name => name !== artistName));
    } else {
      onUpdate([...selectedArtists, artistName]);
    }
  };
  return <div>
      <p className="text-lg mb-6">
        Select some artists you enjoy. We'll use this to help personalize your
        recommendations.
      </p>
      {/* Search */}
      <div className="relative mb-8">
        <input type="text" placeholder="Search for artists..." className="w-full pl-10 pr-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-black" />
        <SearchIcon size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      </div>
      {/* Artist Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {suggestedArtists.map(artist => <button key={artist.name} onClick={() => toggleArtist(artist.name)} className={`group relative aspect-square overflow-hidden rounded-xl ${selectedArtists.includes(artist.name) ? 'ring-2 ring-black' : 'hover:ring-2 hover:ring-black/50'}`}>
            <img src={artist.image} alt={artist.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/60 flex flex-col justify-end p-3 text-white text-left">
              <p className="font-bold truncate">{artist.name}</p>
              <p className="text-sm opacity-80 truncate">
                {artist.genres.join(' · ')}
              </p>
            </div>
            {selectedArtists.includes(artist.name) && <div className="absolute top-2 right-2 bg-white rounded-full p-1">
                <CheckIcon size={16} className="text-black" />
              </div>}
          </button>)}
      </div>
      <p className="text-sm text-center mt-8 text-gray-500">
        {selectedArtists.length === 0 ? 'Select at least 3 artists to continue' : `${selectedArtists.length} artists selected`}
      </p>
    </div>;
}