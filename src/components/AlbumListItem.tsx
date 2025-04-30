import React from 'react';
import { StarIcon } from 'lucide-react';
interface Album {
  id: number;
  title: string;
  artist: string;
  cover: string;
  rating?: number;
  genre?: string;
  releaseDate?: string;
}
interface AlbumListItemProps {
  album: Album;
}
export function AlbumListItem({
  album
}: AlbumListItemProps) {
  return <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
      <img src={album.cover} alt={album.title} className="w-16 h-16 object-cover rounded-lg" />
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-base truncate">{album.title}</h3>
        <p className="text-sm opacity-70">by {album.artist}</p>
        {album.genre && <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full">
            {album.genre}
          </span>}
      </div>
      <div className="flex flex-col items-end gap-1">
        {album.rating && <div className="flex items-center gap-1">
            <StarIcon size={16} className="fill-black" />
            <span className="font-bold text-sm">{album.rating.toFixed(1)}</span>
          </div>}
        {album.releaseDate && <span className="text-xs opacity-70">{album.releaseDate}</span>}
      </div>
    </div>;
}