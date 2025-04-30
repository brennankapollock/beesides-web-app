import React from 'react';
import { Link } from './Link';
import { StarIcon, DiscIcon } from 'lucide-react';
interface ArtistCardProps {
  artist: {
    id: number;
    name: string;
    image: string;
    genres: string[];
    albums: number;
    rating: number;
  };
}
export function ArtistCard({
  artist
}: ArtistCardProps) {
  return <Link to={`/artist/${artist.id}`} className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
      <div className="mb-3">
        <img src={artist.image} alt={artist.name} className="w-full aspect-square object-cover rounded-lg mb-3" />
        <h3 className="font-bold truncate">{artist.name}</h3>
        <div className="flex flex-wrap gap-1 mt-1">
          {artist.genres.map(genre => <span key={genre} className="text-xs bg-white px-2 py-0.5 rounded-full">
              {genre}
            </span>)}
        </div>
      </div>
      <div className="flex gap-4 text-sm">
        <div className="flex items-center gap-1">
          <StarIcon size={16} />
          <span>{artist.rating}</span>
        </div>
        <div className="flex items-center gap-1">
          <DiscIcon size={16} />
          <span>{artist.albums} albums</span>
        </div>
      </div>
    </Link>;
}