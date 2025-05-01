import React from 'react';
import { StarIcon } from 'lucide-react';
interface InitialRatingsProps {
  selectedGenres: string[];
  selectedArtists: string[];
  ratings: Array<{
    id: number;
    rating: number;
  }>;
  onUpdate: (ratings: Array<{
    id: number;
    rating: number;
  }>) => void;
}
export function InitialRatings({
  selectedGenres,
  selectedArtists,
  ratings,
  onUpdate
}: InitialRatingsProps) {
  // Mock albums based on selected genres and artists
  const suggestedAlbums = [{
    id: 1,
    title: 'The Suffering',
    artist: 'Emily Bryan',
    cover: 'https://images.unsplash.com/photo-1599719500956-d158a3abd461?q=80&w=2070&auto=format&fit=crop',
    year: '2023',
    genre: 'Alternative'
  }, {
    id: 2,
    title: 'Daily Chaos',
    artist: 'Emily Bryan',
    cover: 'https://images.unsplash.com/photo-1603384164656-2b0e573ffa0b?q=80&w=1974&auto=format&fit=crop',
    year: '2022',
    genre: 'Indie'
  }, {
    id: 3,
    title: 'Simple',
    artist: 'Ryan Parker',
    cover: 'https://images.unsplash.com/photo-1594623930572-300a3011d9ae?q=80&w=2070&auto=format&fit=crop',
    year: '2024',
    genre: 'Electronic'
  }, {
    id: 4,
    title: 'Midnight Tales',
    artist: 'Sarah Johnson',
    cover: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=2069&auto=format&fit=crop',
    year: '2023',
    genre: 'Jazz'
  }];
  const ratingDescriptions = ['Select a rating', 'Terrible', 'Poor', 'Bad', 'Subpar', 'Average', 'Good', 'Very good', 'Great', 'Excellent', 'Masterpiece'];
  const getRating = (albumId: number) => {
    const rating = ratings.find(r => r.id === albumId);
    return rating ? rating.rating : 0;
  };
  const setRating = (albumId: number, rating: number) => {
    const newRatings = ratings.filter(r => r.id !== albumId);
    if (rating > 0) {
      newRatings.push({
        id: albumId,
        rating
      });
    }
    onUpdate(newRatings);
  };
  return <div>
      <p className="text-lg mb-8">
        Rate some albums to help us understand your taste. Don't worry if you
        haven't heard them all - you can skip any you don't know.
      </p>
      <div className="space-y-6">
        {suggestedAlbums.map(album => <div key={album.id} className="bg-gray-50 rounded-xl p-4">
            <div className="flex gap-4">
              <img src={album.cover} alt={album.title} className="w-24 h-24 rounded-lg object-cover" />
              <div className="flex-1">
                <h3 className="font-bold mb-1">{album.title}</h3>
                <p className="text-sm opacity-70 mb-3">
                  {album.artist} · {album.year} · {album.genre}
                </p>
                <div className="flex flex-col gap-1">
                  <div className="flex">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(value => <button key={value} onClick={() => setRating(album.id, value)} className="p-1">
                        <StarIcon size={20} className={value <= getRating(album.id) ? 'fill-black text-black' : 'text-gray-300'} />
                      </button>)}
                  </div>
                  <p className="text-sm">
                    {getRating(album.id) ? ratingDescriptions[getRating(album.id)] : 'Not rated'}
                  </p>
                </div>
              </div>
            </div>
          </div>)}
      </div>
      <p className="text-sm text-center mt-8 text-gray-500">
        {ratings.length === 0 ? 'Rate at least 3 albums to continue' : `${ratings.length} albums rated`}
      </p>
    </div>;
}