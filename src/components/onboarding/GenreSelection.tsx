import React from 'react';
interface GenreSelectionProps {
  selectedGenres: string[];
  onUpdate: (genres: string[]) => void;
}
export function GenreSelection({
  selectedGenres,
  onUpdate
}: GenreSelectionProps) {
  const genres = [{
    name: 'Rock',
    subgenres: ['Alternative', 'Indie', 'Classic Rock', 'Metal', 'Punk']
  }, {
    name: 'Electronic',
    subgenres: ['House', 'Techno', 'Ambient', 'IDM', 'Synthpop']
  }, {
    name: 'Hip Hop',
    subgenres: ['Rap', 'Trap', 'Old School', 'Underground', 'Alternative Hip Hop']
  }, {
    name: 'Jazz',
    subgenres: ['Bebop', 'Fusion', 'Contemporary', 'Big Band', 'Free Jazz']
  }, {
    name: 'Classical',
    subgenres: ['Baroque', 'Romantic', 'Contemporary', 'Opera', 'Chamber Music']
  }, {
    name: 'Pop',
    subgenres: ['Indie Pop', 'Art Pop', 'Synth Pop', 'Dream Pop', 'K-Pop']
  }];
  const toggleGenre = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      onUpdate(selectedGenres.filter(g => g !== genre));
    } else {
      onUpdate([...selectedGenres, genre]);
    }
  };
  return <div>
      <p className="text-lg mb-8">
        Select the genres you enjoy listening to. This will help us personalize
        your experience.
      </p>
      <div className="space-y-8">
        {genres.map(genre => <div key={genre.name}>
            <h3 className="text-xl font-bold mb-4">{genre.name}</h3>
            <div className="flex flex-wrap gap-3">
              {genre.subgenres.map(subgenre => <button key={subgenre} onClick={() => toggleGenre(subgenre)} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                    ${selectedGenres.includes(subgenre) ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
                  {subgenre}
                </button>)}
            </div>
          </div>)}
      </div>
    </div>;
}