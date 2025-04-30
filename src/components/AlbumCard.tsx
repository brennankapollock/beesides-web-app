import React from 'react';
interface Album {
  id: number;
  title: string;
  artist: string;
  cover: string;
  rating?: number;
  genre?: string;
}
interface AlbumCardProps {
  album: Album;
}
export function AlbumCard({
  album
}: AlbumCardProps) {
  return <div className="group bg-gray-50 rounded-xl overflow-hidden hover:bg-gray-100 transition-colors cursor-pointer">
      <div className="relative">
        <img src={album.cover} alt={album.title} className="w-full aspect-square object-cover" />
        {album.rating && <div className="absolute top-3 right-3 bg-black text-white text-xs px-3 py-1.5 rounded-full font-bold">
            {album.rating.toFixed(1)}
          </div>}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-sm truncate mb-1">{album.title}</h3>
        <p className="text-xs opacity-70">by {album.artist}</p>
      </div>
    </div>;
}