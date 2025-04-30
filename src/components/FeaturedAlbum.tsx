import React from 'react';
import { PlayIcon } from 'lucide-react';
interface Album {
  id: number;
  title: string;
  artist: string;
  cover: string;
  rating?: number;
  genre?: string;
}
interface FeaturedAlbumProps {
  album: Album;
}
export function FeaturedAlbum({
  album
}: FeaturedAlbumProps) {
  return <div className="relative bg-gray-50 rounded-lg overflow-hidden">
      <img src={album.cover} alt={album.title} className="w-full aspect-square object-cover" />
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white">
        <h3 className="text-xl font-bold">{album.title}</h3>
        <p className="text-sm opacity-90">by {album.artist}</p>
        {album.rating && <div className="flex items-center mt-2">
            <div className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full" style={{
            width: `${album.rating / 10 * 100}%`
          }} />
            </div>
            <span className="ml-2 text-xs font-bold">
              {album.rating.toFixed(1)}
            </span>
          </div>}
      </div>
      <button className="absolute top-4 right-4 p-3 bg-white rounded-full shadow-lg">
        <PlayIcon size={18} className="text-black" />
      </button>
    </div>;
}